import assert from "node:assert/strict";
import test from "node:test";
import { buildGameSearch, moveSearchBlock } from "../src/features/search-builder/gameSearch.js";

const keyword = (word, options = {}) => ({ id: word, type: "keyword", keyword: word, join: "and", ...options });
const range = (min, max) => ({ type: "range", min, max });
const group = (id, children, options = {}) => ({ id, type: "group", join: "and", children, ...options });

test("builds the grouped game command with exact Bud and completed hearts", () => {
  const blocks = [
    group("colors", [keyword("red"), keyword("yellow", { join: "or" })]),
    keyword("bud", { exact: true }),
    range("4", "8"),
  ];
  assert.deepEqual(buildGameSearch(blocks), { command: "(red|yellow)&=bud&4-8", incomplete: false });
});

test("quotes literal text, negates groups and supports open heart bounds", () => {
  const text = { type: "text", value: " Library & Bookstore ", exact: true };
  const availability = group("availability", [keyword("busy"), keyword("squad", { join: "or" })], { exclude: true });
  assert.deepEqual(buildGameSearch([text, availability, range("4", "")]), {
    command: '="Library & Bookstore"&!(busy|squad)&4-', incomplete: false,
  });
  assert.equal(buildGameSearch([range("", "3"), range("0", "0")]).command, "-3&0");
});

test("flags incomplete or malformed tiles while leaving the other terms visible", () => {
  for (const invalid of [range("4", "2"), range("9", ""), range("", ""), {type: "text", value: 'bad"phrase'}, group("empty", [])]) {
    assert.deepEqual(buildGameSearch([keyword("red"), invalid]), { command: "red", incomplete: true });
  }
});

test("moves filters between groups and preserves OR when swapping the first two tiles", () => {
  const blocks = [group("colors", [keyword("red"), keyword("yellow", { join: "or" })]), keyword("bud")];
  const reordered = moveSearchBlock(blocks, "yellow", "colors", "red");
  assert.equal(buildGameSearch(reordered).command, "(yellow|red)&bud");
  const moved = moveSearchBlock(reordered, "bud", "colors");
  assert.equal(buildGameSearch(moved).command, "(yellow|red&bud)");
  assert.equal(buildGameSearch(moveSearchBlock(moved, "bud", null, "colors")).command, "bud&(yellow|red)");
  assert.equal(moveSearchBlock(blocks, "colors", "colors"), blocks);
  assert.equal(moveSearchBlock(blocks, "bud", "missing"), blocks);
  assert.equal(moveSearchBlock(blocks, "bud", "colors", "missing"), blocks);
});
