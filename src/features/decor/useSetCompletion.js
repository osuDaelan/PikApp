import { useCallback, useEffect, useRef, useState } from "react";
import { newlyCompletedSets } from "./setCompletion.js";

export default function useSetCompletion(collected) {
  const previous = useRef(collected);
  const sequence = useRef(0);
  const [completion, setCompletion] = useState(null);

  useEffect(() => {
    const sets = newlyCompletedSets(previous.current, collected);
    previous.current = collected;
    if (sets.length) setCompletion({ id: ++sequence.current, sets });
  }, [collected]);

  const dismissCompletion = useCallback(id => {
    setCompletion(current => current?.id === id ? null : current);
  }, []);

  return { completion, dismissCompletion };
}
