import sprintsResults from './data/crewtimer-results-r12967.json';
import { SprintsPointsCalc } from '../src/calculators/SprintsPointsCalc';
import { expect, it } from '@jest/globals';
import { Results } from 'crewtimer-common';

it('sprints points', async () => {
  const points = SprintsPointsCalc(sprintsResults as unknown as Results);
  // check that non-scoring teams are included in the display list
  expect(points.combined.length).toEqual(15);
  expect(points.womens.length).toEqual(15);
  expect(points.mens.length).toEqual(15);

  // check to 'No Race' is not included in the display list
  const ifc = points.combined.find((entry) => entry.team == 'No Race');
  expect(ifc).toBeUndefined();

  // check total points
  const hanlant = points.combined.find((entry) => entry.team === 'Hanlan');
  expect(hanlant).toBeDefined();
  expect(hanlant?.points).toEqual(10);

  const nt = points.combined.find((entry) => entry.team === 'New Trier');
  expect(nt).toBeDefined();
  expect(nt?.points).toEqual(90);
  expect(nt?.place).toEqual(1);

  const mendotat = points.combined.find((entry) => entry.team === 'Mendota');
  expect(mendotat).toBeDefined();
  expect(mendotat?.points).toEqual(45);
  expect(mendotat?.place).toEqual(2);

  // check sculling points
  const hanlan = points.combinedScull.find((entry) => entry.team === 'Hanlan');
  expect(hanlan).toBeDefined();
  expect(hanlan?.points).toEqual(10);

  const lpbc = points.combinedScull.find((entry) => entry.team === 'Lincoln Park Boat Club');
  expect(lpbc).toBeDefined();
  expect(lpbc?.points).toEqual(12.5);

  const mendota = points.combinedScull.find((entry) => entry.team === 'Mendota');
  expect(mendota).toBeDefined();
  expect(mendota?.points).toEqual(45);
  expect(mendota?.place).toEqual(1);

  const cinci = points.combinedScull.find((entry) => entry.team === 'Cincinnati RC');
  expect(cinci).toBeDefined();
  expect(cinci?.points).toEqual(25);
  expect(cinci?.place).toEqual(2);

  // check junior points
  const ntj = points.junior.find((entry) => entry.team === 'New Trier');
  expect(ntj).toBeDefined();
  expect(ntj?.points).toEqual(30);
  expect(ntj?.place).toEqual(1);

  const lpj = points.junior.find((entry) => entry.team === 'Lincoln Park Boat Club');
  expect(lpj).toBeDefined();
  expect(lpj?.points).toEqual(0);
  expect(lpj?.place).toEqual(2);
});
