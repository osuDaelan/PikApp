import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCalculatorBackupFile, isLocalBackupRequest } from "../dev/localCalculatorBackup.js";
import { validCalculatorSnapshot } from "../src/storage/calculatorBackupData.js";
import { assertLocalCalculatorRestoreVerified, markCalculatorChanged, restoreLocalCalculatorBackup, saveLocalCalculatorBackup } from "../src/storage/localCalculatorBackup.js";

const calculator = {
  level: 106, stepsInput: 100000, flowersInput: 50000,
  dSteps: 8000, dFlowers: 2000, coinsNow: 50, totalStepsMode: false,
};
const record = (savedAt, changes = {}) => ({ version: 1, savedAt, calculator: { ...calculator, ...changes } });

test("local calculator backup survives reopening and rejects stale/invalid writes", async t => {
  // Exercise the same writable workspace as the dev server; Windows sandbox
  // virtual temp directories do not support replacing existing files reliably.
  const directory = fileURLToPath(new URL("../.local/", import.meta.url));
  await mkdir(directory, { recursive: true });
  const prefix = join(directory, "test-calculator-");
  const root = await mkdtemp(prefix);
  t.after(async () => {
    assert.ok(root.startsWith(prefix) && root.length > prefix.length);
    await rm(root, { recursive: true, force: true });
  });
  const file = createCalculatorBackupFile(root);
  assert.equal(await file.read(), null);
  await Promise.all([file.write(record(10)), file.write(record(20, { coinsNow: 440 }))]);
  assert.deepEqual(await createCalculatorBackupFile(root).read(), record(20, { coinsNow: 440 }));
  await assert.rejects(file.write(record(15)), /newer local backup/);
  await assert.rejects(file.write(record(30, { level: 999 })), /Invalid calculator backup/);
  assert.equal((await file.read()).calculator.coinsNow, 440);
  await file.write(record(40));
  assert.deepEqual(await file.read(), record(40));
  const path = join(root, ".local", "calculator-progress.json");
  await writeFile(path, "damaged backup", "utf8");
  await assert.rejects(file.write(record(50)));
  assert.equal(await readFile(path, "utf8"), "damaged backup", "failed reads do not overwrite the old file");
});

test("restoration recovers all calculator fields without changing decor progress", async () => {
  const entries = new Map([["pb_decorCollected", '{"saved":true}']]);
  const storage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
  const request = async () => ({ ok: true, json: async () => record(20) });
  await restoreLocalCalculatorBackup({ storage, request });
  for (const [field, value] of Object.entries(calculator)) assert.equal(entries.get(`pb_${field}`), String(value));
  assert.equal(entries.get("pb_decorCollected"), '{"saved":true}');
  entries.set("pb_localCalculatorUpdatedAt", "30");
  entries.set("pb_coinsNow", "777");
  await restoreLocalCalculatorBackup({ storage, request });
  assert.equal(entries.get("pb_coinsNow"), "777", "newer browser edits survive an older disk backup");
});

test("missing or failed backup service leaves existing browser values intact", async () => {
  const storage = { getItem: () => "104", setItem: () => assert.fail("must not write") };
  await restoreLocalCalculatorBackup({ storage, request: async () => ({ ok: true, json: async () => null }) });
  await assert.rejects(restoreLocalCalculatorBackup({ storage, request: async () => ({ ok: false }) }));
});

test("a failed development restore rolls back partial writes and preserves missing fields", async () => {
  const initial = { pb_level: "9", pb_flowersInput: "42", pb_localCalculatorUpdatedAt: "10", pb_decorCollected: '{"saved":true}' };
  const entries = new Map(Object.entries(initial));
  let failed = false;
  const storage = {
    getItem: key => entries.get(key) ?? null,
    setItem(key, value) {
      if (key === "pb_dSteps" && !failed) { failed = true; throw new Error("Quota exceeded"); }
      entries.set(key, value);
    },
    removeItem: key => entries.delete(key),
  };
  await assert.rejects(restoreLocalCalculatorBackup({ storage, request: async () => ({ ok: true, json: async () => record(20) }) }),
    error => error.rollbackFailed === false && /Previous browser values were restored/.test(error.message));
  assert.deepEqual(Object.fromEntries(entries), initial);
});

test("failed startup restoration cannot overwrite a good file through subsequent autosave", async t => {
  const entries = new Map([["pb_level", "9"], ["pb_localCalculatorUpdatedAt", "10"]]);
  let posts = 0;
  t.mock.method(globalThis, "fetch", async () => { posts++; return { ok: true }; });
  const storage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
  await assert.rejects(restoreLocalCalculatorBackup({ storage, request: async () => { throw new Error("Server temporarily unavailable"); } }));
  assert.throws(() => assertLocalCalculatorRestoreVerified(), error => error.code === "RESTORE_UNVERIFIED");
  assert.equal(entries.get("pb_localCalculatorUpdatedAt"), "10");
  await assert.rejects(saveLocalCalculatorBackup(calculator, 100), error => error.code === "RESTORE_UNVERIFIED" && /not restored safely/.test(error.message));
  assert.equal(posts, 0);
  await restoreLocalCalculatorBackup({ storage, request: async () => ({ ok: true, json: async () => null }) });
  assert.doesNotThrow(() => assertLocalCalculatorRestoreVerified());
  await saveLocalCalculatorBackup(calculator, 100);
  assert.equal(posts, 1, "a verified empty file allows the normal backup path again");
});

test("a failed rollback is explicit and the existing development file remains protected", async t => {
  const entries = new Map([["pb_level", "9"], ["pb_localCalculatorUpdatedAt", "10"]]);
  let restoring = false, posts = 0;
  const storage = {
    getItem: key => entries.get(key) ?? null,
    setItem(key, value) {
      if (key === "pb_stepsInput") { restoring = true; throw new Error("Quota exceeded"); }
      if (key === "pb_level" && restoring) throw new Error("Rollback blocked");
      entries.set(key, value);
    },
    removeItem: key => entries.delete(key),
  };
  t.mock.method(globalThis, "fetch", async () => { posts++; return { ok: true }; });
  await assert.rejects(restoreLocalCalculatorBackup({ storage, request: async () => ({ ok: true, json: async () => record(20) }) }),
    error => error.rollbackFailed === true && /backup file is unchanged/.test(error.message));
  await assert.rejects(saveLocalCalculatorBackup(calculator, 100), /not restored safely/);
  assert.equal(posts, 0);
});

test("development saves preserve imported freshness when the device clock moves backwards", async () => {
  const entries = new Map([["pb_localCalculatorUpdatedAt", "9001"], ["pb_level", "9"]]);
  const storage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
  const effectiveTime = markCalculatorChanged(5000, { storage });
  assert.equal(effectiveTime, 9002, "the returned timestamp must also be used for the file backup POST");
  assert.equal(entries.get("pb_localCalculatorUpdatedAt"), "9002");
  await restoreLocalCalculatorBackup({ storage, request: async () => ({ ok: true, json: async () => record(9000, { level: 3 }) }) });
  assert.equal(entries.get("pb_level"), "9", "an older development file cannot undo imported progress");
});

test("backup accepts calculator fields only and blocks unrelated website requests", () => {
  assert.equal(validCalculatorSnapshot(calculator), true);
  for (const invalid of [{ ...calculator, extra: "secret" }, { ...calculator, stepsInput: -1 },
    { ...calculator, coinsNow: "433" }, { ...calculator, totalStepsMode: "false" }, { ...calculator, dSteps: 1_000_000_000 }]) {
    assert.equal(validCalculatorSnapshot(invalid), false);
  }
  assert.equal(isLocalBackupRequest({ host: "localhost:5173", origin: "http://localhost:5173" }), true);
  assert.equal(isLocalBackupRequest({ host: "127.0.0.1:5173" }), true);
  assert.equal(isLocalBackupRequest({ host: "localhost:5173", origin: "https://unrelated.example" }), false);
  assert.equal(isLocalBackupRequest({ host: "localhost:5173", "sec-fetch-site": "cross-site" }), false);
  assert.equal(isLocalBackupRequest({ host: "192.168.1.2:5173" }), false);
});
