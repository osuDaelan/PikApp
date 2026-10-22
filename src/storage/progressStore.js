// Guest keys deliberately match the original app. Do not rename without a migration.
const fields = {
  level: "number",
  stepsInput: "number",
  flowersInput: "number",
  dSteps: "number",
  dFlowers: "number",
  coinsNow: "number",
  decorCollected: "collection",
  showAllDecor: "boolean",
  totalStepsMode: "boolean",
};

function decode(raw, type, fallback) {
  if (raw === null) return fallback;
  if (type === "number") {
    const number = parseInt(raw, 10);
    return Number.isFinite(number) ? number : fallback;
  }
  if (type === "boolean") return raw === "true";
  const value = JSON.parse(raw);
  // A malformed collection should not prevent the app from opening.
  return value && typeof value === "object" && !Array.isArray(value)
    && Object.values(value).every(item => typeof item === "boolean")
    ? value : fallback;
}

/**
 * Synchronous local cache for progress. UI code uses read/write, never localStorage.
 * The guest scope keeps existing saves. Account scopes are isolated local caches;
 * authentication and remote sync will be added behind this boundary separately.
 */
export function createProgressStore({
  getStorage = () => window.localStorage,
  accountId = null,
} = {}) {
  const prefix = accountId === null ? "pb_" : `pb_account:${encodeURIComponent(accountId)}:`;
  const failedWrites = new Map();
  const saveListeners = new Set();
  let saveStatus = Object.freeze({ status: "idle", savedAt: null, failedFields: Object.freeze([]) });

  function typeOf(field) {
    if (!Object.hasOwn(fields, field)) throw new Error(`Unknown progress field: ${field}`);
    return fields[field];
  }

  function publishSaveStatus(savedAt = saveStatus.savedAt) {
    const failedFields = [...failedWrites.keys()].sort();
    const status = failedFields.length ? "error" : savedAt === null ? "idle" : "saved";
    if (status === saveStatus.status && savedAt === saveStatus.savedAt
        && failedFields.length === saveStatus.failedFields.length
        && failedFields.every((field, index) => field === saveStatus.failedFields[index])) return;
    saveStatus = Object.freeze({ status, savedAt, failedFields: Object.freeze(failedFields) });
    for (const listener of [...saveListeners]) {
      try { listener(); } catch { /* A status subscriber cannot change a write result. */ }
    }
  }

  function writeSerialized(field, serialized) {
    try { getStorage().setItem(prefix + field, serialized); }
    catch {
      failedWrites.set(field, { serialized });
      publishSaveStatus();
      return false;
    }
    failedWrites.delete(field);
    publishSaveStatus(Date.now());
    return true;
  }

  function write(field, value) {
    const type = typeOf(field);
    let serialized;
    try { serialized = type === "collection" ? JSON.stringify(value) : String(value); }
    catch {
      // Serialization failures also remain retryable without changing saved data.
      failedWrites.set(field, { value });
      publishSaveStatus();
      return false;
    }
    // Keep a snapshot of the attempted value, rather than a mutable collection object.
    return writeSerialized(field, serialized);
  }

  return {
    scope: accountId === null ? "guest" : "account",
    read(field, fallback) {
      const type = typeOf(field);
      try { return decode(getStorage().getItem(prefix + field), type, fallback); }
      catch { return fallback; }
    },
    write,
    getSaveStatus: () => saveStatus,
    subscribeSaveStatus(listener) {
      saveListeners.add(listener);
      return () => saveListeners.delete(listener);
    },
    retryFailedWrites() {
      for (const field of [...failedWrites.keys()]) {
        const pending = failedWrites.get(field);
        if (!pending) continue;
        if (Object.hasOwn(pending, "serialized")) writeSerialized(field, pending.serialized);
        else write(field, pending.value);
      }
      return failedWrites.size === 0;
    },
  };
}

export const guestProgressStore = createProgressStore();
