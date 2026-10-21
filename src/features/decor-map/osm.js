import osmtogeojson from "osmtogeojson";
import { CATEGORY_BY_ID, cleanCategoryIds, matchCategories } from "./categories.js";
import { boundsAreaKm2, MAX_SEARCH_AREA_KM2, validPoint } from "./coordinates.js";

export const MAX_PLACES = 400;
export const MAX_OSM_ELEMENTS = 500;
const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildOverpassQuery(categoryIds, bounds) {
  const categories = cleanCategoryIds(categoryIds).map(id => CATEGORY_BY_ID.get(id));
  if (!categories.length) throw new Error("Choose at least one decor category.");
  if (boundsAreaKm2(bounds) > MAX_SEARCH_AREA_KM2) throw new Error("Zoom in to search a smaller area.");
  const selectors = new Set();
  for (const category of categories) for (const rule of category.rules) {
    const filters = Object.entries(rule).map(([key, value]) => {
      const pattern = `(^|;)[[:space:]]*${escapeRegex(value)}[[:space:]]*(;|$)`;
      return `[${JSON.stringify(key)}~${JSON.stringify(pattern)},i]`;
    }).join("");
    selectors.add(`nwr${filters};`);
  }
  return `[out:json][timeout:20][bbox:${bounds.map(value => Number(value.toFixed(5))).join(",")}];\n(\n${[...selectors].sort().join("\n")}\n);\nout body geom ${MAX_OSM_ELEMENTS + 1};`;
}

export function validOsmId(id) {
  return typeof id === "string" && /^(node|way|relation)\/[1-9]\d{0,15}$/.test(id);
}

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x, y] = point, [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Use a point within the first polygon where possible. A boundary fallback is
// preferable to a concave polygon's bbox center falling outside its footprint.
export function geometryPosition(geometry) {
  if (!geometry) return null;
  let point;
  if (geometry.type === "Point") point = geometry.coordinates;
  else if (geometry.type === "LineString") point = geometry.coordinates[Math.floor(geometry.coordinates.length / 2)];
  else if (geometry.type === "MultiLineString") return geometryPosition({ type: "LineString", coordinates: geometry.coordinates[0] || [] });
  else if (["Polygon", "MultiPolygon"].includes(geometry.type)) {
    const rings = geometry.type === "Polygon" ? geometry.coordinates : geometry.coordinates[0];
    const outer = rings?.[0];
    if (!outer?.length) return null;
    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    for (const [lng, lat] of outer) {
      west = Math.min(west, lng); east = Math.max(east, lng);
      south = Math.min(south, lat); north = Math.max(north, lat);
    }
    const center = [(west + east) / 2, (south + north) / 2];
    point = pointInRing(center, outer) && !rings.slice(1).some(ring => pointInRing(center, ring)) ? center : outer[0];
  }
  return point && validPoint(point[1], point[0]) ? { lat: point[1], lng: point[0] } : null;
}

export function normalizeOsmResults(data, selectedIds) {
  if (!data || !Array.isArray(data.elements)) throw new Error("The map service returned an unreadable response. Try again.");
  if (data.remark) throw new Error("The map service could not finish this search. Zoom in or try the other data source.");
  const selected = new Set(cleanCategoryIds(selectedIds));
  const converted = osmtogeojson(data, { flatProperties: false });
  const unique = new Map();
  let incomplete = 0;
  for (const feature of converted.features) {
    const id = feature.id;
    if (!validOsmId(id) || unique.has(id)) continue;
    const categoryIds = matchCategories(feature.properties?.tags);
    if (!categoryIds.some(category => selected.has(category))) continue;
    if (feature.properties?.tainted) { incomplete++; continue; }
    const position = geometryPosition(feature.geometry);
    if (!position) continue;
    unique.set(id, { id, ...position, categoryIds, geometry: feature.geometry,
      name: typeof feature.properties?.tags?.name === "string" ? feature.properties.tags.name.slice(0, 200) : "Unnamed place",
      sourceUrl: `https://www.openstreetmap.org/${id}` });
  }
  const places = [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  return { places: places.slice(0, MAX_PLACES), incomplete,
    truncated: data.elements.length > MAX_OSM_ELEMENTS || places.length > MAX_PLACES,
    osmTimestamp: data.osm3s?.timestamp_osm_base || null };
}
