import { cleanCategoryIds, DEFAULT_CATEGORY_IDS } from "./categories.js";
import { DEFAULT_VIEWPORT, validPoint, validViewport } from "./coordinates.js";
import { validOsmId } from "./osmId.js";
import { DATA_SOURCES, DEFAULT_SOURCE_ID } from "./providers.js";

export const MAP_STORAGE_KEY = "pb_decorMap_v1";
export const MAX_PINS = 1000;
export const MAX_PIN_NAME_LENGTH = 120;
// Enough for a valid export at all per-pin limits, including multibyte notes.
export const MAX_IMPORT_BYTES = 16 * 1024 * 1024;
export const defaultMapState = () => ({ version: 1, viewport: { ...DEFAULT_VIEWPORT },
  categoryIds: [...DEFAULT_CATEGORY_IDS], sourceId: DEFAULT_SOURCE_ID, pins: [] });

function normalizePin(pin) {
  if (!pin || typeof pin.id !== "string" || !/^[\w-]{1,100}$/.test(pin.id)
      || typeof pin.name !== "string" || !pin.name.trim() || pin.name.length > MAX_PIN_NAME_LENGTH
      || typeof pin.notes !== "string" || pin.notes.length > 2000
      || !validPoint(pin.lat, pin.lng)
      || !Array.isArray(pin.categoryIds) || pin.categoryIds.some(id => !cleanCategoryIds([id]).length)
      || (pin.osmId != null && !validOsmId(pin.osmId))
      || !Number.isFinite(Date.parse(pin.createdAt)) || !Number.isFinite(Date.parse(pin.updatedAt))) {
    throw new Error("A pin has invalid fields. No pins were imported.");
  }
  return { id: pin.id, name: pin.name.trim(), notes: pin.notes, lat: pin.lat, lng: pin.lng,
    categoryIds: cleanCategoryIds(pin.categoryIds), osmId: pin.osmId || null,
    createdAt: new Date(pin.createdAt).toISOString(), updatedAt: new Date(pin.updatedAt).toISOString() };
}

export function normalizePins(pins) {
  if (!Array.isArray(pins) || pins.length > MAX_PINS) throw new Error(`A backup must contain at most ${MAX_PINS} pins.`);
  const result = pins.map(normalizePin);
  if (new Set(result.map(pin => pin.id)).size !== result.length) throw new Error("The backup contains duplicate pin IDs. No pins were imported.");
  return result;
}

export function normalizeMapState(value) {
  if (!value || value.version !== 1) throw new Error("This map save version is not supported.");
  return { version: 1, viewport: validViewport(value.viewport) ? value.viewport : { ...DEFAULT_VIEWPORT },
    categoryIds: Array.isArray(value.categoryIds) ? cleanCategoryIds(value.categoryIds) : [...DEFAULT_CATEGORY_IDS],
    sourceId: DATA_SOURCES.some(source => source.id === value.sourceId) ? value.sourceId : DEFAULT_SOURCE_ID,
    pins: normalizePins(value.pins) };
}

export function createMapStore({ getStorage = () => window.localStorage } = {}) {
  let blocked = false;
  return {
    getTransferState(state) {
      if (blocked) throw new Error("Your saved map data could not be read. Reopen the map or reload PikApp to retry before transferring progress. If it stays unreadable, use the map’s recovery controls.");
      return state;
    },
    read() {
      let raw = null;
      try {
        raw = getStorage().getItem(MAP_STORAGE_KEY);
        return { state: raw === null ? defaultMapState() : normalizeMapState(JSON.parse(raw)), error: "", raw: null };
      } catch {
        blocked = true;
        return { state: defaultMapState(), error: "Saved map data could not be read. Download a recovery copy before replacing it with an import.", raw };
      }
    },
    write(state, { replaceUnreadable = false } = {}) {
      if (blocked && !replaceUnreadable) return { ok: false, error: "Existing map data is protected. Download its recovery copy, then import a valid backup to replace it." };
      try {
        getStorage().setItem(MAP_STORAGE_KEY, JSON.stringify(normalizeMapState(state)));
        blocked = false;
        return { ok: true, error: "" };
      } catch { return { ok: false, error: "Map changes could not be saved in this browser. Export your pins before leaving." }; }
    },
  };
}

export function parsePinBackup(text) {
  if (typeof text !== "string" || new Blob([text]).size > MAX_IMPORT_BYTES) throw new Error("Choose a JSON pin backup smaller than 16 MB.");
  let value;
  try { value = JSON.parse(text); } catch { throw new Error("This file is not valid JSON. Your saved pins are unchanged."); }
  if (!value || value.version !== 1) throw new Error("This pin backup version is not supported.");
  return normalizePins(value.pins);
}

export function mergePins(current, imported) {
  const merged = new Map(current.map(pin => [pin.id, pin]));
  for (const pin of imported) {
    const previous = merged.get(pin.id);
    if (!previous || Date.parse(pin.updatedAt) > Date.parse(previous.updatedAt)) merged.set(pin.id, pin);
  }
  return normalizePins([...merged.values()]);
}

export function pinBackup(pins) {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), pins: normalizePins(pins) }, null, 2);
}
