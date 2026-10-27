import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CARD_COSTUMES } from "../src/features/decor/cardCatalog.js";
import { decorId } from "../src/features/decor/collection.js";

test("Playing Card labels map to unchanged IDs while Hanafuda/Mahjong retain numbered defaults", () => {
  const sources = JSON.parse(readFileSync(new URL("../docs/decor-image-sources.json", import.meta.url), "utf8"));
  const records = new Map(sources.images.map(record => [record.id, record]));
  let count = 0;
  for (const [location, costumes] of Object.entries(CARD_COSTUMES)) for (const costume of costumes) {
    const named = location === "Playing Card";
    if (named) {
      assert.deepEqual(Object.keys(costume.designLabels), costume.designs);
      assert.equal(new Set(Object.values(costume.designLabels).map(details => details.label)).size, costume.designs.length);
    } else assert.equal(costume.designLabels, undefined);
    for (const design of costume.designs) {
      const details = costume.designLabels?.[design];
      const record = records.get(decorId(location, costume.name, design));
      assert.ok(record);
      if (!named) {
        assert.equal(record.displayLabel, undefined);
        assert.equal(record.labelSource, undefined);
        continue;
      }
      assert.equal(record.displayLabel, details.name);
      assert.match(record.labelSource, /^https:\/\/www\.pikminwiki\.com\/Special_Decor_Pikmin#/);
      assert.ok(details.label.length <= 13);
      count++;
    }
  }
  assert.equal(count, 27);
});

test("Playing Cards distinguish all 13 ranks in each suit and the Purple Joker", () => {
  const labels = CARD_COSTUMES["Playing Card"].flatMap(costume => Object.values(costume.designLabels));
  for (const suit of ["Diamonds", "Clubs"]) {
    const names = labels.filter(details => details.name.endsWith(`of ${suit}`)).map(details => details.name);
    assert.equal(names.length, 13);
    assert.equal(new Set(names).size, 13);
    assert.ok(names.includes(`Ace of ${suit}`));
    assert.ok(names.includes(`King of ${suit}`));
  }
  const purple = CARD_COSTUMES["Playing Card"].find(costume => costume.color === "Purple");
  assert.equal(purple.designLabels["2"].name, "Joker");
});

test("numbered Hanafuda and Mahjong variants remain complete without unverified names", () => {
  const red = CARD_COSTUMES["Hanafuda Card"].find(costume => costume.name === "Hanafuda Card (Volume 1): Red");
  assert.deepEqual(red.designs, ["1", "2", "3", "4", "5", "6"]);
  assert.equal(red.designLabels, undefined);
  const white = CARD_COSTUMES["Mahjong Tile"].find(costume => costume.color === "White");
  assert.deepEqual(white.designs, ["1", "2", "3", "4", "5"]);
  const yellow = CARD_COSTUMES["Mahjong Tile"].find(costume => costume.color === "Yellow");
  assert.equal(yellow.designLabels, undefined);
});
