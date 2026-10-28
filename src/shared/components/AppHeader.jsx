import React, { useState, useEffect } from "react";
import { fmtDate, fmtTime } from "../format.js";
import BrowserSaveStatus from "./BrowserSaveStatus.jsx";
import FeedbackButton from "../../features/feedback/FeedbackButton.jsx";
import { readFirebaseConfig } from "../../features/auth/firebaseConfig.js";
import AccountMenu from "../../features/auth/AccountMenu.jsx";
import "./app-header.css";

// Keep guest use and initial loading independent of the optional auth service.
const signInConfigured = readFirebaseConfig(import.meta.env) !== null;

export default function AppHeader({ getProgressSnapshot, onProgressImported, importComplete }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={{ padding: "18px 18px 0", textAlign: "center", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <img
          src={`${import.meta.env.BASE_URL}images/pikmin-bloom-icon.jpg`}
          alt="Pikmin Bloom app icon"
          width={36}
          height={36}
          style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
        />
        <div>
          <div style={{ fontWeight: 900, fontSize: 19, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>Pikmin Bloom</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Your Bloom companion</div>
        </div>
      </div>
      <div style={{ marginTop: 8, background: "rgba(0,0,0,0.15)", borderRadius: 20, padding: "4px 14px", display: "inline-block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: 0.3 }}>
        🕐 {fmtTime(now)} · {fmtDate(now)}
      </div>
      <div className="app-header-actions">
        <BrowserSaveStatus getProgressSnapshot={getProgressSnapshot} onProgressImported={onProgressImported} importComplete={importComplete} />
        <FeedbackButton />
        {signInConfigured && <AccountMenu />}
      </div>
    </div>
  );
}
