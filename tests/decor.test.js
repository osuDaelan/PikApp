import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES } from "../src/features/decor/catalog.js";
import { decorId, countDecorGroups, isRareLocked, isRareCostume } from "../src/features/decor/collection.js";

test("all 896 legacy collection IDs remain unchanged and unique", () => {
  const ids = [...DECOR_LOCATIONS, ...DECOR_SPECIAL_CATEGORIES].flatMap(group =>
    group.costumes.flatMap(costume => (costume.designs || costume.colors).map(variant =>
      decorId(group.location, costume.name, variant))));
  assert.equal(ids.length, 896);
  assert.equal(new Set(ids).size, 896);
  // Baseline from the original App.jsx before extraction. Review intentionally when adding data.
  assert.equal(createHash("sha256").update(JSON.stringify(ids)).digest("hex"),
    "0fe9bd95e1a91e9d235c44f188d419441c49f99041f9a1978a973309747ba11d");
});

test("legacy selected/unselected entries still produce the same collection totals", () => {
  const saved = { restaurant__chef_hat__Red: true, restaurant__chef_hat__Blue: false };
  assert.deepEqual(countDecorGroups(DECOR_LOCATIONS, saved), { total: 469, done: 1 });
  assert.deepEqual(countDecorGroups(DECOR_SPECIAL_CATEGORIES, saved), { total: 427, done: 0 });
});

test("rare costumes unlock after all base variants are collected", () => {
  const restaurant = DECOR_LOCATIONS.find(group => group.location === "Restaurant");
  const [base, rare] = restaurant.costumes;
  const saved = Object.fromEntries(base.colors.map(color => [decorId(restaurant.location, base.name, color), true]));
  assert.equal(isRareLocked(restaurant, rare, {}), true);
  assert.equal(isRareLocked(restaurant, rare, saved), false);
  saved[decorId(restaurant.location, base.name, "Ice")] = false;
  assert.equal(isRareLocked(restaurant, rare, saved), true);
});

test("rare tile effects apply to rare costumes, not base or golden event decor", () => {
  const restaurant = DECOR_LOCATIONS.find(group => group.location === "Restaurant");
  assert.equal(isRareCostume(restaurant.costumes[0]), false);
  assert.equal(isRareCostume(restaurant.costumes[1]), true);
  assert.equal(isRareCostume({ name: "Golden Toy Airplane" }), false);
  assert.equal(isRareCostume({ name: "Rare-looking base costume" }), false);
  const rareVariants = DECOR_LOCATIONS.flatMap(group => group.costumes)
    .filter(isRareCostume).reduce((count, costume) => count + costume.colors.length, 0);
  assert.equal(rareVariants, 74);
});
