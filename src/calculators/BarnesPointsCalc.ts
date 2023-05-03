import { Results } from "../common/CrewTimerTypes";
import {
  genPlaces,
  isAFinal,
} from "../common/CrewTimerUtils";

export type BarnesPointsResults = {
  team: string;
  points: number;
  place: number;
}[];

export const maxPointsFromName = (eventName: string) => {
  eventName = eventName.toUpperCase();
  const boatClassCaptureExpression = /.* ([1248]+)[x\-\+]+/;
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

  return 0;
}

const percentageOfPoints: Map<number, number[]> = new Map([
  [2, [1, .2]],
  [3, [1, .4, .2]],
  [4, [1, .6, .3, .5]],
  [5, [1, .8, .4, .1]],
  [6, [1, .8, .4, .2, .1, .05]]
]);
  

const scalePoints = (numberOfEntries: number, place: number) => {
  if (numberOfEntries < 2) {
    return 0;
  }

  if (numberOfEntries > 6) {
    numberOfEntries = 6;
  }

  const scalars = percentageOfPoints.get(numberOfEntries);
  if (!scalars || place > scalars.length) {
    return 0;
  }
  
  return scalars[place - 1];
}

const trimCrewName = (crewName: string) => {
  crewName = crewName.toUpperCase();
  const suffixExpression = /(.*) .^/;
  const match = crewName.match(suffixExpression);

  if (match && match.length > 1) {
    return match[1];
  }

  return crewName;
}

/**
 * Calculate points based on the Barnes Scoring System, as described by MSRA:
 * https://sites.google.com/site/msrahome/regatta-rules/home
 */
export const barnesPointsCalc = (resultData: Results): BarnesPointsResults => {
  const teamPoints = new Map<string, number>();
  
  resultData.results.forEach((eventResult) => {
    const eventTeamPoints = new Map<string, number>();

    if (!isAFinal(eventResult.Event, eventResult.EventNum)) {
      return; // not a final (e.g. Heat, TT)
    }

    const maxPoints = maxPointsFromName(eventResult.Event);
    const numberOfEntries = eventResult.entries.length;

    // track the team's we've seen in this event to exclude anything that is not
    // a primary entry (ex: B entries, second entries)
    const placingTeams = new Set<string>();
    
    const sortedEntries = eventResult.entries.sort(
        (lhs, rhs) => (lhs.Place || Number.MAX_VALUE) - (rhs.Place || Number.MAX_VALUE)
      );

    sortedEntries.forEach((entry) => {
      if (!entry.Place) {
        return; // DNF, DNS, DQ, Exhib etc
      }

      // if a team has already placed in this event, skip subsequent entries
      const teamName = trimCrewName(entry.Crew);
      if (placingTeams.has(teamName)) {
          return;
      }

      placingTeams.add(teamName);

      const points = maxPoints * scalePoints(numberOfEntries, entry.Place);

      eventTeamPoints.set(entry.Crew, points);
    });

    // aggregate the points from this event into the whole team points table
    eventTeamPoints.forEach((points: number, teamName: string) => {
      teamPoints.set(teamName, (teamPoints.get(teamName) || 0) + points);
    })

  });

  const sorted = Array.from(teamPoints.entries())
    .sort((a, b) => b[1] - a[1])
    .map((v) => ({ team: v[0], points: v[1], place: 0 }));
  const places = genPlaces(
    sorted.map((entry) => entry.points),
    "desc"
  );
  places.forEach((place, i) => (sorted[i].place = place));
  return sorted;
};
