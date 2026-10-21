export const SECTIONS = [
  { id: "now", icon: "🌸", label: "Now", desktopLabel: "Overview" },
  { id: "decor", icon: "🎀", label: "Decor" },
  { id: "map", icon: "🗺️", label: "Map" },
];
export function sectionFromHash(hash) {
  const id = hash.replace(/^#/, "");
  return SECTIONS.some(section => section.id === id) ? id : "now";
}
