import regattaResults from "./data/crewtimer-results-dev-r12033-export.json";
import { simplePointsCalc } from "../src/calculators/SimpleTeamPointsCalc";
import { expect, it } from "@jest/globals";
import { Results } from "../src/common/CrewTimerTypes";

it("simple points", async () => {
  const points = simplePointsCalc(regattaResults as unknown as Results);
  const mb = points.find((entry) => entry.team === "Mount Baker");
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(24);

  const era = points.find((entry) => entry.team === "Everett Rowing");
  expect(era).toBeDefined();
  expect(era?.points).toEqual(12);

  expect(points.map((entry) => entry.points)).toEqual([24, 16, 12, 12, 8]);
  expect(points.map((entry) => entry.place)).toEqual([1, 2, 3, 3, 5]);
});
