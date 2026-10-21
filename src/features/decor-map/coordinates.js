// A public example city, never a stored personal location. Returning visitors
// use their saved viewport; pasted map links can choose any supported area.
export const DEFAULT_VIEWPORT = { lat: 42.36, lng: -71.06, zoom: 14 };
export const MIN_SEARCH_ZOOM = 13;
export const MAX_SEARCH_AREA_KM2 = 200;

export function validPoint(lat, lng) {
  return typeof lat === "number" && typeof lng === "number"
    && Number.isFinite(lat) && Number.isFinite(lng)
    && Math.abs(lat) <= 85.0511 && Math.abs(lng) <= 180;
}

export function validViewport(value) {
  return !!value && validPoint(value.lat, value.lng)
    && Number.isInteger(value.zoom) && value.zoom >= 2 && value.zoom <= 19;
}

export function viewportFromParams(params) {
  const lat = params.get("mapLat") ?? params.get("lat");
  const lng = params.get("mapLng") ?? params.get("lng");
  const zoom = params.get("mapZoom") ?? params.get("zoom") ?? "16";
  if (lat === null || lng === null || !lat.trim() || !lng.trim() || !zoom.trim()) return null;
  const viewport = { lat: Number(lat), lng: Number(lng), zoom: Number(zoom) };
  return validViewport(viewport) ? viewport : null;
}

export function parseMapLocation(text) {
  const input = text.trim();
  if (/^https?:\/\//i.test(input)) {
    try { return viewportFromParams(new URL(input).searchParams); }
    catch { return null; }
  }
  const match = input.match(/^([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const viewport = { lat: Number(match[1]), lng: Number(match[2]), zoom: 16 };
  return validViewport(viewport) ? viewport : null;
}

export function boundsAreaKm2(bounds) {
  if (!Array.isArray(bounds) || bounds.length !== 4 || !bounds.every(Number.isFinite)) return Infinity;
  const [south, west, north, east] = bounds;
  if (!validPoint(south, west) || !validPoint(north, east) || north <= south || east <= west || east - west > 180) return Infinity;
  return (north - south) * 111.195 * (east - west) * 111.195 * Math.cos((north + south) / 2 * Math.PI / 180);
}

export function searchAreaProblem(bounds, zoom) {
  if (!bounds || zoom < MIN_SEARCH_ZOOM || boundsAreaKm2(bounds) > MAX_SEARCH_AREA_KM2) {
    return "Zoom in to search a smaller area.";
  }
  return "";
}

// Double the view's width/height for room to pan, while keeping the same
// area and coordinate limits as an ordinary search. Never trim the view.
export function bufferedSearchBounds(bounds) {
  const area = boundsAreaKm2(bounds);
  if (!Number.isFinite(area) || area > MAX_SEARCH_AREA_KM2) return null;
  const [south, west, north, east] = bounds;
  const lat = (south + north) / 2, lng = (west + east) / 2;
  const halfHeight = (north - south) / 2, halfWidth = (east - west) / 2;
  const factor = Math.max(1, Math.min(2, Math.sqrt(MAX_SEARCH_AREA_KM2 / area) * .9999,
    (85.0511 - Math.abs(lat)) / halfHeight, (180 - Math.abs(lng)) / halfWidth));
  const expanded = [lat - halfHeight * factor, lng - halfWidth * factor,
    lat + halfHeight * factor, lng + halfWidth * factor];
  return boundsAreaKm2(expanded) <= MAX_SEARCH_AREA_KM2 ? expanded : [...bounds];
}

export function boundsContain(outer, inner) {
  if (!Number.isFinite(boundsAreaKm2(outer)) || !Number.isFinite(boundsAreaKm2(inner))) return false;
  return inner[0] >= outer[0] - .00001 && inner[1] >= outer[1] - .00001
    && inner[2] <= outer[2] + .00001 && inner[3] <= outer[3] + .00001;
}

export function mapViewUrl(href, viewport) {
  const url = new URL(href);
  url.hash = "map";
  url.searchParams.set("mapLat", viewport.lat.toFixed(6));
  url.searchParams.set("mapLng", viewport.lng.toFixed(6));
  url.searchParams.set("mapZoom", String(viewport.zoom));
  return url.href;
}
