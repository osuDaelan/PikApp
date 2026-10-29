import test from "node:test";
import assert from "node:assert/strict";
import { compareMushroomGroups, addMushroomToGroup, removeMushroomFromGroup, setMushroomGroupStars } from "../src/features/mushrooms/groups.js";
import { MUSHROOM_REFERENCE_ROWS } from "../src/features/mushrooms/selection.js";

const choice = (id, typeId = "blue", size = "small", stars = 4, label = "") => ({ id, typeId, size, stars, label });

test("the full combination totals screenshot quantities by color and keeps Special Nectar separate", () => {
  const choices = [choice(1, "gray", "large"), choice(2, "gray", "large"), choice(3, "gray", "large"),
    choice(4, "fire", "large"), choice(5, "white", "large"), choice(6, "blue", "large")];
  const expected = { byColor: { white: { min: 480, max: 1996 }, yellow: { min: 0, max: 0 },
    red: { min: 174, max: 366 }, blue: { min: 119, max: 270 } }, special: 7 };
  assert.deepEqual(compareMushroomGroups(choices, ["white", "red", "blue"]).totals, expected);
  assert.deepEqual(compareMushroomGroups(choices, ["red"], "max").totals, expected);
  assert.deepEqual(compareMushroomGroups(choices, []).totals, expected);
});

test("combined totals follow mixed-star edits, quantity changes and removals", () => {
  let choices = [choice(1, "water", "normal", 4), choice(2, "water", "normal", 3)];
  let totals = compareMushroomGroups(choices, ["blue"]).totals;
  assert.deepEqual([totals.byColor.blue.min, totals.byColor.blue.max, totals.special], [86, 191, 1]);
  choices = addMushroomToGroup(choices, "water/normal"); // Copies the last three-star mushroom.
  totals = compareMushroomGroups(choices, ["blue"]).totals;
  assert.deepEqual([totals.byColor.blue.min, totals.byColor.blue.max, totals.special], [127, 278, 1]);
  choices = setMushroomGroupStars(choices, "water/normal", 4);
  totals = compareMushroomGroups(choices, ["blue"]).totals;
  assert.deepEqual([totals.byColor.blue.min, totals.byColor.blue.max, totals.special], [135, 312, 3]);
  choices = removeMushroomFromGroup(choices, "water/normal");
  totals = compareMushroomGroups(choices, ["blue"]).totals;
  assert.deepEqual([totals.byColor.blue.min, totals.byColor.blue.max, totals.special], [90, 208, 2]);
});

test("an empty combination resets every color and Special Nectar to zero", () => {
  assert.deepEqual(compareMushroomGroups([], []).totals, { byColor: {
    white: { min: 0, max: 0 }, yellow: { min: 0, max: 0 }, red: { min: 0, max: 0 }, blue: { min: 0, max: 0 },
  }, special: 0 });
});

test("quantities sum nectar bounds and change the winning option", () => {
  let choices = [choice(1, "water", "normal"), choice(2)];
  choices = addMushroomToGroup(choices, "blue/small");
  const two = compareMushroomGroups(choices, ["blue"]);
  assert.deepEqual(two.bestIds, ["water/normal"]);
  assert.deepEqual(two.rows.map(row => [row.id, row.quantity, row.selectedMin, row.selectedMax]), [
    ["water/normal", 1, 45, 104], ["blue/small", 2, 20, 46],
  ]);
  for (let i = 0; i < 3; i++) choices = addMushroomToGroup(choices, "blue/small");
  const five = compareMushroomGroups(choices, ["blue"]);
  assert.deepEqual(five.bestIds, ["blue/small"]);
  assert.deepEqual([five.rows[0].selectedMin, five.rows[0].selectedMax], [50, 115]);
});

test("mixed stars sum each actual mushroom, including four-star-only Special Nectar", () => {
  const result = compareMushroomGroups([choice(1, "water", "normal", 4), choice(2, "water", "normal", 3)], ["blue"]);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].stars, null);
  assert.equal(result.rows[0].quantity, 2);
  assert.deepEqual([result.rows[0].selectedMin, result.rows[0].selectedMax, result.rows[0].special], [86, 191, 1]);
  assert.deepEqual(result.rows[0].members.map(member => member.stars), [4, 3]);
});

test("group totals respect color filters, ties and zero-yield recommendations", () => {
  const choices = [choice(1), choice(2), choice(3, "purple"), choice(4, "purple"), choice(5, "red")];
  const blue = compareMushroomGroups(choices, ["blue", "blue"]);
  assert.deepEqual(blue.bestIds, ["blue/small", "purple/small"]);
  assert.deepEqual(blue.winners.blue, ["blue/small", "purple/small"]);
  assert.equal(blue.rows.find(row => row.id === "red/small").selectedMax, 0);
  const white = compareMushroomGroups(choices, ["white"]);
  assert.deepEqual(white.bestIds, []);
  assert.deepEqual(white.winners.white, []);
  assert.deepEqual(compareMushroomGroups(choices, ["blue", "red"]).bestIds, ["red/small"]);
});

test("group ranking supports maximum totals and retains editable groups with no colors", () => {
  const choices = [choice(1, "white", "large"), choice(2, "red", "large")];
  assert.deepEqual(compareMushroomGroups(choices, ["white", "red"]).bestIds, ["red/large"]);
  assert.deepEqual(compareMushroomGroups(choices, ["white", "red"], "max").bestIds, ["white/large"]);
  const noColors = compareMushroomGroups(choices, []);
  assert.equal(noColors.rows.length, 2);
  assert(noColors.rows.every(row => row.selectedMin === 0 && row.selectedMax === 0));
  assert.deepEqual(noColors.bestIds, []);
  assert.throws(() => compareMushroomGroups(choices, ["green"]));
  assert.throws(() => compareMushroomGroups(choices, ["blue"], "average"));
  assert.deepEqual(compareMushroomGroups([], ["blue"]).rows, []);
});

test("group edits preserve individual IDs, names, other groups and input arrays", () => {
  const choices = Object.freeze([Object.freeze(choice(1, "blue", "small", 3, "First")), Object.freeze(choice(2, "blue", "small", 4, "Second")), Object.freeze(choice(3, "water", "normal", 2, "Water"))]);
  const changed = setMushroomGroupStars(choices, "blue/small", 1);
  assert.deepEqual(changed.map(row => [row.id, row.stars, row.label]), [[1, 1, "First"], [2, 1, "Second"], [3, 2, "Water"]]);
  assert.equal(changed[2], choices[2]);
  assert.deepEqual(choices.map(row => row.stars), [3, 4, 2]);
  const removed = removeMushroomFromGroup(choices, "blue/small");
  assert.deepEqual(removed.map(row => row.id), [1, 3]);
  assert.equal(removeMushroomFromGroup(removed, "blue/small").length, 1);
  assert.equal(removeMushroomFromGroup(choices, "unknown"), choices);
  assert.throws(() => setMushroomGroupStars(choices, "blue/small", 0));
});

test("adding copies passes the former cap and removal still permits adding again", () => {
  let choices = [choice(1)];
  for (let i = 0; i < 249; i++) choices = addMushroomToGroup(choices, "blue/small");
  assert.equal(choices.length, 250);
  assert.equal(new Set(choices.map(row => row.id)).size, 250);
  const result = compareMushroomGroups(choices, ["blue"]);
  assert.deepEqual([result.rows[0].quantity, result.totals.byColor.blue.min, result.totals.byColor.blue.max], [250, 2500, 5750]);
  assert.equal(addMushroomToGroup(choices, "unknown"), choices);
  choices = removeMushroomFromGroup(choices, "blue/small");
  assert.equal(addMushroomToGroup(choices, "blue/small").length, 250);
});

test("type/size group identity stays stable when ranking changes and reference data remains intact", () => {
  const reference = JSON.stringify(MUSHROOM_REFERENCE_ROWS);
  const choices = [choice(1), choice(2, "blue", "normal")];
  const before = compareMushroomGroups(choices, ["blue"]);
  const after = compareMushroomGroups(addMushroomToGroup(choices, "blue/small"), ["blue"]);
  assert.deepEqual(new Set(before.rows.map(row => row.id)), new Set(after.rows.map(row => row.id)));
  assert.deepEqual(before.rows.map(row => row.id), ["blue/normal", "blue/small"]);
  assert.equal(JSON.stringify(MUSHROOM_REFERENCE_ROWS), reference);
});

test("large quantities keep full nectar and Special Nectar totals without truncation", () => {
  const choices = Array.from({ length: 20 }, (_, index) => choice(index + 1, "white", "large"));
  const result = compareMushroomGroups(choices, ["white"]);
  assert.deepEqual([result.rows[0].quantity, result.rows[0].selectedMin, result.rows[0].selectedMax, result.rows[0].special], [20, 2400, 9980, 20]);
});
