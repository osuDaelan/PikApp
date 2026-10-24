import { MUSHROOM_TYPES, NECTAR_COLORS, SIZES } from "./data.js";
import { availableSizes, mushroomReward, addMushroomChoice } from "./calculations.js";

function searchText(value) {
  return value.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]+/g, " ").trim();
}

// A stable reference in type/size order. Selection and nectar preferences never filter it.
export const MUSHROOM_REFERENCE_ROWS = Object.freeze(MUSHROOM_TYPES.flatMap(type => availableSizes(type.id).map(size => {
  const label = `${SIZES.find(value => value.id === size).label} ${type.label}`;
  const color = NECTAR_COLORS.find(value => value.id === type.color);
  return Object.freeze({ key: `${type.id}/${size}`, type, size, label, color,
    search: searchText(`${label} ${type.kind} ${type.id.replaceAll("-", "")}`),
    rewards: Object.freeze([1, 2, 3, 4].map(stars => mushroomReward(type.id, size, stars))) });
})));

export function filterMushrooms(query) {
  const groups = String(query ?? "").slice(0, 160).split(",").map(searchText).filter(Boolean);
  if (!groups.length) return MUSHROOM_REFERENCE_ROWS;
  return MUSHROOM_REFERENCE_ROWS.filter(row => groups.some(group => group.split(/\s+/).every(term => row.search.includes(term))));
}

export function toggleMushroomSelection(choices, typeId, size, stars = 4) {
  if (!MUSHROOM_REFERENCE_ROWS.some(row => row.type.id === typeId && row.size === size)) throw new Error("Choose a supported mushroom and size.");
  if (choices.some(choice => choice.typeId === typeId && choice.size === size)) {
    return choices.filter(choice => choice.typeId !== typeId || choice.size !== size);
  }
  return addMushroomChoice(choices, { typeId, size, stars, label: "" });
}
