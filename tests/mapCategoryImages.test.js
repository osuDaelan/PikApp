import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { MAP_CATEGORIES } from "../src/features/decor-map/categories.js";
import { categoryImageUrl } from "../src/features/decor-map/categoryImages.js";

test("all map categories have verified, small local game icons with source records", () => {
  const inventory = JSON.parse(readFileSync(new URL("../docs/map-category-icon-sources.json", import.meta.url), "utf8"));
  const sources = new Map(inventory.map(image => [image.id, image]));
  assert.equal(inventory.length, MAP_CATEGORIES.length);
  assert.deepEqual(new Set(sources.keys()), new Set(MAP_CATEGORIES.map(category => category.id)));
  let total = 0;
  for (const category of MAP_CATEGORIES) {
    const image = sources.get(category.id);
    assert.equal(image.label, category.label);
    assert.equal(image.file, categoryImageUrl(category.id).slice(1));
    assert.equal(new URL(image.originalUrl).hostname, "pikmin.wiki.gallery");
    assert.equal(new URL(image.sourcePage).hostname, "www.pikminwiki.com");
    const bytes = readFileSync(new URL(`../public/${image.file}`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(bytes.readUInt32BE(16), image.width);
    assert.equal(bytes.readUInt32BE(20), image.height);
    assert.ok(image.width > 0 && image.width <= 64 && image.height > 0 && image.height <= 64);
    assert.equal(bytes.length, image.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), image.sha256);
    total += bytes.length;
  }
  assert.ok(total < 60_000, "Category icons remain lightweight and reusable across markers");
});

test("category images respect GitHub Pages paths and reject unknown category IDs", () => {
  assert.equal(categoryImageUrl("restaurant"), "/images/decor-categories/restaurant.png");
  assert.equal(categoryImageUrl("cafe", "/PikApp/"), "/PikApp/images/decor-categories/cafe.png");
  assert.equal(categoryImageUrl("park", "/PikApp/"), "/PikApp/images/decor-categories/park.png");
  assert.equal(categoryImageUrl("../../anything"), null);
  assert.equal(categoryImageUrl("event"), null);
  assert.equal(categoryImageUrl(undefined), null, "Personal pins without a category use the generic pin fallback");
});
