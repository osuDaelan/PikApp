import { useEffect, useRef, useState } from "react";

// Experimental presentation only. No collection/storage logic belongs here.
export default function useDecorTileMotion(collected) {
  const previous = useRef(collected);
  const [motion, setMotion] = useState("");
  const [sparkling, setSparkling] = useState(false);

  useEffect(() => {
    if (previous.current === collected) return;
    previous.current = collected;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMotion("");
      setSparkling(false);
      return;
    }
    setMotion(collected ? "collect" : "release");
    setSparkling(collected);
  }, [collected]);

  useEffect(() => {
    if (!motion) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clear = () => setMotion("");
    const onMotionChange = () => { if (media.matches) clear(); };
    media.addEventListener("change", onMotionChange);
    // Also clean up if CSS animationend is interrupted by hiding or a style change.
    const timer = window.setTimeout(clear, 900);
    return () => {
      window.clearTimeout(timer);
      media.removeEventListener("change", onMotionChange);
    };
  }, [motion]);

  useEffect(() => {
    if (!sparkling) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clear = () => setSparkling(false);
    const onMotionChange = () => { if (media.matches) clear(); };
    media.addEventListener("change", onMotionChange);
    // Independent of the short pop: twinkles fade over the full three seconds.
    const timer = window.setTimeout(clear, 3000);
    return () => {
      window.clearTimeout(timer);
      media.removeEventListener("change", onMotionChange);
    };
  }, [sparkling]);

  return {
    "data-motion": motion || undefined,
    "data-sparkling": sparkling || undefined,
    onAnimationEnd(event) {
      if (event.target.classList.contains("decor-image-tile__art")
          && ["chef-soft-pop", "chef-soft-release"].includes(event.animationName)) {
        setMotion("");
      }
    },
  };
}
