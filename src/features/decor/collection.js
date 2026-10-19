function slugify(s) {
  return s.toLowerCase().replace(/['"()]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function decorId(groupLocation, costumeName, color) {
  return `${slugify(groupLocation)}__${slugify(costumeName)}__${color}`;
}

export function countDecorGroups(groups, collected) {
  let total = 0, done = 0;
  groups.forEach(g => {
    g.costumes.forEach(c => {
      (c.designs || c.colors).forEach(variant => {
        total++;
        if (collected[decorId(g.location, c.name, variant)]) done++;
      });
    });
  });
  return { total, done };
}

export function isFullyCollected(groupLocation, costume, collected) {
  return (costume.designs || costume.colors).every(v => collected[decorId(groupLocation, costume.name, v)]);
}

export function isRareCostume(costume) {
  return / \(Rare\)$/.test(costume.name);
}

// Rare decor only shows up once its base costume is fully collected — mirrors how
// Rare Decor Pikmin actually unlock in-game. Pass showAll to bypass this filter.
export function isRareLocked(group, costume, collected) {
  const m = costume.name.match(/^(.+) \(Rare\)$/);
  if (!m) return false;
  const base = group.costumes.find(c => c.name === m[1]);
  if (!base) return false;
  return !isFullyCollected(group.location, base, collected);
}
