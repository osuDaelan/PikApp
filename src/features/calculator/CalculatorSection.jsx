import React from "react";
import DailyInput from "../../shared/components/DailyInput.jsx";
import Ring from "../../shared/components/Ring.jsx";
import { fmt, fmtDate, fmtDuration, tDate } from "../../shared/format.js";
import { MAX_KNOWN } from "./levelData.js";
import { FLOWERS_PER_COIN, MAX_COINS_PER_DAY } from "./calculations.js";
import { colors, cardStyle } from "../../shared/styles/theme.js";
const { green: G, pink: P, orange: O, darkGreen: DG, coin: C } = colors;

export default function CalculatorSection({ calculator }) {
  const {
    level, req, rem, stepPct, flowerPct, openEdit,
    dSteps, setDSteps, dFlowers, setDFlowers,
    coinsNow, coinsDay, coinsCapped, coinsEarnedByThen, coinsAtLevelUp,
    stepDays, flowerDays, bothDays, canProject, timeline,
  } = calculator;
  return (
    <>
      {!rem ? (
        <div style={{ background: "#fff", borderRadius: 18, padding: 18, textAlign: "center", color: "#aaa", fontSize: 13 }}>
          No level data available above Lv {MAX_KNOWN}.<br />
          <span style={{ fontSize: 11 }}>Check back when the wiki updates for Lv {MAX_KNOWN + 1}–130.</span>
        </div>
      ) : (
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Stat cards — tappable to edit */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            {[
              { label: "Steps Left", val: fmt(rem.stepsLeft), sub: `of ${fmt(req.steps)} req · ${stepPct}%`, color: G, pct: stepPct, focus: "steps" },
              { label: "Flowers Left", val: req.flowers ? fmt(rem.flowersLeft) : "—", sub: req.flowers ? `of ${fmt(req.flowers)} req · ${flowerPct}%` : "No requirement", color: P, pct: req.flowers ? flowerPct : 100, focus: "flowers" },
              { label: "Coins Now", val: fmt(coinsNow), sub: "your wallet balance", color: C, pct: null, focus: "coins" },
            ].map(({ label, val, sub, color, pct, focus }) => (
              <button key={label} onClick={() => openEdit(focus)} style={{ flex: "1 1 140px", background: "#fff", borderRadius: 16, padding: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 4, border: `2px solid transparent`, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "border-color 0.15s", WebkitTapHighlightColor: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = color + "55"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, color: "#ccc" }}>✏️</span>
                    {pct === null ? <span style={{ fontSize: 20 }}>🪙</span> : <Ring pct={pct} color={color} />}
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 10, color: "#bbb" }}>{sub}</div>
              </button>
            ))}
          </div>

          {/* Daily averages */}
          <div style={{ ...cardStyle, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: DG, fontSize: 13, marginBottom: 12 }}>📊 Daily Average</div>
            <DailyInput icon="👟" label="Steps / day" value={dSteps} onChange={setDSteps} sliderMax={50000} color={G} />
            <DailyInput icon="🌸" label="Flowers / day" value={dFlowers} onChange={setDFlowers} sliderMax={30000} color={P} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#fdf6e3", borderRadius: 10 }}>
              <span style={{ fontSize: 18 }}>🪙</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: C }}>{coinsDay}/day coins</div>
                <div style={{ fontSize: 10, color: "#bbb" }}>
                  {coinsCapped ? `Capped at ${MAX_COINS_PER_DAY} · ${FLOWERS_PER_COIN} flowers = 1 coin` : `${FLOWERS_PER_COIN} flowers = 1 coin`}
                </div>
              </div>
            </div>
          </div>

          {!canProject ? (
            <div style={{ ...cardStyle, marginBottom: 12 }}>
              <div style={{ fontWeight: 800, color: DG, fontSize: 14 }}>Set up your calculator</div>
              <p style={{ color: "#666", fontSize: 12, lineHeight: 1.5 }}>
                Enter your current game stats and daily averages to see level-up estimates.
              </p>
              <button type="button" onClick={() => openEdit("level")} style={{ background: G, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                Enter your stats
              </button>
            </div>
          ) : <>
          {/* ETA */}
          <div style={{ ...cardStyle, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, color: DG, fontSize: 13, marginBottom: 10 }}>🎯 ETA to Level {level + 1}</div>
            {[
              { icon: "👟", label: "Steps done", days: Math.ceil(stepDays), color: G, note: `${fmt(dSteps)}/day avg`, show: true },
              { icon: "🌸", label: "Flowers done", days: Math.ceil(flowerDays), color: P, note: req.flowers ? `${fmt(dFlowers)}/day avg` : "No requirement", show: !!req.flowers },
              { icon: "🎉", label: `Level ${level + 1}!`, days: bothDays, color: O, note: stepDays >= flowerDays ? "⚡ steps are bottleneck" : "⚡ flowers are bottleneck", show: true, bold: true },
            ].map(({ icon, label, days, color, note, show, bold }, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid #f0f8ec" }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: bold ? 800 : 700, fontSize: 13, color: "#444" }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#bbb" }}>{note}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {show ? (
                    <>
                      <div style={{ fontWeight: 900, fontSize: 17, color }}>{fmtDuration(days)}</div>
                      <div style={{ fontSize: 11, color: "#bbb" }}>{fmtDate(tDate(days))}</div>
                    </>
                  ) : <div style={{ fontSize: 13, color: "#ddd" }}>—</div>}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid #f0f8ec" }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${C}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🪙</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#444" }}>Coins by then</div>
                <div style={{ fontSize: 11, color: "#bbb" }}>{fmt(coinsNow)} now + {fmt(coinsEarnedByThen)} earned</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 17, color: C }}>🪙 {fmt(coinsAtLevelUp)}</div>
              </div>
            </div>
          </div>

          {/* ── TIMELINE ── */}
          <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #edf7e6" }}>
              <div style={{ fontWeight: 800, color: DG, fontSize: 14, marginBottom: 2 }}>📅 Level-Up Timeline</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>
                Lv {level} → {Math.min(level + timeline.length, 130)} · {fmt(dSteps)} steps & {fmt(dFlowers)} flowers/day
              </div>
            </div>
            <div style={{ padding: "0 16px" }}>
              {timeline.length === 0 && (
                <div style={{ color: "#aaa", fontSize: 13, padding: "16px 0" }}>No more level data available.</div>
              )}
              {timeline.map((e, i) => {
                const col = e.bottleneck === "steps" ? G : P;
                const coinsSoFar = coinsDay * e.days;
                return (
                  <div key={e.level} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid #f0f8ec" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${col}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: col, flexShrink: 0 }}>{e.level}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#333" }}>Level {e.level}</div>
                      <div style={{ fontSize: 10, color: "#bbb" }}>
                        {e.bottleneck === "steps" ? "👟" : "🌸"} bottleneck · {fmt(e.stepsLeft)} steps{e.flowersLeft > 0 ? ` · ${fmt(e.flowersLeft)} 🌸` : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: col }}>{fmtDuration(e.days)}</div>
                      <div style={{ fontSize: 11, color: "#bbb" }}>{fmtDate(e.date)}</div>
                      <div style={{ fontSize: 10, color: C }}>🪙 {fmt(coinsSoFar)}</div>
                    </div>
                  </div>
                );
              })}
              {timeline.length > 0 && timeline[timeline.length - 1].level < MAX_KNOWN && (
                <p style={{ padding: "10px 0", fontSize: 12, color: "#777" }}>Enter a daily flower average to project later levels.</p>
              )}
              {level + timeline.length >= MAX_KNOWN && (
                <div style={{ margin: "10px 0 14px", padding: "8px 10px", background: "#fef9e7", borderRadius: 10, fontSize: 11, color: "#c8a800" }}>
                  ⚠️ Wiki data only goes to Lv {MAX_KNOWN}. Levels {MAX_KNOWN + 1}–130 not yet documented.
                </div>
              )}
            </div>
          </div>
          </>}
        </div>
      )}
    </>
  );

}
