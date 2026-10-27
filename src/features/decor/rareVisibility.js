import { DECOR_LOCATIONS } from "./catalog.js";
import { decorId, decorStorageLocation, isRareCostume, isRareLocked } from "./collection.js";

export const RARE_VISIBILITY_MODES = ["auto", "show", "hide"];
export function rareVisibilityKey(group) {
  return decorId(decorStorageLocation(group), "rare", "visibility");
}
const categories = new Map(DECOR_LOCATIONS.filter(group => group.costumes.some(isRareCostume))
  .map(group => [rareVisibilityKey(group), group]));

// Resolve the complete category, even when search has removed its base rows.
export function rareCategory(group) {
  return categories.get(rareVisibilityKey(group));
}
export function rareVisibilityMode(group, preferences = {}) {
  return preferences[rareVisibilityKey(group)] || "auto";
}
export function validateRareVisibility(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)
      || Object.entries(value).some(([key, mode]) => !categories.has(key) || !RARE_VISIBILITY_MODES.includes(mode))) {
    throw new Error("Invalid rare decor visibility settings");
  }
  return Object.fromEntries(Object.entries(value));
}
export function isDecorCostumeVisible(group, costume, collected, preferences = {}, showAll = false) {
  if (!isRareCostume(costume)) return true;
  const mode = rareVisibilityMode(group, preferences);
  if (mode === "hide") return false;
  if (mode === "show" || showAll) return true;
  const source = rareCategory(group) || group;
  const hasRareProgress = source.costumes.filter(isRareCostume).some(row =>
    (row.designs || row.colors).some(variant => collected[decorId(decorStorageLocation(source), row.name, variant)] === true));
  return hasRareProgress || !isRareLocked(source, costume, collected);
}
