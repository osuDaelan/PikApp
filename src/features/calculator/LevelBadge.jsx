import React from "react";
import { colors } from "../../shared/styles/theme.js";

export default function LevelBadge({ level, openEdit }) {
  const O = colors.orange;
  return (
    <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button onClick={() => openEdit("level")} style={{ background: O, borderRadius: 12, padding: "5px 13px", fontWeight: 900, fontSize: 19, color: "#fff", boxShadow: "0 3px 10px rgba(245,166,35,0.4)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Lv {level}</button>
      <span style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: "0 8px" }}>→</span>
      <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 12, padding: "5px 13px", fontWeight: 900, fontSize: 19, color: "#fff" }}>Lv {level + 1}</div>
    </div>
  );
}
