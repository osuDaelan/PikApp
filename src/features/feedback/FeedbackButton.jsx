import React, { memo, useEffect, useId, useRef, useState } from "react";
import { buildPrivateFeedbackFields, createFeedbackGuard, FEEDBACK_SECTIONS, FEEDBACK_TYPES, getPrivateFeedbackEndpoint, normalizeFeedback } from "./feedback.js";
import "./feedback.css";

const privateEndpoint = getPrivateFeedbackEndpoint(import.meta.env.VITE_FEEDBACK_ENDPOINT);

function waitText(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000);
  return seconds >= 60 ? `${Math.ceil(seconds / 60)} minute${seconds > 60 ? "s" : ""}` : `${seconds} second${seconds === 1 ? "" : "s"}`;
}

function FeedbackButton() {
  const [guard] = useState(() => createFeedbackGuard());
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("bug");
  const [section, setSection] = useState("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [prepared, setPrepared] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [, setTick] = useState(0);
  const dialog = useRef(null);
  const reviewHeading = useRef(null);
  const titleId = useId();
  const infoId = useId();
  const status = open ? guard.getStatus() : { allowed: true, retryAfterMs: 0 };
  const available = Boolean(privateEndpoint);

  function show() {
    setPrepared(null); setError(""); setNotice(""); setWebsite(""); setOpen(true);
  }
  function close() { setOpen(false); setPrepared(null); setError(""); setNotice(""); }
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
    if (!open) return;
    const timer = setInterval(() => setTick(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [open]);
  useEffect(() => { if (prepared) reviewHeading.current?.focus(); }, [prepared]);

  function review(event) {
    event.preventDefault();
    setError(""); setNotice("");
    try {
      if (!available) throw new Error("The private feedback inbox is not connected yet. Please check back soon.");
      const opening = guard.getStatus();
      if (!opening.allowed) throw new Error(opening.reason);
      const draft = normalizeFeedback({ type, section, title, message, website });
      setPrepared({ draft, fields: buildPrivateFeedbackFields(draft) });
    } catch (problem) { setError(problem.message); }
  }
  function continuePrivately(event) {
    try {
      if (!privateEndpoint) throw new Error("The private feedback inbox is not connected yet.");
      const result = guard.claim(prepared.draft, { channel: "private" });
      if (!result.ok) { event.preventDefault(); setError(result.error); return; }
      setError("");
      setNotice("Private submission opened in a new tab. Complete any verification there and check Formspree’s confirmation. PikApp cannot confirm delivery here.");
    } catch (problem) {
      event.preventDefault(); setError(problem.message || "The private feedback form could not be opened. Please try again.");
    }
  }

  return <div className="feedback-button">
    <button type="button" className="feedback-button__trigger" onClick={show} aria-haspopup="dialog" aria-expanded={open}>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z" /><path d="M7 8h9M7 12h6" /></svg>
      Feedback
    </button>
    <dialog ref={dialog} className="feedback-dialog" aria-labelledby={titleId} aria-describedby={infoId} onCancel={close} onClose={close}>
      <button type="button" className="feedback-dialog__close" aria-label="Close feedback" onClick={close}>×</button>
      <h2 id={titleId}>Feedback</h2>
      <p id={infoId}>Send a private message to the PikApp maintainer. No account required.</p>
      {!available && <p className="feedback-dialog__setup" role="status">Feedback isn’t available yet. Please check back soon.</p>}
      {open && (prepared ? <div className="feedback-dialog__review">
        <h3 ref={reviewHeading} tabIndex={-1}>Review your feedback</h3>
        <p className="feedback-dialog__category">{FEEDBACK_TYPES.find(item => item.id === prepared.draft.type)?.label} · {FEEDBACK_SECTIONS.find(item => item.id === prepared.draft.section)?.label}</p>
        <h4>{prepared.draft.title}</h4>
        <p className="feedback-dialog__message">{prepared.draft.message}</p>
        <p>Continue to Formspree in a new tab to finish the private submission. Only the title, message, feedback type and section shown here are included. Check its confirmation before closing that tab.</p>
        <div className="feedback-dialog__actions">
          <form action={privateEndpoint} method="post" target="_blank" rel="noopener" onSubmit={continuePrivately}>
            {Object.entries(prepared.fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
            <button type="submit" className="feedback-dialog__primary" disabled={!status.allowed}>Continue to send ↗</button>
          </form>
          <button type="button" onClick={() => { setPrepared(null); setError(""); setNotice(""); }}>Edit feedback</button>
        </div>
      </div> : <form onSubmit={review}>
        <div className="feedback-dialog__fields">
          <label>Feedback type<select value={type} onChange={event => setType(event.target.value)}>{FEEDBACK_TYPES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label>App section<select value={section} onChange={event => setSection(event.target.value)}>{FEEDBACK_SECTIONS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
        <label>Short title<input value={title} onChange={event => setTitle(event.target.value)} required minLength={3} maxLength={100} placeholder="What would you like us to look at?" /></label>
        <label>Details<textarea value={message} onChange={event => setMessage(event.target.value)} required minLength={20} maxLength={1000} rows={5} placeholder="Describe what happened or what you’d like to see. For bugs, include what you expected." /></label>
        <p className="feedback-dialog__hint">{message.length}/1,000 characters</p>
        <div className="feedback-dialog__honeypot" aria-hidden="true"><label>Website<input name="website" value={website} onChange={event => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></label></div>
        <button type="submit" className="feedback-dialog__primary" disabled={!available || !status.allowed}>{!available ? "Feedback unavailable" : "Review feedback"}</button>
      </form>)}
      {!status.allowed && <p role="status" className="feedback-dialog__hint">{status.reason} Available in {waitText(status.retryAfterMs)}.</p>}
      {error && <p role="alert" className="feedback-dialog__error">{error}</p>}
      {notice && <p role="status" className="feedback-dialog__notice">{notice}</p>}
      <p className="feedback-dialog__hint">You can continue once per minute, up to three times per hour. Continuing counts even if you cancel in the new tab. Formspree also applies its configured spam checks.</p>
    </dialog>
  </div>;
}

export default memo(FeedbackButton);
