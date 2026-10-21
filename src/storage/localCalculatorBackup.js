import { CALCULATOR_FIELDS, CALCULATOR_BACKUP_URL, validCalculatorBackup, validCalculatorSnapshot } from "./calculatorBackupData.js";

const UPDATED_KEY = "pb_localCalculatorUpdatedAt";
let savedSnapshot = null;

export async function restoreLocalCalculatorBackup({ storage = window.localStorage, request = fetch } = {}) {
  const response = await request(CALCULATOR_BACKUP_URL, { cache: "no-store", signal: AbortSignal.timeout(3000) });
  if (!response.ok) throw new Error("Local backup unavailable");
  const backup = await response.json();
  if (backup === null) return;
  if (!validCalculatorBackup(backup)) throw new Error("Invalid local backup");
  const localTime = Number(storage.getItem(UPDATED_KEY)) || 0;
  if (backup.savedAt >= localTime) {
    for (const field of CALCULATOR_FIELDS) storage.setItem(`pb_${field}`, String(backup.calculator[field]));
    storage.setItem(UPDATED_KEY, String(backup.savedAt));
    savedSnapshot = JSON.stringify(backup.calculator);
  }
}

export function isCalculatorBackedUp(snapshot) {
  return savedSnapshot === JSON.stringify(snapshot);
}

export function markCalculatorChanged(savedAt) {
  window.localStorage.setItem(UPDATED_KEY, String(savedAt));
}

export async function saveLocalCalculatorBackup(calculator, savedAt, { keepalive = false } = {}) {
  if (!validCalculatorSnapshot(calculator)) throw new Error("Invalid calculator data");
  const response = await fetch(CALCULATOR_BACKUP_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version: 1, savedAt, calculator }), keepalive,
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error("Local backup unavailable");
  savedSnapshot = JSON.stringify(calculator);
}
