import regattaResults from './data/crewtimer-results-dev-r12033-export.json';
import { simplePointsCalc } from '../src/calculators/SimpleTeamPointsCalc';
import { expect, it } from '@jest/globals';
import { Results } from '../src/common/CrewTimerTypes';

it('simple points', async () => {
    const points = simplePointsCalc(regattaResults as unknown as Results);
    const lks = points.find(entry => entry.team === 'Lake Stevens');
    expect(lks).toBeDefined();
    expect(lks?.points).toEqual(24);

    const era = points.find(entry => entry.team === 'Everett Rowing');
    expect(era).toBeDefined();
    expect(era?.points).toEqual(8);
});