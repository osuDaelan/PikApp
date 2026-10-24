import React from "react";
import { categoryImageUrl } from "./categoryImages.js";

export default function CategoryIcon({ categoryId }) {
  const url = categoryImageUrl(categoryId, import.meta.env.BASE_URL);
  return <span className="decor-map__category-icon" aria-hidden="true">
    {url ? <img src={url} alt="" width="24" height="24" loading="lazy" decoding="async" /> : "📍"}
  </span>;
}
