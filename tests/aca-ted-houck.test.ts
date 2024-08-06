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
  expect(points.trophies[0].winner).toEqual('Scoggins,Ellie');
  expect(points.trophies[0].winnerClub).toEqual('BHAM');
  expect(points.trophies[0].winnerTime).toEqual('02:17.302');
  expect(points.trophies[0].name).toEqual('Francine Fox Award');
  expect(points.trophies[0].criteria).toEqual('Winner of the K1 500 U16 (Juvenile)Women');
});

it('aca internatioal club for nationals', async () => {
  // Same as above test but GHCKRT declared International so any boat with a GHCKRT
  // athlete is excluded from earning points.  Also, Bantam needs 100 entries in a race to earn points.
  const resultsCopy = { ...(regattaResults as unknown as Results) };
  resultsCopy.regattaInfo = { ...resultsCopy.regattaInfo };
  resultsCopy.regattaInfo.json = '{"excludedClubsForPoints":["GHCKRT"],"minEntriesForPoints":{"Bantam":100}}';
  const points = acaPointsCalc(resultsCopy as unknown as Results);
  expect(points).toBeDefined();
  expect(points.classTotals.PARACANOE[0].points).toEqual(7);
  expect(points.classTotals.PARACANOE[0].index).toEqual('SCKC');
  expect(points.classTotals.PARACANOE[0].place).toEqual(1);
  expect(points.clubTotals[0]?.index).toEqual('False Creek');
  expect(points.clubTotals[0]?.points).toEqual(368);
  expect(points.clubTotals[0]?.place).toEqual(1);

  expect(points.genderLevelTotals['Mens K4']?.[0]?.index).toEqual('False Creek');
  expect(points.genderLevelTotals['Womens K4']?.[1]?.points).toEqual(9.5);

  expect(points.levelTotals['Junior']?.[0]?.index).toEqual('False Creek');

  expect(points.paddlersByClub['False Creek']?.size).toEqual(30);

  expect(points.paddlerTotals[0]).toEqual({ index: 'So,Veronica', points: 44, place: 1 });
  expect(points.paddlerClassTotals['Junior']?.[0]).toEqual({ index: 'Scoggins,Abby', points: 23.5, place: 1 });
  expect(points.trophies[0].winner).toEqual('Scoggins,Ellie');
  expect(points.trophies[0].winnerClub).toEqual('BHAM');
  expect(points.trophies[0].winnerTime).toEqual('02:17.302');
  expect(points.trophies[0].name).toEqual('Francine Fox Award');
  expect(points.trophies[0].criteria).toEqual('Winner of the K1 500 U16 (Juvenile)Women');
});
