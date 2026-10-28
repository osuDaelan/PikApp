import React, { memo, useEffect, useId, useRef, useState } from "react";
import useAuthSession from "./useAuthSession.js";
import "./account.css";

function AccountMenu() {
  const auth = useAuthSession();
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const titleId = useId();
  const busy = auth.pending !== null;

  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);

  return <div className="account-menu">
    <button type="button" className="account-menu__trigger" onClick={() => setOpen(true)}
      aria-label={auth.user ? "Your account" : "Sign in"} aria-haspopup="dialog" aria-expanded={open}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </svg>
      <span>{auth.user ? "Account" : "Sign in"}</span>
    </button>
    <dialog className="account-dialog" ref={dialog} aria-labelledby={titleId}
      onCancel={() => setOpen(false)} onClose={() => setOpen(false)}>
      <button type="button" className="account-dialog__close" aria-label="Close account" onClick={() => setOpen(false)}>×</button>
      <h2 id={titleId}>{auth.user ? "Your account" : "Sign in to PikApp"}</h2>
      {auth.user ? <>
        <p className="account-dialog__name">{auth.user.displayName || "Google account"}</p>
        {auth.user.email && <p className="account-dialog__email">{auth.user.email}</p>}
        <p>{auth.status === "signed-in" ? "You're signed in with Google." : "Checking your account. Your local progress is ready to use."}</p>
      </> : <p>Use your Google account, or keep using PikApp as a guest.</p>}

      <div className="account-dialog__local">
        <strong>Progress saves in this browser</strong>
        <p>Signing in does not upload your progress yet. Your stats, checklist and map pins stay in this browser, including when you switch accounts.</p>
      </div>

      {auth.status === "unconfigured" && <p className="account-dialog__hint">Google sign-in is being set up. Guest mode is ready to use.</p>}
      {auth.status === "loading" && <p role="status" className="account-dialog__hint">Checking your sign-in…</p>}
      {auth.error && <p role="alert" className="account-dialog__error">{auth.error}</p>}
      {auth.status === "error" && <button type="button" className="account-dialog__action" onClick={auth.retry}>Try again</button>}
      {auth.user ? (
        <button type="button" className="account-dialog__action" onClick={auth.signOut} disabled={busy || auth.status !== "signed-in"}>
          {auth.pending === "sign-out" ? "Signing out…" : "Sign out"}
        </button>
      ) : (
        <button type="button" className="account-dialog__google" onClick={auth.signIn} disabled={auth.status !== "guest" || busy}>
          {auth.pending === "sign-in" ? "Opening Google…" : "Sign in with Google"}
        </button>
      )}
      <button type="button" className="account-dialog__guest" onClick={() => setOpen(false)}>
        {auth.user ? "Back to PikApp" : "Continue as guest"}
      </button>
    </dialog>
  </div>;
}

export default memo(AccountMenu);
