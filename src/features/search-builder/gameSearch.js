export const KEYWORD_GROUPS = [
  { name: "Pikmin type", keywords: ["red", "yellow", "blue", "purple", "white", "winged", "rock", "ice"] },
  { name: "Head state", keywords: ["leaf", "bud", "flower", "bloom", "wilted"] },
  { name: "Activity", keywords: ["squad", "busy", "standby"] },
  { name: "Other filters", keywords: ["favorite", "decor", "lifelog"] },
];

export const SEARCH_REFERENCE = "https://www.pikminwiki.com/Pikmin_Bloom_interface#Pikmin";

export const OPERATORS = [
  { token: "&", label: "AND" },
  { token: "|", label: "OR" },
  { token: "!", label: "NOT" },
  { token: "(", label: "Open group" },
  { token: ")", label: "Close group" },
  { token: "=", label: "Exact" },
];

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

export function textCommand(value) {
  return textError(value) ? "" : `"${value.trim()}"`;
}

export function friendshipCommand(bounds) {
  if (friendshipError(bounds)) return "";
  return bounds.min === bounds.max ? bounds.min : `${bounds.min}-${bounds.max}`;
}
