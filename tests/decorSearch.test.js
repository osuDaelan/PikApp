import test from "node:test";
import assert from "node:assert/strict";
import { DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES, PIKMIN_COLORS } from "../src/features/decor/catalog.js";
import { decorId, decorStorageLocation, countDecorGroups } from "../src/features/decor/collection.js";
import { compileDecorSearch, searchDecorCatalog, regularDecorGroups, MAX_DECOR_SEARCH_LENGTH } from "../src/features/decor/search.js";

function results(query, collected = {}, recentEdits) {
  const search = compileDecorSearch(query);
  assert.equal(search.error, null, `Valid search: ${query}`);
  // Parser/catalogue coverage explicitly previews every row. Default visibility
  // and complete-source unlock decisions are covered by regression tests below.
  return searchDecorCatalog(search, collected, recentEdits, {showAllDecor:true});
}
function ids(query, collected = {}, recentEdits) {
  const { regular, special } = results(query, collected, recentEdits);
  return [...regular, ...special].flatMap(group => group.costumes.flatMap(costume =>
    (costume.designs || costume.colors).map(variant => decorId(decorStorageLocation(group), costume.name, variant))));
}
const redChef = "restaurant__chef_hat__Red";
const blueChef = "restaurant__chef_hat__Blue";
const redRareChef = "restaurant__chef_hat_rare__Red";

test("default Stadium searches exclude locked rares from results, counts and bulk targets", () => {
  const query = value => searchDecorCatalog(compileDecorSearch(value), {});
  const found = query("stadium");
  assert.deepEqual(found.regular.map(group => group.costumes.map(costume => costume.name)), [["Ball Keychain"]]);
  assert.deepEqual(countDecorGroups(found.regular, {}), { total: 8, done: 0 });
  assert.deepEqual(query("rare stadium").regular, []);
  assert.deepEqual(query("blue stadium").regular[0].costumes.map(costume => costume.name), ["Ball Keychain"]);
});

test("search checks every required base color before filtering by species or status", () => {
  const saved = { stadium__ball_keychain__Red: true, stadium__ball_keychain_rare__Red: true };
  const run = query => searchDecorCatalog(compileDecorSearch(query), saved);
  assert.deepEqual(run("collected red stadium").regular[0].costumes.map(costume => costume.name), ["Ball Keychain"]);
  for (const color of PIKMIN_COLORS.filter(color => color !== "Ice")) saved[decorId("Stadium", "Ball Keychain", color)] = true;
  saved.stadium__ball_keychain__Ice = false;
  assert.deepEqual(run("rare blue stadium").regular[0].costumes.map(costume => costume.name), ["Ball Keychain (Rare)"]);
  saved.stadium__ball_keychain__White = false;
  assert.deepEqual(run("rare blue stadium").regular, []);
});

for (const [location, names, required] of [
  ["Park", ["Clover", "Four-Leaf Clover"], PIKMIN_COLORS.filter(color => color !== "Ice")],
  ["Forest", ["Stag Beetle", "Acorn"], PIKMIN_COLORS],
]) {
  test(`${location} searches reveal both rare rows only when both full required base sets are complete`, () => {
    const saved = {};
    const run = () => searchDecorCatalog(compileDecorSearch(`rare blue ${location}`), saved);
    for (const color of required) saved[decorId(location, names[0], color)] = true;
    assert.deepEqual(run().regular, []);
    for (const color of required) saved[decorId(location, names[1], color)] = true;
    assert.deepEqual(run().regular[0].costumes.map(costume => costume.name), names.map(name => `${name} (Rare)`));
    saved[decorId(location, names[0], "Red")] = false;
    assert.deepEqual(run().regular, []);
  });
}

test("only explicit Show all previews locked search results; undo grace cannot bypass unlocks", () => {
  const id = "stadium__ball_keychain_rare__Red";
  const saved = { [id]: true }, recent = new Set([id]);
  const before = structuredClone(saved);
  const search = compileDecorSearch("missing rare red stadium");
  const hidden = searchDecorCatalog(search, saved, recent);
  assert.deepEqual(hidden, { regular: [], special: [], retainedCount: 0 });
  const preview = searchDecorCatalog(search, saved, recent, { showAllDecor: true });
  assert.equal(preview.retainedCount, 1);
  assert.deepEqual(countDecorGroups(preview.regular, saved), { total: 1, done: 1 });
  assert.deepEqual(searchDecorCatalog(search, saved, recent, { showAllDecor: false }), hidden);
  assert.deepEqual(saved, before);
});

test("empty searches preserve the original catalog references, order and stable saved IDs", () => {
  const { regular, special } = results("  \u3000 ");
  assert.equal(regular, DECOR_LOCATIONS);
  assert.equal(special, DECOR_SPECIAL_CATEGORIES);
  assert.equal(ids("").length, 1056);
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

test("individual card designs support species, volume, design and ownership searches", () => {
  assert.equal(ids("hanafuda").length, 40);
  assert.equal(ids("mahjong").length, 27);
  assert.equal(ids("playing card").length, 27);
  assert.equal(ids("red hanafuda").length, 8);
  assert.deepEqual(ids('red "Hanafuda Card (Volume 1)" "design 6"'), ["hanafuda_card__hanafuda_card_volume_1_red__6"]);
  assert.equal(ids('red mahjong "design 3"').length, 0);
  const legacy = { playing_card__playing_card__Red: true };
  assert.deepEqual(ids("collected playing card", legacy), []);
  const exact = "playing_card__playing_card_red__1";
  assert.deepEqual(ids("collected playing card", { ...legacy, [exact]: true }), [exact]);
  assert.equal(ids("missing playing card", { ...legacy, [exact]: true }).length, 26);
});

test("decor names containing a species word work without quotation marks", () => {
  assert.equal(ids("ice cream").length, 15);
  assert.deepEqual(ids("ICE   CREAM"), ids('"ice cream"'));
  assert.equal(ids("blue ice cream").length, 2);
  assert.deepEqual(ids("ice cream ice"), ["ice_cream__ice_cream_extra_flavor__Ice"]);
  assert.equal(ids("shaved ice").length, 8);
  assert.equal(ids("blue shaved ice").length, 1);
  assert.deepEqual(ids("ice & cream"), ["ice_cream__ice_cream_extra_flavor__Ice"]);
  assert.equal(ids("ice cream | shaved ice").length, 23);
  assert.equal(ids("regular ice cream").length, 0);
  const saved = { ice_cream__ice_cream_classic__Blue: true };
  assert.equal(ids("missing ice cream", saved).length, 14);
  assert.deepEqual(ids("collected ice cream", saved), ["ice_cream__ice_cream_classic__Blue"]);
  assert.equal(ids("!ice cream").length, 1041);
  assert.deepEqual(ids("ice"), ids("ice !ice cream !shaved ice | ice ice cream | ice shaved ice"));
});

test("card descriptions are searchable without changing species or design selectors", () => {
  assert.equal(ids("playing club").length, 13);
  assert.equal(ids("playing diamond").length, 13);
  assert.deepEqual(ids("joker"), ["playing_card__playing_card_purple__2"]);
  assert.deepEqual(ids("ace diamonds"), ["playing_card__playing_card_red__1"]);
  for (const query of ["hanafuda january", "mahjong white dragon", "mahjong red dragon", "mahjong bamboo"]) {
    assert.equal(ids(query).length, 0, "Unverified labels must not remain hidden search aliases");
  }
  assert.deepEqual(ids('red hanafuda "Volume 1" "design 2"'), ["hanafuda_card__hanafuda_card_volume_1_red__2"]);
  assert.deepEqual(ids('white mahjong "design 5"'), ["mahjong_tile__mahjong_tile_white__5"]);
});

test("Shrine visibility controls totals, results and bulk targets while preserving saved marks", () => {
  const saved = { fortune__kichi__Rock: true, restaurant__chef_hat__Blue: true };
  const before = structuredClone(saved);
  assert.equal(countDecorGroups(regularDecorGroups(), saved).total, 492);
  assert.deepEqual(countDecorGroups(regularDecorGroups(), saved), { total: 492, done: 1 });
  assert.deepEqual(countDecorGroups(regularDecorGroups(true), saved), { total: 527, done: 2 });
  for (const query of ["", "shrine", "fortune", "collected", "missing | collected"]) {
    const hidden = searchDecorCatalog(compileDecorSearch(query), saved, new Set(["fortune__kichi__Rock"]), {showShrineDecor:false});
    assert.equal(hidden.regular.some(group => group.location === "Shrine & Temple"), false);
  }
  const shown = searchDecorCatalog(compileDecorSearch("collected shrine"), saved, new Set(), {showShrineDecor:true});
  assert.deepEqual(countDecorGroups(shown.regular, saved), { total: 1, done: 1 });
  assert.deepEqual(saved, before);
});

test("Rainy Day searches find exact designs without treating an old Blue mark as ownership", () => {
  const old = { weather__rainy_day_leaf_hat__Blue: true };
  assert.equal(ids("rainy").length, 3);
  assert.equal(ids("rainy blue").length, 3);
  assert.equal(ids("rainy red").length, 0);
  assert.deepEqual(ids('rainy "design 2"'), ["weather__rainy_day_leaf_hat__2"]);
  assert.deepEqual(ids("collected rainy", old), []);
  const saved = { ...old, weather__rainy_day_leaf_hat__2: true };
  assert.deepEqual(ids("collected rainy", saved), ["weather__rainy_day_leaf_hat__2"]);
  assert.equal(ids("missing rainy", saved).length, 2);
});

test("renamed categories keep old search aliases and collect the same saved variants", () => {
  const saved = { weather__rainy_day_leaf_hat__2: true, weather__snowy_day_snow__White: true, fortune__kichi__Rock: true };
  assert.deepEqual(ids("collected rainy", saved), ["weather__rainy_day_leaf_hat__2"]);
  assert.deepEqual(ids("collected snowy", saved), ["weather__snowy_day_snow__White"]);
  assert.equal(ids("weather").length, 6);
  assert.deepEqual(ids("fortune"), ids('="Shrine & Temple"'));
  assert.deepEqual(ids("collected shrine", saved), ["fortune__kichi__Rock"]);
});

test("Theme Park design searches expose six independent tiles and safe bulk targets", () => {
  assert.equal(ids('"Theme Park"').length, 6);
  assert.equal(ids('"Theme Park" "Design 2"').length, 3);
  assert.deepEqual(ids('"Theme Park" "Design 2" blue'), ["theme_park__theme_park_ticket_design_2__Blue"]);
  const saved = { theme_park__theme_park_ticket__Red: true, theme_park__theme_park_ticket_design_1__Red: true };
  assert.deepEqual(ids('"Theme Park" collected', saved), ["theme_park__theme_park_ticket_design_1__Red"]);
  assert.equal(ids('"Theme Park" missing', saved).length, 5);
});

test("Chess searches distinguish piece sides from Pikmin species and preserve filtered action targets", () => {
  assert.equal(ids("chess").length, 14);
  assert.equal(ids('"Chess Piece: White"').length, 7);
  assert.equal(ids('"Chess Piece: Black"').length, 7);
  assert.equal(ids("chess white").length, 2); // Unquoted white means the White Pikmin species.
  assert.deepEqual(ids("chess black blue"), ["chess_piece__chess_piece_black__Blue"]);
  const saved = { chess_piece__chess_piece__Blue: true, chess_piece__chess_piece_black__Blue: true };
  assert.deepEqual(ids("collected chess", saved), ["chess_piece__chess_piece_black__Blue"]);
  assert.equal(ids("missing chess", saved).length, 13);
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
  assert.deepEqual(ids("collected", saved), [redRareChef, redChef]);
  assert.equal(ids("missing", saved).length, 1054);
  assert.ok(ids("missing", saved).includes(blueChef));
  assert.deepEqual(saved, before);
  assert.deepEqual(ids("collected restaurant !rare", { ...saved, [blueChef]: true }), [redChef, blueChef]);
});

test("rare, regular and event/special filters use catalog metadata, not names", () => {
  assert.equal(ids("rare").length, 107);
  assert.equal(ids("regular").length, 527);
  assert.equal(ids("event").length, 529);
  assert.deepEqual(ids("special"), ids("event"));
  assert.equal(ids("regular !rare").length, 420);
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
    assert.deepEqual(searchDecorCatalog(search, {}), { regular: [], special: [], retainedCount: 0 });
  }
});

test("newly collected missing results stay in their original slots during the undo window", () => {
  const saved = { [redChef]: true, [blueChef]: true };
  const recent = new Set([redChef]);
  const query = "missing =restaurant !rare";
  const expected = ids("=restaurant !rare").filter(id => id !== blueChef);
  assert.deepEqual(ids(query, saved, recent), expected);
  assert.equal(results(query, saved, recent).retainedCount, 1);
  assert.equal(ids(query, saved).includes(redChef), false);
  assert.equal(results(query, saved).retainedCount, 0);
  // The selected flag is real immediately, not a delayed edit or a falsified missing flag.
  assert.deepEqual(ids("collected", saved), [redChef, blueChef]);
});

test("undoing selection restores a normal missing match, and a later selection gets a fresh window", () => {
  const recent = new Set([redChef]);
  for (const query of ["missing =restaurant red !rare", "!collected =restaurant red !rare", "!(collected|blue) =restaurant red !rare"]) {
    assert.deepEqual(ids(query, { [redChef]: true }, recent), [redChef]);
    assert.equal(results(query, { [redChef]: true }, recent).retainedCount, 1);
    assert.deepEqual(ids(query, { [redChef]: false }, recent), [redChef]);
    assert.equal(results(query, { [redChef]: false }, recent).retainedCount, 0);
    assert.deepEqual(ids(query, { [redChef]: true }), []);
    assert.deepEqual(ids(query, { [redChef]: true }, new Set([redChef])), [redChef]);
  }
});

test("grace never bypasses other filters or treats quoted text as a missing keyword", () => {
  const saved = { [redChef]: true };
  const recent = new Set([redChef]);
  for (const query of ["missing blue", "missing event", "missing rare", "missing battery", '"missing"', "missing collected", "!missing"]) {
    assert.equal(results(query, saved, recent).retainedCount, 0, query);
    assert.deepEqual(ids(query, saved, recent), ids(query, saved), query);
  }
  assert.equal(results("missing|red", saved, recent).retainedCount, 0); // Still a real match through red.
  assert.equal(results("collected", saved, recent).retainedCount, 0);
  assert.equal(results("", saved, recent).retainedCount, 0);
  assert.deepEqual(searchDecorCatalog(compileDecorSearch("missing &"), saved, recent), { regular: [], special: [], retainedCount: 0 });
});

test("multiple collected entries expire independently and bulk undo affects only displayed IDs", () => {
  const saved = { [redChef]: true, [blueChef]: true, [redRareChef]: true };
  const query = "missing =restaurant (red|blue)";
  assert.equal(results(query, saved, new Set([redChef, blueChef])).retainedCount, 2);
  assert.equal(results(query, saved, new Set([blueChef])).retainedCount, 1);
  assert.equal(ids(query, saved, new Set([blueChef])).includes(redChef), false);
  assert.equal(ids(query, saved, new Set([blueChef])).includes(blueChef), true);
  const targets = ids(query, saved, new Set([blueChef]));
  const undone = { ...saved, ...Object.fromEntries(targets.map(id => [id, false])) };
  assert.equal(undone[redChef], true);
  assert.equal(undone[redRareChef], true);
  assert.equal(undone[blueChef], false);
  assert.equal(results(query, undone, new Set([blueChef])).retainedCount, 0);
});

test("grace also supports rare, event and numbered-design entries without mutating catalog or progress", () => {
  const designId = "appliances_store__battery__2";
  const eventEntry = ids('event blue "stained glass"')[0];
  assert.ok(eventEntry);
  const saved = { [redRareChef]: true, [eventEntry]: true, [designId]: true };
  const before = JSON.stringify([DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES, saved]);
  const recent = new Map(Object.keys(saved).map(id => [id, 3000]));
  for (const [query, id] of [["missing rare =restaurant red", redRareChef], ['missing event blue "stained glass"', eventEntry], ['missing yellow battery "design 2"', designId]]) {
    assert.deepEqual(ids(query, saved, recent), [id]);
    assert.equal(results(query, saved, recent).retainedCount, 1);
    assert.deepEqual(ids(query, saved), []);
  }
  assert.equal(JSON.stringify([DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES, saved]), before);
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
