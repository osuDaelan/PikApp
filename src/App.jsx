import React, { useState, useEffect, useRef } from "react";

// ─── LEVEL DATA ───────────────────────────────────────────────────────────────
// 1–100: cumulative totals required. 101+: per-level requirements.
const LEVELS = [
  null,
  { steps: 0, flowers: null },
  { steps: 0, flowers: null },
  { steps: 500, flowers: null },
  { steps: 1500, flowers: null },
  { steps: 3000, flowers: null },
  { steps: 5000, flowers: null },
  { steps: 7500, flowers: null },
  { steps: 10500, flowers: null },
  { steps: 14000, flowers: null },
  { steps: 18000, flowers: null },
  { steps: 23000, flowers: null },
  { steps: 29000, flowers: null },
  { steps: 36000, flowers: null },
  { steps: 44000, flowers: null },
  { steps: 53000, flowers: null },
  { steps: 63000, flowers: null },
  { steps: 74000, flowers: null },
  { steps: 86000, flowers: null },
  { steps: 99000, flowers: null },
  { steps: 113000, flowers: null },
  { steps: 128000, flowers: null },
  { steps: 144000, flowers: null },
  { steps: 161000, flowers: 500 },
  { steps: 179000, flowers: null },
  { steps: 198000, flowers: null },
  { steps: 218000, flowers: null },
  { steps: 239000, flowers: 1500 },
  { steps: 261000, flowers: null },
  { steps: 284000, flowers: null },
  { steps: 308000, flowers: 3000 },
  { steps: 333000, flowers: null },
  { steps: 359000, flowers: null },
  { steps: 386000, flowers: 6000 },
  { steps: 414000, flowers: null },
  { steps: 443000, flowers: null },
  { steps: 473000, flowers: null },
  { steps: 504000, flowers: 8000 },
  { steps: 536000, flowers: null },
  { steps: 569000, flowers: null },
  { steps: 603000, flowers: 10000 },
  { steps: 638000, flowers: null },
  { steps: 674000, flowers: 11000 },
  { steps: 711000, flowers: 12000 },
  { steps: 749000, flowers: null },
  { steps: 788000, flowers: 12000 },
  { steps: 828000, flowers: null },
  { steps: 869000, flowers: 13000 },
  { steps: 911000, flowers: null },
  { steps: 955000, flowers: 14000 },
  { steps: 1000000, flowers: 14000 },
  { steps: 1047000, flowers: 15000 },
  { steps: 1097000, flowers: 16000 },
  { steps: 1150000, flowers: 16000 },
  { steps: 1206000, flowers: 17000 },
  { steps: 1265000, flowers: 18000 },
  { steps: 1327000, flowers: 19000 },
  { steps: 1392000, flowers: 20000 },
  { steps: 1460000, flowers: 21000 },
  { steps: 1530000, flowers: 22000 },
  { steps: 1605000, flowers: 23000 },
  { steps: 1685000, flowers: 25000 },
  { steps: 1770000, flowers: 26000 },
  { steps: 1860000, flowers: 28000 },
  { steps: 1955000, flowers: 29000 },
  { steps: 2055000, flowers: 31000 },
  { steps: 2160000, flowers: 32000 },
  { steps: 2270000, flowers: 34000 },
  { steps: 2385000, flowers: 35000 },
  { steps: 2505000, flowers: 37000 },
  { steps: 2630000, flowers: 38000 },
  { steps: 2760000, flowers: 40000 },
  { steps: 2895000, flowers: 41000 },
  { steps: 3035000, flowers: 43000 },
  { steps: 3180000, flowers: 44000 },
  { steps: 3330000, flowers: 46000 },
  { steps: 3485000, flowers: 47000 },
  { steps: 3645000, flowers: 49000 },
  { steps: 3810000, flowers: 50000 },
  { steps: 3980000, flowers: 52000 },
  { steps: 4160000, flowers: 55000 },
  { steps: 4350000, flowers: 58000 },
  { steps: 4550000, flowers: 61000 },
  { steps: 4760000, flowers: 64000 },
  { steps: 4980000, flowers: 67000 },
  { steps: 5210000, flowers: 70000 },
  { steps: 5450000, flowers: 73000 },
  { steps: 5700000, flowers: 76000 },
  { steps: 5960000, flowers: 79000 },
  { steps: 6230000, flowers: 82000 },
  { steps: 6510000, flowers: 85000 },
  { steps: 6800000, flowers: 88000 },
  { steps: 7100000, flowers: 91000 },
  { steps: 7410000, flowers: 94000 },
  { steps: 7730000, flowers: 97000 },
  { steps: 8060000, flowers: 100000 },
  { steps: 8400000, flowers: 105000 },
  { steps: 8760000, flowers: 110000 },
  { steps: 9140000, flowers: 115000 },
  { steps: 9540000, flowers: 120000 },
  { steps: 10000000, flowers: 140000 },
  // 101+ per-level
  { steps: 474000, flowers: 292000 },
  { steps: 475000, flowers: 292300 },
  { steps: 475400, flowers: 292600 },
  { steps: 475900, flowers: 292900 },
  { steps: 476400, flowers: 293200 },
  { steps: 476900, flowers: 293500 },
  { steps: 477300, flowers: 293800 },
  { steps: 477800, flowers: 294000 },
  { steps: 478300, flowers: 294300 },
  { steps: 479200, flowers: 294900 },
  { steps: 479300, flowers: 294900 },
  { steps: 480200, flowers: 295500 },
  { steps: 480700, flowers: 295800 },
  { steps: 481100, flowers: 296100 },
];

const MAX_KNOWN = LEVELS.length - 1;

function isPerLevel(level) { return level >= 101; }

// Returns the full requirement for reaching (level+1)
function getLevelReq(level) {
  const next = level + 1;
  if (next > MAX_KNOWN || !LEVELS[next]) return null;
  return LEVELS[next];
}

// stepsLeft / flowersLeft are what the game shows you
function buildRemaining(stepsLeft, flowersLeft, level) {
  const req = getLevelReq(level);
  if (!req) return null;
  return {
    stepsLeft: Math.max(0, stepsLeft),
    flowersLeft: Math.max(0, flowersLeft),
    stepsGoal: req.steps,
    flowersGoal: req.flowers,
  };
}

function projectLevels(level, stepsLeft, flowersLeft, dSteps, dFlowers, count = 10) {
  const out = [];
  let sL = stepsLeft, fL = flowersLeft, lvl = level, dayOff = 0;
  for (let i = 0; i < count; i++) {
    const nextLv = lvl + 1;
    if (nextLv > MAX_KNOWN) break;
    const sd = dSteps > 0 ? sL / dSteps : Infinity;
    const fd = fL > 0 && dFlowers > 0 ? fL / dFlowers : 0;
    const days = Math.ceil(Math.max(sd, fd));
    dayOff += days;
    const date = new Date();
    date.setDate(date.getDate() + dayOff);
    out.push({ level: nextLv, days: dayOff, date, stepsLeft: sL, flowersLeft: fL, bottleneck: sd >= fd ? "steps" : "flowers" });
    // Advance to the next level's requirements
    const cur = LEVELS[nextLv];
    const nxt = LEVELS[nextLv + 1];
    if (!nxt) break;
    if (nextLv < 100) {
      // Cumulative mode: next remaining = delta between consecutive thresholds
      sL = Math.max(0, nxt.steps - cur.steps);
      // Flowers: each level has its own target, delta from current to next threshold
      fL = nxt.flowers != null
        ? (cur.flowers != null ? Math.max(0, nxt.flowers - cur.flowers) : nxt.flowers)
        : 0;
    } else {
      // Per-level mode: each level has its own full step/flower count
      sL = nxt.steps;
      fL = nxt.flowers != null ? nxt.flowers : 0;
    }
    lvl = nextLv;
  }
  return out;
}

const fmt = n => Math.round(n).toLocaleString();
function fmtDuration(d) {
  if (d <= 0) return "Today!";
  const days = Math.ceil(d);
  if (days < 7) return `${days}d`;
  if (days < 30) {
    const w = Math.floor(days / 7), r = days % 7;
    return r === 0 ? `${w}w` : `${w}w ${r}d`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30), r = Math.floor((days % 30) / 7);
    return r === 0 ? `${m}mo` : `${m}mo ${r}w`;
  }
  const y = Math.floor(days / 365), rem = Math.floor((days % 365) / 30);
  return rem === 0 ? `${y}yr` : `${y}yr ${rem}mo`;
}
function fmtDate(date) { return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function fmtTime(date) { return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
function tDate(days) { const d = new Date(); d.setDate(d.getDate() + days); return d; }

// ─── COIN CALCULATION ─────────────────────────────────────────────────────────
// 1 coin per 250 flowers planted, capped at 60 coins/day.
const FLOWERS_PER_COIN = 250;
const MAX_COINS_PER_DAY = 60;
function coinsPerDay(dFlowers) {
  return Math.min(Math.floor(dFlowers / FLOWERS_PER_COIN), MAX_COINS_PER_DAY);
}

// ─── VALIDATED INPUT ──────────────────────────────────────────────────────────
// Accepts any positive integer, no letters/symbols/negatives.
// Shows inline error. Does NOT restrict by increments.
function fmtComma(n) {
  return n.toLocaleString("en-US");
}

function stripCommas(str) {
  return str.replace(/,/g, "");
}

function ValidatedInput({ value, onChange, placeholder, accentColor, autoFocus }) {
  const [raw, setRaw] = useState(fmtComma(value));
  const [error, setError] = useState("");

  useEffect(() => { setRaw(fmtComma(value)); }, [value]);

  function validate(str) {
    const digits = stripCommas(str);
    if (digits === "" || digits === "-") return "Please enter a number.";
    if (!/^\d+$/.test(digits)) return "Numbers only — no letters, symbols, or negatives.";
    const n = parseInt(digits, 10);
    if (n < 0) return "Must be 0 or greater.";
    if (n > 999999999) return "That's a very large number!";
    return "";
  }

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

// Slider + free-form input for daily averages
function DailyInput({ icon, label, value, onChange, sliderMax, color }) {
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

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────
// Keeps level/steps/flowers/daily-averages consistent across launches.
function loadNum(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
  } catch { return fallback; }
}
function saveNum(key, value) {
  try { localStorage.setItem(key, String(value)); } catch {}
}
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── DECOR DATA ───────────────────────────────────────────────────────────────
// Sourced from pikminwiki.com/Decor_Pikmin#Decor_types and pikminwiki.com/Special_Decor_Pikmin.
// Hierarchy: location/category -> costume variant -> which of the 8 Pikmin colors it comes in
// (colors not listed are N/A for that costume — e.g. most Rare Decor excludes Ice Pikmin).
function slugify(s) {
  return s.toLowerCase().replace(/['"()]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

const DECOR_LOCATIONS = [
  { location: "Restaurant", costumes: [
    { name: "Chef Hat", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Chef Hat (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Café", costumes: [
    { name: "Coffee Cup", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Coffee Cup (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Sweetshop", costumes: [
    { name: "Macaron", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Donut", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Movie Theater", costumes: [
    { name: "Popcorn Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Pharmacy", costumes: [
    { name: "Toothbrush", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Toothbrush (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Zoo", costumes: [
    { name: "Dandelion", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Forest", costumes: [
    { name: "Stag Beetle", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Acorn", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Waterside", costumes: [
    { name: "Fishing Lure", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Fishing Lure (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Post Office", costumes: [
    { name: "Stamp", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Art Gallery", costumes: [
    { name: "Picture Frame", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Airport", costumes: [
    { name: "Toy Airplane", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Station", costumes: [
    { name: "Paper Train", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Ticket", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Gold Ticket", colors: ["Red"] },
  ]},
  { location: "Beach", costumes: [
    { name: "Shell", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Burger Place", costumes: [
    { name: "Burger", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Corner Store", costumes: [
    { name: "Bottle Cap", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Supermarket", costumes: [
    { name: "Mushroom", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Banana", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Banana (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Bakery", costumes: [
    { name: "Baguette", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Baguette (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Hair Salon", costumes: [
    { name: "Scissors", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Scissors (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Clothes Store", costumes: [
    { name: "Hair Tie", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Park", costumes: [
    { name: "Clover", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Four-Leaf Clover", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Clover (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Four-Leaf Clover (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Library & Bookstore", costumes: [
    { name: "Tiny Book", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Sushi Restaurant", costumes: [
    { name: "Sushi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Mountain", costumes: [
    { name: "Mountain Pin Badge", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Stadium", costumes: [
    { name: "Ball Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Theme Park", costumes: [
    { name: "Theme Park Ticket", colors: ["Red", "Yellow", "Blue"] },
  ]},
  { location: "Bus Stop", costumes: [
    { name: "Bus Papercraft", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Italian Restaurant", costumes: [
    { name: "Pizza", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Pasta", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Ramen Restaurant", costumes: [
    { name: "Ramen Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Bridge", costumes: [
    { name: "Bridge Pin Badge", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Hotel", costumes: [
    { name: "Hotel Amenities", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Makeup Store", costumes: [
    { name: "Makeup", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Appliances Store", costumes: [
    { name: "Battery", designs: ["1", "2", "3", "4", "5", "6"], color: "Yellow" },
    { name: "Fairy Lights", designs: ["1", "2"], color: "Yellow" },
  ]},
  { location: "Curry Restaurant", costumes: [
    { name: "Curry Bowl", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "DIY Store", costumes: [
    { name: "Tool", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "University & College", costumes: [
    { name: "College Crest Patch", colors: ["Red", "Yellow", "Blue"] },
  ]},
  { location: "Mexican Restaurant", costumes: [
    { name: "Taco", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Laundromats & Dry Cleaners", costumes: [
    { name: "Laundry Item", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Korean Restaurant", costumes: [
    { name: "Kimchi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Stationery Store", costumes: [
    { name: "Stationery", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Roadside", costumes: [
    { name: "Sticker (Green)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Sticker (Blue)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Sticker (Orange)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Coin", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Coin (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Weather", costumes: [
    { name: "Rainy Day: Leaf Hat", colors: ["Blue"] },
    { name: "Snowy Day: Snow", colors: ["Blue", "White", "Ice"] },
  ]},
  { location: "Fortune", costumes: [
    { name: "Daikichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Kichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Chukichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Shokichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Suekichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
];

const DECOR_SPECIAL_CATEGORIES = [
  { location: "Super Mario Keychain", costumes: [
    { name: "Super Mario Keychain", colors: ["Red", "Yellow", "Blue", "Purple"] },
  ]},
  { location: "Lunar New Year Ornament", costumes: [
    { name: "Lunar New Year Ornament: Red", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Lunar New Year Ornament: Gold", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Chess Piece", costumes: [
    { name: "Chess Piece", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Fingerboard", costumes: [
    { name: "Fingerboard", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Hanafuda Card", costumes: [
    { name: "Hanafuda Card (Volume 1)", colors: ["Red", "Yellow", "Blue", "Purple"] },
    { name: "Hanafuda Card (Volume 2)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Jack-o'-Lantern", costumes: [
    { name: "Jack-o'-Lantern", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Halloween Treat", costumes: [
    { name: "Halloween Treat", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Halloween Light", costumes: [
    { name: "Halloween Light", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "First Anniversary Snack", costumes: [
    { name: "First Anniversary Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Koppaite Space Suit", costumes: [
    { name: "Koppaite Space Suit", colors: ["Red", "Yellow", "Blue"] },
  ]},
  { location: "Mitten", costumes: [
    { name: "Mitten", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "2023 Glasses", costumes: [
    { name: "2023 Glasses", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "2024 Glasses", costumes: [
    { name: "2024 Glasses", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Valentine Sticker", costumes: [
    { name: "Valentine Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Reverse Valentine's Day Sticker", costumes: [
    { name: "Reverse Valentine's Day Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Present Sticker (Gold)", costumes: [
    { name: "Present Sticker (Gold)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Easter Egg", costumes: [
    { name: "Easter Egg", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Bunny Egg", costumes: [
    { name: "Bunny Egg", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Sneaker Keychain", costumes: [
    { name: "Sneaker Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Pikmin 4 Spaceship", costumes: [
    { name: "Pikmin 4 Spaceship", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Pikmin 4 Toy", costumes: [
    { name: "Pikmin 4 Toy", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Mahjong Tile", costumes: [
    { name: "Mahjong Tile", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Ice Cream", costumes: [
    { name: "Ice Cream: Classic", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Ice Cream: 2024 Flavor", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Ice Cream: Extra Flavor", colors: ["Ice"] },
  ]},
  { location: "Puzzle", costumes: [
    { name: "Puzzle: 2021 Fall Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Puzzle: 2022 Summer Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Puzzle: 2023 Summer Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Puzzle: 2024 Fall Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Spring Sticker", costumes: [
    { name: "Spring Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Summer Sticker", costumes: [
    { name: "Summer Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Fall Sticker", costumes: [
    { name: "Fall Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Winter Sticker", costumes: [
    { name: "Winter Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Playing Card", costumes: [
    { name: "Playing Card", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Cheese", costumes: [
    { name: "Cheese", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Coral", costumes: [
    { name: "Coral", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Paint", costumes: [
    { name: "Paint", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Rosette", costumes: [
    { name: "Red Rosette", colors: ["Red"] },
    { name: "Yellow Rosette", colors: ["Yellow"] },
    { name: "Purple Rosette", colors: ["Purple"] },
  ]},
  { location: "3rd Anniversary Cupcake", costumes: [
    { name: "3rd Anniversary Cupcake", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Ball Ornament", costumes: [
    { name: "Ball Ornament", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Party Popper 2025", costumes: [
    { name: "Party Popper 2025", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Chocolate", costumes: [
    { name: "Chocolate", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Rio Carnival", costumes: [
    { name: "Rio Carnival", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Afternoon Tea", costumes: [
    { name: "Afternoon Tea", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Nintendo Consoles '80-'95", costumes: [
    { name: "Nintendo Consoles '80-'95", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Tiny Instrument: Brass Band", costumes: [
    { name: "Tiny Instrument: Brass Band", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Surfboard Keychain", costumes: [
    { name: "Surfboard Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Shaved Ice", costumes: [
    { name: "Shaved Ice", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Mooncake", costumes: [
    { name: "Mooncake", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Photo Button Badge", costumes: [
    { name: "Photo Button Badge", colors: ["Red"] },
  ]},
  { location: "Calavera", costumes: [
    { name: "Calavera", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "4th Anniversary Flower Box", costumes: [
    { name: "4th Anniversary Flower Box", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "4th Anniversary Snack", costumes: [
    { name: "4th Anniversary Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "2025 Ornament", costumes: [
    { name: "2025 Ornament", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Pacifier", costumes: [
    { name: "Pacifier", colors: ["Red"] },
  ]},
  { location: "Osechi", costumes: [
    { name: "Osechi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "2026 Chocolate", costumes: [
    { name: "2026 Chocolate", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Color Powder", costumes: [
    { name: "Color Powder", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Klompen Keychain", costumes: [
    { name: "Klompen Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Game Pak", costumes: [
    { name: "Game Pak", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Flower Crown", costumes: [
    { name: "Flower Crown", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Tiny Instrument: Orchestra", costumes: [
    { name: "Tiny Instrument: Orchestra", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Golden Toy Airplane", costumes: [
    { name: "Golden Toy Airplane", colors: ["Yellow"] },
  ]},
];

// Representative emoji per location/category — placeholder until real costume art is added.
const DECOR_ICONS = {
  // DECOR_LOCATIONS
  "Restaurant": "🍽️", "Café": "☕", "Sweetshop": "🍬", "Movie Theater": "🎬",
  "Pharmacy": "💊", "Zoo": "🦁", "Forest": "🌲", "Waterside": "🎣",
  "Post Office": "📮", "Art Gallery": "🖼️", "Airport": "✈️", "Station": "🚉",
  "Beach": "🏖️", "Burger Place": "🍔", "Corner Store": "🏪", "Supermarket": "🛒",
  "Bakery": "🥖", "Hair Salon": "💇", "Clothes Store": "👕", "Park": "🍀",
  "Library & Bookstore": "📚", "Sushi Restaurant": "🍣", "Mountain": "⛰️",
  "Stadium": "⚽", "Theme Park": "🎡", "Bus Stop": "🚌", "Italian Restaurant": "🍕",
  "Ramen Restaurant": "🍜", "Bridge": "🌉", "Hotel": "🏨", "Makeup Store": "💄",
  "Appliances Store": "🔋", "Curry Restaurant": "🍛", "DIY Store": "🔧",
  "University & College": "🎓", "Mexican Restaurant": "🌮",
  "Laundromats & Dry Cleaners": "🧺", "Korean Restaurant": "🥘",
  "Stationery Store": "✏️", "Roadside": "🛣️", "Weather": "🌦️", "Fortune": "🔮",
  // DECOR_SPECIAL_CATEGORIES
  "Super Mario Keychain": "🍄", "Lunar New Year Ornament": "🧧", "Chess Piece": "♟️",
  "Fingerboard": "🛹", "Hanafuda Card": "🎴", "Jack-o'-Lantern": "🎃",
  "Halloween Treat": "🍭", "Halloween Light": "🕯️", "First Anniversary Snack": "🎂",
  "Koppaite Space Suit": "👽", "Mitten": "🧤", "2023 Glasses": "👓",
  "2024 Glasses": "🕶️", "Valentine Sticker": "💝", "Reverse Valentine's Day Sticker": "💌",
  "Present Sticker (Gold)": "🎁", "Easter Egg": "🥚", "Bunny Egg": "🐰",
  "Sneaker Keychain": "👟", "Pikmin 4 Spaceship": "🚀", "Pikmin 4 Toy": "🧸",
  "Mahjong Tile": "🀄", "Ice Cream": "🍦", "Puzzle": "🧩", "Spring Sticker": "🌸",
  "Summer Sticker": "☀️", "Fall Sticker": "🍁", "Winter Sticker": "❄️",
  "Playing Card": "🃏", "Cheese": "🧀", "Coral": "🪸", "Paint": "🎨",
  "Rosette": "🎖️", "3rd Anniversary Cupcake": "🧁", "Ball Ornament": "🎄",
  "Party Popper 2025": "🎉", "Chocolate": "🍫", "Rio Carnival": "🎭",
  "Afternoon Tea": "🫖", "Nintendo Consoles '80-'95": "🎮",
  "Tiny Instrument: Brass Band": "🎺", "Surfboard Keychain": "🏄", "Shaved Ice": "🍧",
  "Mooncake": "🥮", "Photo Button Badge": "📷", "Calavera": "💀",
  "4th Anniversary Flower Box": "💐", "4th Anniversary Snack": "🍪", "2025 Ornament": "🎄",
  "Pacifier": "🍼", "Osechi": "🍱", "2026 Chocolate": "🍫", "Color Powder": "🌈",
  "Klompen Keychain": "👞", "Game Pak": "💾", "Flower Crown": "🌼",
  "Tiny Instrument: Orchestra": "🎻", "Golden Toy Airplane": "🛩️",
};

const PIKMIN_COLORS = ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"];
const PIKMIN_COLOR_HEX = {
  Red: "#e0453c", Yellow: "#eec32a", Blue: "#4a90d9", Purple: "#9b59b6",
  White: "#c9ccd1", Rock: "#8a7863", Winged: "#f28fb0", Ice: "#7fd4e0",
};
const PIKMIN_COLOR_ABBR = { Red: "R", Yellow: "Y", Blue: "B", Purple: "P", White: "W", Rock: "Rk", Winged: "Wg", Ice: "Ic" };

function decorId(groupLocation, costumeName, color) {
  return `${slugify(groupLocation)}__${slugify(costumeName)}__${color}`;
}

function countDecorGroups(groups, collected) {
  let total = 0, done = 0;
  groups.forEach(g => {
    g.costumes.forEach(c => {
      (c.designs || c.colors).forEach(variant => {
        total++;
        if (collected[decorId(g.location, c.name, variant)]) done++;
      });
    });
  });
  return { total, done };
}

// Placeholder color-coded tile — swap for real per-color artwork later
function ColorTile({ color, available, collected, onToggle }) {
  const hex = PIKMIN_COLOR_HEX[color];
  if (!available) {
    return (
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#ccc", flexShrink: 0 }}>
        –
      </div>
    );
  }
  return (
    <button
      onClick={onToggle}
      title={color}
      style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        border: collected ? "none" : `2px solid ${hex}`,
        background: collected ? hex : "#fff",
        color: collected ? "#fff" : hex,
        fontSize: 9, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: collected ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
        transition: "background 0.15s, box-shadow 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {PIKMIN_COLOR_ABBR[color]}
    </button>
  );
}

// Numbered design toggle — for costumes with multiple non-color design variants (e.g. Battery sizes)
function DesignTile({ label, color, collected, onToggle }) {
  const hex = PIKMIN_COLOR_HEX[color];
  return (
    <button
      onClick={onToggle}
      title={`${color} · design ${label}`}
      style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        border: collected ? "none" : `2px solid ${hex}`,
        background: collected ? hex : "#fff",
        color: collected ? "#fff" : hex,
        fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: collected ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
        transition: "background 0.15s, box-shadow 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </button>
  );
}

// One costume variant's row of toggles — either up to 8 color toggles, or numbered design toggles
function CostumeRow({ groupLocation, costume, collected, onToggleColor, bulkMode, onBulkSet }) {
  const isDesignBased = !!costume.designs;
  const availSet = new Set(costume.colors);
  const ids = (costume.designs || costume.colors).map(v => decorId(groupLocation, costume.name, v));
  const collectedCount = ids.filter(id => collected[id]).length;
  const allCollected = collectedCount === ids.length;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5, gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#555", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{costume.name}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
          {bulkMode && (
            <button
              onClick={() => onBulkSet(ids, !allCollected)}
              style={{ fontSize: 10, fontWeight: 700, color: allCollected ? "#bbb" : O, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, whiteSpace: "nowrap" }}
            >
              {allCollected ? "Clear" : "Select all"}
            </button>
          )}
          <span style={{ fontSize: 10, color: "#bbb", whiteSpace: "nowrap" }}>{collectedCount}/{ids.length}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {isDesignBased
          ? costume.designs.map(design => (
              <DesignTile
                key={design}
                label={design}
                color={costume.color}
                collected={!!collected[decorId(groupLocation, costume.name, design)]}
                onToggle={() => onToggleColor(decorId(groupLocation, costume.name, design))}
              />
            ))
          : PIKMIN_COLORS.map(color => (
              <ColorTile
                key={color}
                color={color}
                available={availSet.has(color)}
                collected={!!collected[decorId(groupLocation, costume.name, color)]}
                onToggle={() => onToggleColor(decorId(groupLocation, costume.name, color))}
              />
            ))}
      </div>
    </div>
  );
}

// A location (or special-decor category) section: header + its costume rows
function DecorGroup({ group, collected, onToggleColor, isFirst, bulkMode, onBulkSet }) {
  const { total, done } = countDecorGroups([group], collected);
  const groupIds = group.costumes.flatMap(c => (c.designs || c.colors).map(variant => decorId(group.location, c.name, variant)));
  const allCollected = done === total;
  return (
    <div style={{ padding: "12px 0", borderTop: isFirst ? "none" : "1px solid #f0f8ec" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: DG, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{DECOR_ICONS[group.location] || "🎀"} {group.location}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexShrink: 0 }}>
          {bulkMode && (
            <button
              onClick={() => onBulkSet(groupIds, !allCollected)}
              style={{ fontSize: 11, fontWeight: 800, color: allCollected ? "#bbb" : G, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, whiteSpace: "nowrap" }}
            >
              {allCollected ? "Clear all" : "Select all"}
            </button>
          )}
          <span style={{ fontSize: 10, color: "#bbb", whiteSpace: "nowrap" }}>{done}/{total}</span>
        </div>
      </div>
      {group.costumes.map(c => (
        <CostumeRow key={c.name} groupLocation={group.location} costume={c} collected={collected} onToggleColor={onToggleColor} bulkMode={bulkMode} onBulkSet={onBulkSet} />
      ))}
    </div>
  );
}

// Progress ring
function Ring({ pct, color, size = 44 }) {
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

const G = "#4caf78", P = "#e879b0", O = "#f5a623", DG = "#2d6e2d", C = "#d4a017";

// ─── RESPONSIVE LAYOUT ────────────────────────────────────────────────────────
// Tracks viewport width so layout can reflow between phone and browser/desktop.
function useWindowWidth() {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 480));
  useEffect(() => {
    function onResize() { setWidth(window.innerWidth); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const winWidth = useWindowWidth();
  const isWide = winWidth >= 720; // threshold for switching to the side-by-side card layout
  const isSplit = winWidth >= 1100; // wide enough to show Now + Decor together, no tabs
  const containerMax = isSplit ? 1360 : 1200; // ceiling only — never forces width on a narrow screen
  const navMax = 360;

  // Defensively zero out any residual horizontal scroll on the split-view panes
  // (can otherwise get stuck mid-scroll when toggling in/out of split view).
  const nowPaneRef = useRef(null);
  const decorPaneRef = useRef(null);
  useEffect(() => {
    if (nowPaneRef.current) nowPaneRef.current.scrollLeft = 0;
    if (decorPaneRef.current) decorPaneRef.current.scrollLeft = 0;
  }, [isSplit]);

  const [tab, setTab] = useState("now");

  // Core state:
  // levels 1-99:  stepsInput = lifetime total steps walked; flowersInput = lifetime total flowers planted
  // levels 100+:  stepsInput = steps left this level;       flowersInput = flowers left this level
  const [level, setLevel] = useState(() => loadNum('pb_level', 101));
  const [stepsInput, setStepsInput] = useState(() => loadNum('pb_stepsInput', 334924));
  const [flowersInput, setFlowersInput] = useState(() => loadNum('pb_flowersInput', 243753));

  // Daily averages
  const [dSteps, setDSteps] = useState(() => loadNum('pb_dSteps', 8000));
  const [dFlowers, setDFlowers] = useState(() => loadNum('pb_dFlowers', 500));

  // Coins currently on hand (not earned-since-last-check — the actual wallet balance)
  const [coinsNow, setCoinsNow] = useState(() => loadNum('pb_coinsNow', 0));

  // Persist core stats + daily averages so they survive a reload/relaunch
  useEffect(() => { saveNum('pb_level', level); }, [level]);
  useEffect(() => { saveNum('pb_stepsInput', stepsInput); }, [stepsInput]);
  useEffect(() => { saveNum('pb_flowersInput', flowersInput); }, [flowersInput]);
  useEffect(() => { saveNum('pb_dSteps', dSteps); }, [dSteps]);
  useEffect(() => { saveNum('pb_dFlowers', dFlowers); }, [dFlowers]);
  useEffect(() => { saveNum('pb_coinsNow', coinsNow); }, [coinsNow]);

  // Decor collection state
  const [decorCollected, setDecorCollected] = useState(() => loadJSON('pb_decorCollected', {}));
  const [decorBulkMode, setDecorBulkMode] = useState(false);
  function toggleDecor(id) {
    setDecorCollected(prev => {
      const next = { ...prev, [id]: !prev[id] };
      saveJSON('pb_decorCollected', next);
      return next;
    });
  }
  function bulkSetDecor(ids, value) {
    setDecorCollected(prev => {
      const next = { ...prev };
      ids.forEach(id => { next[id] = value; });
      saveJSON('pb_decorCollected', next);
      return next;
    });
  }

  // Edit panel state
  const [editing, setEditing] = useState(false);
  const [editFocus, setEditFocus] = useState(null); // 'steps' | 'flowers' | 'level'
  const [totalStepsMode, setTotalStepsMode] = useState(() => {
    try { return localStorage.getItem('pb_totalStepsMode') === 'true'; } catch { return false; }
  });

  function toggleTotalStepsMode(val) {
    setTotalStepsMode(val);
    try { localStorage.setItem('pb_totalStepsMode', String(val)); } catch {}
  }
  const [eLevel, setELevel] = useState(101);
  const [eStepsInput, setEStepsInput] = useState(334924);
  const [eFlowersInput, setEFlowersInput] = useState(243753);
  const [eCoinsNow, setECoinsNow] = useState(0);
  const [eLevelRaw, setELevelRaw] = useState("101");
  const [eLevelError, setELevelError] = useState("");

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function openEdit(focus = null) {
    setELevel(level);
    setEStepsInput(stepsInput);
    setEFlowersInput(flowersInput);
    setECoinsNow(coinsNow);
    setELevelRaw(String(level));
    setELevelError("");
    setEditFocus(focus);
    setEditing(true);
  }

  function validateLevel(str) {
    if (!/^\d+$/.test(str)) return "Numbers only.";
    const n = parseInt(str, 10);
    if (n < 1) return "Level must be at least 1.";
    if (n > MAX_KNOWN) return `Max known level is ${MAX_KNOWN}.`;
    return "";
  }

  function handleLevelChange(str) {
    setELevelRaw(str.trim());
    const err = validateLevel(str.trim());
    setELevelError(err);
    if (!err) setELevel(parseInt(str.trim(), 10));
  }

  function saveEdit() {
    if (eLevelError) return;
    setLevel(eLevel);
    setStepsInput(eStepsInput);
    setFlowersInput(eFlowersInput);
    setCoinsNow(eCoinsNow);
    setEditing(false);
  }

  // Compute derived values
  const req = getLevelReq(level);
  // For levels 1-99: stepsInput is lifetime total, so stepsLeft = req - total (may already be 0)
  // For levels 100+: stepsInput is already steps left
  const stepsLeft = (level < 100 && totalStepsMode)
    ? (req ? Math.max(0, req.steps - stepsInput) : 0)
    : stepsInput;
  const flowersLeft = flowersInput;
  const rem = req ? buildRemaining(stepsLeft, flowersLeft, level) : null;

  let stepDays = Infinity, flowerDays = 0, stepPct = 0, flowerPct = 0;
  if (rem && req) {
    stepDays = dSteps > 0 ? rem.stepsLeft / dSteps : Infinity;
    flowerDays = rem.flowersLeft > 0 && dFlowers > 0 ? rem.flowersLeft / dFlowers : 0;
    stepPct = req.steps > 0 ? Math.round((req.steps - rem.stepsLeft) / req.steps * 100) : 100;
    flowerPct = req.flowers != null && req.flowers > 0
      ? Math.round((req.flowers - rem.flowersLeft) / req.flowers * 100) : 100;
  }
  const bothDays = Math.ceil(Math.max(stepDays, flowerDays));

  const coinsDay = coinsPerDay(dFlowers);
  const coinsCapped = dFlowers / FLOWERS_PER_COIN > MAX_COINS_PER_DAY;
  const coinsEarnedByThen = Number.isFinite(bothDays) ? coinsDay * bothDays : 0;
  const coinsAtLevelUp = coinsNow + coinsEarnedByThen;

  const timeline = projectLevels(level, stepsLeft, flowersLeft, dSteps, dFlowers, 130);

  const TABS = [
    { id: "now", icon: "🌸", label: "Now" },
    { id: "decor", icon: "🎀", label: "Decor" },
  ];

  const regularStats = countDecorGroups(DECOR_LOCATIONS, decorCollected);
  const specialStats = countDecorGroups(DECOR_SPECIAL_CATEGORIES, decorCollected);

  // ── NOW tab body — reused standalone (tabbed mode) and side-by-side (split-view) ──
  const nowBody = (
    <>
      {!rem ? (
        <div style={{ background: "#fff", borderRadius: 18, padding: 18, textAlign: "center", color: "#aaa", fontSize: 13 }}>
          No level data available above Lv {MAX_KNOWN}.<br />
          <span style={{ fontSize: 11 }}>Check back when the wiki updates for Lv 115–130.</span>
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
          <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
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

          {/* ETA */}
          <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
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
              {level + timeline.length >= MAX_KNOWN && (
                <div style={{ margin: "10px 0 14px", padding: "8px 10px", background: "#fef9e7", borderRadius: 10, fontSize: 11, color: "#c8a800" }}>
                  ⚠️ Wiki data only goes to Lv {MAX_KNOWN}. Levels 115–130 not yet documented.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Small inline toggle for bulk "Select all" mode — sits in each section's own header
  // instead of as a separate banner, since it's a mode for the lists directly below it.
  function QuickSelectToggle() {
    return (
      <button
        onClick={() => setDecorBulkMode(v => !v)}
        title='Adds "Select all" buttons to mark a whole costume or location done at once'
        style={{
          display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
          background: decorBulkMode ? "#fff3de" : "#f5f5f5", border: `1px solid ${decorBulkMode ? O : "transparent"}`,
          borderRadius: 20, padding: "4px 10px 4px 8px", cursor: "pointer", fontFamily: "inherit",
          fontSize: 10, fontWeight: 700, color: decorBulkMode ? O : "#999", transition: "all 0.15s",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ fontSize: 11 }}>⚡</span>
        <span>Quick select</span>
      </button>
    );
  }

  // ── DECOR tab body — reused standalone (tabbed mode) and side-by-side (split-view) ──
  const decorBody = (
    <>
      <div style={{ display: "flex", flexDirection: (isWide && !isSplit) ? "row" : "column", gap: 12, alignItems: (isWide && !isSplit) ? "flex-start" : "stretch" }}>
      <div style={{ flex: 1, width: "100%", background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
          <div style={{ fontWeight: 800, color: DG, fontSize: 13 }}>🎀 Regular Decor</div>
          <QuickSelectToggle />
        </div>
        <div style={{ fontSize: 11, color: "#aaa" }}>{regularStats.done}/{regularStats.total} collected · tap a color to toggle</div>
        {DECOR_LOCATIONS.map((g, i) => (
          <DecorGroup key={g.location} group={g} collected={decorCollected} onToggleColor={toggleDecor} isFirst={i === 0} bulkMode={decorBulkMode} onBulkSet={bulkSetDecor} />
        ))}
      </div>

      <div style={{ flex: 1, width: "100%", background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
          <div style={{ fontWeight: 800, color: DG, fontSize: 13 }}>✨ Special &amp; Event Decor</div>
          <QuickSelectToggle />
        </div>
        <div style={{ fontSize: 11, color: "#aaa" }}>{specialStats.done}/{specialStats.total} collected · tap a color to toggle</div>
        {DECOR_SPECIAL_CATEGORIES.map((g, i) => (
          <DecorGroup key={g.location} group={g} collected={decorCollected} onToggleColor={toggleDecor} isFirst={i === 0} bulkMode={decorBulkMode} onBulkSet={bulkSetDecor} />
        ))}
      </div>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", height: isSplit ? "100vh" : "auto", width: "100%", overflow: isSplit ? "hidden" : "visible", background: "linear-gradient(160deg,#c8f0a8 0%,#7dc87b 50%,#4a9e48 100%)", fontFamily: "'Nunito','Trebuchet MS',sans-serif" }}>
    <div style={{ maxWidth: containerMax, margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh", height: isSplit ? "100vh" : "auto", overflow: isSplit ? "hidden" : "visible", transition: "max-width 0.15s" }}>

      {/* Header */}
      <div style={{ padding: "18px 18px 0", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 26 }}>🌱</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 19, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>Pikmin Bloom</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Level Calculator</div>
          </div>
        </div>
        <div style={{ marginTop: 8, background: "rgba(0,0,0,0.15)", borderRadius: 20, padding: "4px 14px", display: "inline-block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: 0.3 }}>
          🕐 {fmtTime(now)} · {fmtDate(now)}
        </div>
      </div>

      {/* Level badge row */}
      <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <button onClick={() => openEdit("level")} style={{ background: O, borderRadius: 12, padding: "5px 13px", fontWeight: 900, fontSize: 19, color: "#fff", boxShadow: "0 3px 10px rgba(245,166,35,0.4)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Lv {level}</button>
        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: "0 8px" }}>→</span>
        <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 12, padding: "5px 13px", fontWeight: 900, fontSize: 19, color: "#fff" }}>Lv {level + 1}</div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, minHeight: 0, padding: isSplit ? "12px 14px 12px" : "12px 14px 90px",
        display: isSplit ? "flex" : "block", flexDirection: "column", overflow: isSplit ? "hidden" : "visible",
      }}>

        {/* ── EDIT PANEL ── */}
        {editing && (
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
              <ValidatedInput value={eStepsInput} onChange={setEStepsInput} placeholder={eLevel < 100 && totalStepsMode ? "e.g. 5250000" : "e.g. 334924"} accentColor="#c8e6b8" autoFocus={editFocus === "steps"} />
            </div>

            {/* Flowers to go */}
            <div style={{ marginBottom: 16 }}>
              {req && req.flowers != null ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 2 }}>🌸 Flowers to go</div>
                  <div style={{ fontSize: 10, color: "#aaa", marginBottom: 5 }}>
                    The game requires <b>{LEVELS[eLevel+1] ? fmt(LEVELS[eLevel+1].flowers) : "—"}</b> flowers for Lv {eLevel}→{eLevel+1}. Enter what it shows you left.
                  </div>
                  <ValidatedInput value={eFlowersInput} onChange={setEFlowersInput} placeholder={eLevel < 100 ? "e.g. 85000" : "e.g. 243753"} accentColor="#f8c8e8" autoFocus={editFocus === "flowers"} />
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
        )}

        {/* ── NOW + DECOR — side by side once the window is wide enough, tabbed otherwise ── */}
        {isSplit ? (
          <div style={{ display: "flex", gap: 20, flex: 1, minHeight: 0 }}>
            <div ref={nowPaneRef} style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", overflowX: "hidden", scrollbarGutter: "stable", paddingRight: 8, boxSizing: "border-box" }}>{nowBody}</div>
            <div ref={decorPaneRef} style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", overflowX: "hidden", scrollbarGutter: "stable", paddingRight: 8, boxSizing: "border-box" }}>{decorBody}</div>
          </div>
        ) : (
          <>
            {tab === "now" && nowBody}
            {tab === "decor" && decorBody}
          </>
        )}

        {/* Pikipedia footnote */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
          {isSplit
            ? "Data from pikminwiki.com/Level, Decor_Pikmin & Special_Decor_Pikmin · Lv 115–130 not yet documented"
            : tab === "decor"
              ? "Data from pikminwiki.com/Decor_Pikmin & Special_Decor_Pikmin"
              : "Data from pikminwiki.com/Level · Lv 115–130 not yet documented"}
        </div>
      </div>
      </div>

      {/* Bottom nav — full-width bar on phone, compact floating dock on desktop; hidden once both pages show side by side */}
      {!isSplit && (
        <div style={{
          position: "fixed", bottom: isWide ? 16 : 0, left: "50%", transform: "translateX(-50%)",
          width: isWide ? "auto" : "100%", maxWidth: isWide ? navMax : containerMax,
          background: "rgba(255,255,255,0.97)", borderTop: isWide ? "none" : "1px solid #e8f5e0",
          borderRadius: isWide ? 20 : 0, display: "flex", justifyContent: "center",
          boxShadow: isWide ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: isWide ? "none" : 1, width: isWide ? 84 : "auto", background: "none", border: "none", padding: isWide ? "10px 0 8px" : "11px 0 9px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", fontFamily: "inherit", color: tab === t.id ? DG : "#bbb", borderTop: isWide ? "none" : `3px solid ${tab === t.id ? G : "transparent"}`, transition: "all 0.15s" }}>
              <span style={{ fontSize: 19 }}>{t.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
