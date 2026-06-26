import { Entry, Event, Results, genPlaces } from 'crewtimer-common';

export type StarsAndStripesTeamPoints = {
  team: string;
  points: number;
  place: number;
};

export type StarsAndStripesPointsResult = StarsAndStripesTeamPoints[];

const PLACEHOLD_TEAM_NAME = 'Empty';
const EXHIB_PENALTY_CODE = 'Exhib';

/**
 * Points awarded by place for each normalized boat class.
 * Index 0 = 1st place, index 1 = 2nd place, etc.
 *
 * 1x (Singles)
 * 2x/2- (Doubles / Pairs)
 * 4x/4+ (Fours / Quads)
 * 8+ (Eights)
 */
const POINTS_BY_BOAT_CLASS: Map<string, number[]> = new Map([
  ['1X', [6, 4, 3, 2]],
  ['2X', [8, 6, 4, 3, 2]],
  ['4X', [12, 9, 6, 4, 3, 2]],
  ['8+', [16, 12, 8, 6, 4, 3]],
]);

/**
 * Boat class patterns matched directly against the event name, in order.
 * 2x and 2- score together; 4x and 4+ score together.
 */
const BOAT_CLASS_PATTERNS: [string, RegExp][] = [
  ['1X', / 1x\b/i],
  ['2X', / 2x\b/i],
  ['2X', / 2-/i],
  ['4X', / 4x\b/i],
  ['4X', / 4\+/i],
  ['8+', / 8\+/i],
];

/**
 * Detect which scoring category an event name belongs to: 1X, 2X, 4X, 8+.
 *
 * @param eventName The Event field, e.g. '1 Womens Varsity 8+ H1'
 * @returns The normalized boat class key, or '' if not a scored class
 */
export const normalizeBoatClass = (eventName: string): string => {
  for (const [boatClass, pattern] of BOAT_CLASS_PATTERNS) {
    if (pattern.test(eventName)) {
      return boatClass;
    }
  }
  return '';
};

/**
 * Returns true if the event number is flagged as non-scoring, i.e. it ends
 * in a numbered 'N' suffix such as '#5N' or '12N'.
 *
 * @param eventNum The EventNum field from the event, e.g. '#5N' or '12'
 */
export const isExcludedEventNum = (eventNum: string): boolean => {
  return /\d+N$/i.test((eventNum || '').trim());
};

/**
 * Extract the root team name. This will trim any trailing single characters
 * which were used as A or B boat designations.
 *
 * For example:
 * "Green Lake Crew A" -> "Green Lake Crew"
 * "Green Lake Crew B" -> "Green Lake Crew"
 * "Green Lake Crew"   -> "Green Lake Crew"
 */
const trimCrewName = (crewName: string) => {
  crewName = crewName.trim();
  const suffixExpression = / .$/;
  return crewName.replace(suffixExpression, '');
};

/**
 * A crew is a composite if its Crew name lists more than one club, separated
 * by a '/' or ';'. For example, 'Mercer Island/Sammamish' and
 * 'Mercer Island;Sammamish' are both composites of two clubs.
 * Composite crews are ineligible to score points toward team trophies.
 */
export const isCompositeCrew = (crewName: string): boolean => {
  return crewName.split(/[/;]/).length > 1;
};

/**
 * Calculate the points earned by each team for a single event.
 */
export const calculateEventTeamPoints = (eventResult: Event): Map<string, number> => {
  const eventTeamPoints = new Map<string, number>();

  if (isExcludedEventNum(eventResult.EventNum)) {
    return eventTeamPoints; // e.g. '#5N' - excluded from scoring
  }

  const boatClass = normalizeBoatClass(eventResult.Event);
  if (!boatClass) {
    return eventTeamPoints; // not a scored boat class
  }

  const pointsByPlace = POINTS_BY_BOAT_CLASS.get(boatClass);
  if (!pointsByPlace) {
    return eventTeamPoints;
  }

  // track teams we've seen in this event to exclude anything that is not
  // a primary entry (ex: B entries, second entries)
  const placingTeams = new Set<string>();

  const sortedEntries = (eventResult.entries || []).sort(
    (lhs: Entry, rhs: Entry) => (lhs.Place || Number.MAX_VALUE) - (rhs.Place || Number.MAX_VALUE),
  );

  sortedEntries.forEach((entry) => {
    if (!entry.Place) {
      return; // DNF, DNS, DQ etc
    }
    if (entry.PenaltyCode === EXHIB_PENALTY_CODE) {
      return;
    }
    if (isCompositeCrew(entry.Crew)) {
      return; // composite crews are ineligible for team points
    }

    const teamName = trimCrewName(entry.Crew);
    if (teamName === PLACEHOLD_TEAM_NAME) {
      return;
    }

    // if a team has already placed in this event, skip subsequent entries
    if (placingTeams.has(teamName)) {
      return;
    }
    placingTeams.add(teamName);

    if (entry.Place > pointsByPlace.length) {
      return; // no points for this place
    }

    const points = pointsByPlace[entry.Place - 1];
    eventTeamPoints.set(teamName, (eventTeamPoints.get(teamName) || 0) + points);
  });

  return eventTeamPoints;
};

/**
 * Accumulate per-event team points into a single team:points map across the
 * whole regatta.
 */
export const starsAndStripesPointsImpl = (resultData: Results): Map<string, number> => {
  const teamPoints = new Map<string, number>();

  resultData.results.forEach((eventResult) => {
    const eventTeamPoints = calculateEventTeamPoints(eventResult);
    eventTeamPoints.forEach((points, teamName) => {
      teamPoints.set(teamName, (teamPoints.get(teamName) || 0) + points);
    });
  });

  return teamPoints;
};

/**
 * Calculate team points based on the Stars and Stripes Regatta scoring system:
 *
 * 1x:    1st=6,  2nd=4,  3rd=3, 4th=2
 * 2x/2-: 1st=8,  2nd=6,  3rd=4, 4th=3, 5th=2
 * 4x/4+: 1st=12, 2nd=9,  3rd=6, 4th=4, 5th=3, 6th=2
 * 8+:    1st=16, 2nd=12, 3rd=8, 4th=6, 5th=4, 6th=3
 *
 * All races are assumed to be finals. Events whose EventNum ends in a
 * numbered 'N' suffix (e.g. '#5N') are excluded. Composite crews (Crew name
 * listing more than one club, separated by '/' or ';') are ineligible for points.
 */
export const starsAndStripesPointsCalc = (resultData: Results): StarsAndStripesPointsResult => {
  const teamPoints = starsAndStripesPointsImpl(resultData);

  const sorted = Array.from(teamPoints.entries())
    .sort((a, b) => b[1] - a[1])
    .map((v) => ({ team: v[0], points: v[1], place: 0 }));

  const places = genPlaces(
    sorted.map((entry) => entry.points),
    'desc',
  );
  places.forEach((place, i) => (sorted[i].place = place));

  return sorted;
};
