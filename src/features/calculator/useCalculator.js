import { useState } from "react";
import useProgressState from "../../shared/hooks/useProgressState.js";
import { guestProgressStore } from "../../storage/progressStore.js";
import { MAX_KNOWN } from "./levelData.js";
import { getLevelReq, buildRemaining, coinsPerDay, projectLevels, daysToComplete, convertStepEntryMode, FLOWERS_PER_COIN, MAX_COINS_PER_DAY } from "./calculations.js";

export default function useCalculator(store = guestProgressStore) {
  // Core state:
  // Below level 100, stepsInput can be lifetime total or remaining, per totalStepsMode.
  // From level 100 onward, stepsInput is remaining. flowersInput is always remaining.
  // These fallbacks apply only to missing fields; existing saves and local backups win.
  const [level, setLevel] = useProgressState("level", 1, store);
  const [stepsInput, setStepsInput] = useProgressState("stepsInput", 0, store);
  const [flowersInput, setFlowersInput] = useProgressState("flowersInput", 0, store);

  // Daily averages
  const [dSteps, setDSteps] = useProgressState("dSteps", 0, store);
  const [dFlowers, setDFlowers] = useProgressState("dFlowers", 0, store);

  // Coins currently on hand (not earned-since-last-check — the actual wallet balance)
  const [coinsNow, setCoinsNow] = useProgressState("coinsNow", 0, store);

  // Edit panel state
  const [editing, setEditing] = useState(false);
  const [editFocus, setEditFocus] = useState(null); // 'steps' | 'flowers' | 'level'
  const [totalStepsMode, setTotalStepsMode] = useProgressState("totalStepsMode", false, store);
  const [eTotalStepsMode, setETotalStepsMode] = useState(totalStepsMode);
  const [eLevel, setELevel] = useState(level);
  const [eStepsInput, setEStepsInput] = useState(stepsInput);
  const [eFlowersInput, setEFlowersInput] = useState(flowersInput);
  const [eCoinsNow, setECoinsNow] = useState(coinsNow);
  const [eLevelRaw, setELevelRaw] = useState(String(level));
  const [eLevelError, setELevelError] = useState("");

  function openEdit(focus = null) {
    setELevel(level);
    setEStepsInput(stepsInput);
    setEFlowersInput(flowersInput);
    setECoinsNow(coinsNow);
    setETotalStepsMode(totalStepsMode);
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
    setTotalStepsMode(eTotalStepsMode);
    setEditing(false);
  }

  function toggleEditStepsMode(nextMode) {
    setEStepsInput(value => convertStepEntryMode(value, eLevel, eTotalStepsMode, nextMode));
    setETotalStepsMode(nextMode);
  }

  // Compute derived values
  const req = getLevelReq(level);
  // Convert lifetime steps only when that entry mode is active below level 100.
  const stepsLeft = (level < 100 && totalStepsMode)
    ? (req ? Math.max(0, req.steps - stepsInput) : 0)
    : stepsInput;
  const flowersLeft = req?.flowers ? flowersInput : 0;
  const rem = req ? buildRemaining(stepsLeft, flowersLeft, level) : null;

  let stepDays = Infinity, flowerDays = 0, stepPct = 0, flowerPct = 0;
  if (rem && req) {
    stepDays = daysToComplete(rem.stepsLeft, dSteps);
    flowerDays = daysToComplete(rem.flowersLeft, dFlowers);
    stepPct = req.steps > 0 ? Math.round((req.steps - rem.stepsLeft) / req.steps * 100) : 100;
    flowerPct = req.flowers != null && req.flowers > 0
      ? Math.round((req.flowers - rem.flowersLeft) / req.flowers * 100) : 100;
  }
  const bothDays = Math.ceil(Math.max(stepDays, flowerDays));
  // A zero step average is fine when all steps are already complete; only the
  // outstanding requirements need a positive rate. Keep fresh zero saves in setup.
  const canProject = Boolean(rem && (dSteps > 0 || dFlowers > 0) && Number.isFinite(bothDays));

  const coinsDay = coinsPerDay(dFlowers);
  const coinsCapped = dFlowers / FLOWERS_PER_COIN > MAX_COINS_PER_DAY;
  const coinsEarnedByThen = canProject ? coinsDay * bothDays : 0;
  const coinsAtLevelUp = coinsNow + coinsEarnedByThen;

  const timeline = canProject ? projectLevels(level, stepsLeft, flowersLeft, dSteps, dFlowers, 130) : [];
  return {
    level, stepsInput, flowersInput, req, rem, stepPct, flowerPct, stepDays, flowerDays, bothDays, canProject, timeline,
    coinsNow, coinsDay, coinsCapped, coinsEarnedByThen, coinsAtLevelUp,
    dSteps, setDSteps, dFlowers, setDFlowers,
    editing, setEditing, editFocus, openEdit, saveEdit, handleLevelChange,
    eLevel, eLevelRaw, eLevelError,
    eStepsInput, setEStepsInput, eFlowersInput, setEFlowersInput, eCoinsNow, setECoinsNow,
    totalStepsMode, eTotalStepsMode, toggleEditStepsMode,
  };
}
