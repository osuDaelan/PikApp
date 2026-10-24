import test from "node:test";
import assert from "node:assert/strict";
import { SECTIONS, sectionFromHash } from "../src/shared/sections.js";

test("navigation orders the dedicated pages with Calculator last", () => {
  assert.deepEqual(SECTIONS.map(section => section.id), ["decor", "map", "mushrooms", "calculator"]);
  assert.deepEqual(SECTIONS.map(section => section.label), ["Decor", "Map", "Mushroom", "Calculator"]);
});

test("section links retain legacy calculator URLs and default to Decor", () => {
  for (const section of SECTIONS) assert.equal(sectionFromHash(`#${section.id}`), section.id);
  assert.equal(sectionFromHash("#now"), "calculator");
  assert.equal(sectionFromHash(""), "decor");
  assert.equal(sectionFromHash("#unknown"), "decor");
});
