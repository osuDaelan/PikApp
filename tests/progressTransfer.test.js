import test from "node:test";
import assert from "node:assert/strict";
import { CALCULATOR_FIELDS } from "../src/storage/calculatorBackupData.js";
import { defaultMapState, MAP_STORAGE_KEY } from "../src/features/decor-map/mapStorage.js";
import { createProgressBackup, parseProgressBackup, summarizeProgressBackup, applyProgressBackup,
  readProgressRecovery, PROGRESS_RECOVERY_KEY, MAX_PROGRESS_BACKUP_BYTES } from "../src/storage/progressTransfer.js";

const red = "restaurant__chef_hat__Red", blue = "restaurant__chef_hat__Blue";
const date = "2026-10-22T12:00:00.000Z";
const UPDATED_KEY = "pb_localCalculatorUpdatedAt";

function snapshot() {
  return {
    calculator: { level: 50, stepsInput: 45000, flowersInput: 30000, dSteps: 6000, dFlowers: 1000, coinsNow: 200, totalStepsMode: false },
    decor: { collected: { [red]: true, [blue]: false }, showAll: false },
    map: { ...defaultMapState(), pins: [{ id: "public-test", name: "Public test park", notes: "Bring a reminder 🌱",
      lat: 42.36, lng: -71.06, categoryIds: ["park"], osmId: "way/123", createdAt: date, updatedAt: date }] },
  };
}

function incoming() {
  const value = snapshot();
  value.calculator = { level: 9, stepsInput: 1000, flowersInput: 0, dSteps: 0, dFlowers: 0, coinsNow: 17, totalStepsMode: true };
  value.decor = { collected: { [red]: false, [blue]: true }, showAll: true };
  value.map.pins = [];
  value.map.categoryIds = ["waterside"];
  return parseProgressBackup(createProgressBackup(value, date));
}

function memoryStorage(initial = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    entries,
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: key => entries.delete(key),
  };
}

function rawSnapshot(value) {
  return { ...Object.fromEntries(CALCULATOR_FIELDS.map(field => [`pb_${field}`, String(value.calculator[field])])),
    pb_decorCollected: JSON.stringify(value.decor.collected), pb_showAllDecor: String(value.decor.showAll),
    [MAP_STORAGE_KEY]: JSON.stringify(value.map), [UPDATED_KEY]: "100" };
}

test("full backups round-trip calculator, explicit decor removals, map settings and private notes", () => {
  const source = snapshot();
  const text = createProgressBackup(source, date);
  const parsed = parseProgressBackup(text);
  assert.deepEqual(parsed, { format: "pikapp-progress", version: 1, exportedAt: date, ...source });
  assert.equal(parsed.decor.collected[blue], false);
  assert.deepEqual(summarizeProgressBackup(parsed), { level: 50, collected: 1, pins: 1, exportedAt: date });
  assert.equal(text.includes("accessToken"), false);
});

test("old partial collections and newly added decor round-trip without a save-format migration", () => {
  const old = parseProgressBackup(createProgressBackup(snapshot(), date));
  const added = ["airport__luggage_tag__Ice", "forest__acorn_rare__Red",
    "halloween_stained_glass__halloween_stained_glass__Ice", "wurst__wurst__Blue"];
  assert.ok(added.every(id => !Object.hasOwn(old.decor.collected, id)), "old backups do not invent new collected entries");
  const updated = snapshot();
  for (const id of added) updated.decor.collected[id] = true;
  const backup = parseProgressBackup(createProgressBackup(updated, date));
  assert.equal(backup.version, 1);
  assert.equal(backup.decor.collected[blue], false, "explicit old removals remain removals");
  for (const id of added) assert.equal(backup.decor.collected[id], true);
  const storage = memoryStorage(rawSnapshot(snapshot()));
  applyProgressBackup(backup, { getStorage: () => storage, current: snapshot(), now: () => Date.parse(date) });
  assert.deepEqual(JSON.parse(storage.getItem("pb_decorCollected")), updated.decor.collected);
});

test("unsupported, extra, unknown and malformed imported data is rejected completely", () => {
  const valid = parseProgressBackup(createProgressBackup(snapshot(), date));
  const changes = [
    value => { value.version = 2; },
    value => { value.format = "pin-backup"; },
    value => { value.auth = { token: "not-progress" }; },
    value => { value.calculator.level = 0; },
    value => { value.calculator.level = 121; },
    value => { value.calculator.coinsNow = -1; },
    value => { value.calculator.dSteps = "0"; },
    value => { value.calculator.stepsInput = Number.MAX_SAFE_INTEGER + 1; },
    value => { value.calculator.totalStepsMode = "true"; },
    value => { value.calculator.extra = 1; },
    value => { delete value.calculator.flowersInput; },
    value => { value.decor.collected.unknown = true; },
    value => { value.decor.collected[red] = 1; },
    value => { value.decor.showAll = "false"; },
    value => { value.map.version = 2; },
    value => { value.map.viewport.lat = 90; },
    value => { value.map.viewport.zoom = 20; },
    value => { value.map.sourceId = "unknown"; },
    value => { value.map.categoryIds.push("unknown"); },
    value => { value.map.categoryIds.push(value.map.categoryIds[0]); },
    value => { value.map.results = []; },
    value => { value.map.pins.push(structuredClone(value.map.pins[0])); },
    value => { value.map.pins[0].notes = "x".repeat(2001); },
    value => { value.map.pins[0].lat = 999; },
    value => { value.map.pins[0].osmId = "https://example.test/private"; },
    value => { value.map.pins[0].createdAt = null; },
    value => { value.map.pins[0].updatedAt = "bad date"; },
    value => { value.map.pins[0].auth = "not-progress"; },
    value => { value.exportedAt = "invalid"; },
  ];
  for (const change of changes) {
    const value = structuredClone(valid);
    change(value);
    assert.throws(() => parseProgressBackup(JSON.stringify(value)), /backup|decor|map|date/i);
  }
  assert.throws(() => parseProgressBackup('{"version":1,"pins":[]}'), /Pin-only/);
  assert.throws(() => parseProgressBackup("not json"), /not valid JSON/);
});

test("backup parsing applies the 20 MB cap to UTF-8 bytes before JSON parsing", () => {
  assert.throws(() => parseProgressBackup("é".repeat(MAX_PROGRESS_BACKUP_BYTES / 2 + 1)), /20 MB/);
  assert.throws(() => parseProgressBackup(null), /20 MB/);
});

test("a maximum pin collection with multibyte names and notes can read its own full backup", () => {
  const source = snapshot();
  const template = source.map.pins[0];
  source.map.pins = Array.from({ length: 1000 }, (_, index) => ({ ...template,
    id: `public-test-${index}`, name: "園".repeat(120), notes: "花".repeat(2000) }));
  const text = createProgressBackup(source, date);
  assert.ok(new Blob([text]).size < MAX_PROGRESS_BACKUP_BYTES);
  const parsed = parseProgressBackup(text);
  assert.equal(parsed.map.pins.length, 1000);
  assert.deepEqual(parsed.map.pins[999], source.map.pins[999]);
  source.map.pins.push({ ...template, id: "public-test-over-limit" });
  assert.throws(() => createProgressBackup(source, date), /invalid map/);
});

test("confirmed replacement preserves live and exact raw recovery without touching unrelated keys", () => {
  const current = snapshot();
  const original = rawSnapshot(current);
  original.pb_level = "050";
  original.pb_decorCollected = '{"future__unknown__entry":true}';
  original[UPDATED_KEY] = "2000";
  const storage = memoryStorage({ ...original, unrelated: "retain", "firebase:authUser:example": "retain identity" });
  assert.deepEqual(applyProgressBackup(incoming(), { current, getStorage: () => storage, now: () => 1000 }),
    { ok: true, importedAt: 2001, recoveryAvailable: true });
  assert.equal(storage.getItem("pb_level"), "9");
  assert.equal(storage.getItem("pb_coinsNow"), "17");
  assert.equal(storage.getItem("pb_totalStepsMode"), "true");
  assert.deepEqual(JSON.parse(storage.getItem("pb_decorCollected")), { [red]: false, [blue]: true });
  assert.deepEqual(JSON.parse(storage.getItem(MAP_STORAGE_KEY)).pins, []);
  assert.equal(storage.getItem(UPDATED_KEY), "2001");
  assert.equal(storage.getItem("unrelated"), "retain");
  assert.equal(storage.getItem("firebase:authUser:example"), "retain identity");
  const recovery = readProgressRecovery({ getStorage: () => storage });
  assert.deepEqual(parseProgressBackup(recovery.backupText), { format: "pikapp-progress", version: 1,
    exportedAt: JSON.parse(recovery.backupText).exportedAt, ...current });
  assert.deepEqual(JSON.parse(recovery.rawText).raw, original);
  assert.equal(JSON.parse(recovery.rawText).raw.unrelated, undefined);
  assert.throws(() => parseProgressBackup(recovery.rawText), /supported PikApp/);
});

test("validation and unreadable current saves abort before any storage mutation", () => {
  const storage = memoryStorage({ pb_level: "50", [PROGRESS_RECOVERY_KEY]: "older recovery" });
  const before = [...storage.entries];
  const value = incoming();
  value.decor.collected.unknown = true;
  assert.throws(() => applyProgressBackup(value, { current: snapshot(), getStorage: () => assert.fail("must validate first") }), /unknown decor/);
  const invalidCurrent = snapshot();
  invalidCurrent.decor.collected.unknown = true;
  assert.throws(() => applyProgressBackup(incoming(), { current: invalidCurrent, getStorage: () => storage }),
    error => error.code === "current-backup-unavailable");
  const blocked = { ...storage, getItem(key) { if (key === "pb_coinsNow") throw new Error("read failed"); return storage.getItem(key); } };
  assert.throws(() => applyProgressBackup(incoming(), { current: snapshot(), getStorage: () => blocked }),
    error => error.code === "storage-unavailable");
  assert.deepEqual([...storage.entries], before);
});

test("recovery storage failure preserves the previous recovery and blocks the import", () => {
  const storage = memoryStorage({ pb_level: "50", [PROGRESS_RECOVERY_KEY]: "older recovery" });
  const before = [...storage.entries];
  const blocked = { ...storage, setItem(key, value) {
    if (key === PROGRESS_RECOVERY_KEY) throw new Error("quota exceeded");
    storage.setItem(key, value);
  } };
  assert.throws(() => applyProgressBackup(incoming(), { current: snapshot(), getStorage: () => blocked }),
    error => error.code === "recovery-unavailable" && !error.rollbackFailed && error.recoveryAvailable);
  assert.deepEqual([...storage.entries], before);
});

test("an unverifiable recovery write is undone before progress can change", () => {
  const storage = memoryStorage({ pb_level: "50", [PROGRESS_RECOVERY_KEY]: "older recovery" });
  let checks = 0;
  const blocked = { ...storage, getItem(key) {
    if (key === PROGRESS_RECOVERY_KEY && ++checks === 2) return "different value";
    return storage.getItem(key);
  } };
  assert.throws(() => applyProgressBackup(incoming(), { current: snapshot(), getStorage: () => blocked }), /recovery copy could not be saved/);
  assert.equal(storage.getItem(PROGRESS_RECOVERY_KEY), "older recovery");
  assert.equal(storage.getItem("pb_level"), "50");
  assert.equal(storage.getItem("pb_stepsInput"), null);
});

test("a late write failure rolls all sections back, including originally absent keys", () => {
  const current = snapshot();
  const original = rawSnapshot(current);
  delete original.pb_stepsInput;
  delete original.pb_showAllDecor;
  const storage = memoryStorage(original);
  let failed = false;
  const blocked = { ...storage, setItem(key, value) {
    if (key === UPDATED_KEY && !failed) { failed = true; throw new Error("last write failed"); }
    storage.setItem(key, value);
  } };
  assert.throws(() => applyProgressBackup(incoming(), { current, getStorage: () => blocked, now: () => 2000 }),
    error => error.code === "import-failed" && !error.rollbackFailed && error.recoveryAvailable && /restored/.test(error.message));
  const remaining = Object.fromEntries([...storage.entries].filter(([key]) => key !== PROGRESS_RECOVERY_KEY));
  assert.deepEqual(remaining, original);
  const recovery = readProgressRecovery({ getStorage: () => storage });
  assert.equal(parseProgressBackup(recovery.backupText).calculator.level, 50);
  assert.equal(JSON.parse(recovery.rawText).raw.pb_stepsInput, null);
});

test("rollback failure is explicit and leaves downloadable raw and live recovery", () => {
  const current = snapshot();
  const storage = memoryStorage(rawSnapshot(current));
  let reverting = false;
  const blocked = { ...storage, setItem(key, value) {
    if (key === "pb_flowersInput") { reverting = true; throw new Error("write failed"); }
    if (key === "pb_level" && reverting) throw new Error("rollback failed");
    storage.setItem(key, value);
  } };
  assert.throws(() => applyProgressBackup(incoming(), { current, getStorage: () => blocked }),
    error => error.rollbackFailed && error.recoveryAvailable && /Keep this tab open/.test(error.message));
  assert.equal(storage.getItem("pb_level"), "9");
  const recovery = readProgressRecovery({ getStorage: () => storage });
  assert.equal(parseProgressBackup(recovery.backupText).calculator.level, 50);
  assert.equal(JSON.parse(recovery.rawText).raw.pb_level, "50");
});

test("recovery reading handles absent, malformed and damaged readable copies without overwriting them", () => {
  const storage = memoryStorage();
  assert.equal(readProgressRecovery({ getStorage: () => storage }), null);
  storage.setItem(PROGRESS_RECOVERY_KEY, "not JSON");
  assert.throws(() => readProgressRecovery({ getStorage: () => storage }), /unreadable/);
  assert.equal(storage.getItem(PROGRESS_RECOVERY_KEY), "not JSON");
  applyProgressBackup(incoming(), { current: snapshot(), getStorage: () => storage });
  const recovery = JSON.parse(storage.getItem(PROGRESS_RECOVERY_KEY));
  recovery.backup.version = 99;
  storage.setItem(PROGRESS_RECOVERY_KEY, JSON.stringify(recovery));
  const damaged = readProgressRecovery({ getStorage: () => storage });
  assert.equal(damaged.backupText, null);
  assert.deepEqual(JSON.parse(damaged.rawText).raw, recovery.raw);
});

test("unadvanceable timestamps prevent stale backup restoration without making writes", () => {
  const storage = memoryStorage({ [UPDATED_KEY]: String(Number.MAX_SAFE_INTEGER), [PROGRESS_RECOVERY_KEY]: "older recovery" });
  const before = [...storage.entries];
  assert.throws(() => applyProgressBackup(incoming(), { current: snapshot(), getStorage: () => storage, now: () => 1000 }),
    error => error.code === "invalid-save-time");
  assert.deepEqual([...storage.entries], before);
  assert.throws(() => applyProgressBackup(incoming(), { current: snapshot(), getStorage: () => storage,
    now: () => 8_640_000_000_000_001 }), error => error.code === "invalid-save-time");
  assert.deepEqual([...storage.entries], before);
});
