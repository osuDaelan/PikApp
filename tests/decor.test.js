import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES, PIKMIN_COLORS } from "../src/features/decor/catalog.js";
import { decorId, decorStorageLocation, countDecorGroups, isRareLocked, isRareCostume } from "../src/features/decor/collection.js";
import { LEGACY_GROUPED_ENTRIES, pendingLegacyDecor } from "../src/features/decor/legacyDecor.js";

test("original IDs stay stable, with grouped design IDs retained separately for review", () => {
  const ids = [...DECOR_LOCATIONS, ...DECOR_SPECIAL_CATEGORIES].flatMap(group =>
    group.costumes.flatMap(costume => (costume.designs || costume.colors).map(variant =>
      decorId(decorStorageLocation(group), costume.name, variant))));
  const legacy = JSON.parse(readFileSync(new URL("./fixtures/decor-legacy-ids.json", import.meta.url), "utf8"));
  const legacySet = new Set(legacy);
  assert.equal(ids.length, 1056);
  assert.equal(new Set(ids).size, 1056);
  assert.equal(legacy.length, 896);
  const retired = new Set(LEGACY_GROUPED_ENTRIES.map(entry => entry.id));
  assert.equal(retired.size, 36);
  assert.deepEqual(ids.filter(id => legacySet.has(id)).sort(), legacy.filter(id => !retired.has(id)).sort());
  assert(legacy.every(id => ids.includes(id) || retired.has(id)));
  // Baseline from the original App.jsx before extraction. Review intentionally when adding data.
  assert.equal(createHash("sha256").update(JSON.stringify(legacy)).digest("hex"),
    "0fe9bd95e1a91e9d235c44f188d419441c49f99041f9a1978a973309747ba11d");
});

test("regular category, costume, design and species order matches the audited wiki gallery", () => {
  const gallery = JSON.parse(readFileSync(new URL("./fixtures/decor-regular-gallery.json", import.meta.url), "utf8"));
  assert.deepEqual(DECOR_LOCATIONS.map(group => group.location), gallery.categories);
  assert.deepEqual(PIKMIN_COLORS, gallery.species);
  const ids = DECOR_LOCATIONS.flatMap(group => group.costumes.flatMap(costume =>
    (costume.designs || PIKMIN_COLORS.filter(color => costume.colors.includes(color)))
      .map(variant => decorId(decorStorageLocation(group), costume.name, variant))));
  assert.equal(ids.length, 527);
  assert.deepEqual(ids, gallery.ids);
});

test("renamed Weather and Fortune display groups still use the original saved IDs", () => {
  const saved = { weather__rainy_day_leaf_hat__2: true, weather__snowy_day_snow__White: true, fortune__kichi__Rock: true };
  for (const [location, identity, total] of [["Rainy Day", "Weather", 3], ["Snowy Day", "Weather", 3], ["Shrine & Temple", "Fortune", 35]]) {
    const group = DECOR_LOCATIONS.find(entry => entry.location === location);
    assert.equal(decorStorageLocation(group), identity);
    assert.deepEqual(countDecorGroups([group], saved), { total, done: 1 });
  }
});

test("Theme Park has both ticket designs for Red, Yellow and Blue, with old marks pending review", () => {
  const group = DECOR_LOCATIONS.find(entry => entry.location === "Theme Park");
  assert.deepEqual(group.costumes.map(costume => costume.name), ["Theme Park Ticket: Design 1", "Theme Park Ticket: Design 2"]);
  for (const costume of group.costumes) assert.deepEqual(costume.colors, ["Red", "Yellow", "Blue"]);
  const saved = { theme_park__theme_park_ticket__Red: true, theme_park__theme_park_ticket_design_2__Blue: true };
  assert.deepEqual(countDecorGroups([group], saved), { total: 6, done: 1 });
  assert.equal(pendingLegacyDecor(saved, "regular").length, 1);
  assert.equal(pendingLegacyDecor(saved, "special").length, 0);
});

test("Rainy Day has three independent Blue Leaf Hats and preserves the old grouped mark for review", () => {
  const weather = DECOR_LOCATIONS.find(group => group.location === "Rainy Day");
  const rain = weather.costumes.find(costume => costume.name === "Rainy Day: Leaf Hat");
  assert.deepEqual(rain.designs, ["1", "2", "3"]);
  assert.equal(rain.color, "Blue");
  assert.deepEqual(rain.colors, ["Blue"]);
  const old = "weather__rainy_day_leaf_hat__Blue";
  const exact = decorId("Weather", rain.name, "2");
  const saved = { [old]: true, [exact]: true, [LEGACY_GROUPED_ENTRIES[0].id]: true };
  const before = structuredClone(saved);
  assert.deepEqual(countDecorGroups([{ ...weather, costumes: [rain] }], saved), { total: 3, done: 1 });
  assert.deepEqual(pendingLegacyDecor(saved, "regular").map(entry => entry.id), [old]);
  assert.equal(pendingLegacyDecor(saved, "special").length, 1);
  assert.equal(pendingLegacyDecor(saved).length, 2);
  assert.deepEqual(saved, before);
});

test("Chess has separate seven-species white and black sets without guessed ownership", () => {
  const chess = DECOR_SPECIAL_CATEGORIES.find(group => group.location === "Chess Piece");
  assert.deepEqual(chess.costumes.map(costume => costume.name), ["Chess Piece: White", "Chess Piece: Black"]);
  for (const costume of chess.costumes) assert.deepEqual(costume.colors, PIKMIN_COLORS.filter(color => color !== "Ice"));
  const saved = { chess_piece__chess_piece__Red: true, chess_piece__chess_piece_black__Blue: true };
  assert.deepEqual(countDecorGroups([chess], saved), { total: 14, done: 1 });
  assert.equal(pendingLegacyDecor(saved, "special").length, 1);
  assert.equal(pendingLegacyDecor(saved, "regular").length, 0);
});

test("legacy selected/unselected entries retain progress with the expanded collection totals", () => {
  const saved = { restaurant__chef_hat__Red: true, restaurant__chef_hat__Blue: false };
  assert.deepEqual(countDecorGroups(DECOR_LOCATIONS, saved), { total: 527, done: 1 });
  assert.deepEqual(countDecorGroups(DECOR_SPECIAL_CATEGORIES, saved), { total: 529, done: 0 });
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
  const old = LEGACY_GROUPED_ENTRIES[0];
  const saved = { [old.id]: true, [LEGACY_GROUPED_ENTRIES[1].id]: false, restaurant__chef_hat__Red: true };
  const before = structuredClone(saved);
  assert.deepEqual(pendingLegacyDecor(saved), [old]);
  assert.deepEqual(countDecorGroups([hanafuda], saved), { total: 40, done: 0 });
  const costume = hanafuda.costumes[0], first = decorId(hanafuda.location, costume.name, costume.designs[0]);
  saved[first] = true;
  assert.equal(countDecorGroups([hanafuda], saved).done, 1);
  assert.equal(saved[old.id], before[old.id]);
  assert.equal(saved[decorId(hanafuda.location, costume.name, "2")], undefined);
});

test("rare Chef Hats require the original seven base colors, excluding Ice", () => {
  const restaurant = DECOR_LOCATIONS.find(group => group.location === "Restaurant");
  const base = restaurant.costumes.find(costume => costume.name === "Chef Hat");
  const rare = restaurant.costumes.find(isRareCostume);
  const saved = Object.fromEntries(base.colors.map(color => [decorId(restaurant.location, base.name, color), true]));
  assert.equal(isRareLocked(restaurant, rare, {}), true);
  assert.equal(isRareLocked(restaurant, rare, saved), false);
  saved[decorId(restaurant.location, base.name, "Ice")] = false;
  assert.equal(isRareLocked(restaurant, rare, saved), false);
  saved[decorId(restaurant.location, base.name, "Blue")] = false;
  assert.equal(isRareLocked(restaurant, rare, saved), true);
});

test("rare tile effects apply to rare costumes, not base or golden event decor", () => {
  const restaurant = DECOR_LOCATIONS.find(group => group.location === "Restaurant");
  assert.equal(isRareCostume(restaurant.costumes[0]), true);
  assert.equal(isRareCostume(restaurant.costumes[1]), false);
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
