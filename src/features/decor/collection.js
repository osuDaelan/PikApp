function slugify(s) {
  return s.toLowerCase().replace(/['"()]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function decorId(groupLocation, costumeName, color) {
  return `${slugify(groupLocation)}__${slugify(costumeName)}__${color}`;
}

// Display categories may change without changing people's saved collection IDs.
export function decorStorageLocation(group) {
  return group.storageLocation || group.location;
}

export function countDecorGroups(groups, collected) {
  let total = 0, done = 0;
  groups.forEach(g => {
    g.costumes.forEach(c => {
      (c.designs || c.colors).forEach(variant => {
        total++;
        if (collected[decorId(decorStorageLocation(g), c.name, variant)]) done++;
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

// Café keeps its original seven-color unlock requirement after Ice was added.
// Other rare costumes still require their entire corresponding base set.
export function isRareLocked(group, costume, collected) {
  const m = costume.name.match(/^(.+) \(Rare\)$/);
  if (!m) return false;
  const base = group.costumes.find(c => c.name === m[1]);
  if (!base) return false;
  const requiredBase = group.location === "Café" && base.name === "Coffee Cup"
    ? { ...base, colors: base.colors.filter(color => color !== "Ice") }
    : base;
  return !isFullyCollected(decorStorageLocation(group), requiredBase, collected);
}
