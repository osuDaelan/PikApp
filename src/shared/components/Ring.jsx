import React from "react";

export default function Ring({ pct, color, size = 44 }) {
  const r = (size - 7) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(1, pct / 100));
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#daf0cc" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s" }} />
    </svg>
  );
}
