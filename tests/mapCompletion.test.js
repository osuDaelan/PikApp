import test from "node:test";
import assert from "node:assert/strict";
import { MAP_CATEGORIES } from "../src/features/decor-map/categories.js";
import { isCategoryComplete } from "../src/features/decor-map/mapPresentation.js";
import { countDecorGroups, decorId, decorStorageLocation, isRareCostume } from "../src/features/decor/collection.js";

test("map completion requires an entire nonempty category, never an unknown, empty or partial count", () => {
  for (const count of [undefined, null, {}, {done:0,total:0}, {done:7,total:14}, {done:15,total:14},
    {done:14,total:"14"}, {done:1.5,total:1.5}]) assert.equal(isCategoryComplete(count), false);
  assert.equal(isCategoryComplete({done:14,total:14}), true);
});

test("every map category requires all species and designs, including rare variants, and reverses after an uncheck", () => {
  for (const {group, id} of MAP_CATEGORIES) {
    const key = costume => (costume.designs || costume.colors).map(variant => decorId(decorStorageLocation(group), costume.name, variant));
    const ids = group.costumes.flatMap(key);
    const counts = saved => countDecorGroups([group], saved);
    const oneSpecies = Object.fromEntries(group.costumes.filter(costume => !costume.designs && costume.colors.includes("Blue"))
      .map(costume => [decorId(decorStorageLocation(group), costume.name, "Blue"), true]));
    assert.equal(isCategoryComplete(counts(oneSpecies)), false, `${id}: one species is not an entire set`);
    const baseOnly = Object.fromEntries(group.costumes.filter(costume => !isRareCostume(costume)).flatMap(key).map(value => [value, true]));
    if (group.costumes.some(isRareCostume)) assert.equal(isCategoryComplete(counts(baseOnly)), false, `${id}: rares still missing`);
    const all = Object.fromEntries(ids.map(value => [value, true]));
    const original = structuredClone(all);
    assert.equal(isCategoryComplete(counts(all)), true, id);
    assert.deepEqual(all, original);
    all[ids.at(-1)] = false;
    assert.equal(isCategoryComplete(counts(all)), false, `${id}: unchecking restores incomplete`);
  }
});
