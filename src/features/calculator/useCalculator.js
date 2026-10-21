import { useState } from "react";
import useProgressState from "../../shared/hooks/useProgressState.js";
import { guestProgressStore } from "../../storage/progressStore.js";
import { MAX_KNOWN } from "./levelData.js";
import { getLevelReq, buildRemaining, coinsPerDay, projectLevels, FLOWERS_PER_COIN, MAX_COINS_PER_DAY } from "./calculations.js";

export default function useCalculator(store = guestProgressStore) {
  // Core state:
  // Below level 100, stepsInput can be lifetime total or remaining, per totalStepsMode.
  // From level 100 onward, stepsInput is remaining. flowersInput is always remaining.
  const [level, setLevel] = useProgressState("level", 101, store);
  const [stepsInput, setStepsInput] = useProgressState("stepsInput", 334924, store);
  const [flowersInput, setFlowersInput] = useProgressState("flowersInput", 243753, store);

  // Daily averages
  const [dSteps, setDSteps] = useProgressState("dSteps", 8000, store);
  const [dFlowers, setDFlowers] = useProgressState("dFlowers", 500, store);

  // Coins currently on hand (not earned-since-last-check — the actual wallet balance)
  const [coinsNow, setCoinsNow] = useProgressState("coinsNow", 0, store);

  // Edit panel state
  const [editing, setEditing] = useState(false);
  const [editFocus, setEditFocus] = useState(null); // 'steps' | 'flowers' | 'level'
  const [totalStepsMode, toggleTotalStepsMode] = useProgressState("totalStepsMode", false, store);
  const [eLevel, setELevel] = useState(101);
  const [eStepsInput, setEStepsInput] = useState(334924);
  const [eFlowersInput, setEFlowersInput] = useState(243753);
  const [eCoinsNow, setECoinsNow] = useState(0);
  const [eLevelRaw, setELevelRaw] = useState("101");
  const [eLevelError, setELevelError] = useState("");

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
  // Convert lifetime steps only when that entry mode is active below level 100.
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
  return {
    level, stepsInput, flowersInput, req, rem, stepPct, flowerPct, stepDays, flowerDays, bothDays, timeline,
    coinsNow, coinsDay, coinsCapped, coinsEarnedByThen, coinsAtLevelUp,
    dSteps, setDSteps, dFlowers, setDFlowers,
    editing, setEditing, editFocus, openEdit, saveEdit, handleLevelChange,
    eLevel, eLevelRaw, eLevelError,
    eStepsInput, setEStepsInput, eFlowersInput, setEFlowersInput, eCoinsNow, setECoinsNow,
    totalStepsMode, toggleTotalStepsMode,
  };
}
