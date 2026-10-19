import { useCallback, useState } from "react";
import useProgressState from "../../shared/hooks/useProgressState.js";
import { guestProgressStore } from "../../storage/progressStore.js";
import useSetCompletion from "./useSetCompletion.js";

export default function useDecorCollection(store = guestProgressStore) {
  const [decorCollected, setDecorCollected] = useProgressState("decorCollected", {}, store);
  const [showAllDecor, setShowAllDecor] = useProgressState("showAllDecor", false, store);
  const [decorBulkMode, setDecorBulkMode] = useState(false);
  const { completion, dismissCompletion } = useSetCompletion(decorCollected);

  function toggleShowAllDecor() { setShowAllDecor(value => !value); }
  const toggleDecor = useCallback(id => {
    setDecorCollected(previous => ({ ...previous, [id]: !previous[id] }));
  }, [setDecorCollected]);
  function bulkSetDecor(ids, value) {
    setDecorCollected(previous => {
      const next = { ...previous };
      ids.forEach(id => { next[id] = value; });
      return next;
    });
  }

  return { decorCollected, decorBulkMode, setDecorBulkMode, showAllDecor, toggleShowAllDecor, toggleDecor, bulkSetDecor, completion, dismissCompletion };
}
