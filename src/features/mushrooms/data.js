export const MUSHROOM_SOURCES = Object.freeze({
  reviewed: "October 24, 2026",
  rewards: "https://www.pikminwiki.com/index.php?title=Mushroom_battle&oldid=352625#Rewards",
  fruits: "https://www.pikminwiki.com/index.php?title=Fruit_(Pikmin_Bloom)&oldid=355926",
  official: "https://niantic.helpshift.com/hc/en/23-pikmin-bloom/faq/4045-rewards-for-clearing-mushrooms/",
});

export const NECTAR_COLORS = Object.freeze([
  { id: "white", label: "White", hex: "#75866c" },
  { id: "yellow", label: "Yellow", hex: "#ac7410" },
  { id: "red", label: "Red", hex: "#c35359" },
  { id: "blue", label: "Blue", hex: "#397dac" },
]);
export const SIZES = Object.freeze([
  { id: "small", label: "Small" }, { id: "normal", label: "Normal" }, { id: "large", label: "Large" },
]);
export const DEFAULT_MUSHROOM_DRAFT = Object.freeze({ choices: [], colors: NECTAR_COLORS.map(color => color.id), sortBy: "min", newStars: 4 });

export const MUSHROOM_TYPES = Object.freeze([
  { id: "red", label: "Red", kind: "regular", color: "red" },
  { id: "yellow", label: "Yellow", kind: "regular", color: "yellow" },
  { id: "blue", label: "Blue", kind: "regular", color: "blue" },
  { id: "purple", label: "Purple", kind: "regular", color: "blue" },
  { id: "white", label: "White", kind: "regular", color: "white" },
  { id: "pink", label: "Pink", kind: "regular", color: "red" },
  { id: "gray", label: "Gray", kind: "regular", color: "white" },
  { id: "ice-blue", label: "Ice Blue", kind: "regular", color: "blue" },
  { id: "fire", label: "Fire", kind: "elemental", color: "red" },
  { id: "water", label: "Water", kind: "elemental", color: "blue" },
  { id: "crystal", label: "Crystal", kind: "elemental", color: "white" },
  { id: "electric", label: "Electric", kind: "elemental", color: "yellow" },
  { id: "poisonous", label: "Poisonous", kind: "elemental", color: "white" },
]);

// Observed fruit yields from Fruit (Pikmin Bloom), revision 355926.
// Reward icons represent size/color pools, not a guarantee of the pictured fruit.
export const FRUITS = Object.freeze({
  lime: { label: "Lime", size: "small", color: "white", min: 2, max: 8 },
  kumquat: { label: "Kumquat", size: "small", color: "yellow", min: 1, max: 3 },
  cherry: { label: "Cherry", size: "small", color: "red", min: 1, max: 2 },
  strawberry: { label: "Strawberry", size: "small", color: "red", min: 4, max: 7 },
  blueberry: { label: "Blueberry", size: "small", color: "blue", min: 1, max: 1 },
  "green-apple": { label: "Green Apple", size: "large", color: "white", min: 21, max: 58 },
  lemon: { label: "Lemon", size: "large", color: "yellow", min: 14, max: 36 },
  orange: { label: "Orange", size: "large", color: "yellow", min: 18, max: 53 },
  apple: { label: "Apple", size: "large", color: "red", min: 23, max: 54 },
  peach: { label: "Peach", size: "large", color: "red", min: 20, max: 46 },
  plum: { label: "Plum", size: "large", color: "blue", min: 8, max: 21 },
  melon: { label: "Melon", size: "giant", color: "white", min: 61, max: 147 },
  "muscat-grapes": { label: "Muscat grapes", size: "giant", color: "white", min: 33, max: 82 },
  grapefruit: { label: "Grapefruit", size: "giant", color: "yellow", min: 60, max: 133 },
  watermelon: { label: "Watermelon", size: "giant", color: "red", min: 58, max: 122 },
  grapes: { label: "Grapes", size: "giant", color: "blue", min: 37, max: 83 },
});
