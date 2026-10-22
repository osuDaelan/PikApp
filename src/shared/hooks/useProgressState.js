import { useCallback, useEffect, useRef, useState } from "react";
import { guestProgressStore } from "../../storage/progressStore.js";

// Mount a fresh feature/session when changing stores so account state stays isolated.
export default function useProgressState(field, fallback, store = guestProgressStore) {
  const [value, setValue] = useState(() => store.read(field, fallback));
  const [editVersion, setEditVersion] = useState(0);
  const edited = useRef(false);
  const update = useCallback(next => {
    edited.current = true;
    setValue(next);
    setEditVersion(version => version + 1);
  }, []);
  useEffect(() => {
    store.write(field, value, { allowUnreadable: edited.current });
    edited.current = false;
  }, [field, store, value, editVersion]);
  return [value, update];
}
