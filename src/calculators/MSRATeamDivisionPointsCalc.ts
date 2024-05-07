import { Results, genPlaces } from 'crewtimer-common';
import { barnesPointsImpl } from './BarnesPointsCalc';

type DivisionDetails = {
  min: number;
  max: number;
};

export const DIVISION_SIZES = new Map<string, DivisionDetails>([
  ['I', { min: 55, max: Number.MAX_VALUE }],
  ['II', { min: 22, max: 55 }],
  ['III', { min: 0, max: 22 }],
  ['unknown', { min: Number.MAX_VALUE, max: Number.MIN_VALUE }], // nothing can match this in normal processing
]);

/**
 * Returns the name of the division which corresponds to the team size.
 * Returns "unknown" if the team size is not eligible for any division.
 * @param teamSize
 * @returns number: numeric division or MAX_INT for invalid teamsize
 */
const getDivisionByTeamSize = (teamSize: number): string => {
  for (const division of DIVISION_SIZES.entries()) {
    if (division[1].min <= teamSize && division[1].max > teamSize) {
      return division[0];
    }
  }
  return 'unknown';
};

/**
 * Given a json mapping from the division name to the min number of athletes required to be in that division,
 * adjust the division boundaries. If the provided map doesn't include values for DI and DII, use the
 * defaults. DIII is assumed to be the lowest starting at 0 athletes.
 *
 * @param divisionMinimums json mapping division name to the min number of athletes
 */
const maybeAdjustDivisions = (divisionMinimums: any) => {
  if (divisionMinimums.size != 2 && !(divisionMinimums['I'] && divisionMinimums['II'])) {
    return;
  }

  DIVISION_SIZES.set('I', { min: divisionMinimums['I'] || 55, max: Number.MAX_VALUE });
  DIVISION_SIZES.set('II', { min: divisionMinimums['II'] || 22, max: divisionMinimums['I'] || 55 });
  DIVISION_SIZES.set('III', { min: 0, max: divisionMinimums['II'] || 22 });
};

export type TeamResult = {
  teamName: string;
  points: number;
  place: number;
  teamSize?: number;
  division?: string;
};

/**
 * Calculate the team's points and split them by division.
 * Returns a mapping from division name to a list of team's results.
 * Teams for which the team size or division cannot be determined will be put in the "unknown" division map.
 * @param resultsData
 */
export const pointsByDivision = (resultsData: Results): Map<string, TeamResult[]> => {
  const regattaInfoJson = JSON.parse(resultsData.regattaInfo.json || '{}');
  console.log(typeof regattaInfoJson);
  const teamSizes = regattaInfoJson?.teamSizes || {};
  const teamDivisionOverrides = regattaInfoJson?.divisionOverrides || {};
  const divisionMinimums = regattaInfoJson?.divisionMinimums || {};

  maybeAdjustDivisions(divisionMinimums);

  const allTeamPoints = barnesPointsImpl(resultsData, true);

  const finalPoints = new Map<string, TeamResult[]>();
  DIVISION_SIZES.forEach((_, divName) => finalPoints.set(divName, []));

  if (!teamSizes) {
    return new Map([['unknown', []]]);
  }

  allTeamPoints.forEach((teamBarnesResults, teamName) => {
    const teamSize = teamSizes[teamName] || 0;
    const division = teamDivisionOverrides[teamName] || getDivisionByTeamSize(teamSize);

    finalPoints.get(division)?.push({
      teamName: teamName,
      points: teamBarnesResults.combined,
      place: 0,
      teamSize: teamSize,
      division: division,
    });
  });

  finalPoints.forEach((teamResults) => {
    teamResults.sort((lhs, rhs) => rhs.points - lhs.points);
    const places = genPlaces(
      teamResults.map((teamResult) => teamResult.points),
      'desc',
    );
    places.forEach((place, idx) => (teamResults[idx].place = place));
  });

  return finalPoints;
};
