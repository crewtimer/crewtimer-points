import { Results } from 'crewtimer-common';
import {
  boatClassFromName,
  capitalizeFirstLetter,
  distanceFromName,
  genPlaces,
  genderFromEventName,
  getRegattaYearFromDate,
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

interface TrophyDefinition {
  name: string;
  firstValidYear: number;
  lastValidYear: number;
}

// Winner of the C1 1000 Senior Men -Jim Terrell Award.
const trophyDefinitions: TrophyDefinition[] = [
  { name: 'Winner of the K1 500 U16 (Juvenile)Women -Francine Fox Award', firstValidYear: 0, lastValidYear: 0 },
  { name: 'Winner of the K1 500 U18 (Junior)Women -Mimi LeBeau Memorial Award', firstValidYear: 0, lastValidYear: 0 },
  { name: 'Winner of the C1 200 U18 (Junior)Men -Andy Toro Award', firstValidYear: 0, lastValidYear: 0 },
  { name: 'Winner of the K1 1000 U18 (Junior)Men -Greg Barton Award', firstValidYear: 0, lastValidYear: 0 },
  { name: 'Winner of the K1 1000 Senior Men -Donald Dodge Memorial Award', firstValidYear: 0, lastValidYear: 0 },
  { name: 'Winner of the K2 500 Senior Men-Eugene & Henry Krawczyk Award', firstValidYear: 0, lastValidYear: 0 }, // Note, rules has a typo and lists 200m instead of 500m
  { name: 'Winner of the K2 1000 Senior Men -Beachem & Van Dyke Award', firstValidYear: 0, lastValidYear: 2024 },
  { name: 'Winner of the K2 1000 Senior Men -The Barton Bellingham Award', firstValidYear: 2025, lastValidYear: 0 },
  {
    name: 'Winner of the K4 500 (was 1000)Senior Men -Eric Feicht Memorial Award',
    firstValidYear: 0,
    lastValidYear: 0,
  },
  { name: 'Winner of the K1 500 Senior Women -Marcia Smoke Award', firstValidYear: 0, lastValidYear: 0 },
  { name: 'Winner of the K4 500 Senior Women', firstValidYear: 0, lastValidYear: 0 },
  { name: 'Winner of the C1 5000 Senior Men -Frank Havens Award', firstValidYear: 0, lastValidYear: 0 },
  // Award20.53.Burgee Awards at  National  Championships
  { name: 'Winner of the C1 500 U16(Juvenile)Women -Nancy Kalafus Award', firstValidYear: 0, lastValidYear: 0 },
  { name: 'Winner of the C1 500 U18(Junior)Women -Debby Smith Page Award', firstValidYear: 0, lastValidYear: 2024 },
  { name: 'Winner of the C1 1000 Senior Men -Jim Terrell Award', firstValidYear: 0, lastValidYear: 0 },
];

const Trophies: { [key: string]: TrophyDefinition } = {
  Juvenile: { name: 'Thomas Horton Trophy', firstValidYear: 0, lastValidYear: 0 },
  Bantam: { name: 'Columbia-Murphy Trophy', firstValidYear: 0, lastValidYear: 0 },
  '(Masters)': { name: 'Jack Blendinger Trophy', firstValidYear: 0, lastValidYear: 0 },
  Junior: { name: 'Black Anvil Trophy', firstValidYear: 0, lastValidYear: 0 },
  Senior: { name: 'Washington Canoe Club Trophy', firstValidYear: 0, lastValidYear: 0 },
  C4: { name: 'Coach Bill Bragg Trophy', firstValidYear: 0, lastValidYear: 0 },
  'Mens K4': { name: 'Chris Barlow Trophy', firstValidYear: 0, lastValidYear: 0 },
  'Womens K4': { name: 'Alan Anderson Trophy', firstValidYear: 0, lastValidYear: 0 },
  ParaCanoe: { name: 'Debbie Page Trophy', firstValidYear: 2025, lastValidYear: 0 }, // First year is 2025
};

interface ACAPointsJson {
  excludedClubs?: string[];
  minEntriesForLevel?: { [boatClass: string]: number };
  minEntries?: number;
}

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
  trophiesByLevel: { [key: string]: TrophyDefinition };
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

  // Interpret configuration struct such as '{"excludedClubsForPoints":["GHCKRT"],"minEntriesForPoints":{"Bantam":100},"minEntries":3}'
  const regattaConfig = JSON.parse(resultData.regattaInfo.json || '{}');
  const pointsConfig = (regattaConfig.points || {}) as ACAPointsJson;
  const minEntriesForLevel: { [level: string]: number } = pointsConfig.minEntriesForLevel || {};
  const excludedClubsForPoints: string[] = pointsConfig.excludedClubs || [];
  const minEntriesRequired: number = pointsConfig.minEntries || 1;
  const regattaYear = getRegattaYearFromDate(resultData.regattaInfo.Date);

  const trophies: TrophyWinner[] = [];
  // Cache trophy attributes
  for (const trophyDef of trophyDefinitions) {
    // Omit if outside year range
    if (
      (trophyDef.firstValidYear && regattaYear < trophyDef.firstValidYear) ||
      (trophyDef.lastValidYear && regattaYear > trophyDef.lastValidYear)
    ) {
      continue;
    }
    const names = trophyDef.name.split('-').map((name) => name.trim());

    trophies.push({
      name: names[1] || 'Unnamed',
      criteria: names[0],
      distance: distanceFromName(trophyDef.name),
      boatClass: boatClassFromName(trophyDef.name),
      level: eventLevelFromName(trophyDef.name),
      gender: genderFromEventName(trophyDef.name),
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

    // Ignore races without the required minimum number of entries
    const validEntries = eventResult.entries?.filter((entry) => {
      if (entry.Stroke.match(/^(indep|indiv)/i)) {
        return false;
      }
      const clubs = entry.Stroke.replace(/,/g, ';')
        .split(';')
        .map((s) => {
          s = s.replace(/\(.*/g, '');
          s = s.trim();
          if (s.match(/^(indep|indiv)/i)) {
            s = 'IND';
          }
          return s;
        });

      const hasExcludedClub = clubs.some((club) => excludedClubsForPoints.includes(club));
      if (hasExcludedClub) {
        return false;
      }

      if (entry.AdjTime === 'DNF') {
        // still counts as a competition
        return true;
      }

      if (!entry.Place) {
        return false;
      }
      return true;
    });

    const validEntriesCount = validEntries?.length || 0;
    if (
      !eventResult.Event.toLowerCase().includes('para') &&
      (validEntriesCount === 0 || validEntriesCount < (minEntriesForLevel[eventClass] || 0))
    ) {
      return;
    }
    if (
      !eventResult.Event.toLowerCase().includes('para') &&
      validEntriesCount < minEntriesRequired &&
      minEntriesForLevel[eventClass] === undefined
    ) {
      return;
    }

    // For each entry in this event, accumulate points according to the
    // criteria for placement and length of race.
    eventResult.entries?.forEach((entry) => {
      // Extract the club abbreviations from the Stroke name
      const clubs = entry.Stroke.replace(/,/g, ';')
        .split(';')
        .map((s) => {
          s = s.replace(/\(.*/g, '');
          s = s.trim();
          if (s.match(/^(indep|indiv)/i)) {
            s = 'IND';
          }
          return s;
        });

      // Check if any paddlers are from an excluded club (e.g. International at nationals)
      const hasExcludedClub = clubs.some((club) => excludedClubsForPoints.includes(club));
      if (hasExcludedClub) {
        return;
      }

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

  // Filter trophiesByLevel by regattaYear
  const filteredTrophiesByLevel: { [key: string]: TrophyDefinition } = {};
  Object.keys(Trophies).forEach((level) => {
    const t = Trophies[level];
    if (
      (t.firstValidYear === 0 || regattaYear >= t.firstValidYear) &&
      (t.lastValidYear === 0 || regattaYear <= t.lastValidYear)
    ) {
      filteredTrophiesByLevel[level] = t;
    }
  });
  return {
    paddlerTotals,
    paddlerClassTotals,
    clubTotals,
    classTotals,
    levelTotals,
    genderLevelTotals,
    paddlersByClub,
    trophies,
    trophiesByLevel: filteredTrophiesByLevel,
  };
};
