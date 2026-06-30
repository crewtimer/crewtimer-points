import { Event, Results, genPlaces } from 'crewtimer-common';
import { isAFinal, boatClassFromName } from '../common/CrewTimerUtils';
// ─── Types ────────────────────────────────────────────────────────────────────

export type HRATeamTotals = {
  overall: number;
  sweep: number;
  sculling: number;
};

export type HRAResult = {
  team: string;
  points: number;
  place: number;
};

export type HRAPoints = {
  overall: HRAResult[];
  sweep: HRAResult[];
  sculling: HRAResult[];
};

// ─── Points Table ─────────────────────────────────────────────────────────────

/**
 * Base (1st place / 100%) points by boat class, as defined by HRA rules:
 *
 *   M/W 8+           → 30
 *   M/W 4+, 4x       → 24
 *   Mixed 8+,4+,4x,2x→ 18
 *   M/W 2x, 2-       → 12
 *   Singles (1x)     → 9
 */
const BASE_POINTS_BY_CLASS: Record<string, number> = {
  '8': 30, // Men / Women sweep eight (boatClassFromName strips the '+')
  '4': 24, // Men / Women coxed/coxless four
  '4x': 24, // Men / Women quad
  '2x': 12, // Men / Women double
  '2': 12, // Men / Women pair (boatClassFromName strips the '-')
  '1x': 9, // Singles
};

/**
 * Place-based percentages per HRA rules (Section 4 points table).
 * Index 0 = 1st place (100%), index 5 = 6th place (15%).
 */
const PLACE_PERCENTAGES = [1.0, 0.8, 0.6, 0.45, 0.3, 0.15];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COMPOSITE_MARKERS = ['/']; // composite crews use "/" in crew name per common convention

/**
 * Returns true when a crew name indicates a composite crew (rowers from 2+ teams).
 * Composite crews are ineligible to earn points (Section 5).
 */
const isComposite = (crewName: string): boolean => COMPOSITE_MARKERS.some((marker) => crewName.includes(marker));

/**
 * Strip trailing single-char suffixes like "A" / "B" boat designators and
 * seeding brackets like "[1]" so B-boats don't create phantom team entries.
 */
const normalizeTeamName = (crewName: string): string => {
  // Remove trailing " [n]" seeding annotations
  crewName = crewName.replace(/\s+\[?.?\]?$/, '');
  // Remove trailing single-character boat suffix (A/B designators)
  crewName = crewName.replace(/ .$/, '');
  return crewName.trim();
};

/**
 * Determine whether this is a mixed event.
 * HRA treats Mixed 8+, 4+, 4x, 2x as a separate points column (18 base pts).
 */
const isMixedEvent = (eventName: string): boolean => {
  const upper = eventName.toUpperCase();
  return upper.includes('MIXED') || upper.includes('MIX');
};

/**
 * Returns true for sculling events (4x, 2x, 1x).
 * Everything else (8+, 4+, 4-, 2-) is sweep.
 */
const isScullingEvent = (eventName: string): boolean => {
  const boat = boatClassFromName(eventName);
  return ['4x', '2x', '1x'].includes(boat ?? '');
};

/**
 * Look up the base (100%) points for an event based on boat class and gender.
 * Mixed events use their own column regardless of boat class.
 */
export const basePointsForEvent = (eventName: string): number => {
  if (isMixedEvent(eventName)) {
    return 18; // Mixed column covers 8+, 4+, 4x, 2x
  }
  const boat = boatClassFromName(eventName);
  return BASE_POINTS_BY_CLASS[boat ?? ''] ?? 0;
};

/**
 * Given a finishing place (1-based), return the points multiplier.
 * Places beyond 6th earn 0 points.
 */
const multiplierForPlace = (place: number): number =>
  place >= 1 && place <= PLACE_PERCENTAGES.length ? PLACE_PERCENTAGES[place - 1] : 0;

// ─── Core calculation ─────────────────────────────────────────────────────────

/**
 * Calculate per-team points for a single event final.
 * Returns a map of { teamName → points }.
 *
 * Rules applied:
 *   - Only A finals count (Section 4 requires completed races; heats/TTs excluded)
 *   - Composite crews earn no points (Section 5)
 *   - All non-composite boats earn points regardless of entry count (Section 6)
 *   - Only the first (highest-placing) entry per team per event counts
 */
export const calcEventPoints = (event: Event): Map<string, number> => {
  const teamPoints = new Map<string, number>();

  if (!isAFinal(event.Event, event.EventNum)) {
    return teamPoints;
  }

  const base = basePointsForEvent(event.Event);
  if (base === 0) {
    return teamPoints; // unrecognised boat class — skip
  }

  const seenTeams = new Set<string>();

  const sortedEntries = [...(event.entries ?? [])].sort(
    (a, b) => (a.Place ?? Number.MAX_VALUE) - (b.Place ?? Number.MAX_VALUE),
  );

  for (const entry of sortedEntries) {
    if (!entry.Place) continue; // DNF / DNS / DQ / no result
    if (isComposite(entry.Crew)) continue; // composite — ineligible (Section 5)

    const team = normalizeTeamName(entry.Crew);
    if (seenTeams.has(team)) continue; // only first entry per team counts
    seenTeams.add(team);

    const pts = base * multiplierForPlace(entry.Place);
    if (pts > 0) {
      teamPoints.set(team, pts);
    }
  }

  return teamPoints;
};

// ─── Aggregation ──────────────────────────────────────────────────────────────

/**
 * Core HRA points implementation.
 * Iterates all events, accumulates team totals split by sweep / sculling.
 */
export const hraPointsImpl = (resultData: Results): Map<string, HRATeamTotals> => {
  const teamTotals = new Map<string, HRATeamTotals>();

  const addPoints = (team: string, pts: number, sculling: boolean) => {
    const existing = teamTotals.get(team) ?? { overall: 0, sweep: 0, sculling: 0 };
    teamTotals.set(team, {
      overall: existing.overall + pts,
      sweep: existing.sweep + (sculling ? 0 : pts),
      sculling: existing.sculling + (sculling ? pts : 0),
    });
  };

  for (const event of resultData.results ?? []) {
    const sculling = isScullingEvent(event.Event);
    const eventPoints = calcEventPoints(event);
    eventPoints.forEach((pts, team) => addPoints(team, pts, sculling));
  }

  // Ensure every Florida team that entered (even with 0 pts) appears in results
  for (const event of resultData.results ?? []) {
    for (const entry of event.entries ?? []) {
      if (isComposite(entry.Crew)) continue;
      const team = normalizeTeamName(entry.Crew);
      if (!teamTotals.has(team)) {
        teamTotals.set(team, { overall: 0, sweep: 0, sculling: 0 });
      }
    }
  }

  return teamTotals;
};

// ─── Finalise & rank ──────────────────────────────────────────────────────────

const rankResults = (entries: Map<string, HRATeamTotals>, key: keyof HRATeamTotals): HRAResult[] => {
  const arr = Array.from(entries.entries())
    .map(([team, totals]) => ({ team, points: totals[key], place: 0 }))
    .sort((a, b) => b.points - a.points)
    .filter((r) => r.points > 0);

  const places = genPlaces(
    arr.map((r) => r.points),
    'desc',
  );
  places.forEach((place, i) => (arr[i].place = place));
  return arr;
};

/**
 * Public entry point.
 * Returns ranked overall, sweep, and sculling standings.
 */
export const hraPointsCalc = (resultData: Results): HRAPoints => {
  const totals = hraPointsImpl(resultData);
  return {
    overall: rankResults(totals, 'overall'),
    sweep: rankResults(totals, 'sweep'),
    sculling: rankResults(totals, 'sculling'),
  };
};
