// All map-only artwork and colors live here, independently of collection assets.
// Fixed SVG fragments are our own simple line drawings; no external names become HTML.
const glyphs = {
  dining: '<path d="M5 3v7m3-7v7M5 7h3m-1.5 3v11M18 3c-4 4-4 8 0 8V3Zm0 8v10"/>',
  cup: '<path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Zm12 1h2a3 3 0 0 1 0 6h-2M7 3v2m5-2v2"/>',
  candy: '<path d="m7 7 10 10M9 5l10 10M5 9l10 10M5 5l4 0-4 4Zm14 14h-4l4-4Z"/><rect x="7" y="7" width="10" height="10" rx="3"/>',
  film: '<path d="M3 8h18v12H3Zm0 0V4h18v4M8 4l-3 4m9-4-3 4m9-4-3 4"/>',
  cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z"/>',
  paw: '<ellipse cx="12" cy="16" rx="6" ry="4"/><circle cx="5" cy="9" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="16" cy="6" r="2"/><circle cx="20" cy="11" r="2"/>',
  tree: '<path d="m9 3-6 8h3l-4 6h14l-4-6h3Zm0 14v4m8-16 5 8h-3l3 5h-5"/>',
  water: '<path d="M3 7c3-4 6 4 9 0s6 4 9 0M3 12c3-4 6 4 9 0s6 4 9 0M3 17c3-4 6 4 9 0s6 4 9 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/>',
  art: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m4 18 5-6 4 4 3-3 5 5"/>',
  plane: '<path d="m12 3 2 7 7 4v2l-7-2v5l3 2H7l3-2v-5l-7 2v-2l7-4Z"/>',
  train: '<rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 11h14M12 3v8m-5 8-2 3m12-3 2 3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>',
  beach: '<path d="M3 12a9 9 0 0 1 18 0Zm9 0v7m-3 2h6M12 3c-3 3-3 6-3 9m3-9c3 3 3 6 3 9"/>',
  burger: '<path d="M4 9a8 6 0 0 1 16 0ZM3 13h18M4 17h16v3H4Z"/>',
  shop: '<path d="M4 10v11h16V10M3 4h18l-1 6H4Zm6 17v-6h6v6M8 4l-1 6m9-6 1 6"/>',
  basket: '<path d="M3 9h18l-3 12H6Zm4 0 5-7 5 7M9 13v4m6-4v4"/>',
  bread: '<path d="M6 19V9a4 4 0 0 1 6-4 4 4 0 0 1 6 4v10ZM9 10v3m6-3v3"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8 8 13 12M8 16 21 3"/>',
  shirt: '<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4a4 4 0 0 1-8 0Z"/>',
  leaf: '<path d="M20 3C9 2 3 7 5 14c2 7 15 5 15-11ZM4 21l11-12"/>',
  book: '<path d="M12 5c-3-3-6-3-9-2v16c3-1 6-1 9 2 3-3 6-3 9-2V3c-3-1-6-1-9 2Zm0 0v16"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0Zm6 10h6M5 3l14 4M6 7h14"/>',
  mountain: '<path d="m2 21 10-18 10 18Zm6-11 4 3 4-3"/>',
  stadium: '<ellipse cx="12" cy="8" rx="9" ry="5"/><path d="M3 8v8c0 7 18 7 18 0V8m-14 5v6m10-6v6"/>',
  wheel: '<circle cx="12" cy="10" r="8"/><path d="M12 2v16M4 10h16M6 4l12 12M6 16 18 4M12 10 7 22m5-12 5 12M5 22h14"/>',
  bus: '<rect x="4" y="3" width="16" height="17" rx="3"/><path d="M4 11h16M8 20v2m8-2v2"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>',
  bridge: '<path d="M2 15h20M5 5v16m14-16v16M5 6c4 8 10 8 14 0M9 11v4m6-4v4"/>',
  bed: '<path d="M3 4v18m0-7h18v7M3 9h18v6M8 9v6m-5 4h18"/>',
  brush: '<path d="m14 3 7 7-9 9-7-7ZM5 12c-4 1-3 7-3 9 3-1 8 0 10-2"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v5m-5 0h10"/>',
  hammer: '<path d="m3 6 5-4 7 7-4 4Zm8 7 8 9 3-3-9-8"/>',
  cap: '<path d="m2 8 10-5 10 5-10 5Zm4 3v6c4 4 8 4 12 0v-6m4-3v9"/>',
  laundry: '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="5"/><path d="M4 7h16m-3-3h-3M7 14c3-3 7 3 10 0"/>',
  pen: '<path d="m4 16 12-12 4 4L8 20l-5 1Zm10-10 4 4M4 16l4 4"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
};
const glyphByCategory = {
  restaurant: "dining", cafe: "cup", sweetshop: "candy", cinema: "film", pharmacy: "cross", zoo: "paw",
  forest: "tree", waterside: "water", "post-office": "mail", "art-gallery": "art", airport: "plane",
  station: "train", beach: "beach", burger: "burger", convenience: "shop", supermarket: "basket",
  bakery: "bread", "hair-salon": "scissors", clothes: "shirt", park: "leaf", library: "book", sushi: "bowl",
  mountain: "mountain", stadium: "stadium", "theme-park": "wheel", "bus-stop": "bus", italian: "dining",
  ramen: "bowl", bridge: "bridge", hotel: "bed", makeup: "brush", appliances: "monitor", curry: "bowl",
  diy: "hammer", university: "cap", mexican: "dining", laundry: "laundry", korean: "bowl", stationery: "pen",
};

export function markerGlyph(categoryId) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[glyphByCategory[categoryId]] || glyphs.pin}</svg>`;
}

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
