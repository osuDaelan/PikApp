import React from "react";

// White five-point stars with blue halos, alternating with small golden glints.
const STARS = [
  [5, 23, -6, -8, 0], [58, 35, 7, -6, 35], [7, 70, -7, 5, 70],
  [57, 82, 6, 7, 20], [32, 94, 0, 7, 90],
  [27, 12, 2, -6, 45, true], [54, 60, 5, 1, 90, true], [24, 82, -2, 5, 0, true],
];

export default function RareTileStars() {
  return <span className="decor-image-tile__stars" aria-hidden="true">
    {STARS.map(([x, y, dx, dy, delay, sparkle], index) => (
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
