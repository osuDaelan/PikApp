import React, { memo, useState } from "react";
import { decorImageUrl } from "./decorImages.js";
import useDecorTileMotion from "./useDecorTileMotion.js";
import RareTileStars from "./RareTileStars.jsx";
import NewDecorSparkles from "./NewDecorSparkles.jsx";
import "./decor-image-tile.css";
import "./decor-tile-motion.css";

function DecorImageTile({ id, image, rare = false, color, caption, label, collected, onToggle }) {
  const [failedSource, setFailedSource] = useState(null);
  const motion = useDecorTileMotion(collected);
  const src = decorImageUrl(image, import.meta.env.BASE_URL);
  return (
    <button type="button" className={`decor-image-tile${rare ? " decor-image-tile--rare" : ""}${caption ? " decor-image-tile--named" : ""}`} aria-label={label} {...motion}
      aria-pressed={collected} onClick={() => onToggle(id)}
      title={`${label}${image.representative ? " · Representative design" : ""} · ${collected ? "Collected — click to uncollect" : "Not collected — click to collect"}`}>
      {motion["data-motion"] === "collect" && (rare ? <RareTileStars /> : <span className="decor-image-tile__confetti" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} style={{ "--confetti-angle": `${index * 45}deg` }} />
        ))}
      </span>)}
      {motion["data-sparkling"] && <NewDecorSparkles />}
      {collected && (
        <span className="decor-image-tile__status" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5 6.3 12 13 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <span className="decor-image-tile__art">
        {failedSource === src
          ? <span className="decor-image-tile__fallback" aria-hidden="true">{color[0]}</span>
          : <img src={src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async"
              onError={() => setFailedSource(src)} />}
      </span>
      <span className="decor-image-tile__label">{caption || color}</span>
    </button>
  );
}

// A collection toggle should update its own tile, not every image in the checklist.
export default memo(DecorImageTile);
