import React from "react";
import ValidatedInput from "../../shared/components/ValidatedInput.jsx";
import { fmt } from "../../shared/format.js";
import { LEVELS } from "./levelData.js";
import { colors } from "../../shared/styles/theme.js";
const { green: G, darkGreen: DG } = colors;

export default function StatsEditor({ calculator }) {
  const {
    editing, setEditing, editFocus, eLevel, eLevelRaw, eLevelError,
    eStepsInput, setEStepsInput, eFlowersInput, setEFlowersInput, eCoinsNow, setECoinsNow,
    handleLevelChange, saveEdit, totalStepsMode, toggleTotalStepsMode,
  } = calculator;
  if (!editing) return null;
  const editReq = LEVELS[eLevel + 1];
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.13)" }}>
      <div style={{ fontWeight: 900, color: DG, fontSize: 15, marginBottom: 4 }}>📝 Update Stats</div>
      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 14 }}>
        Enter exactly what your game shows — steps and flowers <b>to go</b>.
      </div>

      {/* Level */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 5 }}>Current Level</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <input
            type="text"
            inputMode="numeric"
            value={eLevelRaw}
            onChange={e => handleLevelChange(e.target.value)}
            autoFocus={editFocus === "level"}
            style={{ width: "100%", border: `2px solid ${eLevelError ? "#e74c3c" : "#c8e6b8"}`, borderRadius: 8, padding: "7px 10px", fontWeight: 700, fontSize: 14, color: eLevelError ? "#e74c3c" : "#333", outline: "none", fontFamily: "inherit", background: eLevelError ? "#fff5f5" : "#f8fdf5", boxSizing: "border-box" }}
          />
          {eLevelError && <div style={{ fontSize: 10, color: "#e74c3c", fontWeight: 600 }}>⚠ {eLevelError}</div>}
        </div>
      </div>

      {/* Steps */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#555" }}>👟 Steps</div>
          {eLevel < 100 && (
            <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#f0f0f0", borderRadius: 8, padding: 2 }}>
              {[["to go", false], ["lifetime total", true]].map(([label, val]) => (
                <button key={label} onClick={() => toggleTotalStepsMode(val)}
                  style={{ padding: "3px 9px", borderRadius: 6, border: "none", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    background: totalStepsMode === val ? "#fff" : "transparent",
                    color: totalStepsMode === val ? DG : "#aaa",
                    boxShadow: totalStepsMode === val ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: 10, color: "#aaa", marginBottom: 5 }}>
          {eLevel < 100 && totalStepsMode
            ? <>Lv {eLevel}→{eLevel+1} needs <b>{LEVELS[eLevel+1] ? fmt(LEVELS[eLevel+1].steps) : "—"}</b> total lifetime steps. Enter your all-time step count.</>
            : <>Enter the steps remaining shown in your game. Lv {eLevel}→{eLevel+1} requires <b>{LEVELS[eLevel+1] ? fmt(LEVELS[eLevel+1].steps) : "—"}</b> {eLevel < 100 ? "total" : ""} steps.</>
          }
        </div>
        <ValidatedInput value={eStepsInput} onChange={setEStepsInput} placeholder="e.g. 1000" accentColor="#c8e6b8" autoFocus={editFocus === "steps"} />
      </div>

      {/* Flowers to go */}
      <div style={{ marginBottom: 16 }}>
        {editReq && editReq.flowers != null ? (
          <>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 2 }}>🌸 Flowers to go</div>
            <div style={{ fontSize: 10, color: "#aaa", marginBottom: 5 }}>
              The game requires <b>{LEVELS[eLevel+1] ? fmt(LEVELS[eLevel+1].flowers) : "—"}</b> flowers for Lv {eLevel}→{eLevel+1}. Enter what it shows you left.
            </div>
            <ValidatedInput value={eFlowersInput} onChange={setEFlowersInput} placeholder="e.g. 500" accentColor="#f8c8e8" autoFocus={editFocus === "flowers"} />
          </>
        ) : (
          <div style={{ padding: "10px 12px", background: "#f0f8ec", borderRadius: 10, fontSize: 12, color: "#888" }}>
            🌸 No flower requirement for this level.
          </div>
        )}
      </div>

      {/* Coins */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 2 }}>🪙 Coins now</div>
        <div style={{ fontSize: 10, color: "#aaa", marginBottom: 5 }}>
          Your current in-game coin balance.
        </div>
        <ValidatedInput value={eCoinsNow} onChange={setECoinsNow} placeholder="e.g. 1200" accentColor="#f0dba0" autoFocus={editFocus === "coins"} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={saveEdit} disabled={!!eLevelError}
          style={{ flex: 1, background: eLevelError ? "#ccc" : G, border: "none", borderRadius: 10, padding: 11, color: "#fff", fontWeight: 800, fontSize: 14, cursor: eLevelError ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
          Save
        </button>
        <button onClick={() => setEditing(false)}
          style={{ flex: 1, background: "#f0f0f0", border: "none", borderRadius: 10, padding: 11, color: "#888", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
