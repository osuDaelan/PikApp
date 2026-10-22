import React, { useEffect, useRef, useState } from "react";
import { calculatorSnapshot } from "../../storage/calculatorBackupData.js";
import { guestProgressStore } from "../../storage/progressStore.js";
import { assertLocalCalculatorRestoreVerified, isCalculatorBackedUp, markCalculatorChanged, saveLocalCalculatorBackup } from "../../storage/localCalculatorBackup.js";

export default function LocalCalculatorSave({ calculator }) {
  const snapshot = JSON.stringify(calculatorSnapshot(calculator));
  const initialSnapshot = useRef(snapshot);
  const [status, setStatus] = useState("Saving local backup…");
  useEffect(() => {
    const data = JSON.parse(snapshot);
    try { guestProgressStore.assertReadable(); }
    catch { setStatus("File backup paused · restore browser storage and reload"); return; }
    try { assertLocalCalculatorRestoreVerified(); }
    catch {
      // Do not make the startup fallback newer than the unread file. Later user
      // edits still need a freshness marker so restoring on reload preserves them.
      if (snapshot !== initialSnapshot.current) {
        try { markCalculatorChanged(Date.now()); } catch { /* Browser save status reports unavailable storage. */ }
      }
      setStatus("File backup paused · reload to retry restoration");
      return;
    }
    if (isCalculatorBackedUp(data)) { setStatus("Saved locally · file backup"); return; }
    let savedAt = Date.now();
    let cancelled = false;
    let retry;
    setStatus("Saving local backup…");
    try { savedAt = markCalculatorChanged(savedAt); }
    catch { setStatus("Browser storage unavailable · backing up to file…"); }
    async function save() {
      setStatus("Saving local backup…");
      try {
        await saveLocalCalculatorBackup(data, savedAt);
        if (!cancelled) setStatus("Saved locally · file backup");
      } catch (error) {
        if (!cancelled) {
          if (error.code === "RESTORE_UNVERIFIED") {
            setStatus("File backup paused · reload to retry restoration");
            return;
          }
          setStatus("File backup unavailable · retrying…");
          retry = window.setTimeout(save, 5000);
        }
      }
    }
    const timer = window.setTimeout(save, 400);
    const flush = () => { saveLocalCalculatorBackup(data, savedAt, { keepalive: true }).catch(() => {}); };
    window.addEventListener("pagehide", flush);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(retry);
      window.removeEventListener("pagehide", flush);
    };
  }, [snapshot]);
  return <div role="status" style={{ textAlign: "center", marginTop: 7, fontSize: 10, color: "white", textShadow: "0 1px 3px #000" }}>
    {status}
  </div>;
}
