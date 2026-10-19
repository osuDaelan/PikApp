import { useEffect, useState } from "react";
import { getWallpaper } from "./catalog.js";
import { millisecondsToNextMinute, wallpaperForLocalTime } from "./timeOfDay.js";

export default function useWallpaper() {
  const [wallpaperId, setWallpaperId] = useState(() => wallpaperForLocalTime());

  useEffect(() => {
    let timer;
    function refresh() {
      clearTimeout(timer);
      const current = new Date();
      setWallpaperId(wallpaperForLocalTime(current));
      timer = setTimeout(refresh, millisecondsToNextMinute(current));
    }
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return getWallpaper(wallpaperId);
}
