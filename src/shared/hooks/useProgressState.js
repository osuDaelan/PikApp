import { useEffect, useState } from "react";
import { guestProgressStore } from "../../storage/progressStore.js";

// Mount a fresh feature/session when changing stores so account state stays isolated.
export default function useProgressState(field, fallback, store = guestProgressStore) {
  const [value, setValue] = useState(() => store.read(field, fallback));
  useEffect(() => { store.write(field, value); }, [field, store, value]);
  return [value, setValue];
}
