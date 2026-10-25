import { NECTAR_COLORS } from "./data.js";
import { addMushroomChoice, compareMushrooms, updateMushroomChoice } from "./calculations.js";

export const mushroomGroupKey = choice => `${choice.typeId}/${choice.size}`;

// Keep the individual choices intact: mixed stars and optional names belong to
// actual mushrooms, while each comparison option totals one type/size group.
export function compareMushroomGroups(choices, colors, sortBy = "min") {
  const selected = [...new Set(colors)];
  if (selected.some(id => !NECTAR_COLORS.some(color => color.id === id))) throw new Error("Choose a supported nectar color.");
  const individual = compareMushrooms(choices, NECTAR_COLORS.map(color => color.id), sortBy);
  const byId = new Map(individual.rows.map(row => [row.id, row]));
  const groups = new Map();
  for (const choice of choices) {
    const key = mushroomGroupKey(choice), member = byId.get(choice.id);
    if (!groups.has(key)) groups.set(key, {
      id: key, type: member.type, size: member.size,
      label: `${member.size[0].toUpperCase()}${member.size.slice(1)} ${member.type.label}`,
      members: [], byColor: Object.fromEntries(NECTAR_COLORS.map(color => [color.id, { min: 0, max: 0 }])), special: 0,
    });
    const group = groups.get(key);
    group.members.push(member);
    group.special += member.special;
    for (const color of NECTAR_COLORS) {
      group.byColor[color.id].min += member.byColor[color.id].min;
      group.byColor[color.id].max += member.byColor[color.id].max;
    }
  }
  const metric = sortBy === "min" ? "selectedMin" : "selectedMax";
  const other = sortBy === "min" ? "selectedMax" : "selectedMin";
  const rows = [...groups.values()].map(group => ({ ...group,
    quantity: group.members.length,
    stars: group.members.every(member => member.stars === group.members[0].stars) ? group.members[0].stars : null,
    selectedMin: selected.reduce((sum, color) => sum + group.byColor[color].min, 0),
    selectedMax: selected.reduce((sum, color) => sum + group.byColor[color].max, 0),
  })).sort((a, b) => b[metric] - a[metric] || b[other] - a[other] || a.members[0].id - b.members[0].id);
  const best = Math.max(0, ...rows.map(row => row[metric]));
  const winners = Object.fromEntries(selected.map(color => {
    const value = Math.max(0, ...rows.map(row => row.byColor[color][sortBy]));
    return [color, value > 0 ? rows.filter(row => row.byColor[color][sortBy] === value).map(row => row.id) : []];
  }));
  return { rows, winners, bestIds: best > 0 ? rows.filter(row => row[metric] === best).map(row => row.id) : [] };
}

export function addMushroomToGroup(choices, key) {
  for (let index = choices.length - 1; index >= 0; index--) {
    if (mushroomGroupKey(choices[index]) === key) return addMushroomChoice(choices, choices[index]);
  }
  return choices;
}

export function removeMushroomFromGroup(choices, key) {
  for (let index = choices.length - 1; index >= 0; index--) {
    if (mushroomGroupKey(choices[index]) === key) return choices.filter((_, position) => position !== index);
  }
  return choices;
}

export function setMushroomGroupStars(choices, key, stars) {
  if (!Number.isInteger(stars) || stars < 1 || stars > 4) throw new Error("Choose a star rating from 1 to 4.");
  return choices.map(choice => mushroomGroupKey(choice) === key ? updateMushroomChoice(choice, { stars }) : choice);
}
