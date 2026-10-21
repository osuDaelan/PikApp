// Providers are independent of rendering and category rules. Recheck each
// operator's current usage policy before increasing traffic or adding caching.
export const DEFAULT_SOURCE_ID = "overpass-fr";
export const DATA_SOURCES = [
  { id: "overpass-fr", label: "Overpass · France (worldwide)", url: "https://overpass.openstreetmap.fr/api/interpreter" },
  { id: "overpass-de", label: "Overpass · Germany (worldwide)", url: "https://overpass-api.de/api/interpreter" },
  { id: "overpass-coffee", label: "Overpass · Private Coffee (worldwide)", url: "https://overpass.private.coffee/api/interpreter" },
];
export const MAP_TILES = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
};
