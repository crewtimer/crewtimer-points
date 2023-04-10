import { expect, it } from "@jest/globals";
import { genPlaces } from "../src/common/CrewTimerUtils";

it("place assign", async () => {
  expect(genPlaces([1, 2, 3])).toEqual([1, 2, 3]);
  expect(genPlaces([1, 3, 2])).toEqual([1, 3, 2]);
  expect(genPlaces([1, 1, 2])).toEqual([1, 1, 3]);
  expect(genPlaces([1, 2, 1])).toEqual([1, 3, 1]);
  expect(genPlaces([1, 2, 1], "asc")).toEqual([1, 3, 1]);
  expect(genPlaces([1, 4, 2, 3, 4, 2], "asc")).toEqual([1, 5, 2, 4, 5, 2]);
  expect(genPlaces([1, 2, 3], "desc")).toEqual([3, 2, 1]);
  expect(genPlaces([1, 3, 2], "desc")).toEqual([3, 1, 2]);
  expect(genPlaces([1, 1, 2], "desc")).toEqual([2, 2, 1]);
  expect(genPlaces([1, 2, 1], "desc")).toEqual([2, 1, 2]);
  expect(genPlaces([1, 4, 2, 3, 4, 2], "desc")).toEqual([6, 1, 4, 3, 1, 4]);
});
