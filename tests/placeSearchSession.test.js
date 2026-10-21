import test from "node:test";
import assert from "node:assert/strict";
import { boundsAreaKm2, boundsContain, bufferedSearchBounds, MAX_SEARCH_AREA_KM2 } from "../src/features/decor-map/coordinates.js";
import { createPlaceSearchSession } from "../src/features/decor-map/placeSearchSession.js";

const bounds = [42.355, -71.065, 42.365, -71.055];
const context = { categoryIds: ["restaurant", "park"], sourceId: "overpass-fr" };
const query = { ...context, bounds: bufferedSearchBounds(bounds) };
const data = id => ({ places: [{ id }], truncated: false, incomplete: 0, cached: false });
function fixture() {
  const requests = [];
  const session = createPlaceSearchSession({ search: input => new Promise((resolve, reject) => requests.push({ input, resolve, reject })) });
  session.setContext(context);
  return { session, requests };
}

test("scan buffer covers four times a small view, stays bounded near limits and detects panning outside", () => {
  const scanned = bufferedSearchBounds(bounds);
  assert(Math.abs(boundsAreaKm2(scanned) / boundsAreaKm2(bounds) - 4) < .00001);
  assert(boundsContain(scanned, bounds));
  assert(boundsContain(scanned, bounds.map((value, index) => value + (index % 2 ? .004 : 0))));
  assert(!boundsContain(scanned, bounds.map((value, index) => value + (index % 2 ? .02 : 0))));
  for (const view of [[42.3, -71.1, 42.4, -71], [85.03, 179.98, 85.05, 179.999]]) {
    const expanded = bufferedSearchBounds(view);
    assert(boundsContain(expanded, view));
    assert(boundsAreaKm2(expanded) <= MAX_SEARCH_AREA_KM2);
  }
  for (const invalid of [null, [42, NaN, 43, 0], [-80, -170, 80, 170], [1, 179, 2, 181]]) assert.equal(bufferedSearchBounds(invalid), null);
  assert(!boundsContain(null, bounds));
});

test("moving the view does not discard a scan or abort a search; a new scan replaces it only on success", async () => {
  const { session, requests } = fixture();
  const pending = session.search(query);
  // Pan/zoom only changes the next query, not the active context or request.
  const nextQuery = { ...query, bounds: [42.36, -71.06, 42.38, -71.04] };
  session.setContext({ ...context, categoryIds: ["park", "restaurant"] });
  assert.equal(requests.length, 1);
  assert(!requests[0].input.signal.aborted);
  requests[0].resolve(data("first")); await pending;
  const first = session.getSnapshot();
  assert.deepEqual(first.scannedBounds, query.bounds);
  session.setContext(context);
  assert.strictEqual(session.getSnapshot(), first);
  const replacement = session.search(nextQuery);
  assert.equal(session.getSnapshot().phase, "loading");
  assert.strictEqual(session.getSnapshot().places, first.places);
  assert.deepEqual(session.getSnapshot().scannedBounds, query.bounds);
  requests[1].resolve(data("second")); await replacement;
  assert.deepEqual(session.getSnapshot().places, data("second").places);
  assert.deepEqual(session.getSnapshot().scannedBounds, nextQuery.bounds);
});

test("a failed or cancelled replacement preserves the previous scan and its coverage", async () => {
  const { session, requests } = fixture();
  const first = session.search(query); requests[0].resolve(data("kept")); await first;
  const next = session.search(query); requests[1].reject(new Error("Source busy")); await next;
  assert.equal(session.getSnapshot().phase, "error");
  assert.equal(session.getSnapshot().message, "Source busy");
  assert.deepEqual(session.getSnapshot().places, data("kept").places);
  const cancelled = session.search(query);
  session.cancel();
  assert(requests[2].input.signal.aborted);
  requests[2].resolve(data("cancelled")); await cancelled;
  assert.equal(session.getSnapshot().phase, "success");
  assert.deepEqual(session.getSnapshot().places, data("kept").places);
  assert.deepEqual(session.getSnapshot().scannedBounds, query.bounds);
});

test("filter/source changes clear incompatible results and late responses cannot restore them", async () => {
  const { session, requests } = fixture();
  const first = session.search(query); requests[0].resolve(data("old")); await first;
  const stale = session.search(query);
  session.setContext({ ...context, categoryIds: ["park"] });
  assert(requests[1].input.signal.aborted);
  assert.equal(session.getSnapshot().hasScan, false);
  assert.deepEqual(session.getSnapshot().places, []);
  requests[1].resolve(data("stale")); await stale;
  assert.deepEqual(session.getSnapshot().places, []);
  const changed = session.search({ ...query, categoryIds: ["park"] });
  requests[2].resolve(data("park")); await changed;
  session.setContext({ categoryIds: ["park"], sourceId: "overpass-de" });
  assert.equal(session.getSnapshot().scannedBounds, null);
  assert.equal(session.getSnapshot().hasScan, false);
});

test("empty scans still retain their boundary, and only the latest requested scan may win", async () => {
  const { session, requests } = fixture();
  const stale = session.search(query);
  const newest = session.search(query);
  assert(requests[0].input.signal.aborted);
  requests[1].resolve({ places: [], truncated: true, incomplete: 1 }); await newest;
  requests[0].resolve(data("late")); await stale;
  assert.equal(session.getSnapshot().hasScan, true);
  assert.deepEqual(session.getSnapshot().places, []);
  assert.equal(session.getSnapshot().truncated, true);
  assert.equal(session.getSnapshot().incomplete, 1);
  assert.deepEqual(session.getSnapshot().scannedBounds, query.bounds);
});
