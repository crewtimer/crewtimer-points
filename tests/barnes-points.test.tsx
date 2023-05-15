import regattaResults from "./data/crewtimer-results-dev-r12033-export-jr-nov-events.json";
import simpleResults from "./data/crewtimer-results-dev-final-counts.json";
import { barnesPointsCalc } from "../src/calculators/BarnesPointsCalc";
import { expect, it } from "@jest/globals";
import { Results } from "../src/common/CrewTimerTypes";

it("barnes points weighted", async () => {
  const points = barnesPointsCalc(regattaResults as unknown as Results, true);
  // check that non-scoring teams are included in the display list
  expect(points.combined.length).toEqual(9);
  expect(points.womensScull.length).toEqual(9)
  expect(points.mensScull.length).toEqual(9)
  expect(points.womensSweep.length).toEqual(9)
  expect(points.mensSweep.length).toEqual(9)

  const sp = points.combined.find((entry) => entry.team == "Slow Poke");
  expect(sp).toBeDefined();
  expect(sp?.points).toEqual(0);

  const ifc = points.combined.find((entry) => entry.team == "Illegally Fast Composite");
  expect(ifc).toBeDefined();
  expect(ifc?.points).toEqual(0);

  // check teams with B entries
  var mb = points.combined.find((entry) => entry.team === "Mount Baker");
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(66.7);
  mb = points.womensSweep.find((entry) => entry.team === "Mount Baker");
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(48);
  mb = points.womensScull.find((entry) => entry.team === "Mount Baker");
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(10);

  // check 2x boat class
  // 1st place, varsity => 15 points
  const glc_mscull = points.mensScull.find((entry) => entry.team === "Green Lake Crew");
  expect(glc_mscull).toBeDefined();
  expect(glc_mscull?.points).toEqual(15);

  // 4th place, 5 boats in final - .1 * 15 = 1.5
  const mb_mscull = points.mensScull.find((entry) => entry.team === "Mount Baker");
  expect(mb_mscull).toBeDefined();
  expect(mb_mscull?.points).toEqual(1.5);

  // GLC: 6th in frosh 8 and 6th in varsity 8
  // .05 * .6 * 30 + .05 * 1 * 30 = 2.4 points
  const glc_wsweep = points.womensSweep.find((entry) => entry.team === "Green Lake Crew");
  expect(glc_wsweep).toBeDefined();
  expect(glc_wsweep?.points).toEqual(2.4);

  // check 4+ boat class and JR events
  // LS: 2nd place in JR 4+ and Varsity 4+
  // .8 * .8 * 20 + .8 * 1 * 20 = 28.8 points
  const ls_msweep = points.mensSweep.find((entry) => entry.team === "Lakeside School");
  expect(ls_msweep).toBeDefined();
  expect(ls_msweep?.points).toEqual(28.8);

  // validate combined points value and order
  expect(points.combined.map((entry) => entry.points)).toEqual([66.7, 53.9, 46.4, 43.6, 40.8, 11.6, 5.8, 0, 0]);
});

it("barnes points traditional", async () => {
  const points = barnesPointsCalc(regattaResults as unknown as Results, false);
  // check that non-scoring teams are included in the display list
  expect(points.combined.length).toEqual(9);
  expect(points.womensScull.length).toEqual(9)
  expect(points.mensScull.length).toEqual(9)
  expect(points.womensSweep.length).toEqual(9)
  expect(points.mensSweep.length).toEqual(9)

  const sp = points.combined.find((entry) => entry.team == "Slow Poke");
  expect(sp).toBeDefined();
  expect(sp?.points).toEqual(0);

  const ifc = points.combined.find((entry) => entry.team == "Illegally Fast Composite");
  expect(ifc).toBeDefined();
  expect(ifc?.points).toEqual(0);

  // check teams with B entries
  var mb = points.combined.find((entry) => entry.team === "Mount Baker");
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(79.5);
  mb = points.womensSweep.find((entry) => entry.team === "Mount Baker");
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(60);
  mb = points.womensScull.find((entry) => entry.team === "Mount Baker");
  expect(mb).toBeDefined();
  expect(mb?.points).toEqual(10);

  // check 2x boat class
  // 1st place, varsity => 15 points
  const glc_mscull = points.mensScull.find((entry) => entry.team === "Green Lake Crew");
  expect(glc_mscull).toBeDefined();
  expect(glc_mscull?.points).toEqual(15);

  // 4th place, 5 boats in final - .1 * 15 = 1.5
  const mb_mscull = points.mensScull.find((entry) => entry.team === "Mount Baker");
  expect(mb_mscull).toBeDefined();
  expect(mb_mscull?.points).toEqual(1.5);

  // GLC: 6th in frosh 8 and 6th in varsity 8
  // .05 * 30 + .05 * 30 = 3 points
  const glc_wsweep = points.womensSweep.find((entry) => entry.team === "Green Lake Crew");
  expect(glc_wsweep).toBeDefined();
  expect(glc_wsweep?.points).toEqual(3);

  // check 4+ boat class and JR events
  // LS: 2nd place in JR 4+ and Varsity 4+
  // .8 * 20 + .8 * 20 = 28.8 points
  const ls_msweep = points.mensSweep.find((entry) => entry.team === "Lakeside School");
  expect(ls_msweep).toBeDefined();
  expect(ls_msweep?.points).toEqual(32);

  // validate combined points value and order
  expect(points.combined.map((entry) => entry.points)).toEqual([79.5, 58.5, 56, 50, 44, 14, 7, 0, 0]);
});

it("barnes points by number of entries", async () => {
  const points = barnesPointsCalc(regattaResults as unknown as Results, false);
  // check that exhibition crews are excluded from the number of entries
});
