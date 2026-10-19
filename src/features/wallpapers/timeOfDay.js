// Date#getHours uses the visitor's device timezone, not the server's timezone.
export function wallpaperForLocalTime(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 17) return "garden-day";
  if (hour >= 17 && hour < 22) return "garden-evening";
  return "garden-night";
}

export function millisecondsToNextMinute(date = new Date()) {
  return 60000 - date.getSeconds() * 1000 - date.getMilliseconds();
}
