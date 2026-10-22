import { useCallback, useEffect, useState } from "react";
import { createMapStore, mergePins } from "./mapStorage.js";
import { mapViewUrl, viewportFromParams } from "./coordinates.js";

export default function useMapProgress() {
  const [store] = useState(() => createMapStore());
  const [loaded] = useState(() => store.read());
  const [state, setState] = useState(() => ({ ...loaded.state,
    viewport: viewportFromParams(new URLSearchParams(window.location.search)) || loaded.state.viewport }));
  const [saveError, setSaveError] = useState(loaded.error);
  const [recoveryRaw, setRecoveryRaw] = useState(loaded.raw);
  const getTransferState = useCallback(() => store.getTransferState(state), [store, state]);
  useEffect(() => {
    const result = store.write(state);
    setSaveError(result.error);
  }, [store, state]);
  useEffect(() => {
    // Replace the current map view rather than adding history for every pan.
    // Re-entering a shared link now restores the latest view, not stale params.
    window.history.replaceState({}, "", mapViewUrl(window.location.href, state.viewport));
  }, [state.viewport]);
  function importPins(pins) {
    const next = { ...state, pins: mergePins(state.pins, pins) };
    const result = store.write(next, { replaceUnreadable: true });
    setSaveError(result.error);
    if (!result.ok) return false;
    setRecoveryRaw(null);
    setState(next);
    return true;
  }
  return { state, setState, saveError, recoveryRaw, importPins, getTransferState };
}
