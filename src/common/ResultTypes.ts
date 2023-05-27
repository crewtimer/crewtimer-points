// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface KeyMap<T = any> {
  [key: string]: T;
}
export interface ProgressDetail {
  e: string;
  s: string; // 0,1,R for each waypoint. R=Ready, 1=have time
}

export interface Progress {
  S: { [eventId: string]: ProgressDetail };
  Waypoints: string[];
}

export interface RegattaInfo {
  Admins: string;
  ClearTS: number;
  CombinedRaces: string;
  CustomCodes: string;
  DataSource: string;
  Date: string;
  Finished: boolean;
  FlightRaces: string;
  HasRoster: boolean;
  InfoText: string;
  Name: string;
  NumDays: string;
  NumEntries: number;
  NumEvents: number;
  Owner: string;
  PenaltyLocations: string;
  Public: string;
  RaceType: string;
  ResultDigits: string;
  ResultOmitCols: string;
  ResultWaypoints: string;
  ResultsPendOfficial: string;
  ResultsPending: string;
  Title: string;
  Titles: string;
  Waypoints: string;
}

export interface Entry {
  AdjTime: string;
  Bow: string;
  Crew: string;
  CrewAbbrev: string;
  Event: string;
  EventAbbrev: string;
  EventNum: string;
  Flight: string;
  G_Finish_time_raw: string;
  G_Start_time_raw: string;
  Index: number;
  PenaltyCode: string;
  Place: number;
  RawTime: string;
  S_time: string;
  Stroke: string;

  // synthetic fields
  DestBow: string;
}

export interface EventResult {
  Day: string;
  DispOrder: number[];
  Event: string;
  EventInfo: string;
  EventNum: string;
  Finished: boolean;
  Flight: string;
  Official: boolean;
  RaceType: string;
  Start: string;
  entries: Entry[];
  eventIndex: number;
  eventKey: string;
}

export interface Results {
  P: Progress;
  lastUpdatedEvent: string;
  regattaInfo: RegattaInfo;
  results: EventResult[];
}
