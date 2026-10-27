import test from "node:test";
import assert from "node:assert/strict";
import { DECOR_LOCATIONS } from "../src/features/decor/catalog.js";
import { decorId, decorStorageLocation, countDecorGroups, isRareCostume, isRareLocked } from "../src/features/decor/collection.js";

const cafe = DECOR_LOCATIONS.find(group => group.location === "Café");
const coffee = cafe.costumes.find(costume => costume.name === "Coffee Cup");
const rareCoffee = cafe.costumes.find(isRareCostume);
const originalSeven = coffee.colors.filter(color => color !== "Ice");
const baseSave = () => Object.fromEntries(originalSeven.map(color => [decorId("Café", coffee.name, color), true]));

test("Café unlocks rare Coffee Cups with the original seven colors, with Ice absent or unchecked", () => {
  assert.equal(originalSeven.length, 7);
  const saved = baseSave();
  assert.equal(isRareLocked(cafe, rareCoffee, saved), false);
  saved[decorId("Café", coffee.name, "Ice")] = false;
  assert.equal(isRareLocked(cafe, rareCoffee, saved), false);
  saved[decorId("Café", coffee.name, "Ice")] = true;
  assert.equal(isRareLocked(cafe, rareCoffee, saved), false);
});

test("each original Café color is required, even with Ice and existing rare progress collected", () => {
  for (const color of originalSeven) {
    const saved = { ...baseSave(), [decorId("Café", coffee.name, "Ice")]: true,
      [decorId("Café", rareCoffee.name, "Red")]: true };
    saved[decorId("Café", coffee.name, color)] = false;
    assert.equal(isRareLocked(cafe, rareCoffee, saved), true, color);
    saved[decorId("Café", coffee.name, color)] = true;
    assert.equal(isRareLocked(cafe, rareCoffee, saved), false, color);
  }
});

test("Café still tracks eight base and seven rare Coffee Cups without changing saved flags or catalog data", () => {
  const saved = { ...baseSave(), [decorId("Café", rareCoffee.name, "Red")]: true };
  const beforeSave = structuredClone(saved), beforeGroup = structuredClone(cafe);
  assert.equal(isRareLocked(cafe, rareCoffee, saved), false);
  assert.deepEqual(countDecorGroups([cafe], saved), { done: 8, total: 15 });
  assert.equal(coffee.colors.length, 8);
  assert.equal(rareCoffee.colors.length, 7);
  assert.deepEqual(saved, beforeSave);
  assert.deepEqual(cafe, beforeGroup);
});

test("every other rare costume keeps its full matching base requirement, including Ice where available", () => {
  for (const group of DECOR_LOCATIONS.filter(group => group !== cafe)) {
    for (const rare of group.costumes.filter(isRareCostume)) {
      const base = group.costumes.find(costume => costume.name === rare.name.replace(/ \(Rare\)$/, ""));
      const variants = base.designs || base.colors;
      const location = decorStorageLocation(group);
      const saved = Object.fromEntries(variants.map(variant => [decorId(location, base.name, variant), true]));
      assert.equal(isRareLocked(group, rare, saved), false, `${group.location}: ${rare.name}`);
      for (const variant of variants) {
        saved[decorId(location, base.name, variant)] = false;
        saved[decorId(location, rare.name, "Red")] = true;
        assert.equal(isRareLocked(group, rare, saved), true, `${group.location}: ${base.name}: ${variant}`);
        saved[decorId(location, base.name, variant)] = true;
      }
    }
  }
});

test("Station Paper Train and Gold Ticket cannot unlock rare Tickets", () => {
  const station = DECOR_LOCATIONS.find(group => group.location === "Station");
  const rare = station.costumes.find(isRareCostume);
  const saved = Object.fromEntries(station.costumes.filter(costume => costume.name !== "Ticket")
    .flatMap(costume => costume.colors.map(color => [decorId("Station", costume.name, color), true])));
  assert.equal(isRareLocked(station, rare, saved), true);
});
