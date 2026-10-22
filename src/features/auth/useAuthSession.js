import { useEffect, useState, useSyncExternalStore } from "react";
import { createAuthSession } from "./authSession.js";
import { readFirebaseConfig } from "./firebaseConfig.js";

export default function useAuthSession() {
  const [session] = useState(() => {
    const config = readFirebaseConfig(import.meta.env);
    return createAuthSession({
      configured: config !== null,
      loadClient: () => import("./firebaseClient.js").then(module => module.createFirebaseAuthClient(config)),
    });
  });
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  useEffect(() => session.start(), [session]);
  return { ...state, signIn: session.signIn, signOut: session.signOut, retry: session.retry };
}
