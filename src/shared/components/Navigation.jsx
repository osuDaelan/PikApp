import React from "react";
import { colors } from "../styles/theme.js";
import { SECTIONS } from "../sections.js";

export default function Navigation({ tab, setTab, isWide, isDesktop, containerMax }) {
  const { green: G, darkGreen: DG } = colors;
  const navMax = 360;
  return (
    <nav aria-label="Main sections" style={{
      position: "fixed", bottom: isWide ? 16 : 0, left: "50%", transform: "translateX(-50%)",
      width: isWide ? "auto" : "100%", maxWidth: isWide ? navMax : containerMax, zIndex: 10000,
      background: "rgba(255,255,255,0.97)", borderTop: isWide ? "none" : "1px solid #e8f5e0",
      borderRadius: isWide ? 20 : 0, display: "flex", justifyContent: "center",
      boxShadow: isWide ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
    }}>
      {SECTIONS.map(t => (
        <button type="button" key={t.id} aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}
          style={{ flex: isWide ? "none" : 1, width: isWide ? 84 : "auto", background: "none", border: "none", padding: isWide ? "10px 0 8px" : "11px 0 9px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", fontFamily: "inherit", color: tab === t.id ? DG : "#bbb", borderTop: isWide ? "none" : `3px solid ${tab === t.id ? G : "transparent"}`, transition: "all 0.15s" }}>
          <span aria-hidden="true" style={{ fontSize: 19 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700 }}>{isDesktop && t.desktopLabel ? t.desktopLabel : t.label}</span>
        </button>
      ))}
    </nav>
  );
}
