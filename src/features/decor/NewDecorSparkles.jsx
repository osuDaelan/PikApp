import React, { useState } from "react";
import "./new-decor-sparkles.css";

const TWINKLES = [
  [12, 0], [8, 230], [10, 460], [7, 120], [11, 350], [8, 570],
];

export default function NewDecorSparkles() {
  const [twinkles] = useState(() => TWINKLES.map(([size, delay]) => ({
    size, delay, x: 14 + Math.random() * 44, y: 16 + Math.random() * 76,
  })));

  return <span className="new-decor-sparkles" aria-hidden="true">
    {twinkles.map(({ size, delay, x, y }, index) => (
      <svg key={index} viewBox="0 0 24 24" className="new-decor-sparkles__glint"
        style={{ left: x, top: y, width: size, height: size, "--twinkle-delay": `${delay}ms` }}>
        <polygon points="12,0 14.5,9.5 24,12 14.5,14.5 12,24 9.5,14.5 0,12 9.5,9.5" />
      </svg>
    ))}
  </span>;
}
