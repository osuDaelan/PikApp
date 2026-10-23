import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES } from "../src/features/decor/catalog.js";
import { decorId } from "../src/features/decor/collection.js";
import { getDecorImage, decorImageUrl } from "../src/features/decor/decorImages.js";

test("every existing checklist entry resolves to its own verified PNG and source record", () => {
  const provenance = JSON.parse(readFileSync(new URL("../docs/decor-image-sources.json", import.meta.url), "utf8"));
  const sources = new Map(provenance.images.map(image => [image.id, image]));
  const usedFiles = new Set();
  let entries = 0;
  for (const group of [...DECOR_LOCATIONS, ...DECOR_SPECIAL_CATEGORIES]) {
    for (const costume of group.costumes) {
      for (const variant of costume.designs || costume.colors) {
        const id = decorId(group.location, costume.name, variant);
        const image = getDecorImage(id);
        assert.ok(image, `No image for ${id}`);
        assert.ok(image.alt.length > 0);
        assert.equal(usedFiles.has(image.file), false, `Unexpected artwork reuse: ${image.file}`);
        usedFiles.add(image.file);
        const source = sources.get(id);
        assert.ok(source, `No source for ${id}`);
        assert.equal(image.file, source.file);
        assert.equal(new URL(source.originalUrl).hostname, "pikmin.wiki.gallery");
        const bytes = readFileSync(new URL(`../public/images/decor/${image.file}`, import.meta.url));
        assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", id);
        assert.equal(bytes.readUInt32BE(16), image.width, id);
        assert.equal(bytes.readUInt32BE(20), image.height, id);
        assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, id);
        entries++;
      }
    }
  }
  assert.equal(entries, 975);
  assert.equal(sources.size, entries);
  assert.equal(getDecorImage("unknown_decor"), null);
});

test("rare, numbered, and representative event mappings stay distinct and respect base paths", () => {
  const base = getDecorImage(decorId("Restaurant", "Chef Hat", "Ice"));
  const rare = getDecorImage(decorId("Restaurant", "Chef Hat (Rare)", "Ice"));
  assert.notEqual(base.file, rare.file);
  const battery = getDecorImage(decorId("Appliances Store", "Battery", "6"));
  assert.match(battery.alt, /design 6/);
  const hanafuda = getDecorImage(decorId("Hanafuda Card", "Hanafuda Card (Volume 1)", "Red"));
  assert.equal(hanafuda.representative, true);
  assert.equal(decorImageUrl(base, "/PikApp/"), `/PikApp/images/decor/${base.file}`);
});
