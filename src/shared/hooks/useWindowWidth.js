import { useState, useEffect } from "react";

export default function useWindowWidth() {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 480));
  useEffect(() => {
    function onResize() { setWidth(window.innerWidth); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}
