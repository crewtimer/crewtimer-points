import regattaResults from './data/crewtimer-results-r12581-fira-export.json';
import { firaPointsCalc, calculateNumberOfEntries } from '../src/calculators/FIRAPointsCalc';
import { expect, it } from '@jest/globals';
import { Results } from 'crewtimer-common';
//import { eventNames } from 'process';

it('FIRA Mitchell Points', async () => {
  const points = firaPointsCalc(regattaResults as unknown as Results);
  // check that non-scoring teams are included in the display list
  expect(points.overall.length).toEqual(11);
  expect(points.men.length).toEqual(8);
  expect(points.women.length).toEqual(10);

  const sp = points.overall.find((entry) => entry.team == 'University of Tampa');
  expect(sp).toBeDefined();

  // check teams with B entries
  let rc = points.overall.find((entry) => entry.team === 'Rollins College');
  expect(rc).toBeDefined();
  expect(rc?.points).toEqual(134.5);
  rc = points.women.find((entry) => entry.team === 'Rollins College');
  expect(rc).toBeDefined();
  expect(rc?.points).toEqual(74.5);
  rc = points.men.find((entry) => entry.team === 'Rollins College');
  expect(rc).toBeDefined();
  expect(rc?.points).toEqual(60);
});

it('fira points traditional', async () => {
  const points = firaPointsCalc(regattaResults as unknown as Results);
  // check that non-scoring non-exhib-only teams are included in the display list
  expect(points.overall.length).toEqual(11);
  expect(points.women.length).toEqual(10);
  expect(points.men.length).toEqual(8);

  // verify the D1 teams were excluded (not points eligible in D1 events)
  const sp = points.overall.find((entry) => entry.team == 'Kansas State University');
  expect(sp).toBeUndefined();

  const ifc = points.overall.find((entry) => entry.team == 'University of Miami');
  expect(ifc).toBeUndefined();

  // check teams with B entries
  let rc = points.overall.find((entry) => entry.team === 'Rollins College');
  expect(rc).toBeDefined();
  expect(rc?.points).toEqual(134.5);
  rc = points.women.find((entry) => entry.team === 'Rollins College');
  expect(rc).toBeDefined();
  expect(rc?.points).toEqual(74.5);

  let uf = points.men.find((entry) => entry.team === 'University of Florida');
  expect(uf?.points).toEqual(8.5);

  // validate combined points value and order
  expect(points.men.map((entry) => entry.points)).toEqual([113.5, 60, 59, 45, 27, 24.25, 17.5, 8.5]);
  expect(points.women.map((entry) => entry.points)).toEqual([74.5, 67, 62, 54.5, 49.25, 38.75, 24.25, 23, 5.5, 2.25]);
  expect(points.overall.map((entry) => entry.points)).toEqual([
    134.5, 113.5, 94, 82, 78.75, 69.25, 62, 57.75, 38.75, 19.75, 5.5,
  ]);
});

it('Excluded entries and events', async () => {
  const results = regattaResults as unknown as Results;
  const points = firaPointsCalc(regattaResults as unknown as Results);

  // check that exhibition crews are excluded from the number of entries
  expect(calculateNumberOfEntries(results.results[5].entries)).toEqual(3);
  expect(calculateNumberOfEntries(results.results[6].entries)).toEqual(5);

  let ks = points.overall.find((entry) => entry.team === 'Kansas State University');
  expect(ks).toBeUndefined();

  let bu = points.overall.find((entry) => entry.team === 'Brown University');
  expect(bu).toBeUndefined();
});
