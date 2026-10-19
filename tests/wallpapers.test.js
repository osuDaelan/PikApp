import test from "node:test";
import assert from "node:assert/strict";
import { getWallpaper } from "../src/features/wallpapers/catalog.js";
import { wallpaperForLocalTime } from "../src/features/wallpapers/timeOfDay.js";

test("Garden wallpaper follows local time at the morning, evening, and night boundaries", () => {
  for (const [hour, minute, expected] of [
    [0, 0, "garden-night"], [5, 59, "garden-night"],
    [6, 0, "garden-day"], [12, 0, "garden-day"], [16, 59, "garden-day"],
    [17, 0, "garden-evening"], [21, 59, "garden-evening"],
    [22, 0, "garden-night"], [23, 59, "garden-night"],
  ]) {
    const selected = getWallpaper(wallpaperForLocalTime(new Date(2026, 9, 18, hour, minute)));
    assert.equal(selected.id, expected);
    assert.ok(selected.file.endsWith(".webp"));
  }
});
