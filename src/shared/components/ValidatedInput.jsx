import React, { useState, useEffect } from "react";
import { fmtComma, stripCommas } from "../format.js";
import { validateWholeNumberInput as validate } from "../numericInput.js";

export default function ValidatedInput({ value, onChange, placeholder, accentColor, autoFocus }) {
  const [raw, setRaw] = useState(fmtComma(value));
  const [error, setError] = useState("");

  useEffect(() => { setRaw(fmtComma(value)); }, [value]);

  function handleChange(e) {
    const input = e.target.value;
    // Allow digits and commas only while typing
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
      // Reformat with commas, preserving cursor feel by not reformatting mid-type
      // Only reformat if it looks complete (no trailing issues)
      setRaw(fmtComma(n));
    } else {
      setRaw(input);
    }
  }

  function handleBlur() {
    const digits = stripCommas(raw);
    const err = validate(digits);
    if (err || digits === "") {
      setRaw(fmtComma(value));
      setError("");
    } else {
      // Clean format on blur
      setRaw(fmtComma(parseInt(digits, 10)));
      setError("");
    }
  }

  const hasError = !!error;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
      <input
        type="text"
        inputMode="numeric"
        value={raw}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: "100%",
          border: `2px solid ${hasError ? "#e74c3c" : accentColor || "#c8e6b8"}`,
          borderRadius: 8,
          padding: "6px 10px",
          fontWeight: 700,
          fontSize: 14,
          color: hasError ? "#e74c3c" : "#333",
          outline: "none",
          fontFamily: "inherit",
          background: hasError ? "#fff5f5" : "#f8fdf5",
          boxSizing: "border-box",
          transition: "border-color 0.2s, background 0.2s",
        }}
      />
      {hasError && (
        <div style={{ fontSize: 10, color: "#e74c3c", fontWeight: 600, paddingLeft: 2 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
