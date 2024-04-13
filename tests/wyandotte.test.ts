import hebdaResults from './data/crewtimer-results-r12672-hebda23.json';
import wyHiResults from './data/crewtimer-results-r12676-wyhi23.json';
import {
  hebdaPointsCalc,
  hebdaCalculateEventTeamPoints,
  wyHiCalculateEventTeamPoints,
  wyHiPointsCalc,
} from '../src/calculators/WyandottePointsCalc';
import { expect, it } from '@jest/globals';
import { Results } from 'crewtimer-common';

it('hebda points', async () => {
  const points = hebdaPointsCalc(hebdaResults as unknown as Results);
  // check that non-scoring teams are included in the display list
  expect(points.combined.length).toEqual(8);
  expect(points.womens.length).toEqual(8);
  expect(points.mens.length).toEqual(8);

  // check to 'No Race' is not included in the display list
  const ifc = points.combined.find((entry) => entry.team == 'No Race');
  expect(ifc).toBeUndefined();

  // check teams with B entries
  const roos = points.combined.find((entry) => entry.team === 'Roosevelt');
  expect(roos).toBeDefined();
  expect(roos?.points).toEqual(38);

  const results = hebdaResults as unknown as Results;

  const fiveEntries = hebdaCalculateEventTeamPoints(results.results[16]);
  expect(fiveEntries.size).toEqual(5);
  expect(fiveEntries.get('Roosevelt')).toEqual(5);
  expect(fiveEntries.get('Carlson')).toEqual(2);
  expect(fiveEntries.get('Riverview')).toEqual(1);
  expect(fiveEntries.get('Crestwood')).toEqual(0);
  expect(fiveEntries.get('Trenton')).toEqual(0);

  const fourEntries = hebdaCalculateEventTeamPoints(results.results[8]);
  expect(fourEntries.size).toEqual(4);
  expect(fourEntries.get('Carlson')).toEqual(5);
  expect(fourEntries.get('Parkersburg')).toEqual(2);
  expect(fourEntries.get('Riverview')).toEqual(0);
  expect(fourEntries.get('Grosse Ile')).toEqual(0);
});

it('wy-hi points', async () => {
  const points = wyHiPointsCalc(wyHiResults as unknown as Results);
  const results = wyHiResults as unknown as Results;

  const pb = points.mens.find((entry) => entry.team === 'Perrysburg');
  expect(pb).toBeDefined();
  expect(pb?.points).toEqual(41);

  const twoentries = wyHiCalculateEventTeamPoints(results.results[14]);
  expect(twoentries.size).toEqual(2);
  expect(twoentries.get('Roosevelt')).toEqual(30);
  expect(twoentries.get('Grosse Ile')).toEqual(15);
});
