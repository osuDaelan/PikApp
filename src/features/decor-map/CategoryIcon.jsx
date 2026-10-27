import React from "react";
import { categoryImageUrl } from "./categoryImages.js";

export default function CategoryIcon({ categoryId, completed = false }) {
  const url = categoryImageUrl(categoryId, import.meta.env.BASE_URL);
  const complete = completed && !!url;
  return <span className={`decor-map__category-icon${complete ? " decor-map__category-icon--complete" : ""}`}
    role={complete ? "img" : undefined} aria-label={complete ? "Entire category collected" : undefined} aria-hidden={complete ? undefined : true}>
    {url ? completed
      ? <span className="decor-map__completion-symbol" style={{ "--decor-category-image": `url("${url}")` }} />
      : <img src={url} alt="" width="24" height="24" loading="lazy" decoding="async" /> : "📍"}
  </span>;
}
