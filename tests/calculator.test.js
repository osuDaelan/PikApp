import test from "node:test";
import assert from "node:assert/strict";
import { getLevelReq, projectLevels, coinsPerDay, daysToComplete } from "../src/features/calculator/calculations.js";
import { MAX_KNOWN } from "../src/features/calculator/levelData.js";

test("requirements keep the cumulative/per-level boundary at the same levels", () => {
  assert.deepEqual(getLevelReq(99), { steps: 10000000, flowers: 140000 });
  assert.deepEqual(getLevelReq(100), { steps: 474000, flowers: 292000 });
  assert.deepEqual(getLevelReq(101), { steps: 475000, flowers: 292300 });
  assert.equal(getLevelReq(120), null);
});

test("requirements match Pikipedia's documented levels 115–120", () => {
  assert.equal(MAX_KNOWN, 120);
  const requirements = [
    { steps: 481600, flowers: 296400 },
    { steps: 482100, flowers: 296700 },
    { steps: 482600, flowers: 297000 },
    { steps: 483000, flowers: 297300 },
    { steps: 483500, flowers: 297500 },
    { steps: 484000, flowers: 297800 },
  ];
  assert.deepEqual(requirements.map((_, index) => getLevelReq(114 + index)), requirements);
});

test("projection uses full per-level requirements through 120 and stops before unknown levels", () => {
  const timeline = projectLevels(114, 481600, 296400, 10000, 1000, 130);
  assert.deepEqual(timeline.map(({ level, days, stepsLeft, flowersLeft }) =>
    ({ level, days, stepsLeft, flowersLeft })), [
    { level: 115, days: 297, stepsLeft: 481600, flowersLeft: 296400 },
    { level: 116, days: 594, stepsLeft: 482100, flowersLeft: 296700 },
    { level: 117, days: 891, stepsLeft: 482600, flowersLeft: 297000 },
    { level: 118, days: 1189, stepsLeft: 483000, flowersLeft: 297300 },
    { level: 119, days: 1487, stepsLeft: 483500, flowersLeft: 297500 },
    { level: 120, days: 1785, stepsLeft: 484000, flowersLeft: 297800 },
  ]);
  assert.deepEqual(projectLevels(120, 0, 0, 10000, 1000, 130), []);
});

test("saved-progress next-level and timeline calculations retain their existing results", () => {
  const timeline = projectLevels(101, 334924, 243753, 8000, 500, 2);
  assert.deepEqual(timeline.map(({ level, days, stepsLeft, flowersLeft, bottleneck }) =>
    ({ level, days, stepsLeft, flowersLeft, bottleneck })), [
    { level: 102, days: 488, stepsLeft: 334924, flowersLeft: 243753, bottleneck: "flowers" },
    { level: 103, days: 1074, stepsLeft: 475400, flowersLeft: 292600, bottleneck: "flowers" },
  ]);
});

test("completion time needs a positive daily rate only when work remains", () => {
  assert.equal(daysToComplete(0, 0), 0);
  assert.equal(daysToComplete(-5, 0), 0);
  assert.equal(daysToComplete(0, 500), 0);
  assert.equal(daysToComplete(900, 200), 4.5);
  assert.equal(daysToComplete(900, 0), Infinity);
  assert.equal(daysToComplete(900, -1), Infinity);

  const timeline = projectLevels(1, 0, 0, 0, 0, 130);
  assert.deepEqual(timeline.map(({ level, days }) => ({ level, days })), [{ level: 2, days: 0 }]);
  assert.ok(Number.isFinite(timeline[0].date.getTime()));
});

test("missing step or flower averages do not invent a completion date", () => {
  assert.deepEqual(projectLevels(101, 100, 0, 0, 500), []);
  assert.deepEqual(projectLevels(101, 0, 100, 8000, 0), []);
});

test("a low-level timeline stops when a later flower requirement has no daily average", () => {
  const timeline = projectLevels(1, 0, 0, 500, 0, 130);
  assert.deepEqual(timeline.map(({ level }) => level), Array.from({ length: 21 }, (_, index) => index + 2));
  assert.equal(timeline.at(-1).days, 288);
  assert.equal(getLevelReq(timeline.at(-1).level).flowers, 500);
  assert.ok(timeline.every(({ days, date }) => Number.isFinite(days) && Number.isFinite(date.getTime())));
});

test("coin estimates retain rounding and the daily cap", () => {
  assert.equal(coinsPerDay(249), 0);
  assert.equal(coinsPerDay(500), 2);
  assert.equal(coinsPerDay(15000), 60);
  assert.equal(coinsPerDay(30000), 60);
});
