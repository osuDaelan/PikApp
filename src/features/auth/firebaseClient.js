import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const APP_NAME = "pikapp-sign-in";

export function createFirebaseAuthClient(config) {
  const app = getApps().find(item => item.name === APP_NAME) || initializeApp(config, APP_NAME);
  // Firebase restores its browser session; app progress still uses the guest store.
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  return {
    watch(onUser, onError) { return onAuthStateChanged(auth, onUser, onError); },
    // Call directly from the user's click after initialization to retain activation.
    signIn() { return signInWithPopup(auth, provider).then(() => {}); },
    signOut() { return signOut(auth); },
  };
}
