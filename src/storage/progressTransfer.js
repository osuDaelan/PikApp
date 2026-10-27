import { CALCULATOR_FIELDS, calculatorSnapshot, validCalculatorSnapshot } from "./calculatorBackupData.js";
import { DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES } from "../features/decor/catalog.js";
import { decorId, decorStorageLocation } from "../features/decor/collection.js";
import { LEGACY_GROUPED_ENTRIES, pendingLegacyDecor } from "../features/decor/legacyDecor.js";
import { validateRareVisibility } from "../features/decor/rareVisibility.js";
import { CATEGORY_BY_ID } from "../features/decor-map/categories.js";
import { validViewport } from "../features/decor-map/coordinates.js";
import { DATA_SOURCES } from "../features/decor-map/providers.js";
import { MAP_STORAGE_KEY, normalizeMapState } from "../features/decor-map/mapStorage.js";

export const MAX_PROGRESS_BACKUP_BYTES = 20 * 1024 * 1024;
export const PROGRESS_RECOVERY_KEY = "pb_progressRecovery_v1";
const UPDATED_KEY = "pb_localCalculatorUpdatedAt";
const LEGACY_RAW_KEYS = [...CALCULATOR_FIELDS.map(field => `pb_${field}`), "pb_decorCollected", "pb_showAllDecor", MAP_STORAGE_KEY, UPDATED_KEY];
const RAW_KEYS = [...LEGACY_RAW_KEYS, "pb_rareVisibility"];
const ACTIVE_DECOR_IDS = new Set([...DECOR_LOCATIONS, ...DECOR_SPECIAL_CATEGORIES].flatMap(group =>
  group.costumes.flatMap(costume => (costume.designs || costume.colors).map(variant => decorId(decorStorageLocation(group), costume.name, variant)))));
const KNOWN_DECOR_IDS = new Set([...ACTIVE_DECOR_IDS, ...LEGACY_GROUPED_ENTRIES.map(entry => entry.id)]);
const PIN_FIELDS = ["id", "name", "notes", "lat", "lng", "categoryIds", "osmId", "createdAt", "updatedAt"];

function failure(message, code = "invalid-backup", flags = {}) {
  return Object.assign(new Error(message), { code, rollbackFailed: false, recoveryAvailable: false, ...flags });
}

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value, keys) {
  return record(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}

function isoDate(value) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw failure("The backup has an invalid date.");
  return new Date(value).toISOString();
}

function validCategories(value) {
  return Array.isArray(value) && value.every(id => typeof id === "string" && CATEGORY_BY_ID.has(id))
    && new Set(value).size === value.length;
}

function normalizedBackup(value) {
  if (!exactKeys(value, ["format", "version", "exportedAt", "calculator", "decor", "map"])
      || value.format !== "pikapp-progress" || value.version !== 1) {
    throw failure("Choose a supported PikApp progress backup (version 1). Pin-only and account files cannot be imported here.");
  }
  if (!exactKeys(value.calculator, CALCULATOR_FIELDS) || !validCalculatorSnapshot(value.calculator)) {
    throw failure("The backup has invalid calculator values. No saved data was changed.");
  }
  if (!(exactKeys(value.decor, ["collected", "showAll"]) || exactKeys(value.decor, ["collected", "showAll", "rareVisibility"])) || typeof value.decor.showAll !== "boolean"
      || !record(value.decor.collected) || Object.entries(value.decor.collected).some(([id, collected]) =>
        !KNOWN_DECOR_IDS.has(id) || typeof collected !== "boolean")) {
    throw failure("The backup has invalid or unknown decor entries. No saved data was changed.");
  }
  let rareVisibility;
  if (Object.hasOwn(value.decor, "rareVisibility")) {
    try { rareVisibility = validateRareVisibility(value.decor.rareVisibility); }
    catch { throw failure("The backup has invalid rare decor visibility settings. No saved data was changed."); }
  }
  const map = value.map;
  if (!exactKeys(map, ["version", "viewport", "categoryIds", "sourceId", "pins"]) || map.version !== 1
      || !exactKeys(map.viewport, ["lat", "lng", "zoom"]) || !validViewport(map.viewport)
      || !validCategories(map.categoryIds) || !DATA_SOURCES.some(source => source.id === map.sourceId)
      || !Array.isArray(map.pins) || map.pins.some(pin => !exactKeys(pin, PIN_FIELDS)
        || !validCategories(pin.categoryIds) || typeof pin.createdAt !== "string" || typeof pin.updatedAt !== "string")) {
    throw failure("The backup has invalid map settings or pins. No saved data was changed.");
  }
  let normalizedMap;
  try { normalizedMap = normalizeMapState(map); }
  catch { throw failure("The backup has invalid map settings or pins. No saved data was changed."); }
  return { format: "pikapp-progress", version: 1, exportedAt: isoDate(value.exportedAt),
    calculator: calculatorSnapshot(value.calculator),
    decor: { collected: Object.fromEntries(Object.entries(value.decor.collected)), showAll: value.decor.showAll,
      ...(rareVisibility === undefined ? {} : { rareVisibility }) },
    map: { ...normalizedMap, viewport: { ...normalizedMap.viewport } } };
}

function backupText(value) {
  const text = JSON.stringify(value, null, 2);
  if (new Blob([text]).size > MAX_PROGRESS_BACKUP_BYTES) throw failure("Choose a PikApp progress backup smaller than 20 MB.");
  return text;
}

export function createProgressBackup({ calculator, decor, map }, date = new Date()) {
  let exportedAt;
  try { exportedAt = new Date(date).toISOString(); }
  catch { throw failure("The backup date is invalid."); }
  return backupText(normalizedBackup({ format: "pikapp-progress", version: 1, exportedAt, calculator, decor, map }));
}

export function parseProgressBackup(text) {
  if (typeof text !== "string" || new Blob([text]).size > MAX_PROGRESS_BACKUP_BYTES) {
    throw failure("Choose a PikApp progress backup smaller than 20 MB.");
  }
  let value;
  try { value = JSON.parse(text); }
  catch { throw failure("This file is not valid JSON. No saved data was changed."); }
  const backup = normalizedBackup(value);
  backupText(backup);
  return backup;
}

export function summarizeProgressBackup(value) {
  const backup = normalizedBackup(value);
  return { level: backup.calculator.level, collected: Object.entries(backup.decor.collected).filter(([id, checked]) => checked && ACTIVE_DECOR_IDS.has(id)).length,
    pendingDecorReviews: pendingLegacyDecor(backup.decor.collected).length,
    rareVisibilityOverrides: Object.values(backup.decor.rareVisibility || {}).filter(mode => mode !== "auto").length,
    pins: backup.map.pins.length, exportedAt: backup.exportedAt };
}

function restoreRaw(storage, key, value) {
  if (value === null) storage.removeItem(key);
  else storage.setItem(key, value);
}

/** Replace the guest save only after a readable live backup and exact raw recovery are persisted. */
export function applyProgressBackup(value, { current, getStorage = () => window.localStorage, now = () => Date.now() } = {}) {
  const backup = normalizedBackup(value);
  backupText(backup);
  let previous;
  try { previous = parseProgressBackup(createProgressBackup(current)); }
  catch { throw failure("Your current progress could not be backed up safely. No saved data was changed.", "current-backup-unavailable"); }
  let storage, raw, previousRecovery;
  try {
    storage = getStorage();
    if (!["getItem", "setItem", "removeItem"].every(method => typeof storage[method] === "function")) throw new Error();
    raw = Object.fromEntries(RAW_KEYS.map(key => {
      const saved = storage.getItem(key);
      if (saved !== null && typeof saved !== "string") throw new Error();
      return [key, saved];
    }));
    previousRecovery = storage.getItem(PROGRESS_RECOVERY_KEY);
    if (previousRecovery !== null && typeof previousRecovery !== "string") throw new Error();
  } catch { throw failure("Browser saves could not be read safely. No saved data was changed.", "storage-unavailable"); }
  const priorTime = Number(raw[UPDATED_KEY]);
  const importedAt = Math.max(now(), Number.isSafeInteger(priorTime) && priorTime >= 0 ? priorTime + 1 : 0);
  if (!Number.isSafeInteger(importedAt) || importedAt <= 0 || !Number.isFinite(new Date(importedAt).getTime())) {
    throw failure("The local save timestamp could not be advanced safely. No saved data was changed.", "invalid-save-time");
  }
  const createdAt = new Date(importedAt).toISOString();
  const recoveryText = JSON.stringify({ format: "pikapp-progress-recovery", version: 1, createdAt, backup: previous, raw });
  let recoveryWritten = false;
  try {
    storage.setItem(PROGRESS_RECOVERY_KEY, recoveryText);
    recoveryWritten = true;
    if (storage.getItem(PROGRESS_RECOVERY_KEY) !== recoveryText) throw new Error();
  } catch {
    let rollbackFailed = false;
    // A throwing localStorage.setItem is atomic; only undo a completed but unverifiable write.
    if (recoveryWritten) {
      try { restoreRaw(storage, PROGRESS_RECOVERY_KEY, previousRecovery); }
      catch { rollbackFailed = true; }
    }
    throw failure("A recovery copy could not be saved. Import was blocked and your progress was not changed.",
      "recovery-unavailable", { rollbackFailed, recoveryAvailable: previousRecovery !== null });
  }
  const replacement = {
    ...Object.fromEntries(CALCULATOR_FIELDS.map(field => [`pb_${field}`, String(backup.calculator[field])])),
    pb_decorCollected: JSON.stringify(backup.decor.collected), pb_showAllDecor: String(backup.decor.showAll),
    pb_rareVisibility: JSON.stringify(backup.decor.rareVisibility || {}),
    [MAP_STORAGE_KEY]: JSON.stringify(backup.map), [UPDATED_KEY]: String(importedAt),
  };
  const applied = [];
  try {
    for (const [key, saved] of Object.entries(replacement)) {
      storage.setItem(key, saved);
      applied.push(key);
    }
    if (Object.entries(replacement).some(([key, saved]) => storage.getItem(key) !== saved)) throw new Error();
  } catch {
    for (const key of applied.reverse()) {
      try { restoreRaw(storage, key, raw[key]); } catch { /* Try every key, then verify the entire original save. */ }
    }
    let rollbackFailed = true;
    try { rollbackFailed = RAW_KEYS.some(key => storage.getItem(key) !== raw[key]); } catch { /* Recovery is still retained. */ }
    throw failure(rollbackFailed
      ? "Import failed and the previous save could not be fully restored. Keep this tab open and download the recovery copy before making more changes."
      : "Import could not be saved. Your previous saved data was restored.",
    "import-failed", { rollbackFailed, recoveryAvailable: true });
  }
  return { ok: true, importedAt, recoveryAvailable: true };
}

export function readProgressRecovery({ getStorage = () => window.localStorage } = {}) {
  let text;
  try { text = getStorage().getItem(PROGRESS_RECOVERY_KEY); }
  catch { throw failure("The recovery copy could not be read in this browser.", "recovery-unreadable"); }
  if (text === null) return null;
  let recovery;
  try {
    recovery = JSON.parse(text);
    if (!exactKeys(recovery, ["format", "version", "createdAt", "backup", "raw"])
        || recovery.format !== "pikapp-progress-recovery" || recovery.version !== 1
        || !(exactKeys(recovery.raw, RAW_KEYS) || exactKeys(recovery.raw, LEGACY_RAW_KEYS))
        || Object.values(recovery.raw).some(value => value !== null && typeof value !== "string")) throw new Error();
    recovery.createdAt = isoDate(recovery.createdAt);
  } catch { throw failure("The recovery copy is unreadable. Its stored contents have not been changed.", "recovery-unreadable"); }
  let readable = null;
  try { readable = backupText(normalizedBackup(recovery.backup)); } catch { /* Exact raw originals can still be downloaded. */ }
  return { backupText: readable, rawText: JSON.stringify(recovery, null, 2), createdAt: recovery.createdAt };
}
