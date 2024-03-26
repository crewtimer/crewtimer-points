import { Entry, Event, Results, genPlaces } from 'crewtimer-common';
import { isAFinal } from '../common/CrewTimerUtils';

export type BarnesPointsTeamResults = {
  combined: number;
  mensScull: number;
  womensScull: number;
  mensSweep: number;
  womensSweep: number;
};

export type BarnesPointsTeamResultsRanked = {
  combined: PointsPlace;
  mensScull: PointsPlace;
  womensScull: PointsPlace;
  mensSweep: PointsPlace;
  womensSweep: PointsPlace;
};

export type PointsPlace = {
  points: number;
  place: number;
}

export type TeamPoints = {
  team: string;
  points: number;
  place: number;
};

export type BarnesFullCategoryResults = {
  combined: TeamPoints[];
  mensScull: TeamPoints[];
  womensScull: TeamPoints[];
  mensSweep: TeamPoints[];
  womensSweep: TeamPoints[];
};

export type BarnesSimpleCategoryResults = {
  combined: TeamPoints[];
  mens: TeamPoints[];
  womens: TeamPoints[];
};

const PLACEHOLD_TEAM_NAME = 'Empty';
const EXHIB_PENALTY_CODE = 'Exhib';
const WOMENS_EVENT_REGEX_MATCHERS = [/WOMEN/, /GIRL/];

/**
 * The max possible number of points for this event given the boat class and event type
 *
 * @param eventName
 * @returns Number of points
 */
export const maxPointsFromName = (eventName: string, useScaledEvents: boolean) => {
  eventName = eventName.toUpperCase();
  const points = maxPointsByBoatClass(eventName);
  return points * scaleByEventType(eventName, useScaledEvents);
};

/**
 * The max possible number of points for this event given the boat class and event type
 *
 * @param eventName
 * @returns Number of points
 */
export const maxPointsByBoatClass = (eventName: string) => {
  const boatClassCaptureExpression = /.* ([1248])[xX\-+]/;
  const match = eventName.match(boatClassCaptureExpression);

  if (match && match.length > 1) {
    const boatClass = Number.parseInt(match[1]);
    if (boatClass == 1) {
      return 10;
    }
    if (boatClass == 2) {
      return 15;
    }
    if (boatClass == 4) {
      return 20;
    }
    if (boatClass == 8) {
      return 30;
    }
  }

  // assume there is at least one person per boat
  return 10;
};

/**
 * Number of points for each place in a final,
 * by the number of entries in the final.
 */
const percentageOfPoints: Map<number, number[]> = new Map([
  [2, [1, 0.2]],
  [3, [1, 0.4, 0.2]],
  [4, [1, 0.6, 0.3, 0.05]],
  [5, [1, 0.8, 0.4, 0.1]],
  [6, [1, 0.8, 0.4, 0.2, 0.1, 0.05]],
]);

/**
 * Given the number of entries in an event and a boats placement,
 * determine the percentage of points for the given place
 *
 * @param numberOfEntries
 * @param place
 * @returns (float) A pergentage between [0,1]
 */
const scalePoints = (numberOfEntries: number, place: number) => {
  if (numberOfEntries < 2) {
    return 0;
  }

  // snap to 6, even if there were more lanes
  if (numberOfEntries > 6) {
    numberOfEntries = 6;
  }

  const scalars = percentageOfPoints.get(numberOfEntries);
  if (!scalars || place > scalars.length) {
    return 0;
  }

  return scalars[place - 1];
};

const NOVICE_MATCHERS = [/NOV/, /FRESHMAN/, /FROSH/, /3V/, /3RD/];

const JUNIOR_MATCHERS = [/JUNIOR/, /JNR/, /JR/, /2V/, /2ND/];

/**
 * Based on whether this is a varsity, junior, or novice event
 * return the percentage of max points to use
 *
 * 1st Varsity: 100%
 * 2nd Varsity/Junior/JV: 80%
 * 3rd Varsity/Novice/Freshman/Frosh: 60%
 *
 * @param eventName
 */
const scaleByEventType = (eventName: string, useScaledEvents: boolean) => {
  if (!useScaledEvents) {
    return 1;
  }

  if (NOVICE_MATCHERS.some((noviceMatcher) => eventName.match(noviceMatcher))) {
    return 0.6;
  }

  if (JUNIOR_MATCHERS.some((juniorMatcher) => eventName.match(juniorMatcher))) {
    return 0.8;
  }

  // assume this is a varsity event
  return 1;
};

/**
 * Extract the root team name. This will trim any trailing single characters
 * which were used as A or B boat designations
 *
 * For example:
 * "Green Lake Crew A" -> "Green Lake Crew"
 * "Green Lake Crew B" -> "Green Lake Crew"
 * "Green Lake Crew"   -> "Green Lake Crew"
 *
 * @param crewName
 * @returns (string) The team name
 */
const trimCrewName = (crewName: string) => {
  crewName = crewName.trim();
  const suffixExpression = / .$/;
  return crewName.replace(suffixExpression, '');
};

/**
 * Assign places to an array of TeamPoints
 * 
 * @param TeamPoints[]
 */
const assignPlaces = (teamPoints: TeamPoints[]) => {
  const places = genPlaces(teamPoints.map(teamEntry => teamEntry.points),
    'desc'
  )
  places.forEach((place, i) => teamPoints[i].place = place)
}

/**
 * Sort teams in each category by number of points, including sweep/sculling split out
 *
 * @param results
 * @returns
 */
const finalizeFullResults = (results: Map<string, BarnesPointsTeamResults>): BarnesFullCategoryResults => {
  const sortedPoints = {
    combined: Array.from(results.entries())
      .sort((a, b) => b[1].combined - a[1].combined)
      .map((value) => ({ team: value[0], points: value[1].combined, place: 0 })),

    mensScull: Array.from(results.entries())
      .sort((a, b) => b[1].mensScull - a[1].mensScull)
      .map((value) => ({ team: value[0], points: value[1].mensScull, place: 0 })),

    womensScull: Array.from(results.entries())
      .sort((a, b) => b[1].womensScull - a[1].womensScull)
      .map((value) => ({ team: value[0], points: value[1].womensScull, place: 0 })),

    mensSweep: Array.from(results.entries())
      .sort((a, b) => b[1].mensSweep - a[1].mensSweep)
      .map((value) => ({ team: value[0], points: value[1].mensSweep, place: 0 })),

    womensSweep: Array.from(results.entries())
      .sort((a, b) => b[1].womensSweep - a[1].womensSweep)
      .map((value) => ({ team: value[0], points: value[1].womensSweep, place: 0 })),
  };

  assignPlaces(sortedPoints.combined);
  assignPlaces(sortedPoints.mensScull);
  assignPlaces(sortedPoints.womensScull);
  assignPlaces(sortedPoints.mensSweep);
  assignPlaces(sortedPoints.womensSweep);

  return sortedPoints;
};

/**
 * Sort teams in each category by number of points
 *
 * @param results
 * @returns
 */
const finalizeResults = (results: Map<string, BarnesPointsTeamResults>) => {
  const sortedPoints = {
    combined: Array.from(results.entries())
      .sort((a, b) => b[1].combined - a[1].combined)
      .map((value) => ({ team: value[0], points: value[1].combined, place: 0 })),

    mens: Array.from(results.entries())
      .sort((a, b) => b[1].mensScull + b[1].mensSweep - (a[1].mensScull + a[1].mensSweep))
      .map((value) => ({ team: value[0], points: value[1].mensScull + value[1].mensSweep, place: 0 })),

    womens: Array.from(results.entries())
      .sort((a, b) => b[1].womensScull + b[1].womensSweep - (a[1].womensScull + a[1].womensSweep))
      .map((value) => ({ team: value[0], points: value[1].womensScull + value[1].womensSweep, place: 0 })),
  };

  assignPlaces(sortedPoints.combined);
  assignPlaces(sortedPoints.mens);
  assignPlaces(sortedPoints.womens);

  return sortedPoints;
};

/**
 * Returns the number of entries, excluding any exhibition crews
 *
 * @param entries
 * @returns number of elligible entries
 */
export const calculateNumberOfEntries = (entries: Entry[]) => {
  return entries.filter((entry) => entry.PenaltyCode != 'Exhib').length;
};

export const calculateEventTeamPoints = (eventResult: Event, useScaledEvents: boolean): Map<string, number> => {
  const eventTeamPoints = new Map<string, number>();

  if (!isAFinal(eventResult.Event, eventResult.EventNum)) {
    return eventTeamPoints; // not a final (e.g. Heat, TT)
  }

  const maxPoints = maxPointsFromName(eventResult.Event, useScaledEvents);
  const numberOfEntries = calculateNumberOfEntries(eventResult.entries || []);

  // track the team's we've seen in this event to exclude anything that is not
  // a primary entry (ex: B entries, second entries)
  const placingTeams = new Set<string>();

  const sortedEntries = (eventResult.entries || []).sort(
    (lhs, rhs) => (lhs.Place || Number.MAX_VALUE) - (rhs.Place || Number.MAX_VALUE),
  );

  sortedEntries.forEach((entry) => {
    const teamName = trimCrewName(entry.Crew);
    if (!entry.Place) {
      return; // DNF, DNS, DQ, Exhib etc
    }

    // if a team has already placed in this event, skip subsequent entries
    if (placingTeams.has(teamName)) {
      return;
    }

    placingTeams.add(teamName);

    const points = maxPoints * scalePoints(numberOfEntries, entry.Place);

    eventTeamPoints.set(teamName, points);
  });

  return eventTeamPoints;
};

/**
 * Identify all teams which are entered in either only Men's or only Women's events and
 * which could be elligible for exclusion from the Combined points table
 */

const getCoedTeams = (eventResults: Event[]): Set<string> => {
  const womensTeams = new Set<string>();
  const mensTeams = new Set<string>();

  eventResults.forEach((eventResult) => {
    if (womensEvent(eventResult.Event)) {
      eventResult.entries.forEach((entry) => {
        womensTeams.add(trimCrewName(entry.Crew));
      });
    } else {
      eventResult.entries.forEach((entry) => {
        mensTeams.add(trimCrewName(entry.Crew));
      });
    }
  });

  const coedTeams = new Set<string>();
  womensTeams.forEach((team) => {
    if (mensTeams.has(team)) {
      coedTeams.add(team);
    }
  });

  return coedTeams;
};

/**
 * Return true if the event name indicated that this is a women's event
 */
export const womensEvent = (eventName: string): boolean => {
  return WOMENS_EVENT_REGEX_MATCHERS.some((candidate) => eventName.toUpperCase().search(candidate) != -1);
};

/**
 * Calculate points based on the Barnes Scoring System, as described by MSRA:
 * https://sites.google.com/site/msrahome/regatta-rules/home
 */
export const barnesPointsImpl = (
  resultData: Results,
  useScaledEvents: boolean,
  coedTeamsOnlyInCombined?: boolean,
): Map<string, BarnesPointsTeamResults> => {
  const teamPoints = new Map<string, BarnesPointsTeamResults>();

  const coedTeams = getCoedTeams(resultData.results);

  resultData.results.forEach((eventResult) => {
    const isWomensEvent = womensEvent(eventResult.Event);
    const isScullingEvent = eventResult.Event.match(/[1234]x/) != null;

    const eventTeamPoints = calculateEventTeamPoints(eventResult, useScaledEvents);

    // aggregate the points from this event into the whole team points table
    eventTeamPoints.forEach((points: number, teamName: string) => {
      const teamEntry = teamPoints.get(teamName);

      if (!teamEntry) {
        teamPoints.set(teamName, {
          // if we only allow coed teams to get points towards the combined trophy, and this is not a coed team,
          // give them 0 points towards the combined trophy
          combined: coedTeamsOnlyInCombined && !coedTeams.has(teamName) ? 0 : points,
          womensScull: isWomensEvent && isScullingEvent ? points : 0,
          mensScull: !isWomensEvent && isScullingEvent ? points : 0,
          womensSweep: isWomensEvent && !isScullingEvent ? points : 0,
          mensSweep: !isWomensEvent && !isScullingEvent ? points : 0,
        });
      } else {
        teamPoints.set(teamName, {
          combined: coedTeamsOnlyInCombined && !coedTeams.has(teamName) ? 0 : teamEntry.combined + points,
          womensScull: teamEntry.womensScull + (isWomensEvent && isScullingEvent ? points : 0),
          mensScull: teamEntry.mensScull + (!isWomensEvent && isScullingEvent ? points : 0),
          womensSweep: teamEntry.womensSweep + (isWomensEvent && !isScullingEvent ? points : 0),
          mensSweep: teamEntry.mensSweep + (!isWomensEvent && !isScullingEvent ? points : 0),
        });
      }
    });
  });

  // check if there were teams entered which scored 0 points,
  // but which still need to be represented on the results page
  // exhibition crews are ignored
  const scoringTeams = new Set<string>(teamPoints.keys());
  const missingTeams = new Set<string>();
  resultData.results.forEach((event) =>
    event.entries?.forEach((entry) => {
      const teamName = trimCrewName(entry.Crew);
      if (!scoringTeams.has(teamName) && teamName != PLACEHOLD_TEAM_NAME && entry.PenaltyCode != EXHIB_PENALTY_CODE) {
        missingTeams.add(teamName);
      }
    }),
  );

  missingTeams.forEach((missingTeam) =>
    teamPoints.set(missingTeam, {
      combined: 0,
      womensScull: 0,
      mensScull: 0,
      womensSweep: 0,
      mensSweep: 0,
    }),
  );

  return teamPoints;
};

/**
 * Calculate points based on the Barnes Scoring System, as described by MSRA:
 * https://sites.google.com/site/msrahome/regatta-rules/home
 */
export const barnesFullPointsCalc = (
  resultData: Results,
  useScaledEvents: boolean,
  coedTeamsOnlyInCombined?: boolean,
): BarnesFullCategoryResults => {
  const teamPoints = barnesPointsImpl(resultData, useScaledEvents, coedTeamsOnlyInCombined);

  return finalizeFullResults(teamPoints);
};

/**
 * Calculate points based on the Barnes Scoring System, as described by MSRA:
 * https://sites.google.com/site/msrahome/regatta-rules/home
 */
export const barnesPointsCalc = (resultData: Results, useScaledEvents: boolean): BarnesSimpleCategoryResults => {
  const teamPoints = barnesPointsImpl(resultData, useScaledEvents);

  return finalizeResults(teamPoints);
};
