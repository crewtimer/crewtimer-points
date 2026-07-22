/**
 * Tests for the HRA Masters Points Series calculator.
 *
 * Run with: yarn test
 */

import { basePointsForEvent, calcEventPoints, hraPointsCalc } from '../src/calculators/HRAPointsCalc';

// ─── Unit: basePointsForEvent ─────────────────────────────────────────────────

describe('basePointsForEvent', () => {
  test('Men 8+ → 30', () => expect(basePointsForEvent('Men 8+')).toBe(30));
  test('Women 8+ → 30', () => expect(basePointsForEvent('Women 8+')).toBe(30));
  test('Men 4+ → 24', () => expect(basePointsForEvent('Men 4+')).toBe(24));
  test('Women 4x → 24', () => expect(basePointsForEvent('Women 4x')).toBe(24));
  test('Mixed 8+ → 18', () => expect(basePointsForEvent('Mixed 8+')).toBe(18));
  test('Mixed 4x → 18', () => expect(basePointsForEvent('Mixed 4x')).toBe(18));
  test('Mixed 2x → 18', () => expect(basePointsForEvent('Mixed 2x')).toBe(18));
  test('Men 2x → 12', () => expect(basePointsForEvent('Men 2x')).toBe(12));
  test('Women 2- → 12', () => expect(basePointsForEvent('Women 2-')).toBe(12));
  test('Men 1x → 9', () => expect(basePointsForEvent('Men 1x')).toBe(9));
  test('Women 1x → 9', () => expect(basePointsForEvent('Women 1x')).toBe(9));
});

// ─── Unit: calcEventPoints ────────────────────────────────────────────────────

const makeEvent = (name: string, eventNum: string, crews: { name: string; place: number | null }[]) => ({
  Event: name,
  EventNum: eventNum,
  entries: crews.map((c) => ({
    Crew: c.name,
    Place: c.place ?? undefined,
    PenaltyCode: '',
  })),
});

describe('calcEventPoints – Women 8+ A Final', () => {
  const event = makeEvent('Women 8+ Masters A Final', '1A', [
    { name: 'Tampa Bay Rowing', place: 1 },
    { name: 'Sarasota Crew', place: 2 },
    { name: 'Jacksonville Rowing', place: 3 },
  ]);

  const result = calcEventPoints(event as any);

  test('1st place earns 30 pts (100%)', () => expect(result.get('Tampa Bay Rowing')).toBeCloseTo(30.0));
  test('2nd place earns 24 pts (80%)', () => expect(result.get('Sarasota Crew')).toBeCloseTo(24.0));
  test('3rd place earns 18 pts (60%)', () => expect(result.get('Jacksonville Rowing')).toBeCloseTo(18.0));
});

describe('calcEventPoints – Mixed 4x A Final', () => {
  const event = makeEvent('Mixed 4x Masters A Final', '2A', [
    { name: 'Orlando Masters', place: 1 },
    { name: 'Gainesville Rowing', place: 2 },
  ]);

  const result = calcEventPoints(event as any);

  test('Mixed event 1st place earns 18 pts', () => expect(result.get('Orlando Masters')).toBeCloseTo(18.0));
  test('Mixed event 2nd place earns 14.4 pts (80%)', () => expect(result.get('Gainesville Rowing')).toBeCloseTo(14.4));
});

describe('calcEventPoints – composite crew exclusion', () => {
  const event = makeEvent('Men 4+ Masters A Final', '3A', [
    { name: 'Tampa/Sarasota', place: 1 }, // composite — slash in name
    { name: 'Orlando Masters', place: 2 },
  ]);

  const result = calcEventPoints(event as any);

  test('composite crew earns no points', () => expect(result.has('Tampa/Sarasota')).toBe(false));
  test('2nd-place non-composite crew earns 2nd-place points', () =>
    expect(result.get('Orlando Masters')).toBeCloseTo(19.2));
});

describe('calcEventPoints – heat is excluded', () => {
  const event = makeEvent('Women 1x Masters Heat 1', '5H1', [{ name: 'Some Crew', place: 1 }]);
  const result = calcEventPoints(event as any);
  test('heat returns empty map', () => expect(result.size).toBe(0));
});

describe('calcEventPoints – only first entry per team counts', () => {
  const event = makeEvent('Men 2x Masters A Final', '4A', [
    { name: 'Tampa Bay Rowing A', place: 1 },
    { name: 'Tampa Bay Rowing B', place: 2 }, // same team, B boat
    { name: 'Sarasota Crew', place: 3 },
  ]);
  const result = calcEventPoints(event as any);
  // "Tampa Bay Rowing A" and "Tampa Bay Rowing B" both strip to "Tampa Bay Rowing"
  test('B-boat does not give team double credit', () => expect(result.get('Tampa Bay Rowing')).toBeCloseTo(12.0));
  test('3rd place crew gets 3rd-place points (effectively 2nd unique team)', () =>
    expect(result.get('Sarasota Crew')).toBeCloseTo(7.2));
});

// ─── Integration: hraPointsCalc ─────────────────────────────────────────────

describe('hraPointsCalc – integration', () => {
  const mockResults: any = {
    results: [
      makeEvent('Men 8+ Masters A Final', '1A', [
        { name: 'Tampa Bay Rowing', place: 1 }, // 30 pts sweep
        { name: 'Sarasota Crew', place: 2 }, // 24 pts sweep
      ]),
      makeEvent('Men 1x Masters A Final', '2A', [
        { name: 'Tampa Bay Rowing', place: 1 }, // 9 pts sculling
        { name: 'Gainesville Rowing', place: 2 }, // 7.2 pts sculling
      ]),
    ] as any,
  };

  const points = hraPointsCalc(mockResults);

  test('Tampa Bay Rowing overall = 39 (30 + 9)', () => {
    const entry = points.overall.find((r) => r.team === 'Tampa Bay Rowing');
    expect(entry?.points).toBeCloseTo(39.0);
  });

  test('overall standings are sorted by points descending', () => {
    expect(points.overall[0].points).toBeGreaterThanOrEqual(points.overall[1]?.points ?? 0);
  });

  test('Tampa Bay Rowing sweep = 30', () => {
    const entry = points.sweep.find((r) => r.team === 'Tampa Bay Rowing');
    expect(entry?.points).toBeCloseTo(30.0);
  });

  test('Tampa Bay Rowing sculling = 9', () => {
    const entry = points.sculling.find((r) => r.team === 'Tampa Bay Rowing');
    expect(entry?.points).toBeCloseTo(9.0);
  });

  test('places are assigned correctly (1st, 2nd, ...)', () => {
    expect(points.overall[0].place).toBe(1);
  });
});
