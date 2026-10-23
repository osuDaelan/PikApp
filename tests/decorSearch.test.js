import test from "node:test";
import assert from "node:assert/strict";
import { DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES, PIKMIN_COLORS } from "../src/features/decor/catalog.js";
import { decorId, countDecorGroups } from "../src/features/decor/collection.js";
import { compileDecorSearch, searchDecorCatalog, MAX_DECOR_SEARCH_LENGTH } from "../src/features/decor/search.js";

function results(query, collected = {}) {
  const search = compileDecorSearch(query);
  assert.equal(search.error, null, `Valid search: ${query}`);
  return searchDecorCatalog(search, collected);
}
function ids(query, collected = {}) {
  const { regular, special } = results(query, collected);
  return [...regular, ...special].flatMap(group => group.costumes.flatMap(costume =>
    (costume.designs || costume.colors).map(variant => decorId(group.location, costume.name, variant))));
}
const redChef = "restaurant__chef_hat__Red";
const blueChef = "restaurant__chef_hat__Blue";
const redRareChef = "restaurant__chef_hat_rare__Red";

test("empty searches preserve the original catalog references, order and stable saved IDs", () => {
  const { regular, special } = results("  \u3000 ");
  assert.equal(regular, DECOR_LOCATIONS);
  assert.equal(special, DECOR_SPECIAL_CATEGORIES);
  assert.equal(ids("").length, 975);
  assert.deepEqual(ids("!not-an-existing-costume"), ids(""));
});

test("all eight species filter individual tiles, including the species of numbered designs", () => {
  for (const color of PIKMIN_COLORS) {
    const { regular, special } = results(color.toUpperCase());
    assert.ok(regular.length + special.length > 0);
    for (const group of [...regular, ...special]) for (const costume of group.costumes) {
      if (costume.designs) assert.equal(costume.color, color);
      else assert.deepEqual(costume.colors, [color]);
    }
  }
  assert.equal(ids("yellow battery").length, 6);
  assert.equal(ids("red battery").length, 0);
  assert.deepEqual(ids('yellow battery "design 2"'), ["appliances_store__battery__2"]);
  // Unquoted species is a species filter, not a partial match on Ice Cream or Shaved Ice.
  assert.ok(ids('"ice"').length > ids("ice").length);
});

test("text searches cover categories, partial costume names, species labels, accents and phrases", () => {
  assert.equal(ids("ReStAuRaNt").length, 66); // Includes all restaurant categories.
  assert.deepEqual(ids("cafe"), ids("CAFÉ"));
  assert.deepEqual(ids('"coffee cup"'), ids("coffee cup"));
  assert.deepEqual(ids('"Blue Pikmin"'), ids("blue"));
  assert.equal(ids("stained glass").length, 8);
  assert.equal(ids('"Library & Bookstore"').length, 7);
  assert.equal(ids("stained").length, 8);
});

test("collected and missing reflect live progress and do not modify it", () => {
  const saved = { [redChef]: true, [blueChef]: false, [redRareChef]: true, unrelated: true };
  const before = structuredClone(saved);
  assert.deepEqual(ids("collected", saved), [redChef, redRareChef]);
  assert.equal(ids("missing", saved).length, 973);
  assert.ok(ids("missing", saved).includes(blueChef));
  assert.deepEqual(saved, before);
  assert.deepEqual(ids("collected restaurant !rare", { ...saved, [blueChef]: true }), [redChef, blueChef]);
});

test("rare, regular and event/special filters use catalog metadata, not names", () => {
  assert.equal(ids("rare").length, 107);
  assert.equal(ids("regular").length, 522);
  assert.equal(ids("event").length, 453);
  assert.deepEqual(ids("special"), ids("event"));
  assert.equal(ids("regular !rare").length, 415);
  assert.equal(ids("event rare").length, 0);
  assert.equal(ids("event golden").length, 1);
  assert.equal(ids("event golden rare").length, 0);
  assert.equal(ids("restaurant rare").length, 8);
});

test("AND accepts spaces, full-width spaces, ampersands and commas", () => {
  const expected = [blueChef];
  for (const query of ["blue =restaurant !rare", "blue&=restaurant&!rare", "blue,=restaurant,!rare", "blue\u3000=restaurant\u3000!rare"]) {
    assert.deepEqual(ids(query), expected, query);
  }
});

test("OR aliases, exclusion and nested groups obey NOT then AND then OR precedence", () => {
  const redOnly = ids("restaurant red !rare");
  const blueOnly = ids("restaurant blue !rare");
  assert.deepEqual(ids("restaurant !rare (red|blue)").sort(), [...redOnly, ...blueOnly].sort());
  assert.deepEqual(ids("restaurant !rare (red;blue)").sort(), [...redOnly, ...blueOnly].sort());
  assert.deepEqual(ids("restaurant !rare !(red|blue)"), ids("restaurant !rare !red !blue"));
  assert.deepEqual(ids("!!rare"), ids("rare"));
  assert.deepEqual(ids("red | blue & restaurant"), ids("red | (blue & restaurant)"));
  assert.notDeepEqual(ids("(red | blue) & restaurant"), ids("red | blue & restaurant"));
  assert.deepEqual(ids("=restaurant(red|blue)!rare"), [redChef, blueChef]);
});

test("straight quotes escape syntax and reserved filters; equals matches a whole field", () => {
  assert.equal(ids('="Chef Hat"').length, 8);
  assert.equal(ids('="Chef Hat (Rare)"').length, 8);
  assert.equal(ids('"Chef Hat"').length, 16);
  assert.equal(ids('="restaurant"').length, 16);
  assert.equal(ids('="cafe"').length, 15);
  assert.equal(ids('"rare"').length, 107);
  assert.equal(ids('="rare"').length, 0);
  assert.equal(ids('"collected"', { [redChef]: true }).length, 0);
  assert.equal(ids('"missing"').length, 0);
  assert.equal(compileDecorSearch('"a\\\"b\\\\c"').error, null);
  assert.equal(ids('"a&b|c!d(e)"').length, 0);
  assert.equal(ids('".*"').length, 0); // Text is not interpreted as a regular expression.
});

test("invalid or incomplete expressions return a useful error and no bulk-action targets", () => {
  for (const query of ['"chef', '""', "red &", "red |", "& red", "red || blue", "red && blue", "!", "=", "=(red)", "(red", "red)", "()", "red,;blue"]) {
    const search = compileDecorSearch(query);
    assert.equal(search.active, true, query);
    assert.equal(typeof search.error, "string", query);
    assert.ok(search.error.length > 0);
    assert.deepEqual(searchDecorCatalog(search, {}), { regular: [], special: [] });
  }
});

test("query limits prevent excessive nesting and oversized input from crashing the checklist", () => {
  for (const query of ["x".repeat(MAX_DECOR_SEARCH_LENGTH + 1), "(".repeat(34) + "red" + ")".repeat(34), "!".repeat(34) + "red", "x|".repeat(130) + "x"]) {
    assert.ok(compileDecorSearch(query).error, query);
  }
  assert.equal(ids("x".repeat(MAX_DECOR_SEARCH_LENGTH)).length, 0);
});

test("filtered groups expose only matching variants for counts and bulk changes without changing catalog or unlock data", () => {
  const before = JSON.stringify([DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES]);
  const saved = { [redChef]: true, [blueChef]: false };
  const { regular, special } = results("missing restaurant (red|blue)", saved);
  const matchingIds = ids("missing restaurant (red|blue)", saved);
  assert.ok(!matchingIds.includes(redChef));
  assert.ok(matchingIds.includes(blueChef));
  assert.ok(matchingIds.includes(redRareChef));
  assert.deepEqual(countDecorGroups([...regular, ...special], saved), { total: matchingIds.length, done: 0 });
  const afterBulk = { ...saved, ...Object.fromEntries(matchingIds.map(id => [id, true])) };
  assert.equal(ids("missing restaurant (red|blue)", afterBulk).length, 0);
  assert.equal(ids("collected", afterBulk).length, matchingIds.length + 1);
  assert.equal(JSON.stringify([DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES]), before);
  assert.equal(DECOR_LOCATIONS[0].costumes[0].colors.length, 8);
});
