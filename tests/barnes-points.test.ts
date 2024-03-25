import regattaResults from './data/crewtimer-results-dev-r12033-export-jr-nov-events.json';
import simpleResults from './data/crewtimer-results-dev-final-counts.json';
import barnesCoedAndSingleGender from './data/crewtimer-results-dev-r12033-export-coed-single-gender-teams.json';
import {
  barnesFullPointsCalc,
  barnesPointsCalc,
  calculateEventTeamPoints,
  calculateNumberOfEntries,
} from '../src/calculators/BarnesPointsCalc';
import { expect, it } from '@jest/globals';
import { Results } from 'crewtimer-common';

it('barnes points full weighted', async () => {
  const points = barnesFullPointsCalc(regattaResults as unknown as Results, true);
  // check that non-scoring teams are included in the display list
  expect(points.combined.length).toEqual(8);
  expect(points.womensScull.length).toEqual(8);
  expect(points.mensScull.length).toEqual(8);
  expect(points.womensSweep.length).toEqual(8);
  expect(points.mensSweep.length).toEqual(8);

  const sp = points.combined.find((entry) => entry.team == 'Slow Poke');
  expect(sp).toBeDefined();
  expect(sp?.points).toEqual(0);

  const ifc = points.combined.find((entry) => entry.team == 'Illegally Fast Composite');
  expect(ifc).toBeUndefined();

  // check teams with B entries
  let mb = points.combined.find((entry) => entry.team === 'Mount Baker');
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(65.95);
  mb = points.womensSweep.find((entry) => entry.team === 'Mount Baker');
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(48);
  mb = points.womensScull.find((entry) => entry.team === 'Mount Baker');
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(10);

  // check 2x boat class
  // 1st place, varsity => 15 points
  const glc_mscull = points.mensScull.find((entry) => entry.team === 'Green Lake Crew');
  expect(glc_mscull).toBeDefined();
  expect(glc_mscull?.points).toEqual(15);

  // 4th place, 5 boats in final - .1 * 15 = 1.5
  const mb_mscull = points.mensScull.find((entry) => entry.team === 'Mount Baker');
  expect(mb_mscull).toBeDefined();
  expect(mb_mscull?.points).toEqual(0.75);

  // GLC: 6th in frosh 8 and 6th in varsity 8
  // .05 * .6 * 30 + .05 * 1 * 30 = 2.4 points
  const glc_wsweep = points.womensSweep.find((entry) => entry.team === 'Green Lake Crew');
  expect(glc_wsweep).toBeDefined();
  expect(glc_wsweep?.points).toEqual(2.4);

  // check 4+ boat class and JR events
  // LS: 2nd place in JR 4+ and Varsity 4+
  // .8 * .8 * 20 + .8 * 1 * 20 = 28.8 points
  const ls_msweep = points.mensSweep.find((entry) => entry.team === 'Lakeside School');
  expect(ls_msweep).toBeDefined();
  expect(ls_msweep?.points).toEqual(28.8);

  // validate combined points value and order
  expect(points.combined.map((entry) => entry.points)).toEqual([65.95, 53.9, 46.4, 42.1, 37.8, 11.6, 5.8, 0]);
});

it('barnes points simple weighted', async () => {
  const points = barnesPointsCalc(regattaResults as unknown as Results, true);
  // check that non-scoring teams are included in the display list
  expect(points.combined.length).toEqual(8);
  expect(points.womens.length).toEqual(8);
  expect(points.mens.length).toEqual(8);

  const sp = points.combined.find((entry) => entry.team == 'Slow Poke');
  expect(sp).toBeDefined();
  expect(sp?.points).toEqual(0);

  const ifc = points.combined.find((entry) => entry.team == 'Illegally Fast Composite');
  expect(ifc).toBeUndefined();

  // check teams with B entries
  let mb = points.combined.find((entry) => entry.team === 'Mount Baker');
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(65.95);
  mb = points.womens.find((entry) => entry.team === 'Mount Baker');
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(58);

  const glc_mens = points.mens.find((entry) => entry.team === 'Green Lake Crew');
  expect(glc_mens).toBeDefined();
  expect(glc_mens?.points).toEqual(51);

  // 4th place, 5 boats in final - .1 * 15 = 1.5
  const mb_mens = points.mens.find((entry) => entry.team === 'Mount Baker');
  expect(mb_mens).toBeDefined();
  expect(mb_mens?.points).toEqual(7.95);

  const glc_womens = points.womens.find((entry) => entry.team === 'Green Lake Crew');
  expect(glc_womens).toBeDefined();
  expect(glc_womens?.points).toEqual(2.9);

  const ls_mens = points.mens.find((entry) => entry.team === 'Lakeside School');
  expect(ls_mens).toBeDefined();
  expect(ls_mens?.points).toEqual(37.8);

  // validate combined points value and order
  expect(points.combined.map((entry) => entry.points)).toEqual([65.95, 53.9, 46.4, 42.1, 37.8, 11.6, 5.8, 0]);
});

it('barnes points traditional', async () => {
  const points = barnesFullPointsCalc(regattaResults as unknown as Results, false);
  // check that non-scoring non-exhib-only teams are included in the display list
  expect(points.combined.length).toEqual(8);
  expect(points.womensScull.length).toEqual(8);
  expect(points.mensScull.length).toEqual(8);
  expect(points.womensSweep.length).toEqual(8);
  expect(points.mensSweep.length).toEqual(8);

  const sp = points.combined.find((entry) => entry.team == 'Slow Poke');
  expect(sp).toBeDefined();
  expect(sp?.points).toEqual(0);

  const ifc = points.combined.find((entry) => entry.team == 'Illegally Fast Composite');
  expect(ifc).toBeUndefined();

  // check teams with B entries
  let mb = points.combined.find((entry) => entry.team === 'Mount Baker');
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(78.75);
  mb = points.womensSweep.find((entry) => entry.team === 'Mount Baker');
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(60);
  mb = points.womensScull.find((entry) => entry.team === 'Mount Baker');
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(10);

  // check 2x boat class
  // 1st place, varsity => 15 points
  const glc_mscull = points.mensScull.find((entry) => entry.team === 'Green Lake Crew');
  expect(glc_mscull).toBeDefined();
  expect(glc_mscull?.points).toEqual(15);

  // 4th place, 5 boats in final - .1 * 15 = 1.5
  const mb_mscull = points.mensScull.find((entry) => entry.team === 'Mount Baker');
  expect(mb_mscull).toBeDefined();
  expect(mb_mscull?.points).toEqual(0.75);

  // GLC: 6th in frosh 8 and 6th in varsity 8
  // .05 * 30 + .05 * 30 = 3 points
  const glc_wsweep = points.womensSweep.find((entry) => entry.team === 'Green Lake Crew');
  expect(glc_wsweep).toBeDefined();
  expect(glc_wsweep?.points).toEqual(3);

  // check 4+ boat class and JR events
  // LS: 2nd place in JR 4+ and Varsity 4+
  // .8 * 20 + .8 * 20 = 28.8 points
  const ls_msweep = points.mensSweep.find((entry) => entry.team === 'Lakeside School');
  expect(ls_msweep).toBeDefined();
  expect(ls_msweep?.points).toEqual(32);

  // validate combined points value and order
  expect(points.combined.map((entry) => entry.points)).toEqual([78.75, 58.5, 56, 48.5, 41, 14, 7, 0]);
});

it('barnes points with coed and single gender teams', async () => {
  const points = barnesFullPointsCalc(barnesCoedAndSingleGender as unknown as Results, true, true);
  // check that non-scoring non-exhib-only teams are included in the display list
  expect(points.combined.length).toEqual(8);
  expect(points.womensScull.length).toEqual(8);
  expect(points.mensScull.length).toEqual(8);
  expect(points.womensSweep.length).toEqual(8);
  expect(points.mensSweep.length).toEqual(8);

  const sp = points.combined.find((entry) => entry.team == 'Slow Poke');
  expect(sp).toBeDefined();
  expect(sp?.points).toEqual(0);

  const ifc = points.combined.find((entry) => entry.team == 'Illegally Fast Composite');
  expect(ifc).toBeUndefined();

  // check that single gender team does not get points in the combined trophy
  let womensTeam = points.combined.find((entry) => entry.team === 'Exclusively Womens Events Team');
  console.log(points.combined);
  expect(womensTeam).toBeDefined();
  expect(womensTeam?.points).toEqual(0);
  womensTeam = points.womensSweep.find((entry) => entry.team === 'Exclusively Womens Events Team');
  expect(womensTeam).toBeDefined();
  expect(womensTeam?.points).toEqual(4.8);
  womensTeam = points.womensScull.find((entry) => entry.team === 'Exclusively Womens Events Team');
  expect(womensTeam).toBeDefined();
  expect(womensTeam?.points).toEqual(1);
  womensTeam = points.mensSweep.find((entry) => entry.team === 'Exclusively Womens Events Team');
  expect(womensTeam).toBeDefined();
  expect(womensTeam?.points).toEqual(0);
  womensTeam = points.mensScull.find((entry) => entry.team === 'Exclusively Womens Events Team');
  expect(womensTeam).toBeDefined();
  expect(womensTeam?.points).toEqual(0);

  // check that coed team that only scores in a single gender, does get points in combined
  let coedTeam = points.combined.find((entry) => entry.team === 'Co-ed no womens points');
  expect(coedTeam).toBeDefined();
  expect(coedTeam?.points).toEqual(37.8);
  coedTeam = points.womensSweep.find((entry) => entry.team === 'Co-ed no womens points');
  expect(coedTeam).toBeDefined();
  expect(coedTeam?.points).toEqual(0);
  coedTeam = points.womensScull.find((entry) => entry.team === 'Co-ed no womens points');
  expect(coedTeam).toBeDefined();
  expect(coedTeam?.points).toEqual(0);
  coedTeam = points.mensSweep.find((entry) => entry.team === 'Co-ed no womens points');
  expect(coedTeam).toBeDefined();
  expect(coedTeam?.points).toEqual(28.8);
  coedTeam = points.mensScull.find((entry) => entry.team === 'Co-ed no womens points');
  expect(coedTeam).toBeDefined();
  expect(coedTeam?.points).toEqual(9);

  // validate combined points value and order
  expect(points.combined.map((entry) => entry.points)).toEqual([65.95, 53.9, 42.1, 37.8, 0, 0, 0, 0]);
});

it('barnes points by number of entries', async () => {
  const results = simpleResults as unknown as Results;
  // const points = barnesPointsCalc(results, false);
  // check that exhibition crews are excluded from the number of entries
  expect(calculateNumberOfEntries(results.results[0].entries)).toEqual(5);

  const fiveEntries = calculateEventTeamPoints(results.results[1], false);
  expect(fiveEntries.size).toEqual(5);
  expect(fiveEntries.get('Lakeside School')).toEqual(20);
  expect(fiveEntries.get('Everett Rowing')).toEqual(20 * 0.8);
  expect(fiveEntries.get('Mount Baker')).toEqual(20 * 0.4);
  expect(fiveEntries.get('Green Lake Crew')).toEqual(20 * 0.1);
  expect(fiveEntries.get('Holy Names Academy')).toEqual(0);

  const fourEntries = calculateEventTeamPoints(results.results[2], false);
  expect(fourEntries.size).toEqual(4);
  expect(fourEntries.get('Green Lake Crew')).toEqual(20);
  expect(fourEntries.get('Mount Baker')).toEqual(20 * 0.6);
  expect(fourEntries.get('Everett Rowing')).toEqual(20 * 0.3);
  expect(fourEntries.get('Holy Names Academy')).toEqual(20 * 0.05);

  const threeEntries = calculateEventTeamPoints(results.results[3], false);
  expect(threeEntries.size).toEqual(3);
  expect(threeEntries.get('Green Lake Crew')).toEqual(15);
  expect(threeEntries.get('Mount Baker')).toEqual(15 * 0.4);
  expect(threeEntries.get('Everett Rowing')).toEqual(15 * 0.2);

  const twoEntries = calculateEventTeamPoints(results.results[4], false);
  expect(twoEntries.size).toEqual(2);
  expect(twoEntries.get('Green Lake Crew')).toEqual(10);
  expect(twoEntries.get('Mount Baker')).toEqual(10 * 0.2);
});
