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

test("save status has stable readonly snapshots, notifies only on change and unsubscribes", t => {
  const storage = memoryStorage();
  const store = createProgressStore({ getStorage: () => storage });
  t.mock.method(Date, "now", () => 100);
  const initial = store.getSaveStatus();
  assert.deepEqual(initial, { status: "idle", savedAt: null, failedFields: [] });
  assert.strictEqual(store.getSaveStatus(), initial);
  assert.equal(store.retryFailedWrites(), true);
  assert.strictEqual(store.getSaveStatus(), initial);
  const snapshots = [];
  const unsubscribe = store.subscribeSaveStatus(() => snapshots.push(store.getSaveStatus()));
  assert.equal(store.write("level", 9), true);
  const saved = store.getSaveStatus();
  assert.deepEqual(saved, { status: "saved", savedAt: 100, failedFields: [] });
  assert.equal(Object.isFrozen(saved), true);
  assert.equal(Object.isFrozen(saved.failedFields), true);
  assert.equal(snapshots.length, 1);
  assert.equal(store.write("coinsNow", 42), true);
  assert.strictEqual(store.getSaveStatus(), saved);
  assert.equal(snapshots.length, 1);
  unsubscribe();
  t.mock.method(Date, "now", () => 200);
  assert.equal(store.write("level", 10), true);
  assert.equal(store.getSaveStatus().savedAt, 200);
  assert.equal(snapshots.length, 1);
});

test("unrelated successful saves cannot hide a failed collection write", t => {
  const storage = memoryStorage();
  const store = createProgressStore({ getStorage: () => ({
    ...storage,
    setItem(key, value) {
      if (key === "pb_decorCollected") throw new Error("Quota exceeded");
      storage.setItem(key, value);
    },
  }) });
  t.mock.method(Date, "now", () => 100);
  const notifications = [];
  store.subscribeSaveStatus(() => notifications.push(store.getSaveStatus()));
  assert.equal(store.write("decorCollected", { red: true }), false);
  const error = store.getSaveStatus();
  assert.deepEqual(error, { status: "error", savedAt: null, failedFields: ["decorCollected"] });
  assert.equal(store.write("decorCollected", { blue: true }), false);
  assert.strictEqual(store.getSaveStatus(), error);
  assert.equal(notifications.length, 1);
  assert.equal(store.write("level", 9), true);
  assert.deepEqual(store.getSaveStatus(), { status: "error", savedAt: 100, failedFields: ["decorCollected"] });
  assert.equal(store.retryFailedWrites(), false);
  assert.equal(store.getSaveStatus().status, "error");
  assert.equal(storage.getItem("pb_level"), "9");
  assert.equal(storage.getItem("pb_decorCollected"), null);
});

test("explicit retry saves the latest failed values and clears only recovered fields", () => {
  const storage = memoryStorage({ pb_decorCollected: '{"old":true}' });
  const blocked = new Set(["pb_decorCollected", "pb_coinsNow"]);
  const store = createProgressStore({ getStorage: () => ({
    ...storage,
    setItem(key, value) {
      if (blocked.has(key)) throw new Error("Storage unavailable");
      storage.setItem(key, value);
    },
  }) });
  assert.equal(store.write("decorCollected", { first: true }), false);
  const latest = { last: true };
  assert.equal(store.write("decorCollected", latest), false);
  latest.unattempted = true;
  assert.equal(store.write("coinsNow", 17), false);
  assert.equal(store.write("coinsNow", 42), false);
  assert.deepEqual(store.getSaveStatus().failedFields, ["coinsNow", "decorCollected"]);
  assert.deepEqual(store.read("decorCollected", {}), { old: true });
  blocked.delete("pb_decorCollected");
  assert.equal(store.retryFailedWrites(), false);
  assert.deepEqual(store.read("decorCollected", {}), { last: true });
  assert.deepEqual(store.getSaveStatus().failedFields, ["coinsNow"]);
  blocked.clear();
  assert.equal(store.retryFailedWrites(), true);
  assert.equal(store.read("coinsNow", 0), 42);
  assert.equal(store.getSaveStatus().status, "saved");
  assert.deepEqual(store.getSaveStatus().failedFields, []);
});

test("a successful replacement clears its own failure and old values cannot replay", () => {
  const storage = memoryStorage();
  let blocked = true;
  const store = createProgressStore({ getStorage: () => {
    if (blocked) throw new Error("Blocked");
    return storage;
  } });
  assert.equal(store.write("coinsNow", 17), false);
  blocked = false;
  const unsubscribe = store.subscribeSaveStatus(() => { throw new Error("Broken subscriber"); });
  assert.equal(store.write("coinsNow", 42), true);
  assert.equal(store.retryFailedWrites(), true);
  assert.equal(store.read("coinsNow", 0), 42);
  assert.equal(store.getSaveStatus().status, "saved");
  unsubscribe();
});
