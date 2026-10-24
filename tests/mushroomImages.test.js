import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { MUSHROOM_TYPES } from "../src/features/mushrooms/data.js";
import { mushroomImageUrl } from "../src/features/mushrooms/images.js";

test("every supported mushroom type has a bounded, verified local PNG and Pikipedia source", () => {
  const inventory = JSON.parse(readFileSync(new URL("../docs/mushroom-image-sources.json", import.meta.url), "utf8"));
  const sources = new Map(inventory.images.map(image => [image.id, image]));
  assert.equal(sources.size, 13);
  assert.deepEqual(new Set(sources.keys()), new Set(MUSHROOM_TYPES.map(type => type.id)));
  let total = 0;
  for (const type of MUSHROOM_TYPES) {
    const image = sources.get(type.id);
    assert.equal(image.file, `${type.id}.png`);
    assert.equal(new URL(image.originalUrl).hostname, "pikmin.wiki.gallery");
    assert.equal(new URL(image.sourcePage).hostname, "www.pikminwiki.com");
    const bytes = readFileSync(new URL(`../public/images/mushrooms/${image.file}`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(bytes.readUInt32BE(16), image.width);
    assert.equal(bytes.readUInt32BE(20), image.height);
    assert.ok(image.width > 0 && image.width <= 96 && image.height > 0 && image.height <= 96);
    assert.equal(bytes.length, image.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), image.sha256);
    total += bytes.length;
  }
  assert.ok(total < 250_000, "Type icons should remain small enough for lightweight reuse");
});

test("mushroom images use the deployment base and reject unknown type paths", () => {
  assert.equal(mushroomImageUrl("red"), "/images/mushrooms/red.png");
  assert.equal(mushroomImageUrl("ice-blue", "/PikApp/"), "/PikApp/images/mushrooms/ice-blue.png");
  assert.equal(mushroomImageUrl("water", "/PikApp/"), "/PikApp/images/mushrooms/water.png");
  assert.equal(mushroomImageUrl("../../anything"), null);
  assert.equal(mushroomImageUrl("event"), null);
});
