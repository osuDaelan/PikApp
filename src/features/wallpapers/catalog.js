// Official assets only. Sources and rights are recorded in public/images/ATTRIBUTION.md.
export const WALLPAPERS = [
  { id: "garden-day", name: "Garden · Day", file: "garden-day.webp", source: "Nintendo Pikmin Garden" },
  { id: "garden-evening", name: "Garden · Evening", file: "garden-evening.webp", source: "Nintendo Pikmin Garden" },
  { id: "garden-night", name: "Garden · Night", file: "garden-night.webp", source: "Nintendo Pikmin Garden" },
];

export function wallpaperUrl(wallpaper, baseUrl = "/") {
  return `${baseUrl}images/wallpapers/${wallpaper.file}`;
}

export function getWallpaper(id) {
  return WALLPAPERS.find(wallpaper => wallpaper.id === id);
}
