import { Results } from "../common/CrewTimerTypes";
import {
  isAFinal,
} from "../common/CrewTimerUtils";

export type BarnesPointsTeamResults = {
  combined: number,
  mensScull: number,
  womensScull: number,
  mensSweep: number,
  womensSweep: number
};

export type TeamPoints = {
  team: string,
  points: number
}

export type BarnesCategoryResults = {
  combined: TeamPoints[],
  mensScull: TeamPoints[],
  womensScull: TeamPoints[],
  mensSweep: TeamPoints[],
  womensSweep: TeamPoints[],
}

const PLACEHOLD_TEAM_NAME = 'Empty'

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
}

/**
 * The max possible number of points for this event given the boat class and event type
 * 
 * @param eventName 
 * @returns Number of points
 */
export const maxPointsByBoatClass = (eventName: string) => {
  const boatClassCaptureExpression = /.* ([1248])[xX\-\+]/;
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
}

/**
 * Number of points for each place in a final, 
 * by the number of entries in the final.
 */
const percentageOfPoints: Map<number, number[]> = new Map([
  [2, [1, .2]],
  [3, [1, .4, .2]],
  [4, [1, .6, .3, .5]],
  [5, [1, .8, .4, .1]],
  [6, [1, .8, .4, .2, .1, .05]]
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
}

const NOVICE_MATCHERS = [
  /NOV/,
  /FRESHMAN/,
  /FROSH/,
  /3V/,
  /3RD/
]

const JUNIOR_MATCHERS = [
  /JUNIOR/,
  /JNR/,
  /JR/,
  /2V/,
  /2ND/
]

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

  if (NOVICE_MATCHERS.some(noviceMatcher => eventName.match(noviceMatcher))) {
    return .6;
  }

  if (JUNIOR_MATCHERS.some(juniorMatcher => eventName.match(juniorMatcher))) {
    return .8;
  }

  // assume this is a varsity event
  return 1;

}

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
  return crewName.replace(suffixExpression, "");
}


/**
 * Sort teams in each category by number of points
 * 
 * @param results 
 * @returns 
 */
const finalizeResults = (results: Map<string, BarnesPointsTeamResults>): BarnesCategoryResults => {
  return {
    combined: Array.from(results.entries())
      .sort((a, b) => b[1].combined - a[1].combined)
      .map(value => ({ team: value[0], points: value[1].combined })),

    mensScull: Array.from(results.entries())
      .sort((a, b) => b[1].mensScull - a[1].mensScull)
      .map(value => ({ team: value[0], points: value[1].mensScull })),

    womensScull: Array.from(results.entries())
      .sort((a, b) => b[1].womensScull - a[1].womensScull)
      .map(value => ({ team: value[0], points: value[1].womensScull })),

    mensSweep: Array.from(results.entries())
      .sort((a, b) => b[1].mensSweep - a[1].mensSweep)
      .map(value => ({ team: value[0], points: value[1].mensSweep })),

    womensSweep: Array.from(results.entries())
      .sort((a, b) => b[1].womensSweep - a[1].womensSweep)
      .map(value => ({ team: value[0], points: value[1].womensSweep }))
  }
}

/**
 * Calculate points based on the Barnes Scoring System, as described by MSRA:
 * https://sites.google.com/site/msrahome/regatta-rules/home
 */
export const barnesPointsCalc = (resultData: Results, useScaledEvents: boolean): BarnesCategoryResults => {
  const teamPoints = new Map<string, BarnesPointsTeamResults>();

  resultData.results.forEach((eventResult) => {
    const eventTeamPoints = new Map<string, number>();

    const candidateMatches = [/WOMEN/, /GIRL/];
    const isWomensEvent = candidateMatches.some(candidate => eventResult.Event.toUpperCase().search(candidate) != -1)
    const isScullingEvent = eventResult.Event.match(/[1234]x/) != null;

    if (!isAFinal(eventResult.Event, eventResult.EventNum)) {
      return; // not a final (e.g. Heat, TT)
    }

    const maxPoints = maxPointsFromName(eventResult.Event, useScaledEvents);
    const numberOfEntries = eventResult.entries.length;

    // track the team's we've seen in this event to exclude anything that is not
    // a primary entry (ex: B entries, second entries)
    const placingTeams = new Set<string>();

    const sortedEntries = eventResult.entries.sort(
      (lhs, rhs) => (lhs.Place || Number.MAX_VALUE) - (rhs.Place || Number.MAX_VALUE)
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

    // aggregate the points from this event into the whole team points table
    eventTeamPoints.forEach((points: number, teamName: string) => {
      const teamEntry = teamPoints.get(teamName);

      if (!teamEntry) {
        teamPoints.set(teamName, {
          combined: points,
          womensScull: isWomensEvent && isScullingEvent ? points : 0,
          mensScull: !isWomensEvent && isScullingEvent ? points : 0,
          womensSweep: isWomensEvent && !isScullingEvent ? points : 0,
          mensSweep: !isWomensEvent && !isScullingEvent ? points : 0
        });
      } else {
        teamPoints.set(teamName, {
          combined: teamEntry.combined + points,
          womensScull: teamEntry.womensScull + (isWomensEvent && isScullingEvent ? points : 0),
          mensScull: teamEntry.mensScull + (!isWomensEvent && isScullingEvent ? points : 0),
          womensSweep: teamEntry.womensSweep + (isWomensEvent && !isScullingEvent ? points : 0),
          mensSweep: teamEntry.mensSweep + (!isWomensEvent && !isScullingEvent ? points : 0)
        });
      }
    });

  });

  // check if there were teams entered which scored 0 points,
  // but which still need to be represented on the results page
  const scoringTeams = new Set<string>(teamPoints.keys());
  const missingTeams = new Set<string>();
  resultData.results.forEach(event =>
    event.entries.forEach(entry => {
      const teamName = trimCrewName(entry.Crew);
      if (!scoringTeams.has(teamName) && teamName != PLACEHOLD_TEAM_NAME) {
        missingTeams.add(teamName);
      }
    }));

  missingTeams.forEach(missingTeam => teamPoints.set(missingTeam, {
    combined: 0,
    womensScull: 0,
    mensScull: 0,
    womensSweep: 0,
    mensSweep: 0
  }))

  return finalizeResults(teamPoints);
};
