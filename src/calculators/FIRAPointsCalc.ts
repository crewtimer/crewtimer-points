import { Entry, Event, Results, genPlaces } from 'crewtimer-common';
import { isAFinal } from '../common/CrewTimerUtils';

export type FIRAPointsTeamResults = {
  overall: number;
  men: number;
  women: number;
};

export type FIRAResult = {
  team: string;
  points: number;
  place: number;
};

export type FIRAPoints = {
  overall: FIRAResult[];
  men: FIRAResult[];
  women: FIRAResult[];
};

const PLACEHOLD_TEAM_NAME = 'Empty';
const EXHIB_PENALTY_CODE = 'Exhib';

/**
 * The max possible number of points for this event given the boat class and event type
 *
 * @param eventName
 * @returns Number of points
 */
export const maxPointsFromName = (eventName: string) => {
  eventName = eventName.toUpperCase();
  const points = maxPointsByBoatClass(eventName);
  return points;
};

/*
/**
 * The max possible number of points for this event given the boat class and event type
 *
 * @param eventName
 * @returns Number of points
 */
export const maxPointsByBoatClass = (eventName: string) => {
  const boatClassCaptureExpression = /.* ([1248])[xX\-+]/;
  const match = eventName.match(boatClassCaptureExpression);

  const LT_JV_MATCHERS = [/LIGHTWEIGHT/, /LTWT/, /JV/, /JUNIOR VARSITY/];
  const FN_MATCHERS = [/FROSH/, /NOVICE/, /F\/N/];

  if (match && match.length > 1) {
    const boatClass = Number.parseInt(match[1]);
    // boat is a 1x - max = 5
    if (boatClass == 1) {
      return 5;
    }
    // boat is either a 2- or a 2x - max is 10
    if (boatClass == 2) {
      return 10;
    }
    // boat is a 4 - all 4s max is 15 pts
    if (boatClass == 4) {
      return 15;
    }
    if (boatClass == 8) {
      // the event is an 8, but need to determine what type of 8 (V8, JV8, LtWt8...)
      // Check to see if this is a JV or V LTWT event
      if (LT_JV_MATCHERS.some((ltJvMatcher) => eventName.match(ltJvMatcher))) {
        return 25;
      }

      // Check to see if this is a FROSH/NOVICE event
      else if (FN_MATCHERS.some((fnMatcher) => eventName.match(fnMatcher))) {
        return 20;
      } else {
        // Must be a straight up Varsity 8
        return 30;
      }
    }
  }
  return 5; //assume at least a 1x
};

/**
 * Number of points for each place in a final,
 * by the number of entries in the final.
 */
const percentageOfPoints: Map<number, number[]> = new Map([
  [2, [1, 0.2]],
  [3, [1, 0.4, 0.2]],
  [4, [1, 0.6, 0.3, 0.05]],
  [5, [1, 0.8, 0.4, 0.1, 0.05]],
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

/**
 * Extract the root team name. This will trim any trailing single characters
 * which were used as A or B boat designations as well as any seeding designation
 * suffixes like [1] or [3]
 *
 * For example:
 * "Rollins College [2]" -> Rollins College"
 * "Green Lake Crew A" -> "Green Lake Crew"
 * "Green Lake Crew B" -> "Green Lake Crew"
 * "Green Lake Crew"   -> "Green Lake Crew"
 *
 * @param crewName
 * @returns (string) The team name
 */
const trimCrewName = (crewName: string) => {
  const suffixExpression = / .$/;
  crewName = crewName.replace(suffixExpression, '');

  const pattern = /\s+\[?.?\]?$/;
  crewName = crewName.replace(pattern, '');
  crewName = crewName.trim();
  return crewName;
};

/**
 * Sort teams in each category by number of points and cleanup list to remove
 * teams that have 0 points or teams that are not eligible to get any points
 * (Typically this is D1 and IRA. Guests can still get points, but are not
 * eligible for the overall points trophies)
 *
 * @param results
 * @returns
 */
const finalizeResults = (results: Map<string, FIRAPointsTeamResults>) => {
  // sort the three groups with respect to their points
  let overallArray = Array.from(results.entries())
    .sort((a, b) => b[1].overall - a[1].overall)
    .map((value) => ({ team: value[0], points: value[1].overall, place: 0 }));

  let menArray = Array.from(results.entries())
    .sort((a, b) => b[1].men - a[1].men)
    .map((value) => ({ team: value[0], points: value[1].men, place: 0 }));

  let womenArray = Array.from(results.entries())
    .sort((a, b) => b[1].women - a[1].women)
    .map((value) => ({ team: value[0], points: value[1].women, place: 0 }));

  // now remove the teams with 0 points (D1 and IRA primarily)
  overallArray = overallArray.filter((result) => result.points !== 0);
  menArray = menArray.filter((result) => result.points !== 0);
  womenArray = womenArray.filter((result) => result.points !== 0);

  const places_o = genPlaces(
    overallArray.map((entry) => entry.points),
    'desc',
  );
  places_o.forEach((place, i) => (overallArray[i].place = place));

  const places_m = genPlaces(
    menArray.map((entry) => entry.points),
    'desc',
  );
  places_m.forEach((place, i) => (menArray[i].place = place));

  const places_w = genPlaces(
    womenArray.map((entry) => entry.points),
    'desc',
  );
  places_w.forEach((place, i) => (womenArray[i].place = place));

  return {
    overall: overallArray,
    men: menArray,
    women: womenArray,
  };
};

/**
 * Returns the number of entries, excluding any exhibition crews
 *
 * @param entries
 * @returns number of elligible entries
 */
export const calculateNumberOfEntries = (entries: Entry[]) => {
  return entries.filter((entry) => entry.PenaltyCode != EXHIB_PENALTY_CODE).length;
};

/**
 * Returns the number of points
 *
 * @param eventResult
 * @returns number of elligiblepoints for the team
 */
export const calculateEventTeamPoints = (eventResult: Event): Map<string, number> => {
  const eventTeamPoints = new Map<string, number>();

  if (!isAFinal(eventResult.Event, eventResult.EventNum)) {
    return eventTeamPoints; // not a final (e.g. Heat, TT)
  }

  const maxPoints = maxPointsFromName(eventResult.Event);
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

    const points = maxPoints * scalePoints(numberOfEntries, entry.Place);

    eventTeamPoints.set(teamName, points);
  });

  return eventTeamPoints;
};

/**
 * FIRA Points implementation method
 * Calculate points based on the FIRA Points System, as described by FIRA:
 * https://firarowing.org
 */
export const firaPointsImpl = (resultData: Results): Map<string, FIRAPointsTeamResults> => {
  const teamPoints = new Map<string, FIRAPointsTeamResults>();
  resultData.results.forEach((eventResult) => {
    const excludedMatches = [/DIVI/, /DI/, /DIV1/, /D1/, /DIV-I/, /DIV-1/, /IRA/];
    let isExcludedEvent = excludedMatches.some((excluded) => eventResult.Event.toUpperCase().search(excluded) != -1);

    // handle special cases like 'DII' (we want to keep DII but it would be matched to 'D1')

    if (eventResult.Event.toUpperCase().search(/(?:^|\W)DII(?:$|\W)/) != -1) {
      isExcludedEvent = false;
    }

    if (!isExcludedEvent) {
      const candidateMatches = [/WOMEN/, /WOMENS/, /GIRL/, /GIRLS/];
      const isWomensEvent = candidateMatches.some(
        (candidate) => eventResult.Event.toUpperCase().search(candidate) != -1,
      );

      const eventTeamPoints = calculateEventTeamPoints(eventResult);

      // aggregate the points from this event into the whole team points table
      eventTeamPoints.forEach((points: number, teamName: string) => {
        const teamEntry = teamPoints.get(teamName);

        if (!teamEntry) {
          teamPoints.set(teamName, {
            overall: points,
            women: isWomensEvent ? points : 0,
            men: !isWomensEvent ? points : 0,
          });
        } else {
          teamPoints.set(teamName, {
            overall: teamEntry.overall + points,
            women: teamEntry.women + (isWomensEvent ? points : 0),
            men: teamEntry.men + (!isWomensEvent ? points : 0),
          });
        }
      });
    }
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
        missingTeams.add(teamName);
      }
    }),
  );

  missingTeams.forEach((missingTeam) =>
    teamPoints.set(missingTeam, {
      overall: 0,
      women: 0,
      men: 0,
    }),
  );

  return teamPoints;
};

/**
 * Calculate points based on the FIRA Points System, as described by FIRA:
 * https://firarowing.org
 */
export const firaPointsCalc = (resultData: Results): FIRAPoints => {
  const teamPoints = firaPointsImpl(resultData);

  return finalizeResults(teamPoints);
};
