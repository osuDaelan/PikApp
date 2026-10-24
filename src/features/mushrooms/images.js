import { MUSHROOM_TYPES } from "./data.js";

// These type icons are shared across sizes, just as in Pikipedia's type table.
export function mushroomImageUrl(typeId, baseUrl = "/") {
  if (!MUSHROOM_TYPES.some(type => type.id === typeId)) return null;
  return `${baseUrl}images/mushrooms/${typeId}.png`;
}
