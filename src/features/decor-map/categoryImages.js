import { CATEGORY_BY_ID } from "./categories.js";

// Local copies of the game's category symbols, shared by sidebar and map markers.
export function categoryImageUrl(categoryId, baseUrl = "/") {
  if (!CATEGORY_BY_ID.has(categoryId)) return null;
  return `${baseUrl}images/decor-categories/${categoryId}.png`;
}
