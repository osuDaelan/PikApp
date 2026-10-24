import test from "node:test";
import assert from "node:assert/strict";
import { MUSHROOM_TYPES, NECTAR_COLORS, FRUITS, MAX_MUSHROOM_CHOICES } from "../src/features/mushrooms/data.js";
import { REWARD_RECIPES } from "../src/features/mushrooms/rewardRecipes.js";
import { availableSizes, fruitPool, mushroomReward, updateMushroomChoice,
  addMushroomChoice, compareMushrooms, nectarRange } from "../src/features/mushrooms/calculations.js";
import { sectionFromHash } from "../src/shared/sections.js";
import { MUSHROOM_REFERENCE_ROWS, filterMushrooms, toggleMushroomSelection } from "../src/features/mushrooms/selection.js";

const choice = (id, typeId, size = "normal", stars = 4, label = "") => ({ id, typeId, size, stars, label });
const bounds = (type, size, stars = 4) => {
  const reward = mushroomReward(type, size, stars);
  return [reward.min, reward.max, reward.special];
};

test("all 34 supported combinations have four valid outcomes with complete carry counts", () => {
  assert.equal(MUSHROOM_TYPES.length, 13);
  assert.equal(REWARD_RECIPES.length, 34);
  assert.equal(new Set(REWARD_RECIPES.map(row => `${row.typeId}/${row.size}`)).size, 34);
  for (const type of MUSHROOM_TYPES) {
    const sizes = type.kind === "regular" ? ["small", "normal", "large"] : ["normal", "large"];
    assert.deepEqual(availableSizes(type.id), sizes);
    for (const size of sizes) {
      const recipe = REWARD_RECIPES.find(row => row.typeId === type.id && row.size === size);
      assert.equal(recipe.outcomes.length, 4);
      for (const [index, outcome] of recipe.outcomes.entries()) {
        const reward = mushroomReward(type.id, size, index + 1);
        assert.ok(reward.min > 0 && reward.max >= reward.min);
        assert.equal(reward.byColor[type.color].min, reward.min);
        assert.equal(reward.byColor[type.color].max, reward.max);
        let carriers = 1 + outcome.special; // postcard plus Special fruits
        for (const [id, count] of Object.entries(outcome.fruits)) {
          assert.ok(Number.isInteger(count) && count > 0);
          carriers += count * ({ small: 1, large: 6, giant: 8 }[FRUITS[id].size]);
        }
        assert.equal(outcome.minPikmin, carriers, `${type.id}/${size}/${index + 1} carry count`);
        assert.ok(index === 0 ? outcome.score === 0 : outcome.score > recipe.outcomes[index - 1].score);
        assert.equal(outcome.special, index < 3 ? 0 : type.kind === "elemental" ? (size === "large" ? 2 : 1) : (size === "large" ? 1 : 0));
      }
    }
  }
});

test("fruit icons resolve all documented fruits of the same size and color", () => {
  assert.deepEqual(fruitPool("muscat-grapes"), { size: "giant", color: "white", min: 33, max: 147, fruits: ["Melon", "Muscat grapes"] });
  assert.deepEqual(fruitPool("lemon"), { size: "large", color: "yellow", min: 14, max: 53, fruits: ["Lemon", "Orange"] });
  assert.deepEqual(fruitPool("cherry"), { size: "small", color: "red", min: 1, max: 7, fruits: ["Cherry", "Strawberry"] });
  assert.equal(fruitPool("green-apple").max, 58);
  assert.throws(() => fruitPool("missing"));
});

test("regular nectar ranges preserve source exceptions and keep Special Nectar separate", () => {
  assert.deepEqual(bounds("red", "small", 1), [2, 14, 0]);
  assert.deepEqual(bounds("white", "small"), [25, 74, 0]);
  assert.deepEqual(bounds("white", "normal", 2), [48, 140, 0]);
  assert.deepEqual(bounds("white", "normal", 3), [41, 179, 0]);
  assert.deepEqual(bounds("white", "large"), [120, 499, 1]);
  assert.deepEqual(bounds("yellow", "large"), [194, 452, 1]);
  assert.deepEqual(bounds("red", "large"), [194, 420, 1]);
  assert.deepEqual(bounds("blue", "normal"), [45, 104, 0]);
  assert.deepEqual(bounds("ice-blue", "normal"), [24, 63, 0]);
  assert.deepEqual(bounds("blue", "large"), [119, 270, 1]);
});

test("elemental four-star yields use their own recipes rather than regular mushrooms", () => {
  for (const [type, normal, large] of [
    ["fire", [78, 176, 1], [174, 366, 2]],
    ["water", [45, 104, 1], [111, 249, 2]],
    ["electric", [74, 186, 1], [180, 399, 2]],
    ["crystal", [54, 205, 1], [99, 441, 2]],
    ["poisonous", [54, 205, 1], [99, 441, 2]],
  ]) {
    assert.deepEqual(bounds(type, "normal"), normal);
    assert.deepEqual(bounds(type, "large"), large);
  }
});

test("unsupported sizes, types and star ratings cannot produce plausible rewards", () => {
  for (const [type, size, stars] of [["event", "normal", 4], ["red", "giant", 4], ["fire", "small", 4],
    ["red", "normal", 0], ["red", "normal", 5], ["red", "normal", 2.5], ["red", "normal", "4"]]) {
    assert.throws(() => mushroomReward(type, size, stars));
  }
});

test("the full reference keeps type/size order, all star ratings and unchanged values after selection", () => {
  const original = JSON.stringify(MUSHROOM_REFERENCE_ROWS);
  assert.equal(MUSHROOM_REFERENCE_ROWS.length, 34);
  assert.deepEqual(MUSHROOM_REFERENCE_ROWS.slice(0, 3).map(row => row.label), ["Small Red", "Normal Red", "Large Red"]);
  assert.deepEqual(new Set(MUSHROOM_REFERENCE_ROWS.map(row => row.key)), new Set(REWARD_RECIPES.map(row => `${row.typeId}/${row.size}`)));
  for (const row of MUSHROOM_REFERENCE_ROWS) assert.deepEqual(row.rewards.map(reward => reward.stars), [1, 2, 3, 4]);
  compareMushrooms([choice(1, "red")], ["red"], "max");
  filterMushrooms("normal water");
  toggleMushroomSelection([], "blue", "small");
  assert.equal(JSON.stringify(MUSHROOM_REFERENCE_ROWS), original);
});

test("minimum and maximum ranking can recommend different available mushrooms", () => {
  const choices = [choice(1, "white", "large"), choice(2, "red", "large")];
  const colors = NECTAR_COLORS.map(color => color.id);
  assert.deepEqual(compareMushrooms(choices, colors).bestIds, [2]);
  assert.deepEqual(compareMushrooms(choices, colors, "max").bestIds, [1]);
  assert.deepEqual(compareMushrooms(choices, ["white"]).bestIds, [1]);
});

test("only desired colors count, color winners stay separate and zeros are never recommended", () => {
  const choices = [choice(1, "blue"), choice(2, "red"), choice(3, "yellow")];
  const result = compareMushrooms(choices, ["blue", "red", "blue"]);
  assert.deepEqual(result.bestIds, [2]);
  assert.deepEqual(result.winners, { blue: [1], red: [2] });
  assert.equal(result.rows.find(row => row.id === 1).selectedMin, 45);
  assert.equal(result.rows.find(row => row.id === 3).selectedMax, 0);
  assert.deepEqual(compareMushrooms(choices, ["white"]).winners.white, []);
  assert.deepEqual(compareMushrooms(choices, ["white"]).bestIds, []);
  assert.deepEqual(compareMushrooms(choices, []), { rows: [], winners: {}, bestIds: [] });
  assert.deepEqual(compareMushrooms([], ["blue"]).rows, []);
  assert.throws(() => compareMushrooms(choices, ["green"]));
  assert.throws(() => compareMushrooms(choices, ["blue"], "average"));
});

test("ties retain each option's own range and secondary bounds break display-order ties", () => {
  const result = compareMushrooms([choice(1, "red", "large"), choice(2, "yellow", "large")], ["red", "yellow"]);
  assert.deepEqual(result.bestIds, [2, 1]);
  assert.deepEqual(result.rows.map(row => [row.selectedMin, row.selectedMax]), [[194, 452], [194, 420]]);
  const blueTies = compareMushrooms([choice(5, "blue"), choice(3, "purple"), choice(7, "red")], ["blue"]);
  assert.deepEqual(blueTies.winners.blue, [3, 5]);
  assert.deepEqual(blueTies.bestIds, [3, 5]);
});

test("adding duplicates, editing and ranking never mutate existing choices", () => {
  const original = Object.freeze(choice(1, "red", "small", 2, "Original"));
  const choices = Object.freeze([original]);
  const added = addMushroomChoice(choices, { ...original, id: 1 });
  assert.deepEqual(added.map(row => row.id), [1, 2]);
  assert.deepEqual(added.map(row => row.typeId), ["red", "red"]);
  const updated = updateMushroomChoice(original, { typeId: "fire", label: "x".repeat(80) });
  assert.equal(updated.size, "normal");
  assert.equal(updated.stars, 2);
  assert.equal(updated.label.length, 40);
  assert.equal(original.size, "small");
  compareMushrooms(choices, ["red"]);
  assert.equal(choices[0], original);
  assert.throws(() => updateMushroomChoice(original, { typeId: "invalid" }));
  assert.throws(() => updateMushroomChoice(original, { stars: 0 }));
});

test("comparison inputs stay bounded and generated labels remain useful", () => {
  let choices = [];
  for (let index = 0; index < MAX_MUSHROOM_CHOICES + 5; index++) choices = addMushroomChoice(choices, choice(0, "blue"));
  assert.equal(choices.length, 20);
  assert.equal(new Set(choices.map(row => row.id)).size, 20);
  assert.equal(compareMushrooms(choices, ["blue"]).rows[0].label, "Normal Blue");
  assert.equal(nectarRange(2, 2), "2");
  assert.equal(nectarRange(2, 8), "2–8");
  assert.equal(sectionFromHash("#mushrooms"), "mushrooms");
});

test("mushroom search supports unordered terms, comma alternatives, type aliases and no matches", () => {
  assert.equal(filterMushrooms("  "), MUSHROOM_REFERENCE_ROWS);
  assert.deepEqual(filterMushrooms("WATER NORMAL").map(row => row.key), ["water/normal"]);
  assert.deepEqual(filterMushrooms("small blue, normal yellow, normal water").map(row => row.key), ["yellow/normal", "blue/small", "ice-blue/small", "water/normal"]);
  assert.deepEqual(filterMushrooms("normal ice-blue").map(row => row.key), ["ice-blue/normal"]);
  assert.deepEqual(filterMushrooms("iceblue normal").map(row => row.key), ["ice-blue/normal"]);
  assert.equal(filterMushrooms("elemental").length, 10);
  assert.deepEqual(filterMushrooms("small water"), []);
  assert.equal(filterMushrooms(" ".repeat(160) + "missing").length, 34);
});

test("checkbox selection from either picker adds/removes the same type and size without mutating progress", () => {
  const first = Object.freeze(toggleMushroomSelection([], "blue", "small", 3).map(Object.freeze));
  const added = toggleMushroomSelection(first, "yellow", "normal", 2);
  const three = toggleMushroomSelection(added, "water", "normal");
  assert.deepEqual(three.map(row => [row.typeId, row.size, row.stars]), [["blue", "small", 3], ["yellow", "normal", 2], ["water", "normal", 4]]);
  const removed = toggleMushroomSelection(three, "blue", "small");
  assert.equal(removed.length, 2);
  assert.equal(first[0].stars, 3);
  assert.equal(compareMushrooms(three, ["blue"]).rows.length, 3);
  assert.equal(filterMushrooms("fire").length, 2);
  assert.equal(three.length, 3); // filtering has no effect on selected choices
});

test("unchecking removes all matching copies but individual removal can retain the checked type", () => {
  let choices = toggleMushroomSelection([], "water", "normal");
  choices = addMushroomChoice(choices, { ...choices[0], stars: 3 });
  choices = toggleMushroomSelection(choices, "water", "large");
  const individualRemoval = choices.filter(row => row.id !== 1);
  assert.ok(individualRemoval.some(row => row.typeId === "water" && row.size === "normal"));
  assert.deepEqual(toggleMushroomSelection(choices, "water", "normal").map(row => row.size), ["large"]);
});

test("checkbox limits still allow deselection and reject unavailable combinations", () => {
  let choices = [];
  for (const row of MUSHROOM_REFERENCE_ROWS.slice(0, MAX_MUSHROOM_CHOICES)) choices = toggleMushroomSelection(choices, row.type.id, row.size);
  assert.equal(choices.length, MAX_MUSHROOM_CHOICES);
  const next = MUSHROOM_REFERENCE_ROWS[MAX_MUSHROOM_CHOICES];
  assert.equal(toggleMushroomSelection(choices, next.type.id, next.size), choices);
  assert.equal(toggleMushroomSelection(choices, choices[0].typeId, choices[0].size).length, MAX_MUSHROOM_CHOICES - 1);
  assert.throws(() => toggleMushroomSelection([], "fire", "small"));
  assert.throws(() => toggleMushroomSelection([], "water", "normal", 5));
});
