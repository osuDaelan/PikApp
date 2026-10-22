import React, { memo, useEffect, useId, useRef, useState } from "react";
import { buildFeedbackIssueUrl, createFeedbackGuard, FEEDBACK_SECTIONS, FEEDBACK_TYPES, MIN_REVIEW_MS, normalizeFeedback } from "./feedback.js";
import "./feedback.css";

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
  const openedAt = useRef(0);
  const titleId = useId();
  const infoId = useId();
  const status = open ? guard.getStatus() : { allowed: true, retryAfterMs: 0 };
  const reviewWait = open ? Math.max(0, MIN_REVIEW_MS - (performance.now() - openedAt.current)) : 0;

  function show() {
    openedAt.current = performance.now();
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
      if (performance.now() - openedAt.current < MIN_REVIEW_MS) throw new Error("Take a moment to review your feedback, then try again.");
      const opening = guard.getStatus();
      if (!opening.allowed) throw new Error(opening.reason);
      const draft = normalizeFeedback({ type, section, title, message, website });
      setPrepared({ draft, url: buildFeedbackIssueUrl(draft) });
    } catch (problem) { setError(problem.message); }
  }
  function continueOnGitHub(event) {
    try {
      const result = guard.claim(prepared.draft);
      if (!result.ok) { event.preventDefault(); setError(result.error); return; }
      setError("");
      setNotice("GitHub draft requested. Review it there and choose Submit new issue to send your feedback. Nothing has been posted by PikApp.");
    } catch {
      event.preventDefault(); setError("Your feedback draft could not be opened. Please try again.");
    }
  }

  return <div className="feedback-button">
    <button type="button" className="feedback-button__trigger" onClick={show} aria-haspopup="dialog" aria-expanded={open}>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z" /><path d="M7 8h9M7 12h6" /></svg>
      Feedback
    </button>
    <dialog ref={dialog} className="feedback-dialog" aria-labelledby={titleId} aria-describedby={infoId} onCancel={close} onClose={close}>
      <button type="button" className="feedback-dialog__close" aria-label="Close feedback" onClick={close}>×</button>
      <h2 id={titleId}>Share feedback</h2>
      <p id={infoId}>Bug reports and suggestions go to <strong>public GitHub issues</strong>. You’ll need a GitHub account. Please leave out private details and pin locations.</p>
      <a className="feedback-dialog__browse" href="https://github.com/osuDaelan/PikApp/issues" target="_blank" rel="noopener noreferrer">Browse existing feedback ↗</a>
      {open && (prepared ? <div className="feedback-dialog__review">
        <h3 ref={reviewHeading} tabIndex={-1}>Review your feedback</h3>
        <p className="feedback-dialog__category">{FEEDBACK_TYPES.find(item => item.id === prepared.draft.type)?.label} · {FEEDBACK_SECTIONS.find(item => item.id === prepared.draft.section)?.label}</p>
        <h4>{prepared.draft.title}</h4>
        <p className="feedback-dialog__message">{prepared.draft.message}</p>
        <p>Continue to review and submit on GitHub. PikApp shares only the text and section shown here.</p>
        <div className="feedback-dialog__actions">
          <a className="feedback-dialog__primary" href={prepared.url} target="_blank" rel="noopener noreferrer" onClick={continueOnGitHub}
            onAuxClick={event => { if (event.button === 1) continueOnGitHub(event); }} aria-disabled={!status.allowed}>Continue on GitHub ↗</a>
          <button type="button" onClick={() => { setPrepared(null); setError(""); setNotice(""); }}>Edit feedback</button>
        </div>
      </div> : <form onSubmit={review}>
        <div className="feedback-dialog__fields">
          <label>Feedback type<select value={type} onChange={event => setType(event.target.value)}>{FEEDBACK_TYPES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label>App section<select value={section} onChange={event => setSection(event.target.value)}>{FEEDBACK_SECTIONS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
        <label>Short title<input value={title} onChange={event => setTitle(event.target.value)} required minLength={8} maxLength={100} placeholder="What would you like us to look at?" /></label>
        <label>Details<textarea value={message} onChange={event => setMessage(event.target.value)} required minLength={20} maxLength={1000} rows={5} placeholder="Describe what happened or what you’d like to see. For bugs, include what you expected." /></label>
        <p className="feedback-dialog__hint">{message.length}/1,000 characters · You can add screenshots on GitHub.</p>
        <div className="feedback-dialog__honeypot" aria-hidden="true"><label>Website<input name="website" value={website} onChange={event => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></label></div>
        <button type="submit" className="feedback-dialog__primary" disabled={reviewWait > 0 || !status.allowed}>{reviewWait > 0 ? `Review in ${Math.ceil(reviewWait / 1000)}s` : "Review feedback"}</button>
      </form>)}
      {!status.allowed && <p role="status" className="feedback-dialog__hint">{status.reason} Available in {waitText(status.retryAfterMs)}.</p>}
      {error && <p role="alert" className="feedback-dialog__error">{error}</p>}
      {notice && <p role="status" className="feedback-dialog__notice">{notice}</p>}
      <p className="feedback-dialog__hint">To reduce repeats, this browser allows one draft per minute, up to three per hour. Opening a GitHub draft counts even if you cancel there.</p>
    </dialog>
  </div>;
}

export default memo(FeedbackButton);
