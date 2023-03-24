// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface KeyMap<T = any> {
  [key: string]: T;
}

export interface StoredProgressionRule {
  advancement?: string;
  laneMapping?: string;
}

export interface AdvanceSpec { topCount: number, topTime: number, finalCount: number };
export interface ProgressionRules {
  isSimpleFinal: boolean; // True if this is a simple final event.  e.g. FA with no feeders.  bracket: string;
  bracketType: string; /// Base bracket type.  e.g H, SAB, FA
  eventInfoAdvancement: string;  /// EventInfo field, if present
  Event: string; /// Cooked Event name sans event num and bracket hints
  srcEventNums: string[]; /// List of event numbers that directly feed this event
  computeBrackets: string[]; /// List of brackets to compute, in order, for this bracket
  eventNumByBracket: KeyMap<string>; /// Given a bracket, look up the corresponding EventNum
  winnerEventNumList: string[]; /// Event numbers to place winners
  loserEventNumList: string[]; /// Event numbers for losers
  otherEventNumList: string[][]; /// Others
  toFinalEventNumList: string[]; /// Event numbers which have direct to final placement
  advanceMethod: string; /// The advance method that will be used
  advanceSpec: AdvanceSpec;
}

export const DefaultProgressionRule: ProgressionRules = {
  isSimpleFinal: false,
  Event: '',
  bracketType: 'FA',
  srcEventNums: [],
  eventNumByBracket: {},
  winnerEventNumList: [],
  loserEventNumList: [],
  otherEventNumList: [],
  toFinalEventNumList: [],
  computeBrackets: [],
  eventInfoAdvancement: '',
  advanceMethod: 'T3',
  advanceSpec: { topCount: 0, topTime: 0, finalCount: 0 }
};

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

/** Types used in spreadsheet definitions */

/** A single 'entry' including Bow number and related fields*/
export interface SSEntry {
  [key: string]: string;
}

/** Array of event configs in declaration order */
export type SSEventList = SSEventConfig[];

/** Array of entries for each event indexed by EventNum */
export interface SSEventEntriesMap {
  [eventNum: string]: SSEntry[];
}

/** Event Configuration */
export interface SSEventConfig {
  Day: string;
  Event: string;
  EventInfo: string;
  EventNum: string;
  RaceType: string;
  Start: string;
  eventKey: string;
  eventIndex: number;
  eventItems: SSEntry[];
  LineNum: string;
  Rules: ProgressionRules;
  bracket: string; /// The designated bracket for this event.  e.g. H1, SAB1, FA, FB
}

export const DefaultSSEventConfig: SSEventConfig = {
  Day: '',
  Event: '',
  EventInfo: '',
  EventNum: '',
  RaceType: '',
  Start: '',
  eventKey: '',
  eventIndex: 0,
  eventItems: [] as SSEntry[],
  LineNum: '',
  Rules: DefaultProgressionRule,
  bracket: 'FA',
};
/** Event Config indexed by EventNum */
export interface SSEventConfigMap {
  [eventNum: string]: SSEventConfig;
}

export interface Warning {
  EventNum: string;
  level: 'E' | 'W' | 'I';
  message: string;
}
