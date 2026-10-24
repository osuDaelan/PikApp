import { FRUITS, MUSHROOM_TYPES, NECTAR_COLORS, MAX_MUSHROOM_CHOICES } from "./data.js";
import { REWARD_RECIPES } from "./rewardRecipes.js";

const types = new Map(MUSHROOM_TYPES.map(type => [type.id, type]));
const recipes = new Map(REWARD_RECIPES.map(recipe => [`${recipe.typeId}/${recipe.size}`, recipe]));

export function availableSizes(typeId) {
  if (!types.has(typeId)) throw new Error("Choose a supported mushroom type.");
  return types.get(typeId).kind === "elemental" ? ["normal", "large"] : ["small", "normal", "large"];
}

export function fruitPool(displayFruitId) {
  const fruit = FRUITS[displayFruitId];
  if (!fruit) throw new Error("Unknown fruit in the reward data.");
  const alternatives = Object.values(FRUITS).filter(value => value.size === fruit.size && value.color === fruit.color);
  return { size: fruit.size, color: fruit.color, min: Math.min(...alternatives.map(value => value.min)),
    max: Math.max(...alternatives.map(value => value.max)), fruits: alternatives.map(value => value.label) };
}

export function mushroomReward(typeId, size, stars) {
  const recipe = recipes.get(`${typeId}/${size}`);
  if (!recipe || !Number.isInteger(stars) || stars < 1 || stars > 4) throw new Error("Choose a supported mushroom, size and star rating.");
  const outcome = recipe.outcomes[stars - 1];
  const byColor = Object.fromEntries(NECTAR_COLORS.map(color => [color.id, { min: 0, max: 0 }]));
  const fruitGroups = Object.entries(outcome.fruits).map(([id, count]) => {
    const pool = fruitPool(id);
    byColor[pool.color].min += pool.min * count;
    byColor[pool.color].max += pool.max * count;
    return { ...pool, count };
  });
  return { type: types.get(typeId), size, stars, byColor, fruitGroups,
    min: Object.values(byColor).reduce((sum, value) => sum + value.min, 0),
    max: Object.values(byColor).reduce((sum, value) => sum + value.max, 0),
    special: outcome.special, minPikmin: outcome.minPikmin, score: outcome.score };
}

export function referenceRewards(stars = 4) {
  return REWARD_RECIPES.map(recipe => ({ id: `${recipe.typeId}/${recipe.size}`, ...mushroomReward(recipe.typeId, recipe.size, stars) }))
    .sort((a, b) => a.max - b.max || a.min - b.min || a.id.localeCompare(b.id));
}

export function updateMushroomChoice(choice, patch) {
  const next = { ...choice, ...patch };
  const sizes = availableSizes(next.typeId);
  if (!sizes.includes(next.size)) next.size = "normal";
  if (!Number.isInteger(next.stars) || next.stars < 1 || next.stars > 4) throw new Error("Choose a star rating from 1 to 4.");
  next.label = String(next.label || "").slice(0, 40);
  return next;
}

export function addMushroomChoice(choices, choice) {
  if (choices.length >= MAX_MUSHROOM_CHOICES) return choices;
  const id = Math.max(0, ...choices.map(value => value.id)) + 1;
  return [...choices, updateMushroomChoice({ ...choice, id }, {})];
}

export function compareMushrooms(choices, colors, sortBy = "min") {
  if (!["min", "max"].includes(sortBy)) throw new Error("Choose minimum or maximum nectar ranking.");
  const selected = [...new Set(colors)];
  if (selected.some(id => !NECTAR_COLORS.some(color => color.id === id))) throw new Error("Choose a supported nectar color.");
  if (!selected.length) return { rows: [], winners: {}, bestIds: [] };
  const other = sortBy === "min" ? "max" : "min";
  const rows = choices.map(choice => {
    const reward = mushroomReward(choice.typeId, choice.size, choice.stars);
    return { ...reward, id: choice.id, label: choice.label.trim() || `${reward.type.label} · ${choice.size}`,
      selectedMin: selected.reduce((sum, color) => sum + reward.byColor[color].min, 0),
      selectedMax: selected.reduce((sum, color) => sum + reward.byColor[color].max, 0) };
  }).sort((a, b) => b[sortBy === "min" ? "selectedMin" : "selectedMax"] - a[sortBy === "min" ? "selectedMin" : "selectedMax"]
    || b[other === "min" ? "selectedMin" : "selectedMax"] - a[other === "min" ? "selectedMin" : "selectedMax"] || a.id - b.id);
  const metric = sortBy === "min" ? "selectedMin" : "selectedMax";
  const best = Math.max(0, ...rows.map(row => row[metric]));
  const winners = Object.fromEntries(selected.map(color => {
    const value = Math.max(0, ...rows.map(row => row.byColor[color][sortBy]));
    return [color, value > 0 ? rows.filter(row => row.byColor[color][sortBy] === value).map(row => row.id) : []];
  }));
  return { rows, winners, bestIds: best > 0 ? rows.filter(row => row[metric] === best).map(row => row.id) : [] };
}

export function nectarRange(min, max) { return min === max ? String(min) : `${min}–${max}`; }
