import test from "node:test";
import assert from "node:assert/strict";
import { DECOR_SETS, decorSetId, newlyCompletedSets } from "../src/features/decor/setCompletion.js";

const findSet = (location, costume) => DECOR_SETS.find(set => set.id === decorSetId(location, costume));
const collected = ids => Object.fromEntries(ids.map(id => [id, true]));

test("only the last missing required variant completes a costume set", () => {
  const chef = findSet("Restaurant", "Chef Hat");
  const almost = collected(chef.ids.slice(0, -1));
  assert.deepEqual(newlyCompletedSets({}, almost), []);
  assert.deepEqual(newlyCompletedSets(almost, collected(chef.ids)), [chef]);
});

test("saved complete sets, unrelated edits, and removals do not replay completion", () => {
  const chef = findSet("Restaurant", "Chef Hat");
  const complete = collected(chef.ids);
  assert.deepEqual(newlyCompletedSets(complete, { ...complete }), []);
  assert.deepEqual(newlyCompletedSets(complete, { ...complete, unknown: true }), []);
  assert.deepEqual(newlyCompletedSets(complete, { ...complete, [chef.ids[0]]: false }), []);
});

test("bulk updates report newly completed base and rare sets together once", () => {
  const chef = findSet("Restaurant", "Chef Hat");
  const rare = findSet("Restaurant", "Chef Hat (Rare)");
  const next = collected([...chef.ids, ...rare.ids]);
  assert.deepEqual(newlyCompletedSets({}, next), [chef, rare]);
  assert.deepEqual(newlyCompletedSets(next, { ...next }), []);
  assert.deepEqual(newlyCompletedSets(collected(chef.ids), next), [rare]);
});

test("numbered and single-species sets use their actual requirements", () => {
  const battery = findSet("Appliances Store", "Battery");
  const lights = findSet("Appliances Store", "Fairy Lights");
  const rain = findSet("Weather", "Rainy Day: Leaf Hat");
  assert.equal(battery.ids.length, 6);
  assert.equal(lights.ids.length, 2);
  assert.equal(rain.ids.length, 1);
  assert.deepEqual(newlyCompletedSets(collected(battery.ids.slice(0, 5)), collected(battery.ids)), [battery]);
  assert.deepEqual(newlyCompletedSets({}, collected([...lights.ids, ...rain.ids])), [lights, rain]);
});

test("uncollecting and genuinely completing the set again produces a new transition", () => {
  const chef = findSet("Restaurant", "Chef Hat");
  const complete = collected(chef.ids);
  const incomplete = { ...complete, [chef.ids[0]]: false };
  assert.deepEqual(newlyCompletedSets(complete, incomplete), []);
  assert.deepEqual(newlyCompletedSets(incomplete, complete), [chef]);
  assert.equal(new Set(DECOR_SETS.map(set => set.id)).size, DECOR_SETS.length);
});
