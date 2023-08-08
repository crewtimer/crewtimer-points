import { Results } from 'crewtimer-common';
import {
  boatClassFromName,
  capitalizeFirstLetter,
  distanceFromName,
  genPlaces,
  genderFromEventName,
  isAFinal,
  numSeatsFromName,
  uppercaseLastLetter,
} from '../common/CrewTimerUtils';

/**
 * Calculate the Team Points for an ACA Regatta.
 *
 * Canoe/Kayak regattas typically run with 9 lanes.
 * For events up to and including 1000m, points are awarded for the first 6 lanes.
 * For longer events beyone 1000m, points are awarded for the first 9 lanes.
 * Points are only awarded for 'Finals', not heats, exibitation, or development races.
 *
 */

const nonDistancePoints = [9, 7, 5, 3, 2, 1];
const distancePoints = [12, 10, 8, 6, 5, 4, 3, 2, 1];

// Winner of the C1 1000 Senior Men -Jim Terrell Award.
const trophyDefinitions = [
  'Winner of the K1 500 U16 (Juvenile)Women -Francine Fox Award',
  'Winner of the K1 500 U18 (Junior)Women -Mimi LeBeau Memorial Award',
  'Winner of the C1 200 U18 (Junior)Men -Andy Toro Award',
  'Winner of the K1 1000 U18 (Junior)Men -Greg Barton Award',
  'Winner of the K1 1000 Senior Men -Donald Dodge Memorial Award',
  'Winner of the K2 200 Senior Men-Eugene & Henry Krawczyk Award',
  'Winner of the K2 1000 Senior Men -Beachem & Van Dyke Award',
  'Winner of the K4 500 (was 1000)Senior Men -Eric Feicht Memorial Award',
  'Winner of the K1 500 Senior Women -Marcia Smoke Award',
  'Winner of the K4 500 Senior Women',
  'Winner of the C1 5000 Senior Men -Frank Havens Award',
  // Award20.53.Burgee Awards at  National  Championships
  'Winner of the C1 500 U16(Juvenile)Women -Nancy Kalafus Award',
  'Winner of the C1 500 U18(Junior)Women -Debby Smith Page Award',
  'Winner of the C1 1000 Senior Men -Jim Terrell Award',
];

interface ACAResultRecord {
  index: string;
  points: number;
  place: number;
}

interface TrophyWinner {
  name: string;
  criteria: string;
  distance: number;
  boatClass: string;
  level: string;
  gender: string;
  winner: string;
  winnerClub: string;
  winnerTime: string;
  winnerRaceNum: string;
}
export type ACAPointsResult = {
  clubTotals: ACAResultRecord[];
  classTotals: { [boatClass: string]: ACAResultRecord[] };
  levelTotals: { [eventLevel: string]: ACAResultRecord[] };
  genderLevelTotals: { [genderLevel: string]: ACAResultRecord[] };
  paddlersByClub: { [club: string]: Set<string> };

  paddlerTotals: ACAResultRecord[];
  paddlerClassTotals: { [paddler: string]: ACAResultRecord[] };
  trophies: TrophyWinner[];
};

/**
 * Given an event name, attempt to extract the 'level' of the race (bantam, junior, etc)
 *
 * Masters may have optional A, B, C designation.
 *
 * @param eventName
 * @returns 'Unknown' if not able to determin the event level.  The detected event level otherwise.
 */
export const eventLevelFromName = (eventName: string) => {
  eventName = eventName.toLowerCase();
  const matches = [/bantam/, /juv/, /junior/, /senior/, /u23/, /masters ?[abcdef]/, /open/, /paracanoe/, / dev/];
  for (let i = 0; i < matches.length; i++) {
    const match = eventName.match(matches[i]);
    if (match) {
      let eventLevel = match[0].trim().replace(' ', '').replace(/juv$/, 'juvenile');
      eventLevel = capitalizeFirstLetter(eventLevel).replace('canoe', 'Canoe');
      if (eventLevel.startsWith('Masters')) {
        eventLevel = uppercaseLastLetter(eventLevel);
      }
      return eventLevel;
    }
  }
  return 'Other';
};

/**
 * Convert an object of club:points value pairs into a sorted array where each
 * array element contains the club name, points and place.
 *
 * @param points
 * @returns {club:string, points:number, place:number}[]
 */
const summarizePoints = (points: { [key: string]: number }) => {
  const totals = Object.entries(points)
    .sort((a, b) => b[1] - a[1])
    .map((v) => ({ index: v[0], points: v[1], place: 0 }));
  const places = genPlaces(
    totals.map((entry) => entry.points),
    'desc',
  );
  places.forEach((place, i) => (totals[i].place = place));
  return totals;
};

/**
 * Given a set of points indexed by a key (boatClass, eventLevel, etc) and further indexed
 * by club name, generate a summary result record that is an array of type ACAResultRecord[]
 * for each index.  The ACAResultRecord[] result is also sorted by place.
 *
 * @param points
 * @returns
 */
const sortAndSummarize = (points: { [key: string]: { [club: string]: number } }) => {
  const totals: { [key: string]: ACAResultRecord[] } = {};
  for (const [key, pointsForKey] of Object.entries(points)) {
    // console.log(`Key=+${key}`);
    // if (key.includes('(Masters)')) {
    //   continue;
    // }
    totals[key] = summarizePoints(pointsForKey);
  }
  return totals;
};
/**
 * Calculate points based on the ACA National Championships Point Scoring section 71.
 */
export const acaPointsCalc = (resultData: Results): ACAPointsResult => {
  const boatClassPointsByClub: { [boatClass: string]: { [club: string]: number } } = {};
  const eventLevelPointsByClub: { [eventLevel: string]: { [club: string]: number } } = {};
  const genderClassPointsByClub: { [genderClass: string]: { [club: string]: number } } = {};
  const pointsByEventNum: { [eventNum: string]: number } = {};
  const clubPoints: { [club: string]: number } = {};
  const paddlersByClub: { [club: string]: Set<string> } = {};
  //** Points by Paddler By Class (juvenile, junior, etc) */
  const paddlerPointsByClass: { [eventClass: string]: { [paddler: string]: number } } = {};
  const paddlerPoints: { [paddler: string]: number } = {};

  const trophies: TrophyWinner[] = [];
  // Cache trophy attributes
  for (const trophy of trophyDefinitions) {
    const names = trophy.split('-').map((name) => name.trim());

    trophies.push({
      name: names[1] || 'Unnamed',
      criteria: names[0],
      distance: distanceFromName(trophy),
      boatClass: boatClassFromName(trophy),
      level: eventLevelFromName(trophy),
      gender: genderFromEventName(trophy),
      winner: '',
      winnerClub: '',
      winnerTime: '',
      winnerRaceNum: '',
    });
  }

  // Iterate over each Event, accumulating points into various useful buckets
  resultData.results.forEach((eventResult) => {
    const eventName = eventResult.Event;
    const eventNum = eventResult.EventNum;

    // Do not accumulate points unless it's a final
    if (!isAFinal(eventName, eventNum)) {
      return;
    }

    // Ignore exhibitation races
    if (eventName.toLowerCase().includes('exhib') || eventName.toLowerCase().includes(' dev')) {
      return;
    }

    let boatClass = boatClassFromName(eventName);
    if (!boatClass) {
      boatClass = 'Unknown'; // mistake in spreadsheet
    }
    if (boatClass.toLowerCase().includes('exhib')) {
      return;
    }

    // Furhter parse the event name into useful fields
    const distance = distanceFromName(eventName) || 200;
    const seats = numSeatsFromName(eventName);
    const eventClass = eventLevelFromName(eventName);
    const gender = genderFromEventName(eventName);

    // For each entry in this event, accumulate points according to the
    // criteria for placement and length of race.
    eventResult.entries.forEach((entry) => {
      // Extract the club abbreviations from the Stroke name
      const clubs = entry.Stroke.replace(/,/g, ';')
        .split(';')
        .map((s) => {
          s = s.trim();
          if (s.match(/^(indep|indiv)/i)) {
            s = 'IND';
          }
          return s;
        });

      // Extract and normalize athlete names
      const athletes = entry.Crew.split(';').map((c) => c.trim().replace(' ', ''));

      // Keep an accounting of athlete count by club
      clubs.forEach((club, i) => {
        let paddlers = paddlersByClub[club];
        if (!paddlers) {
          paddlersByClub[club] = paddlers = new Set<string>();
        }
        const athlete = athletes[i];
        paddlers.add(athlete);
      });

      // Dont use if the entry didn't place
      const place = entry.Place;
      if (!place) {
        return; // DNF, DNS, DQ etc
      }

      // only top 6 places for 200, 500, 1000
      if (place > 6 && distance <= 1000) {
        return;
      }
      // only top 9 places for distance events
      if (place > 9) {
        return;
      }

      if (place === 1) {
        const trophyIndex = trophies.findIndex(
          (trophy) =>
            trophy.boatClass === boatClass &&
            trophy.distance === distance &&
            trophy.gender === gender &&
            trophy.level === eventClass,
        );
        if (trophyIndex >= 0) {
          let trophy = trophies[trophyIndex];
          if (trophy?.winner) {
            // This level has already been used.  Must be a tie.
            trophy = { ...trophy, name: '', criteria: '' };
            trophies.splice(trophyIndex + 1, 0, trophy);
          }
          trophy.winner = athletes.join('; ');
          trophy.winnerClub = clubs.join('; ');
          trophy.winnerTime = entry.AdjTime;
          trophy.winnerRaceNum = entry.EventNum;
        }
      }

      // For a given place and distance, get the number of points available
      const pointsAvail = distance <= 1000 ? nonDistancePoints[place - 1] : distancePoints[place - 1];

      // Allocate the points to each athlete
      const pointsPerSeat = pointsAvail / seats;

      // Accumulate points per paddler
      const classPoints = paddlerPointsByClass[eventClass] || {};
      paddlerPointsByClass[eventClass] = classPoints;
      athletes.forEach((athlete) => {
        const points = classPoints[athlete] || 0;
        classPoints[athlete] = points + pointsPerSeat;
        paddlerPoints[athlete] = (paddlerPoints[athlete] || 0) + pointsPerSeat;
      });

      // Accumulate points for each club in various categories
      clubs.forEach((club) => {
        // Accumulate total club points
        clubPoints[club] = (clubPoints[club] || 0) + pointsPerSeat;
        pointsByEventNum[eventNum] = (pointsByEventNum[eventNum] || 0) + pointsPerSeat;

        // boat class points accumulate (K1, K2 etc)
        const boatClassPoints = (boatClassPointsByClub[boatClass] = boatClassPointsByClub[boatClass] || {});
        boatClassPoints[club] = (boatClassPoints[club] || 0) + pointsPerSeat;

        // Now do event level (Bantam, Junior, etc)
        const eventLevelPoints = (eventLevelPointsByClub[eventClass] = eventLevelPointsByClub[eventClass] || {});
        eventLevelPoints[club] = (eventLevelPoints[club] || 0) + pointsPerSeat;

        if (eventClass.startsWith('Masters')) {
          const overallMastersPoints = (eventLevelPointsByClub['(Masters)'] =
            eventLevelPointsByClub['(Masters)'] || {});
          overallMastersPoints[club] = (overallMastersPoints[club] || 0) + pointsPerSeat;
        }
        // Now do gendered event level (Mens Bantam,Womens Junior, etc)
        const genderClass = `${gender} ${boatClass}`;
        const genderClassPoints = (genderClassPointsByClub[genderClass] = genderClassPointsByClub[genderClass] || {});
        genderClassPoints[club] = (genderClassPoints[club] || 0) + pointsPerSeat;
      });
    }); // forEach entry
  }); // forEach event

  // Organize points for export
  const clubTotals = summarizePoints(clubPoints);
  const classTotals = sortAndSummarize(boatClassPointsByClub);

  const levelTotals = sortAndSummarize(eventLevelPointsByClub);
  const genderLevelTotals = sortAndSummarize(genderClassPointsByClub);

  const paddlerClassTotals = sortAndSummarize(paddlerPointsByClass);
  const paddlerTotals = summarizePoints(paddlerPoints);

  return {
    paddlerTotals,
    paddlerClassTotals,
    clubTotals,
    classTotals,
    levelTotals,
    genderLevelTotals,
    paddlersByClub,
    trophies,
  };
};
