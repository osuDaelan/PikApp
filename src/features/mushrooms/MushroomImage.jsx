import React from "react";
import { mushroomImageUrl } from "./images.js";

export default function MushroomImage({ typeId }) {
  const src = mushroomImageUrl(typeId, import.meta.env.BASE_URL);
  if (!src) return null;
  return <img className="mushroom-type-image" src={src} alt="" width={36} height={36} loading="lazy" decoding="async" />;
}
