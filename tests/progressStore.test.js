import test from "node:test";
import assert from "node:assert/strict";
import { createProgressStore } from "../src/storage/progressStore.js";

function memoryStorage(initial = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
}

test("existing guest saves load with their original keys and types", () => {
  const storage = memoryStorage({
    pb_level: "101", pb_stepsInput: "334924", pb_flowersInput: "243753",
    pb_dSteps: "8000", pb_dFlowers: "500", pb_coinsNow: "1200",
    pb_decorCollected: '{"restaurant__chef_hat__Red":true,"restaurant__chef_hat__Blue":false}',
    pb_showAllDecor: "true", pb_totalStepsMode: "false",
  });
  const store = createProgressStore({ getStorage: () => storage });
  for (const [field, expected] of Object.entries({
    level: 101, stepsInput: 334924, flowersInput: 243753,
    dSteps: 8000, dFlowers: 500, coinsNow: 1200,
    showAllDecor: true, totalStepsMode: false,
  })) assert.equal(store.read(field, null), expected);
  assert.deepEqual(store.read("decorCollected", {}), {
    restaurant__chef_hat__Red: true, restaurant__chef_hat__Blue: false,
  });
});

test("updates remain readable after creating a fresh store", () => {
  const storage = memoryStorage();
  const store = createProgressStore({ getStorage: () => storage });
  assert.equal(store.write("level", 105), true);
  assert.equal(store.write("showAllDecor", true), true);
  assert.equal(store.write("decorCollected", { restaurant__chef_hat__Red: true }), true);
  const reloaded = createProgressStore({ getStorage: () => storage });
  assert.equal(storage.getItem("pb_level"), "105");
  assert.equal(reloaded.read("level", 1), 105);
  assert.equal(reloaded.read("showAllDecor", false), true);
  assert.deepEqual(reloaded.read("decorCollected", {}), { restaurant__chef_hat__Red: true });
});

test("local account caches cannot overwrite guest or other account progress", () => {
  const storage = memoryStorage({ pb_level: "101" });
  const options = { getStorage: () => storage };
  const guest = createProgressStore(options);
  const first = createProgressStore({ ...options, accountId: "first/account" });
  const second = createProgressStore({ ...options, accountId: "second" });
  assert.equal(first.read("level", 1), 1);
  first.write("level", 110);
  second.write("level", 114);
  assert.equal(guest.read("level", 1), 101);
  assert.equal(first.read("level", 1), 110);
  assert.equal(second.read("level", 1), 114);
});

test("invalid collection data falls back without crashing", () => {
  for (const value of ["null", "[]", '"text"', '{"x":"yes"}', "invalid JSON"]) {
    const storage = memoryStorage({ pb_decorCollected: value, pb_level: "not a number" });
    const store = createProgressStore({ getStorage: () => storage });
    assert.deepEqual(store.read("decorCollected", {}), {});
    assert.equal(store.read("level", 101), 101);
  }
});

test("blocked storage does not prevent using the app", () => {
  const store = createProgressStore({ getStorage: () => { throw new Error("Blocked"); } });
  assert.equal(store.read("level", 101), 101);
  assert.deepEqual(store.read("decorCollected", {}), {});
  assert.equal(store.write("level", 102), false);
});

test("unknown fields fail explicitly instead of creating accidental save keys", () => {
  const store = createProgressStore({ getStorage: () => memoryStorage() });
  assert.throws(() => store.read("typo", 1), /Unknown progress field/);
  assert.throws(() => store.write("typo", 1), /Unknown progress field/);
});
