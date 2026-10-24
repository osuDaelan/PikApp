export const SECTIONS = [
  { id: "decor", icon: "🎀", label: "Decor" },
  { id: "map", icon: "🗺️", label: "Map" },
  { id: "mushrooms", icon: "🍄", label: "Mushroom" },
  { id: "calculator", icon: "🧮", label: "Calculator" },
];
export function sectionFromHash(hash) {
  const id = hash.replace(/^#/, "");
  // Preserve shared links to the former Now/Overview calculator page.
  if (id === "now") return "calculator";
  return SECTIONS.some(section => section.id === id) ? id : "decor";
}
