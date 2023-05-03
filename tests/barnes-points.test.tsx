import regattaResults from "./data/crewtimer-results-dev-r12033-export-with-B-entries.json";
import { barnesPointsCalc } from "../src/calculators/BarnesPointsCalc";
import { expect, it } from "@jest/globals";
import { Results } from "../src/common/CrewTimerTypes";

it("barnes points", async () => {
  const points = barnesPointsCalc(regattaResults as unknown as Results);
  const mb = points.find((entry) => entry.team === "Mount Baker");
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(34);

  const era = points.find((entry) => entry.team === "Everett Rowing");
  expect(era).toBeDefined();
  expect(era?.points).toEqual(20);

  const ls = points.find((entry) => entry.team === "Lakeside School");
  expect(ls).toBeDefined();
  expect(ls?.points).toEqual(16);

  const glc = points.find((entry) => entry.team === "Green Lake Crew");
  expect(glc).toBeDefined();
  expect(glc?.points).toEqual(21.5);

  expect(points.map((entry) => entry.points)).toEqual([34, 24, 21.5, 20, 16, 6, 3]);
  expect(points.map((entry) => entry.place)).toEqual([1, 2, 3, 4, 5, 6, 7]);
});
