import { expect, it } from '@jest/globals';
import { Entry, Event, Results } from 'crewtimer-common';
import {
  starsAndStripesPointsCalc,
  isCompositeCrew,
  isExcludedEventNum,
  normalizeBoatClass,
} from '../src/calculators/StarsAndStripesPointsCalc';

const makeEntry = (Crew: string, Place: number): Entry =>
  ({
    Crew,
    Place,
  } as unknown as Entry);

const makeEvent = (Event_: string, EventNum: string, entries: Entry[]): Event =>
  ({
    Event: Event_,
    EventNum,
    entries,
  } as unknown as Event);

const makeResults = (results: Event[]): Results =>
  ({
    results,
  } as unknown as Results);

it('normalizes boat classes', () => {
  expect(normalizeBoatClass('1 Womens Varsity 1x')).toEqual('1X');
  expect(normalizeBoatClass('1 Womens Varsity 2x')).toEqual('2X');
  expect(normalizeBoatClass('1 Womens Varsity 2-')).toEqual('2X');
  expect(normalizeBoatClass('1 Womens Varsity 4x')).toEqual('4X');
  expect(normalizeBoatClass('1 Womens Varsity 4+')).toEqual('4X');
  expect(normalizeBoatClass('1 Womens Varsity 8+')).toEqual('8+');
  expect(normalizeBoatClass('1 Womens Varsity 1+')).toEqual('');
});

it('detects excluded #N event numbers', () => {
  expect(isExcludedEventNum('#5N')).toBe(true);
  expect(isExcludedEventNum('12N')).toBe(true);
  expect(isExcludedEventNum('5')).toBe(false);
  expect(isExcludedEventNum('#5')).toBe(false);
});

it('detects composite crews separated by / or ;', () => {
  expect(isCompositeCrew('Mercer Island/Sammamish')).toBe(true);
  expect(isCompositeCrew('Mercer Island;Sammamish')).toBe(true);
  expect(isCompositeCrew('Mount Baker')).toBe(false);
});

it('awards points by boat class and place', () => {
  const results = makeResults([
    makeEvent('1 Womens Varsity 1x', '1', [
      makeEntry('Mount Baker', 1),
      makeEntry('Green Lake Crew', 2),
      makeEntry('Pocock', 3),
      makeEntry('Lakeside School', 4),
      makeEntry('Everett Rowing', 5),
    ]),
    makeEvent('2 Womens Varsity 8+', '2', [makeEntry('Mount Baker', 1), makeEntry('Pocock', 2)]),
  ]);

  const points = starsAndStripesPointsCalc(results);

  const mb = points.find((entry) => entry.team === 'Mount Baker');
  expect(mb?.points).toEqual(6 + 16); // 1st in 1x + 1st in 8+

  const pocock = points.find((entry) => entry.team === 'Pocock');
  expect(pocock?.points).toEqual(3 + 12); // 3rd in 1x + 2nd in 8+

  const lakeside = points.find((entry) => entry.team === 'Lakeside School');
  expect(lakeside?.points).toEqual(2); // 4th in 1x

  // 5th place in a 1x event scores no points (only 1st-4th are scored)
  const everett = points.find((entry) => entry.team === 'Everett Rowing');
  expect(everett).toBeUndefined();
});

it('excludes events whose EventNum ends in a numbered N suffix', () => {
  const results = makeResults([makeEvent('1 Womens Varsity 1x', '#5N', [makeEntry('Mount Baker', 1)])]);

  const points = starsAndStripesPointsCalc(results);
  expect(points).toEqual([]);
});

it('excludes composite crews (separated by /) from team points', () => {
  const results = makeResults([
    makeEvent('1 Womens Varsity 2x', '1', [makeEntry('Mercer Island/Sammamish', 1), makeEntry('Mount Baker', 2)]),
  ]);

  const points = starsAndStripesPointsCalc(results);
  expect(points.find((entry) => entry.team.includes('Mercer'))).toBeUndefined();

  const mb = points.find((entry) => entry.team === 'Mount Baker');
  expect(mb?.points).toEqual(6); // scored at its actual recorded place (2nd) even though 1st place is a non-scoring composite
});

it('excludes composite crews (separated by ;) from team points', () => {
  const results = makeResults([
    makeEvent('1 Womens Varsity 2x', '1', [makeEntry('Mercer Island;Sammamish', 1), makeEntry('Mount Baker', 2)]),
  ]);

  const points = starsAndStripesPointsCalc(results);
  expect(points.find((entry) => entry.team.includes('Mercer'))).toBeUndefined();

  const mb = points.find((entry) => entry.team === 'Mount Baker');
  expect(mb?.points).toEqual(6);
});

it('collapses A/B boat entries from the same team to a single score', () => {
  const results = makeResults([
    makeEvent('1 Womens Varsity 4x', '1', [
      makeEntry('Mount Baker A', 1),
      makeEntry('Mount Baker B', 2),
      makeEntry('Pocock A', 3),
    ]),
  ]);

  const points = starsAndStripesPointsCalc(results);
  const mb = points.find((entry) => entry.team === 'Mount Baker');
  expect(mb?.points).toEqual(12); // only the higher-placing A entry counts
});
