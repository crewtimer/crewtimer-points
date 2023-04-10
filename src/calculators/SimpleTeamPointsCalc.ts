import { Results } from "../common/CrewTimerTypes";
import {
  genPlaces,
  isAFinal,
  numSeatsFromName,
} from "../common/CrewTimerUtils";

export type SimplePointsResult = {
  team: string;
  points: number;
  place: number;
}[];

/**
 * Calculate points based on the number of seats in a boat and place.
 * 3 points for first, 2 for second, 1 for third
 */
export const simplePointsCalc = (resultData: Results): SimplePointsResult => {
  const teamPoints = new Map<string, number>();
  resultData.results.forEach((eventResult) => {
    if (!isAFinal(eventResult.Event, eventResult.EventNum)) {
      return; // not a final (e.g. Heat, TT)
    }
    const seats = numSeatsFromName(eventResult.Event);
    eventResult.entries.forEach((entry) => {
      if (!entry.Place) {
        return; // DNF, DNS, DQ etc
      }
      if (entry.Place > 3) {
        return;
      }
      const team = entry.Crew;
      const points = seats * (4 - entry.Place);
      teamPoints.set(team, (teamPoints.get(team) || 0) + points);
    });
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
