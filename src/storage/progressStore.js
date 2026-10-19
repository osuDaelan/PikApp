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

  function typeOf(field) {
    if (!Object.hasOwn(fields, field)) throw new Error(`Unknown progress field: ${field}`);
    return fields[field];
  }

  return {
    scope: accountId === null ? "guest" : "account",
    read(field, fallback) {
      const type = typeOf(field);
      try { return decode(getStorage().getItem(prefix + field), type, fallback); }
      catch { return fallback; }
    },
    write(field, value) {
      const type = typeOf(field);
      try {
        getStorage().setItem(prefix + field, type === "collection" ? JSON.stringify(value) : String(value));
        return true;
      } catch { return false; }
    },
  };
}

export const guestProgressStore = createProgressStore();
