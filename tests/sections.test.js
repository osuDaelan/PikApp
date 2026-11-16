import test from "node:test";
import assert from "node:assert/strict";
import { SECTIONS, sectionFromHash, cleanSectionUrl, sectionUrl } from "../src/shared/sections.js";

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

const oldMapUrl = "https://example.github.io/PikApp/?mapLat=42.36&mapLng=-71.06&mapZoom=16&lat=42&lng=-71&zoom=14&keep=first&keep=second#map";

test("non-map navigation removes map parameters while retaining other URL data", () => {
  for (const section of ["decor", "mushrooms", "calculator"]) {
    const url = new URL(sectionUrl(oldMapUrl, section));
    assert.equal(url.pathname, "/PikApp/");
    assert.equal(url.hash, `#${section}`);
    assert.deepEqual([...url.searchParams.keys()], ["keep", "keep"]);
    assert.deepEqual(url.searchParams.getAll("keep"), ["first", "second"]);
  }
  assert.equal(new URL(sectionUrl(oldMapUrl, "now")).hash, "#calculator");
  assert.equal(new URL(sectionUrl(oldMapUrl, "unknown")).hash, "#decor");
});

test("Map links retain their viewport and unrelated query parameters", () => {
  const url = new URL(sectionUrl(oldMapUrl.replace("#map", "#decor"), "map"));
  assert.equal(url.hash, "#map");
  assert.equal(url.searchParams.get("mapLat"), "42.36");
  assert.equal(url.searchParams.get("mapLng"), "-71.06");
  assert.equal(url.searchParams.get("mapZoom"), "16");
  assert.deepEqual(url.searchParams.getAll("keep"), ["first", "second"]);
  assert.equal(cleanSectionUrl(oldMapUrl), oldMapUrl);
});

test("startup and history cleanup preserve legacy hashes and avoid adding a default hash", () => {
  for (const hash of ["#decor", "#mushrooms", "#calculator", "#now", "#unknown", ""]) {
    const url = new URL(cleanSectionUrl(oldMapUrl.replace("#map", hash)));
    assert.equal(url.hash, hash);
    assert.deepEqual([...url.searchParams.keys()], ["keep", "keep"]);
  }
  assert.equal(cleanSectionUrl("https://example.github.io/PikApp/?release=test"), "https://example.github.io/PikApp/?release=test");
});
