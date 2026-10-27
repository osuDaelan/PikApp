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

// These sets retain their original seven-color unlock after Ice was added.
// Keep the exceptions scoped to the matching base costume; Ice still counts
// toward collection totals and remains available in both base and rare rows.
const ORIGINAL_SEVEN_RARE_BASES = new Map([
  ["Café", ["Coffee Cup"]],
  ["Restaurant", ["Chef Hat"]],
  ["Pharmacy", ["Toothbrush"]],
  ["Station", ["Ticket"]],
  ["Stadium", ["Ball Keychain"]],
  ["Park", ["Clover", "Four-Leaf Clover"]],
]);

export function isRareLocked(group, costume, collected) {
  const m = costume.name.match(/^(.+) \(Rare\)$/);
  if (!m) return false;
  const base = group.costumes.find(c => c.name === m[1]);
  if (!base) return false;
  const requiredBase = ORIGINAL_SEVEN_RARE_BASES.get(group.location)?.includes(base.name)
    ? { ...base, colors: base.colors.filter(color => color !== "Ice") }
    : base;
  return !isFullyCollected(decorStorageLocation(group), requiredBase, collected);
}
