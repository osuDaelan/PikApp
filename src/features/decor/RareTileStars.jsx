import React, { useState } from "react";

// White five-point stars with blue halos, alternating with small golden glints.
const STAR_MOTION = [
  [-6, -8, 0], [7, -6, 35], [-7, 5, 70],
  [6, 7, 20], [0, 7, 90],
  [2, -6, 45, true], [5, 1, 90, true], [-2, 5, 0, true],
];

function createStars() {
  const positions = [];
  return STAR_MOTION.map(motion => {
    let best;
    let bestDistance = -1;
    // Fresh positions across the artwork, with room for each star's drift and
    // glow. Prefer 16px spacing; bounded attempts also handle crowded layouts.
    for (let attempt = 0; attempt < 24; attempt++) {
      const point = [16 + Math.random() * 40, 16 + Math.random() * 76];
      const distance = Math.min(...positions.map(([x, y]) => Math.hypot(point[0] - x, point[1] - y)));
      if (distance > bestDistance) { best = point; bestDistance = distance; }
      if (distance >= 16) break;
    }
    positions.push(best);
    return [...best, ...motion];
  });
}

export default function RareTileStars() {
  // Pick a complete layout once per burst, never on animation frames/rerenders.
  const [stars] = useState(createStars);

  return <span className="decor-image-tile__stars" aria-hidden="true">
    {stars.map(([x, y, dx, dy, delay, sparkle], index) => (
      <svg key={index} viewBox="0 0 24 24"
        className={`decor-image-tile__star${sparkle ? " decor-image-tile__star--glint" : ""}`}
        style={{ left: x, top: y, "--star-dx": `${dx}px`, "--star-dy": `${dy}px`, "--star-delay": `${delay}ms` }}>
        <polygon points={sparkle
          ? "12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9"
          : "12,1 15.4,8.1 23,9.2 17.4,14.8 18.8,23 12,19.1 5.2,23 6.6,14.8 1,9.2 8.6,8.1"} />
      </svg>
    ))}
  </span>;
}
