import React, { useMemo, useState } from "react";
import { SPARKLE_DEAD_ZONE } from "./sparkleLayout.js";
import SparkleDeadZoneContext from "./SparkleDeadZoneContext.js";
import "./decor-dead-zone-debug.css";

// Temporary local-development visualization; remove this wrapper after tuning.
export default function DecorDeadZoneDebug({ children }) {
  const [visible, setVisible] = useState(true);
  const [width, setWidth] = useState(SPARKLE_DEAD_ZONE.rx * 2);
  const [height, setHeight] = useState(SPARKLE_DEAD_ZONE.ry * 2);
  const zone = useMemo(() => ({ ...SPARKLE_DEAD_ZONE, rx: width / 2, ry: height / 2 }), [width, height]);
  if (!import.meta.env.DEV) return children;
  const { x, y, rx, ry } = zone;
  return <SparkleDeadZoneContext.Provider value={zone}><div data-star-dead-zone={visible ? "visible" : undefined} style={{
    "--dead-zone-left": `${x - rx}px`, "--dead-zone-top": `${y - ry}px`,
    "--dead-zone-width": `${rx * 2}px`, "--dead-zone-height": `${ry * 2}px`,
  }}>
    <div className="decor-dead-zone-debug">
      <button type="button" aria-pressed={visible} onClick={() => setVisible(value => !value)}>
        {visible ? "Hide" : "Show"} star dead zone
      </button>
      <div role="group" aria-label="Dead zone width" className="decor-dead-zone-debug__size">
        <span>Width: {width}px</span>
        <button type="button" aria-label="Decrease dead zone width" disabled={width <= 12} onClick={() => setWidth(value => Math.max(12, value - 2))}>−</button>
        <button type="button" aria-label="Increase dead zone width" disabled={width >= 44} onClick={() => setWidth(value => Math.min(44, value + 2))}>+</button>
      </div>
      <div role="group" aria-label="Dead zone height" className="decor-dead-zone-debug__size">
        <span>Height: {height}px</span>
        <button type="button" aria-label="Decrease dead zone height" disabled={height <= 24} onClick={() => setHeight(value => Math.max(24, value - 2))}>−</button>
        <button type="button" aria-label="Increase dead zone height" disabled={height >= 88} onClick={() => setHeight(value => Math.min(88, value + 2))}>+</button>
      </div>
      <button type="button" onClick={() => { setWidth(SPARKLE_DEAD_ZONE.rx * 2); setHeight(SPARKLE_DEAD_ZONE.ry * 2); }}>Reset size</button>
      <span>Debug · red oval = no stars. New selections use this size; reload resets it.</span>
    </div>
    {children}
  </div></SparkleDeadZoneContext.Provider>;
}
