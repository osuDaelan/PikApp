export const SECTIONS = [
  { id: "decor", icon: "🎀", label: "Decor" },
  { id: "map", icon: "🗺️", label: "Map" },
  { id: "mushrooms", icon: "🍄", label: "Mushroom" },
  { id: "calculator", icon: "🧮", label: "Calculator" },
];
export function sectionFromHash(hash) {
  const id = hash.replace(/^#/, "");
  // Preserve shared links to the former Now/Overview calculator page.
  if (id === "now") return "calculator";
  return SECTIONS.some(section => section.id === id) ? id : "decor";
}

// Map coordinates belong only to Map links. Preserve other query parameters,
// the deployment path and existing hashes when cleaning an older shared link.
export function cleanSectionUrl(href) {
  const url = new URL(href);
  if (sectionFromHash(url.hash) !== "map") {
    for (const key of ["mapLat", "mapLng", "mapZoom", "lat", "lng", "zoom"]) {
      if (url.searchParams.has(key)) url.searchParams.delete(key);
    }
  }
  return url.href;
}

export function sectionUrl(href, sectionId) {
  const url = new URL(href);
  url.hash = sectionFromHash(`#${sectionId}`);
  return cleanSectionUrl(url.href);
}
