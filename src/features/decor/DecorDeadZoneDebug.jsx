import React, { useState } from "react";
import { SPARKLE_DEAD_ZONE } from "./sparkleLayout.js";
import "./decor-dead-zone-debug.css";

// Temporary local-development visualization; remove this wrapper after tuning.
export default function DecorDeadZoneDebug({ children }) {
  const [visible, setVisible] = useState(true);
  if (!import.meta.env.DEV) return children;
  const { x, y, rx, ry } = SPARKLE_DEAD_ZONE;
  return <div data-star-dead-zone={visible ? "visible" : undefined} style={{
    "--dead-zone-left": `${x - rx}px`, "--dead-zone-top": `${y - ry}px`,
    "--dead-zone-width": `${rx * 2}px`, "--dead-zone-height": `${ry * 2}px`,
  }}>
    <div className="decor-dead-zone-debug">
      <button type="button" aria-pressed={visible} onClick={() => setVisible(value => !value)}>
        {visible ? "Hide" : "Show"} star dead zone
      </button>
      <span>Debug · red oval = no stars · {rx * 2} × {ry * 2}px</span>
    </div>
    {children}
  </div>;
}
