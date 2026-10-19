import React, { useState, useEffect, useRef } from "react";
import { fmtComma, stripCommas } from "../format.js";

// Slider + free-form input for daily averages
export default function DailyInput({ icon, label, value, onChange, sliderMax, color }) {
  const [raw, setRaw] = useState(fmtComma(value));
  const [error, setError] = useState("");
  const trackRef = useRef(null);

  useEffect(() => { setRaw(fmtComma(value)); }, [value]);

  function validate(str) {
    const digits = stripCommas(str);
    if (digits === "") return "Enter a number.";
    if (!/^\d+$/.test(digits)) return "Numbers only — no letters, symbols, or negatives.";
    const n = parseInt(digits, 10);
    if (n <= 0) return "Must be at least 1.";
    return "";
  }

  function handleChange(e) {
    const input = e.target.value;
    const stripped = stripCommas(input);
    if (stripped !== "" && !/^\d*$/.test(stripped)) {
      setError("Numbers only — no letters, symbols, or negatives.");
      setRaw(input);
      return;
    }
    const err = validate(stripped);
    setError(err);
    if (!err && stripped !== "") {
      const n = parseInt(stripped, 10);
      onChange(n);
      setRaw(fmtComma(n));
    } else {
      setRaw(input);
    }
  }

  function handleBlur() {
    const digits = stripCommas(raw);
    if (error || digits === "" || parseInt(digits, 10) <= 0) {
      setRaw(fmtComma(value));
      setError("");
    } else {
      setRaw(fmtComma(parseInt(digits, 10)));
      setError("");
    }
  }

  // Custom slider: snap by exactly 50 using integer math
  function handleTrackInteraction(e) {
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const steps = Math.round((ratio * sliderMax) / 50);
    const snapped = Math.min(steps * 50, sliderMax);
    onChange(snapped);
    setRaw(fmtComma(snapped));
    setError("");
  }

  function handleTrackMouseMove(e) {
    if (e.buttons !== 1) return;
    handleTrackInteraction(e);
  }

  const clampedValue = Math.min(value, sliderMax);
  const thumbPct = (clampedValue / sliderMax) * 100;
  const hasError = !!error;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: "#555", flex: 1 }}>{icon} {label}</span>
        <div style={{ width: 110 }}>
          <input
            type="text"
            inputMode="numeric"
            value={raw}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{
              width: "100%",
              border: `2px solid ${hasError ? "#e74c3c" : color}`,
              borderRadius: 8,
              padding: "4px 8px",
              fontWeight: 700,
              fontSize: 13,
              color: hasError ? "#e74c3c" : "#333",
              textAlign: "right",
              outline: "none",
              fontFamily: "inherit",
              background: hasError ? "#fff5f5" : "#f8fdf5",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
      {hasError && (
        <div style={{ fontSize: 10, color: "#e74c3c", fontWeight: 600, marginBottom: 4 }}>
          ⚠ {error}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          ref={trackRef}
          onMouseDown={handleTrackInteraction}
          onMouseMove={handleTrackMouseMove}
          onTouchStart={handleTrackInteraction}
          onTouchMove={handleTrackInteraction}
          style={{ flex: 1, height: 28, display: "flex", alignItems: "center", cursor: "pointer", position: "relative", userSelect: "none" }}
        >
          {/* Track background */}
          <div style={{ position: "absolute", left: 0, right: 0, height: 5, borderRadius: 3, background: "#e0f0d8" }} />
          {/* Filled portion */}
          <div style={{ position: "absolute", left: 0, width: `${thumbPct}%`, height: 5, borderRadius: 3, background: color, transition: "width 0.05s" }} />
          {/* Thumb */}
          <div style={{
            position: "absolute",
            left: `calc(${thumbPct}% - 9px)`,
            width: 18, height: 18,
            borderRadius: "50%",
            background: "#fff",
            border: `3px solid ${color}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            transition: "left 0.05s",
            pointerEvents: "none",
          }} />
        </div>
        <span style={{ fontSize: 10, color: "#bbb", whiteSpace: "nowrap", minWidth: 36 }}>
          max {(sliderMax / 1000).toFixed(0)}k
        </span>
      </div>
    </div>
  );
}
