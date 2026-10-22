import { LEVELS, MAX_KNOWN } from "./levelData.js";

// Returns the full requirement for reaching (level+1)
export function getLevelReq(level) {
  const next = level + 1;
  if (next > MAX_KNOWN || !LEVELS[next]) return null;
  return LEVELS[next];
}

// Switching the editor's representation must keep the same remaining progress.
export function convertStepEntryMode(value, level, fromLifetime, toLifetime) {
  const req = getLevelReq(level);
  if (!req || level >= 100 || fromLifetime === toLifetime) return value;
  return Math.max(0, req.steps - value);
}

// stepsLeft / flowersLeft are what the game shows you
export function buildRemaining(stepsLeft, flowersLeft, level) {
  const req = getLevelReq(level);
  if (!req) return null;
  return {
    stepsLeft: Math.max(0, stepsLeft),
    flowersLeft: Math.max(0, flowersLeft),
    stepsGoal: req.steps,
    flowersGoal: req.flowers,
  };
}

export function daysToComplete(remaining, dailyAverage) {
  if (!(remaining > 0)) return 0;
  return dailyAverage > 0 ? remaining / dailyAverage : Infinity;
}

export function projectLevels(level, stepsLeft, flowersLeft, dSteps, dFlowers, count = 10) {
  const out = [];
  let sL = stepsLeft, fL = flowersLeft, lvl = level, dayOff = 0;
  for (let i = 0; i < count; i++) {
    const nextLv = lvl + 1;
    if (nextLv > MAX_KNOWN) break;
    const sd = daysToComplete(sL, dSteps);
    const fd = daysToComplete(fL, dFlowers);
    const days = Math.ceil(Math.max(sd, fd));
    if (!Number.isFinite(days)) break;
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

export const FLOWERS_PER_COIN = 250;
export const MAX_COINS_PER_DAY = 60;
export function coinsPerDay(dFlowers) {
  return Math.min(Math.floor(dFlowers / FLOWERS_PER_COIN), MAX_COINS_PER_DAY);
}
