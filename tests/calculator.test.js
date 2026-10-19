import test from "node:test";
import assert from "node:assert/strict";
import { getLevelReq, projectLevels, coinsPerDay } from "../src/features/calculator/calculations.js";
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

test("default next-level and timeline calculations retain their existing results", () => {
  const timeline = projectLevels(101, 334924, 243753, 8000, 500, 2);
  assert.deepEqual(timeline.map(({ level, days, stepsLeft, flowersLeft, bottleneck }) =>
    ({ level, days, stepsLeft, flowersLeft, bottleneck })), [
    { level: 102, days: 488, stepsLeft: 334924, flowersLeft: 243753, bottleneck: "flowers" },
    { level: 103, days: 1074, stepsLeft: 475400, flowersLeft: 292600, bottleneck: "flowers" },
  ]);
});

test("coin estimates retain rounding and the daily cap", () => {
  assert.equal(coinsPerDay(249), 0);
  assert.equal(coinsPerDay(500), 2);
  assert.equal(coinsPerDay(15000), 60);
  assert.equal(coinsPerDay(30000), 60);
});
