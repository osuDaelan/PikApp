import React, { useContext, useState } from "react";
import { createSparkleLayout } from "./sparkleLayout.js";
import SparkleDeadZoneContext from "./SparkleDeadZoneContext.js";
import "./new-decor-sparkles.css";

const TWINKLES = [
  [12, 0], [8, 230], [10, 460], [7, 120], [11, 350], [8, 570],
];

export default function NewDecorSparkles() {
  const zone = useContext(SparkleDeadZoneContext);
  const [twinkles] = useState(() => {
    const positions = createSparkleLayout(TWINKLES.map(([size]) => ({ radius: size / 2 + 2, dy: 3 })), Math.random, zone);
    return positions.map((position, index) => ({ ...position, size: TWINKLES[index][0], delay: TWINKLES[index][1] }));
  });

  return <span className="new-decor-sparkles" aria-hidden="true">
    {twinkles.map(({ size, delay, x, y, dy }, index) => (
      <svg key={index} viewBox="0 0 24 24" className="new-decor-sparkles__glint"
        style={{ left: x, top: y, width: size, height: size, "--twinkle-delay": `${delay}ms`, "--twinkle-dy": `${dy}px` }}>
        <polygon points="12,0 14.5,9.5 24,12 14.5,14.5 12,24 9.5,14.5 0,12 9.5,9.5" />
      </svg>
    ))}
  </span>;
}
