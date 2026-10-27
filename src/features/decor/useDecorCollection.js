import { useCallback, useEffect, useState } from "react";
import useProgressState from "../../shared/hooks/useProgressState.js";
import { guestProgressStore } from "../../storage/progressStore.js";
import useSetCompletion from "./useSetCompletion.js";
import { DECOR_SEARCH_GRACE_MS } from "./search.js";
import { rareVisibilityKey } from "./rareVisibility.js";

export default function useDecorCollection(store = guestProgressStore) {
  const [decorCollected, setDecorCollected] = useProgressState("decorCollected", {}, store);
  const [showAllDecor, setShowAllDecor] = useProgressState("showAllDecor", false, store);
  const [rareVisibility, setRareVisibility] = useProgressState("rareVisibility", {}, store);
  const [showShrineDecor, setShowShrineDecor] = useProgressState("showShrineDecor", false, store);
  const [decorBulkMode, setDecorBulkMode] = useState(false);
  const [decorSearchQuery, updateDecorSearchQuery] = useState("");
  const [recentDecorEdits, setRecentDecorEdits] = useState(() => new Map());
  const { completion, dismissCompletion } = useSetCompletion(decorCollected);

  const setDecorSearchQuery = useCallback(query => {
    // A different query must never inherit temporarily retained results.
    setRecentDecorEdits(new Map());
    updateDecorSearchQuery(query);
  }, []);
  const recordSearchEdits = useCallback((ids, keep = true) => {
    const expiresAt = performance.now() + DECOR_SEARCH_GRACE_MS;
    setRecentDecorEdits(previous => {
      const next = new Map(previous);
      ids.forEach(id => { if (keep) next.set(id, expiresAt); else next.delete(id); });
      return next;
    });
  }, []);
  useEffect(() => {
    if (!recentDecorEdits.size) return;
    // One timer for the nearest deadline, even for a bulk edit. Each tile gets its own window.
    const delay = Math.max(0, Math.min(...recentDecorEdits.values()) - performance.now());
    const timer = window.setTimeout(() => {
      const now = performance.now();
      setRecentDecorEdits(previous => new Map([...previous].filter(([, expiresAt]) => expiresAt > now)));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [recentDecorEdits]);

  function toggleShowAllDecor() { setShowAllDecor(value => !value); }
  const setRareVisibilityMode = useCallback((group, mode) => {
    const key = rareVisibilityKey(group);
    setRareVisibility(previous => {
      const next = { ...previous };
      if (mode === "auto") delete next[key];
      else next[key] = mode;
      return next;
    });
  }, [setRareVisibility]);
  const toggleDecor = useCallback(id => {
    if (decorSearchQuery.trim()) recordSearchEdits([id]);
    setDecorCollected(previous => ({ ...previous, [id]: !previous[id] }));
  }, [setDecorCollected, decorSearchQuery, recordSearchEdits]);
  function bulkSetDecor(ids, value) {
    if (decorSearchQuery.trim()) recordSearchEdits(ids, value);
    setDecorCollected(previous => {
      const next = { ...previous };
      ids.forEach(id => { next[id] = value; });
      return next;
    });
  }

  return { decorCollected, decorBulkMode, setDecorBulkMode, decorSearchQuery, setDecorSearchQuery, recentDecorEdits, showAllDecor, toggleShowAllDecor, rareVisibility, setRareVisibilityMode, showShrineDecor, setShowShrineDecor, toggleDecor, bulkSetDecor, completion, dismissCompletion };
}
