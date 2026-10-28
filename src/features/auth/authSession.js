// This controller owns authentication only. It never reads or changes progress.
export function authErrorMessage(error, action = "sign-in") {
  switch (error?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.";
    case "auth/unauthorized-domain":
    case "auth/operation-not-allowed":
      return "Google sign-in isn't available on this website yet. You can keep using guest mode.";
    case "auth/network-request-failed":
      return "Couldn't reach the sign-in service. Check your connection and try again.";
    case "auth/web-storage-unsupported":
    case "auth/unsupported-persistence-type":
      return "This browser couldn't save a sign-in session. Allow site storage or try another browser.";
    case "auth/account-exists-with-different-credential":
      return "An account with this email uses a different sign-in method. Use that method to sign in.";
    case "auth/user-disabled":
      return "This account can't sign in. You can continue using guest mode.";
    case "auth/invalid-user-token":
    case "auth/user-token-expired":
      return "Your sign-in session expired. Please try signing in again.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Wait a moment and try again.";
    default:
      return action === "sign-out"
        ? "Couldn't sign out. Please try again."
        : "Couldn't complete Google sign-in. Please try again.";
  }
}

function safeUser(user) {
  if (!user || typeof user.uid !== "string" || !user.uid) return null;
  return Object.freeze({ uid: user.uid,
    displayName: typeof user.displayName === "string" ? user.displayName : "",
    email: typeof user.email === "string" ? user.email : "" });
}

function sameUser(first, second) {
  return first === second || Boolean(first && second && first.uid === second.uid
    && first.displayName === second.displayName && first.email === second.email);
}

export function createAuthSession({ configured, loadClient }) {
  let snapshot = Object.freeze({ status: configured ? "loading" : "unconfigured",
    user: null, pending: null, error: "" });
  let generation = 0, running = false, client = null, unwatch = null, operation = null;
  const listeners = new Set(), leases = new Set();
  const current = run => running && run === generation;

  function update(patch) {
    const next = { ...snapshot, ...patch };
    if (sameUser(next.user, snapshot.user)) next.user = snapshot.user;
    if (Object.keys(next).every(key => next[key] === snapshot[key])) return;
    snapshot = Object.freeze(next);
    for (const listener of [...listeners]) listener();
  }

  function stop() {
    running = false;
    generation++;
    operation = null;
    client = null;
    const cleanup = unwatch;
    unwatch = null;
    try { cleanup?.(); } catch { /* Cleanup must not block leaving the app. */ }
  }

  function begin() {
    stop();
    if (!configured || !leases.size) return;
    running = true;
    const run = generation;
    update({ status: "loading", user: null, pending: null, error: "" });
    Promise.resolve().then(() => current(run) ? loadClient() : null).then(loaded => {
      if (!current(run)) return;
      if (!loaded || typeof loaded.watch !== "function" || typeof loaded.signIn !== "function"
          || typeof loaded.signOut !== "function") throw new Error("Invalid authentication client");
      client = loaded;
      const cleanup = loaded.watch(user => {
        if (!current(run)) return;
        const normalized = safeUser(user);
        if (user && !normalized) {
          update({ status: "error", user: null, pending: null, error: authErrorMessage(null) });
          return;
        }
        update({ status: normalized ? "signed-in" : "guest", user: normalized, error: "" });
      }, error => {
        if (current(run)) update({ status: "error", user: null, pending: null, error: authErrorMessage(error) });
      });
      if (current(run)) unwatch = typeof cleanup === "function" ? cleanup : null;
      else cleanup?.();
    }).catch(error => {
      if (current(run)) update({ status: "error", user: null, pending: null, error: authErrorMessage(error) });
    });
  }

  async function act(action) {
    if (!running || !client || operation || !["guest", "signed-in"].includes(snapshot.status)) return;
    if (action === "sign-out" && !snapshot.user) return;
    if (action === "sign-in" && snapshot.user) return;
    const run = generation, attempt = {};
    operation = attempt;
    update({ pending: action, error: "" });
    try {
      await client[action === "sign-in" ? "signIn" : "signOut"]();
    } catch (error) {
      if (current(run) && operation === attempt) update({ error: authErrorMessage(error, action) });
    } finally {
      if (current(run) && operation === attempt) {
        operation = null;
        update({ pending: null });
      }
    }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    start() {
      const lease = {};
      leases.add(lease);
      if (configured && !running) begin();
      return () => { if (leases.delete(lease) && !leases.size) stop(); };
    },
    signIn: () => act("sign-in"),
    signOut: () => act("sign-out"),
    retry() { if (configured && leases.size && snapshot.status === "error") begin(); },
  };
}
