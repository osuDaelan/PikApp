import { DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES } from "./catalog.js";
import { decorId, decorStorageLocation } from "./collection.js";

export function decorSetId(location, costume) {
  return decorId(location, costume, "set");
}

export const DECOR_SETS = [...DECOR_LOCATIONS, ...DECOR_SPECIAL_CATEGORIES].flatMap(group =>
  group.costumes.map(costume => ({
    id: decorSetId(decorStorageLocation(group), costume.name),
    label: `${group.location} · ${costume.name}`,
    ids: (costume.designs || costume.colors).map(variant => decorId(decorStorageLocation(group), costume.name, variant)),
  })));

// Compare transitions, not totals: reveals, reloads, and removals aren't completions.
export function newlyCompletedSets(previous, next) {
  return DECOR_SETS.filter(set => set.ids.length > 0
    && set.ids.every(id => !!next[id])
    && !set.ids.every(id => !!previous[id]));
}
