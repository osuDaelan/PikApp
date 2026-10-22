import { CALCULATOR_FIELDS, CALCULATOR_BACKUP_URL, validCalculatorBackup, validCalculatorSnapshot } from "./calculatorBackupData.js";

const UPDATED_KEY = "pb_localCalculatorUpdatedAt";
let savedSnapshot = null;
let restoreVerified = false;

export async function restoreLocalCalculatorBackup({ storage = window.localStorage, request = fetch } = {}) {
  restoreVerified = false;
  savedSnapshot = null;
  const response = await request(CALCULATOR_BACKUP_URL, { cache: "no-store", signal: AbortSignal.timeout(3000) });
  if (!response.ok) throw new Error("Local backup unavailable");
  const backup = await response.json();
  if (backup === null) { restoreVerified = true; return; }
  if (!validCalculatorBackup(backup)) throw new Error("Invalid local backup");
  const localTime = Number(storage.getItem(UPDATED_KEY)) || 0;
  if (backup.savedAt >= localTime) {
    const replacement = [...CALCULATOR_FIELDS.map(field => [`pb_${field}`, String(backup.calculator[field])]), [UPDATED_KEY, String(backup.savedAt)]];
    const original = new Map(replacement.map(([key]) => [key, storage.getItem(key)]));
    if ([...original.values()].some(value => value !== null && typeof value !== "string")
        || ([...original.values()].includes(null) && typeof storage.removeItem !== "function")) throw new Error("Local backup could not be restored safely");
    const applied = [];
    try {
      for (const [key, value] of replacement) { storage.setItem(key, value); applied.push(key); }
      if (replacement.some(([key, value]) => storage.getItem(key) !== value)) throw new Error("Restore verification failed");
    } catch {
      for (const key of applied.reverse()) {
        try {
          if (original.get(key) === null) storage.removeItem(key);
          else storage.setItem(key, original.get(key));
        } catch { /* Restore every other field before checking the complete original save. */ }
      }
      let rollbackFailed = true;
      try { rollbackFailed = [...original].some(([key, value]) => storage.getItem(key) !== value); } catch { /* Preserve the file. */ }
      throw Object.assign(new Error(rollbackFailed
        ? "Local backup restoration failed and browser values could not be fully restored. The backup file is unchanged; restore browser storage and reload."
        : "Local backup restoration failed. Previous browser values were restored and the backup file is unchanged."), { rollbackFailed });
    }
    savedSnapshot = JSON.stringify(backup.calculator);
  }
  restoreVerified = true;
}

export function isCalculatorBackedUp(snapshot) {
  return savedSnapshot === JSON.stringify(snapshot);
}

export function assertLocalCalculatorRestoreVerified() {
  if (!restoreVerified) throw Object.assign(new Error("Local backup was not restored safely. Restore the backup service and reload before saving to the file."), { code: "RESTORE_UNVERIFIED" });
}

export function markCalculatorChanged(savedAt, { storage = window.localStorage } = {}) {
  const previous = Number(storage.getItem(UPDATED_KEY));
  const effectiveTime = Math.max(savedAt, Number.isSafeInteger(previous) && previous >= 0 ? previous + 1 : 0);
  if (!Number.isSafeInteger(effectiveTime) || effectiveTime <= 0) throw new Error("Invalid local save timestamp");
  storage.setItem(UPDATED_KEY, String(effectiveTime));
  return effectiveTime;
}

export async function saveLocalCalculatorBackup(calculator, savedAt, { keepalive = false } = {}) {
  if (!validCalculatorSnapshot(calculator)) throw new Error("Invalid calculator data");
  assertLocalCalculatorRestoreVerified();
  const response = await fetch(CALCULATOR_BACKUP_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version: 1, savedAt, calculator }), keepalive,
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error("Local backup unavailable");
  savedSnapshot = JSON.stringify(calculator);
}
