import { useEffect, useState } from "react";
import { sectionFromHash, cleanSectionUrl, sectionUrl } from "../sections.js";

export default function useSectionNavigation() {
  const [section, setSection] = useState(() => sectionFromHash(window.location.hash));
  useEffect(() => {
    const update = () => {
      setSection(sectionFromHash(window.location.hash));
      const cleaned = cleanSectionUrl(window.location.href);
      if (cleaned !== window.location.href) {
        try { window.history.replaceState(window.history.state, "", cleaned); }
        catch { /* Optional URL cleanup must not prevent using the app. */ }
      }
    };
    update();
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => { window.removeEventListener("hashchange", update); window.removeEventListener("popstate", update); };
  }, []);
  function navigate(id) {
    const next = sectionFromHash(`#${id}`);
    const url = sectionUrl(window.location.href, next);
    if (window.location.href !== url) {
      try { window.history.pushState({}, "", url); }
      catch { /* Section controls remain usable if history updates are blocked. */ }
    }
    setSection(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return [section, navigate];
}
