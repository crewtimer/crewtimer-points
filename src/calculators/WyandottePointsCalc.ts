/**********************************************************************
 * Calculate points for Hebda Cup and Wy-Hi regattas.
 * Scoring systems are detailed in the docs folder:
 *     docs/HedbaCupScoring.pdf
 *     docs/WyHiScoring.pdf
 *
 * This code was modified from the BarnesPointsCalc.ts file to
 * support the Hebda Cup and Wy-Hi regattas.
 *********************************************************************/

import { Entry, Event, Results } from 'crewtimer-common';
import { isAFinal } from '../common/CrewTimerUtils';

export type WyandottePointsTeamResults = {
  combined: number;
  mens: number;
  womens: number;
};

export type TeamPoints = {
  team: string;
  points: number;
};

export type WyandotteCategoryResults = {
  combined: TeamPoints[];
  mens: TeamPoints[];
  womens: TeamPoints[];
};

const PLACEHOLD_TEAM_NAME = 'Empty';
const EXHIB_PENALTY_CODE = 'Exhib';

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
 * Returns the number of entries, excluding any exhibition crews
 *
 * @param entries
 * @returns number of elligible entries
 */
export const calculateNumberOfEntries = (entries: Entry[]) => {
  return entries.filter((entry) => entry.PenaltyCode != 'Exhib').length;
};

/****************************************************************************************
 * All code above this comment block is used for both Hebda and Wy-Hi Regattas
 ****************************************************************************************/

/**
 * The max possible number of points for this event given the boat class and event type
 *
 * @param eventName
 * @returns Number of points
 */
export const hebdaMaxPointsFromName = (eventName: string) => {
  eventName = eventName.toUpperCase();
  const points = hebdaMaxPointsByBoatClass(eventName);
  return points;
};

export const hebdaMaxPointsByBoatClass = (eventName: string) => {
  const boatClassCaptureExpression = /.* ([248])[xX\-+]/;
  const match = eventName.match(boatClassCaptureExpression);

  if (match && match.length > 1) {
    const boatClass = Number.parseInt(match[1]);
    if (boatClass == 2) {
      return 2;
    }
    if (boatClass == 4) {
      return 5;
    }
    if (boatClass == 8) {
      return 9;
    }
  }

  return 2;
};

const hebdaPointsMap: Map<number, number[]> = new Map([
  [2, [1, 1 / 2, 1 / 4]],
  [5, [1, 2 / 5, 1 / 5]],
  [9, [1, 4 / 9, 2 / 9]],
]);

const hebdaScalePoints = (numberOfEntries: number, place: number, maxPoints: number) => {
  if (numberOfEntries < 2) {
    return 0;
  }
  if (numberOfEntries >= 2) {
    numberOfEntries--;
  }
  if (numberOfEntries >= 3) {
    numberOfEntries = 3;
  }

  const scalars = hebdaPointsMap.get(maxPoints);
  if (!scalars || place > numberOfEntries) {
    return 0;
  }

  return scalars[place - 1];
};

const hebdaFinalizeResults = (results: Map<string, WyandottePointsTeamResults>) => {
  return {
    combined: Array.from(results.entries())
      .sort((a, b) => b[1].combined - a[1].combined)
      .map((value) => ({ team: value[0], points: value[1].combined })),

    mens: Array.from(results.entries())
      .sort((a, b) => b[1].mens - a[1].mens)
      .map((value) => ({ team: value[0], points: value[1].mens })),

    womens: Array.from(results.entries())
      .sort((a, b) => b[1].womens - a[1].womens)
      .map((value) => ({ team: value[0], points: value[1].womens })),
  };
};

export const hebdaCalculateEventTeamPoints = (eventResult: Event): Map<string, number> => {
  const eventTeamPoints = new Map<string, number>();

  if (!isAFinal(eventResult.Event, eventResult.EventNum)) {
    return eventTeamPoints; // not a final (e.g. Heat, TT)
  }

  const maxPoints = hebdaMaxPointsFromName(eventResult.Event);
  const numberOfEntries = calculateNumberOfEntries(eventResult.entries);

  // track the team's we've seen in this event to exclude anything that is not
  // a primary entry (ex: B entries, second entries)
  const placingTeams = new Set<string>();

  const sortedEntries = eventResult.entries.sort(
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

    const points = maxPoints * hebdaScalePoints(numberOfEntries, entry.Place, maxPoints);

    eventTeamPoints.set(teamName, points);
  });

  return eventTeamPoints;
};

export const hebdaPointsImpl = (resultData: Results): Map<string, WyandottePointsTeamResults> => {
  const teamPoints = new Map<string, WyandottePointsTeamResults>();
  resultData.results.forEach((eventResult) => {
    const candidateMatches = [/WOMEN/, /GIRL/];
    const isWomensEvent = candidateMatches.some((candidate) => eventResult.Event.toUpperCase().search(candidate) != -1);

    const eventTeamPoints = hebdaCalculateEventTeamPoints(eventResult);

    // aggregate the points from this event into the whole team points table
    eventTeamPoints.forEach((points: number, teamName: string) => {
      const teamEntry = teamPoints.get(teamName);

      if (!teamEntry) {
        teamPoints.set(teamName, {
          combined: points,
          mens: !isWomensEvent ? points : 0,
          womens: isWomensEvent ? points : 0,
        });
      } else {
        teamPoints.set(teamName, {
          combined: teamEntry.combined + points,
          mens: teamEntry.mens + (!isWomensEvent ? points : 0),
          womens: teamEntry.womens + (isWomensEvent ? points : 0),
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
    event.entries.forEach((entry) => {
      const teamName = trimCrewName(entry.Crew);
      if (!scoringTeams.has(teamName) && teamName != PLACEHOLD_TEAM_NAME && entry.PenaltyCode != EXHIB_PENALTY_CODE) {
        // Ignore events where 'No Race' is the only entry to clean up standings
        if (teamName != 'No Race') missingTeams.add(teamName);
      }
    }),
  );

  missingTeams.forEach((missingTeam) =>
    teamPoints.set(missingTeam, {
      combined: 0,
      mens: 0,
      womens: 0,
    }),
  );

  return teamPoints;
};

/**
 * Calculate points based on the Hebda Cub Scoring System, as described by the Wyandotte Boat Club:
 * https://wyandotteboatclub.com/hebda-cup/
 */
export const hebdaPointsCalc = (resultData: Results): WyandotteCategoryResults => {
  const teamPoints = hebdaPointsImpl(resultData);

  return hebdaFinalizeResults(teamPoints);
};

/****************************************************************************************
 * The code below this comment block is used for Wy-Hi Regattas only
 * Check the WyHiScoring pdf under 'docs' for more information
 *
 */

/**
 * The max possible number of points for this event given the boat class and event type
 *
 * @param eventName
 * @returns Number of points
 */
export const wyHiMaxPointsFromName = (eventName: string) => {
  eventName = eventName.toUpperCase();
  const points = wyHiMaxPointsByBoatClass(eventName);
  return points;
};

/**
 * Returns the max possible number of points for this event given the boat class and event type
 * @param eventName
 * @returns Number of maximum points
 */
export const wyHiMaxPointsByBoatClass = (eventName: string) => {
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

  return 10; // default to 10 points
};

/**
 * Returns true if the event is a final only event
 *
 * @param eventInfo
 * @returns true if the event is final only
 */
export const isFinalOnly = (eventInfo: string) => {
  return eventInfo.toUpperCase() == 'FINAL ONLY';
};

/**
 * Points map for "Final Onyl" events
 */
const wyHiPointsMapFinalOnly: Map<number, number[]> = new Map([
  [10, [1, 1 / 2, 3 / 10, 1 / 10, 0, 0, 0]],
  [15, [1, 8 / 15, 4 / 15, 2 / 15, 1 / 15, 0, 0]],
  [20, [1, 1 / 2, 1 / 4, 3 / 20, 1 / 10, 1 / 20, 0]],
  [30, [1, 1 / 2, 4 / 15, 2 / 15, 1 / 15, 1 / 30, 0]],
]);

/**
 *  Points map for "From Heats" events
 */
const wyHiPointsMapFromHeats: Map<number, number[]> = new Map([
  [10, [1, 4 / 5, 3 / 5, 1 / 2, 2 / 5, 3 / 10, 1 / 5]],
  [15, [1, 11 / 15, 8 / 15, 2 / 5, 1 / 3, 4 / 15, 1 / 5]],
  [20, [1, 3 / 4, 11 / 20, 2 / 5, 3 / 10, 1 / 4, 1 / 5]],
  [30, [1, 23 / 30, 17 / 30, 13 / 30, 1 / 3, 4 / 15, 1 / 5]],
]);

const wyHiScalePoints = (numberOfEntries: number, place: number, maxPoints: number, finalOnly: boolean) => {
  if (finalOnly) {
    const scalars = wyHiPointsMapFinalOnly.get(maxPoints);
    if (!scalars || place > numberOfEntries) {
      return 0;
    }

    return scalars[place - 1];
  } else {
    const scalars = wyHiPointsMapFromHeats.get(maxPoints);
    if (!scalars || place > numberOfEntries) {
      return 0;
    }

    return scalars[place - 1];
  }
};

const wyHiFinalizeResults = (results: Map<string, WyandottePointsTeamResults>) => {
  return {
    combined: Array.from(results.entries())
      .sort((a, b) => b[1].combined - a[1].combined)
      .map((value) => ({ team: value[0], points: value[1].combined })),

    mens: Array.from(results.entries())
      .sort((a, b) => b[1].mens - a[1].mens)
      .map((value) => ({ team: value[0], points: value[1].mens })),

    womens: Array.from(results.entries())
      .sort((a, b) => b[1].womens - a[1].womens)
      .map((value) => ({ team: value[0], points: value[1].womens })),
  };
};

export const wyHiCalculateEventTeamPoints = (eventResult: Event): Map<string, number> => {
  const eventTeamPoints = new Map<string, number>();
  let finalOnly = false;

  if (!isAFinal(eventResult.Event, eventResult.EventNum)) {
    return eventTeamPoints; // not a final (e.g. Heat, TT)
  }

  // check if the event is final only
  if (isFinalOnly(eventResult.EventInfo)) {
    finalOnly = true;
  }

  const maxPoints = wyHiMaxPointsFromName(eventResult.Event);
  const numberOfEntries = calculateNumberOfEntries(eventResult.entries);

  // track the team's we've seen in this event to exclude anything that is not
  // a primary entry (ex: B entries, second entries)
  const placingTeams = new Set<string>();

  const sortedEntries = eventResult.entries.sort(
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

    const points = maxPoints * wyHiScalePoints(numberOfEntries, entry.Place, maxPoints, finalOnly);

    eventTeamPoints.set(teamName, points);
  });

  return eventTeamPoints;
};

export const wyHiPointsImpl = (resultData: Results): Map<string, WyandottePointsTeamResults> => {
  const teamPoints = new Map<string, WyandottePointsTeamResults>();
  resultData.results.forEach((eventResult) => {
    const candidateMatches = [/WOMEN/, /GIRL/];
    const isWomensEvent = candidateMatches.some((candidate) => eventResult.Event.toUpperCase().search(candidate) != -1);

    const eventTeamPoints = wyHiCalculateEventTeamPoints(eventResult);

    // aggregate the points from this event into the whole team points table
    eventTeamPoints.forEach((points: number, teamName: string) => {
      const teamEntry = teamPoints.get(teamName);

      if (!teamEntry) {
        teamPoints.set(teamName, {
          combined: points,
          mens: !isWomensEvent ? points : 0,
          womens: isWomensEvent ? points : 0,
        });
      } else {
        teamPoints.set(teamName, {
          combined: teamEntry.combined + points,
          mens: teamEntry.mens + (!isWomensEvent ? points : 0),
          womens: teamEntry.womens + (isWomensEvent ? points : 0),
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
    event.entries.forEach((entry) => {
      const teamName = trimCrewName(entry.Crew);
      if (!scoringTeams.has(teamName) && teamName != PLACEHOLD_TEAM_NAME && entry.PenaltyCode != EXHIB_PENALTY_CODE) {
        // Ignore events where 'No Race' is the only entry to clean up standings
        if (teamName != 'No Race') missingTeams.add(teamName);
      }
    }),
  );

  missingTeams.forEach((missingTeam) =>
    teamPoints.set(missingTeam, {
      combined: 0,
      mens: 0,
      womens: 0,
    }),
  );

  return teamPoints;
};

/**
 * Calculate points based on the Wyandotte System of Scoring, as described by the Wyandotte Boat Club:
 * https://wyandotteboatclub.com/regattas/wy-hi-regatta/
 */
export const wyHiPointsCalc = (resultData: Results): WyandotteCategoryResults => {
  const teamPoints = wyHiPointsImpl(resultData);

  return wyHiFinalizeResults(teamPoints);
};
