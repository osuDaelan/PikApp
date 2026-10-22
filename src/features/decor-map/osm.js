import osmtogeojson from "osmtogeojson";
import { CATEGORY_BY_ID, cleanCategoryIds, matchCategories } from "./categories.js";
import { boundsAreaKm2, MAX_SEARCH_AREA_KM2, validPoint } from "./coordinates.js";
import { validOsmId } from "./osmId.js";
export { validOsmId } from "./osmId.js";

export const MAX_PLACES = 400;
export const MAX_OSM_ELEMENTS = 500;
export const OSM_TYPE_LIMITS = { node: 300, way: 125, relation: 75 };
export const RESERVED_SHAPES = 100;
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
  const outputs = Object.entries(OSM_TYPE_LIMITS).map(([type, limit]) => `${type}.matches;\nout body geom ${limit + 1};`).join("\n");
  return `[out:json][timeout:20][bbox:${bounds.map(value => Number(value.toFixed(5))).join(",")}];\n(\n${[...selectors].sort().join("\n")}\n)->.matches;\n${outputs}`;
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
  const polygons = places.filter(place => ["Polygon", "MultiPolygon"].includes(place.geometry.type));
  const lines = places.filter(place => ["LineString", "MultiLineString"].includes(place.geometry.type));
  const shapes = [...polygons, ...lines];
  // Keep room for multipolygons as well as ways; unused shares are borrowed.
  const reserved = ["relation/", "way/"].flatMap(prefix => shapes.filter(place => place.id.startsWith(prefix)).slice(0, RESERVED_SHAPES / 2));
  const initialIds = new Set(reserved.map(place => place.id));
  reserved.push(...shapes.filter(place => !initialIds.has(place.id)).slice(0, RESERVED_SHAPES - reserved.length));
  const reservedIds = new Set(reserved.map(place => place.id));
  const displayed = [...reserved, ...places.filter(place => !reservedIds.has(place.id)).slice(0, MAX_PLACES - reserved.length)]
    .sort((a, b) => a.name.localeCompare(b.name));
  const typeCounts = data.elements.reduce((counts, element) => { counts[element.type] = (counts[element.type] || 0) + 1; return counts; }, {});
  return { places: displayed, incomplete,
    truncated: Object.entries(OSM_TYPE_LIMITS).some(([type, limit]) => typeCounts[type] > limit)
      || data.elements.length > MAX_OSM_ELEMENTS || places.length > MAX_PLACES,
    osmTimestamp: data.osm3s?.timestamp_osm_base || null };
}
