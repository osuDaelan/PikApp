export const KEYWORD_GROUPS = [
  { name: "Pikmin type", keywords: ["red", "yellow", "blue", "purple", "white", "winged", "rock", "ice"] },
  { name: "Head state", keywords: ["leaf", "bud", "flower", "bloom", "wilted"] },
  { name: "Activity", keywords: ["squad", "busy", "standby"] },
  { name: "Other filters", keywords: ["favorite", "decor", "lifelog"] },
];

export const SEARCH_REFERENCE = "https://www.pikminwiki.com/Pikmin_Bloom_interface#Pikmin";

export function friendshipError({ min, max }) {
  if (min === "" && max === "") return "Choose a minimum or maximum.";
  if ([min, max].some(value => value !== "" && !/^[0-8]$/.test(value))) return "Use 0–8 completed hearts.";
  if (min !== "" && max !== "" && Number(min) > Number(max)) return "The maximum must be at least the minimum.";
  return "";
}

export function textError(value) {
  if (!value.trim()) return "Enter a search phrase.";
  if (value.includes('"') || /[\u0000-\u001f\u007f]/.test(value)) return "Use a single line without straight double quotes.";
  return "";
}

function filterCommand(block) {
  if (block.type === "keyword") return block.keyword;
  if (block.type === "text") return textError(block.value) ? "" : `"${block.value.trim()}"`;
  if (friendshipError(block)) return "";
  return block.min === block.max ? block.min : `${block.min}-${block.max}`;
}

export function buildGameSearch(blocks) {
  let command = "";
  let incomplete = false;
  for (const block of blocks) {
    const group = block.type === "group" ? buildGameSearch(block.children) : null;
    const term = group ? (group.command ? `(${group.command})` : "") : filterCommand(block);
    if (!term || group?.incomplete) incomplete = true;
    if (!term) continue;
    const operator = command ? (block.join === "or" ? "|" : "&") : "";
    const exact = block.exact && (block.type === "text" || block.type === "keyword") ? "=" : "";
    command += operator + (block.exclude ? "!" : "") + exact + term;
  }
  return { command, incomplete };
}

// The builder has one level of groups. A top-level group can be reordered,
// while filters can move between any two lists.
export function moveSearchBlock(blocks, id, groupId, beforeId = null) {
  const owner = blocks.find(block => block.type === "group" && block.children.some(child => child.id === id));
  const source = owner?.children ?? blocks;
  const moving = source.find(block => block.id === id);
  const destination = groupId === null ? null : blocks.find(block => block.type === "group" && block.id === groupId);
  if (!moving || beforeId === id || (groupId !== null && (!destination || moving.type === "group"))) return blocks;
  const target = destination?.children ?? blocks;
  if (beforeId !== null && !target.some(block => block.id === beforeId)) return blocks;

  function changeList(list, receivesBlock) {
    const remaining = list.filter(block => block.id !== id);
    if (!receivesBlock) return remaining;
    const index = beforeId === null ? remaining.length : remaining.findIndex(block => block.id === beforeId);
    const reordered = [...remaining.slice(0, index), moving, ...remaining.slice(index)];
    if (source !== target) return reordered;
    // Reordering within a list preserves the operators between positions.
    return reordered.map((block, position) =>
      block.join === list[position].join ? block : { ...block, join: list[position].join });
  }

  return changeList(blocks, !destination).map(block => {
    if (block.type !== "group" || (block.id !== owner?.id && block.id !== destination?.id)) return block;
    return { ...block, children: changeList(block.children, block.id === destination?.id) };
  });
}
