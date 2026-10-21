import test from "node:test";
import assert from "node:assert/strict";
import { MAP_CATEGORIES, matchCategories } from "../src/features/decor-map/categories.js";
import { buildOverpassQuery, normalizeOsmResults, geometryPosition } from "../src/features/decor-map/osm.js";
import { parseMapLocation, mapViewUrl, searchAreaProblem } from "../src/features/decor-map/coordinates.js";
import { createPlaceClient } from "../src/features/decor-map/placeClient.js";
import { createMapStore, defaultMapState, MAP_STORAGE_KEY, parsePinBackup, pinBackup, mergePins } from "../src/features/decor-map/mapStorage.js";
import { sectionFromHash } from "../src/shared/sections.js";

const bounds = [42.355, -71.065, 42.365, -71.055];
const node = { type: "node", id: 11, lat: 42.36, lon: -71.06, tags: { amenity: "restaurant", cuisine: "italian;pizza", name: '<img src=x onerror="alert(1)">' } };
const polygon = points => points.map(([lat, lon]) => ({ lat, lon }));
const outer = polygon([[42.35, -71.07], [42.37, -71.07], [42.37, -71.05], [42.35, -71.05], [42.35, -71.07]]);
const inner = polygon([[42.355, -71.065], [42.365, -71.065], [42.365, -71.055], [42.355, -71.055], [42.355, -71.065]]);
const relation = { type: "relation", id: 900, tags: { type: "multipolygon", leisure: "park", name: "Park with a courtyard" }, members: [
  { type: "way", ref: 901, role: "outer", geometry: outer }, { type: "way", ref: 902, role: "inner", geometry: inner },
] };
const response = data => ({ ok: true, headers: new Headers(), json: async () => structuredClone(data) });
const savedPin = (changes = {}) => ({ id: "test-pin", name: "My place", notes: "A reminder", lat: 42.36, lng: -71.06,
  categoryIds: ["restaurant"], osmId: "node/11", createdAt: "2026-10-21T12:00:00.000Z", updatedAt: "2026-10-21T12:00:00.000Z", ...changes });

test("map rules connect to existing checklist groups, with unique semicolon-aware matches", () => {
  assert.equal(MAP_CATEGORIES.length, 39);
  assert.equal(new Set(MAP_CATEGORIES.map(category => category.id)).size, 39);
  assert(MAP_CATEGORIES.every(category => category.group.location === category.label));
  assert.deepEqual(matchCategories({ amenity: "restaurant", cuisine: "ITALIAN; pizza" }), ["restaurant", "italian"]);
  assert.deepEqual(matchCategories({ cuisine: "tex-mex" }), ["mexican"]);
  assert.deepEqual(matchCategories({ amenity: "toy_library" }), []);
  assert.deepEqual(matchCategories({ amenity: "fast_food" }), []);
});

test("Overpass queries bound the area, use token boundaries, and ignore unknown category input", () => {
  const query = buildOverpassQuery(["italian", "restaurant", "italian", 'bad"];out;'], bounds);
  assert(query.includes('[bbox:42.355,-71.065,42.365,-71.055]'));
  assert(query.includes('(^|;)[[:space:]]*restaurant[[:space:]]*(;|$)'));
  assert(!query.includes("(^|;)?"));
  assert.equal((query.match(/\*italian\[/g) || []).length, 1);
  assert(query.endsWith("out body geom 501;"));
  assert(!query.includes('bad'));
  assert.throws(() => buildOverpassQuery([], bounds), /Choose/);
  assert.throws(() => buildOverpassQuery(["park"], [-80, -170, 80, 170]), /Zoom in/);
  assert.throws(() => buildOverpassQuery(["park"], [42, NaN, 43, 0]), /Zoom in/);
});

test("OSM normalization preserves relation identity, polygon holes, and distinct object types", () => {
  const data = { elements: [node, structuredClone(node), relation,
    { type: "way", id: 11, tags: { bridge: "yes" }, geometry: polygon([[42.36, -71.06], [42.361, -71.061]]) }] };
  const result = normalizeOsmResults(data, ["restaurant", "park", "bridge"]);
  assert.equal(result.places.length, 3);
  const park = result.places.find(place => place.id === "relation/900");
  assert(park, "relation must retain its own OSM identity");
  assert.equal(park.sourceUrl, "https://www.openstreetmap.org/relation/900");
  assert.equal(park.geometry.type, "Polygon");
  assert.equal(park.geometry.coordinates.length, 2, "courtyard remains a hole");
  assert(result.places.some(place => place.id === "way/11"));
  assert.deepEqual(result.places.find(place => place.id === "node/11").categoryIds, ["restaurant", "italian"]);
  assert.equal(result.places.find(place => place.id === "node/11").name, node.tags.name, "external names stay plain data for React text rendering");
});

test("geometry positions avoid a polygon hole and incomplete/failed OSM searches are explicit", () => {
  const position = geometryPosition({ type: "Polygon", coordinates: [outer, inner].map(ring => ring.map(point => [point.lon, point.lat])) });
  assert.notDeepEqual(position, { lat: 42.36, lng: -71.06 });
  assert.throws(() => normalizeOsmResults({ elements: [], remark: "runtime timeout" }, ["park"]), /could not finish/);
  assert.throws(() => normalizeOsmResults({}, ["park"]), /unreadable/);
  const partial = normalizeOsmResults({ elements: [{ type: "way", id: 1, nodes: [1, 2, 3], tags: { leisure: "park" }, geometry: [outer[0], null, outer[2]] }] }, ["park"]);
  assert.equal(partial.places.length, 0);
});

test("map coordinates and URL navigation validate inputs and preserve the deployment path", () => {
  assert.deepEqual(parseMapLocation("42.36, -71.06"), { lat: 42.36, lng: -71.06, zoom: 16 });
  assert.deepEqual(parseMapLocation("https://example.com/?lat=42.36&lng=-71.06&zoom=18"), { lat: 42.36, lng: -71.06, zoom: 18 });
  for (const input of ["90, 0", "0, 999", "Infinity, 2", "https://example.com/?lat=&lng=3", "https://example.com/?lat=42&lng=-71&zoom=99", "Boston"]) assert.equal(parseMapLocation(input), null);
  const url = new URL(mapViewUrl("https://example.github.io/PikApp/#decor", { lat: 42.36, lng: -71.06, zoom: 16 }));
  assert.equal(url.pathname, "/PikApp/");
  assert.equal(url.hash, "#map");
  assert.equal(sectionFromHash("#map"), "map");
  assert.equal(sectionFromHash("#unknown"), "now");
  assert.equal(searchAreaProblem(bounds, 16), "");
  assert.match(searchAreaProblem(bounds, 10), /Zoom in/);
});

test("place client caches equivalent searches and limits repeated public requests", async () => {
  let time = 0, requests = 0;
  const client = createPlaceClient({ now: () => time, fetcher: async (url, options) => {
    requests++;
    assert.equal(options.method, "POST");
    assert(new URLSearchParams(options.body).get("data").includes("nwr"));
    return response({ elements: [node] });
  } });
  const query = { categoryIds: ["restaurant", "italian"], bounds, sourceId: "overpass-de" };
  assert.equal((await client.search(query)).places.length, 1);
  assert.equal((await client.search({ ...query, categoryIds: ["italian", "restaurant"] })).cached, true);
  assert.equal(requests, 1);
  await assert.rejects(client.search({ ...query, sourceId: "overpass-coffee" }), /wait a few/);
  time = 6000;
  await client.search({ ...query, sourceId: "overpass-coffee" });
  assert.equal(requests, 2);
});

test("place client handles busy servers, cancellation and a client-side deadline", async () => {
  const query = { categoryIds: ["restaurant"], bounds, sourceId: "overpass-de" };
  const busy = createPlaceClient({ fetcher: async () => ({ ok: false, status: 429 }) });
  await assert.rejects(busy.search(query), /busy/);
  const hanging = (url, options) => new Promise((resolve, reject) => options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }));
  const timed = createPlaceClient({ fetcher: hanging, timeoutMs: 10 });
  await assert.rejects(timed.search(query), /timed out/);
  const cancelled = createPlaceClient({ fetcher: hanging });
  const controller = new AbortController();
  const pending = cancelled.search({ ...query, signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});

test("map storage round-trips pins separately from existing calculator and collection keys", () => {
  const values = new Map([["pb_level", "104"], ["pb_decorCollected", '{"legacy-id":true}']]);
  const getStorage = () => ({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) });
  const state = { ...defaultMapState(), pins: [savedPin()] };
  assert.equal(createMapStore({ getStorage }).write(state).ok, true);
  assert.deepEqual(createMapStore({ getStorage }).read().state, state);
  assert.equal(values.get("pb_level"), "104");
  assert.equal(values.get("pb_decorCollected"), '{"legacy-id":true}');
  assert(values.has(MAP_STORAGE_KEY));
});

test("unreadable or future map saves are preserved until an explicit replacement", () => {
  for (const raw of ['{broken', '{"version":99,"pins":[]}']) {
    let stored = raw;
    const store = createMapStore({ getStorage: () => ({ getItem: () => stored, setItem: (key, value) => { stored = value; } }) });
    assert.equal(store.read().raw, raw);
    assert.equal(store.write(defaultMapState()).ok, false);
    assert.equal(stored, raw);
    assert.equal(store.write(defaultMapState(), { replaceUnreadable: true }).ok, true);
  }
  const blocked = createMapStore({ getStorage: () => { throw new Error("denied"); } });
  assert(blocked.read().error);
  assert.equal(blocked.write(defaultMapState(), { replaceUnreadable: true }).ok, false);
});

test("pin import is validated completely, merges newer edits and rejects unsafe source references", () => {
  const original = savedPin();
  assert.deepEqual(parsePinBackup(pinBackup([original])), [original]);
  const newer = savedPin({ notes: "Newer edit", updatedAt: "2026-10-21T13:00:00.000Z" });
  assert.deepEqual(mergePins([original], [newer]), [newer]);
  assert.deepEqual(mergePins([newer], [original]), [newer]);
  for (const changes of [{ lat: 91 }, { osmId: 'javascript:alert(1)' }, { categoryIds: ["not-a-category"] }, { name: "" }, { updatedAt: "bad" }]) {
    assert.throws(() => parsePinBackup(JSON.stringify({ version: 1, pins: [original, savedPin({ id: "bad-pin", ...changes })] })), /invalid fields/);
  }
  assert.throws(() => parsePinBackup('{"version":2,"pins":[]}'), /version/);
  assert.throws(() => parsePinBackup(JSON.stringify({ version: 1, pins: [original, original] })), /duplicate/);
});

test("a full valid pin collection with multibyte notes can import its own exported backup", () => {
  const pins = Array.from({ length: 1000 }, (_, index) => savedPin({ id: `pin-${index}`, name: "界".repeat(120),
    notes: "界".repeat(2000), categoryIds: MAP_CATEGORIES.map(category => category.id) }));
  const restored = parsePinBackup(pinBackup(pins));
  assert.equal(restored.length, pins.length);
  assert.equal(restored[999].notes, pins[999].notes);
});
