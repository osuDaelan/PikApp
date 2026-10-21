import { useEffect, useState } from "react";
import { sectionFromHash } from "../sections.js";

export default function useSectionNavigation() {
  const [section, setSection] = useState(() => sectionFromHash(window.location.hash));
  useEffect(() => {
    const update = () => setSection(sectionFromHash(window.location.hash));
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => { window.removeEventListener("hashchange", update); window.removeEventListener("popstate", update); };
  }, []);
  function navigate(id) {
    const next = sectionFromHash(`#${id}`);
    if (window.location.hash !== `#${next}`) window.history.pushState({}, "", `#${next}`);
    setSection(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return [section, navigate];
}
