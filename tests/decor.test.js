import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES, PIKMIN_COLORS } from "../src/features/decor/catalog.js";
import { decorId, countDecorGroups, isRareLocked, isRareCostume } from "../src/features/decor/collection.js";
import { LEGACY_CARD_ENTRIES, pendingLegacyCards } from "../src/features/decor/legacyCards.js";

test("original IDs stay stable, with grouped card IDs retained separately for review", () => {
  const ids = [...DECOR_LOCATIONS, ...DECOR_SPECIAL_CATEGORIES].flatMap(group =>
    group.costumes.flatMap(costume => (costume.designs || costume.colors).map(variant =>
      decorId(group.location, costume.name, variant))));
  const legacy = JSON.parse(readFileSync(new URL("./fixtures/decor-legacy-ids.json", import.meta.url), "utf8"));
  const legacySet = new Set(legacy);
  assert.equal(ids.length, 1044);
  assert.equal(new Set(ids).size, 1044);
  assert.equal(legacy.length, 896);
  const retired = new Set(LEGACY_CARD_ENTRIES.map(entry => entry.id));
  assert.equal(retired.size, 25);
  assert.deepEqual(ids.filter(id => legacySet.has(id)), legacy.filter(id => !retired.has(id)));
  assert(legacy.every(id => ids.includes(id) || retired.has(id)));
  // Baseline from the original App.jsx before extraction. Review intentionally when adding data.
  assert.equal(createHash("sha256").update(JSON.stringify(legacy)).digest("hex"),
    "0fe9bd95e1a91e9d235c44f188d419441c49f99041f9a1978a973309747ba11d");
});

test("legacy selected/unselected entries retain progress with the expanded collection totals", () => {
  const saved = { restaurant__chef_hat__Red: true, restaurant__chef_hat__Blue: false };
  assert.deepEqual(countDecorGroups(DECOR_LOCATIONS, saved), { total: 522, done: 1 });
  assert.deepEqual(countDecorGroups(DECOR_SPECIAL_CATEGORIES, saved), { total: 522, done: 0 });
});

test("card sets track every verified design without inferring species or sibling ownership", () => {
  const find = location => DECOR_SPECIAL_CATEGORIES.find(group => group.location === location);
  for (const [location, total] of [["Hanafuda Card", 40], ["Playing Card", 27], ["Mahjong Tile", 27]]) {
    assert.equal(countDecorGroups([find(location)], {}).total, total);
  }
  const hanafuda = find("Hanafuda Card");
  assert.equal(countDecorGroups([{ ...hanafuda, costumes: hanafuda.costumes.filter(c => c.name.includes("Volume 1")) }], {}).total, 24);
  assert.equal(countDecorGroups([{ ...hanafuda, costumes: hanafuda.costumes.filter(c => c.name.includes("Volume 2")) }], {}).total, 16);
  const mahjongRed = find("Mahjong Tile").costumes.find(c => c.color === "Red");
  assert.deepEqual(mahjongRed.designs, ["1", "2"]);
  const old = LEGACY_CARD_ENTRIES[0];
  const saved = { [old.id]: true, [LEGACY_CARD_ENTRIES[1].id]: false, restaurant__chef_hat__Red: true };
  const before = structuredClone(saved);
  assert.deepEqual(pendingLegacyCards(saved), [old]);
  assert.deepEqual(countDecorGroups([hanafuda], saved), { total: 40, done: 0 });
  const costume = hanafuda.costumes[0], first = decorId(hanafuda.location, costume.name, costume.designs[0]);
  saved[first] = true;
  assert.equal(countDecorGroups([hanafuda], saved).done, 1);
  assert.equal(saved[old.id], before[old.id]);
  assert.equal(saved[decorId(hanafuda.location, costume.name, "2")], undefined);
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
  assert.equal(rareVariants, 107);
});

test("the October 2026 review includes newer regular and event species without unavailable variants", () => {
  const regular = (location, name) => DECOR_LOCATIONS.find(group => group.location === location).costumes.find(costume => costume.name === name);
  for (const [location, name] of [
    ["Pharmacy", "Toothbrush"], ["Pharmacy", "Toothbrush (Rare)"],
    ["Forest", "Stag Beetle (Rare)"], ["Forest", "Acorn (Rare)"], ["Airport", "Luggage Tag"],
    ["Station", "Ticket"], ["Station", "Ticket (Rare)"], ["Bakery", "Baguette"], ["Bakery", "Pastry"],
    ["Stadium", "Ball Keychain"], ["Stadium", "Ball Keychain (Rare)"],
  ]) assert.deepEqual(regular(location, name).colors, PIKMIN_COLORS, `${location}: ${name}`);
  for (const name of ["Halloween: Stained Glass", "Balinese Carving", "Wurst", "Shaved Ice", "Mooncake"]) {
    assert.deepEqual(DECOR_SPECIAL_CATEGORIES.find(group => group.location === name).costumes[0].colors, PIKMIN_COLORS, name);
  }
  assert.equal(regular("Café", "Coffee Cup (Rare)").colors.includes("Ice"), false);
  assert.equal(regular("Bakery", "Baguette (Rare)").colors.includes("Ice"), false);
});
