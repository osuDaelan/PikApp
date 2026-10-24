// Map colors and geometry styling are independent of the category image assets.
export function placeCategory(place, selectedIds) {
  const matches = place.categoryIds.filter(id => selectedIds.includes(id));
  return ["waterside", "park", "forest"].find(id => matches.includes(id)) || matches[0] || place.categoryIds[0];
}

export function markerColors(categoryId, saved = false) {
  if (saved) return { accent: "#966016", tint: "#fff0c6" };
  if (categoryId === "waterside") return { accent: "#227aa8", tint: "#dcefff" };
  if (["park", "forest"].includes(categoryId)) return { accent: "#397d41", tint: "#e0f1d8" };
  return { accent: "#52647a", tint: "#edf1f7" };
}

export function featureStyle(place, selectedIds, selected = false) {
  const categoryId = placeCategory(place, selectedIds);
  const colors = markerColors(categoryId);
  const polygon = ["Polygon", "MultiPolygon"].includes(place.geometry.type);
  return { color: colors.accent, fillColor: categoryId === "waterside" ? "#60b5ed" : ["park", "forest"].includes(categoryId) ? "#519f46" : "#a3b4c8",
    weight: selected ? 4 : 2, opacity: selected ? 1 : .85, fill: polygon,
    fillOpacity: selected ? .43 : .28, fillRule: "evenodd", lineCap: "round", lineJoin: "round" };
}
