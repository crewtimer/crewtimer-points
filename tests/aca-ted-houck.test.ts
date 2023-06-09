import regattaResults from './data/crewtimer-results-aca-ted-houck-results.json';
import { expect, it } from '@jest/globals';
import { Results } from 'crewtimer-common';
import { acaPointsCalc } from '../src/calculators/ACATeamPointsCalc';

//
// Based on https://www.crewtimer.com/regatta/jnnhxoep
//
it('aca team points', async () => {
  const points = acaPointsCalc(regattaResults as unknown as Results);
  expect(points).toBeDefined();
  expect(points.classTotals.PARACANOE[0].points).toEqual(36);
  expect(points.classTotals.PARACANOE[0].index).toEqual('GHCKRT');
  expect(points.classTotals.PARACANOE[0].place).toEqual(1);
  expect(points.clubTotals[0]?.index).toEqual('False Creek');
  expect(points.clubTotals[0]?.points).toEqual(484.25);
  expect(points.clubTotals[0]?.place).toEqual(1);

  expect(points.genderLevelTotals['Mens K4']?.[0]?.index).toEqual('False Creek');
  expect(points.genderLevelTotals['Womens K4']?.[1]?.points).toEqual(18);

  expect(points.levelTotals['Junior']?.[0]?.index).toEqual('False Creek');

  expect(points.paddlersByClub['False Creek']?.size).toEqual(38);

  expect(points.paddlerTotals[0]).toEqual({ index: 'So,Veronica', points: 44, place: 1 });
  expect(points.paddlerClassTotals['Junior']?.[0]).toEqual({ index: 'Scoggins,Abby', points: 23.5, place: 1 });
});
