import React, { useEffect, useId, useRef, useState } from "react";
import {
  applyProgressBackup, createProgressBackup, MAX_PROGRESS_BACKUP_BYTES,
  parseProgressBackup, readProgressRecovery, summarizeProgressBackup,
} from "../../storage/progressTransfer.js";

function download(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function savedRecovery() {
  try { return readProgressRecovery(); }
  catch { return null; }
}

export default function ProgressTransfer({ getSnapshot, onImported, importComplete }) {
  const inputId = useId();
  const readVersion = useRef(0);
  const previewHeading = useRef(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(importComplete ? "Progress imported. Your previous save is available below." : "");
  const [recovery, setRecovery] = useState(savedRecovery);
  const [showRawRecovery, setShowRawRecovery] = useState(false);
  const filenameDate = () => new Date().toISOString().slice(0, 10);
  useEffect(() => { if (preview) previewHeading.current?.focus(); }, [preview]);
  useEffect(() => () => { readVersion.current++; }, []);

  function exportProgress() {
    try {
      download(createProgressBackup(getSnapshot()), `pikapp-progress-${filenameDate()}.json`);
      setError("");
      setNotice("Backup download started. Move this JSON file to your other device, then import it there.");
    } catch (problem) { setError(problem.message); setNotice(""); }
  }

  async function readImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const version = ++readVersion.current;
    setBusy(true); setPreview(null); setError(""); setNotice("");
    try {
      if (file.size > MAX_PROGRESS_BACKUP_BYTES) throw new Error("Choose a PikApp progress backup smaller than 20 MB.");
      const data = parseProgressBackup(await file.text());
      const current = parseProgressBackup(createProgressBackup(getSnapshot()));
      if (version === readVersion.current) setPreview({ data, name: file.name,
        incoming: summarizeProgressBackup(data), current: summarizeProgressBackup(current) });
    } catch (problem) {
      if (version === readVersion.current) setError(problem.message);
    } finally { if (version === readVersion.current) setBusy(false); }
  }

  function importProgress() {
    setError(""); setNotice("");
    try {
      applyProgressBackup(preview.data, { current: getSnapshot() });
      onImported();
    } catch (problem) {
      setRecovery(savedRecovery());
      setShowRawRecovery(Boolean(problem.rollbackFailed));
      setError(problem.message);
    }
  }

  return <section className="progress-transfer" aria-label="Transfer progress">
    <h3>Move progress between devices</h3>
    <p>Export a file here, send it to your other device, then open PikApp there and import it. Includes stats, checklist, map pins and map preferences.</p>
    <div className="progress-transfer__actions">
      <button type="button" onClick={exportProgress} disabled={busy}>Export progress</button>
      <label className={`progress-transfer__file${busy ? " progress-transfer__file--busy" : ""}`} htmlFor={inputId}>
        {busy ? "Reading file…" : "Import progress"}
        <input id={inputId} type="file" accept=".json,application/json" aria-label="Import progress file" onChange={readImport} disabled={busy} />
      </label>
    </div>
    <p className="progress-transfer__hint">Apply any open stats form with Save first. The file contains your pin locations and notes—share it only where you intend.</p>
    {preview && <div className="progress-transfer__preview">
      <h4 ref={previewHeading} tabIndex={-1}>Review imported save</h4>
      <p className="progress-transfer__filename">{preview.name}</p>
      <table>
        <caption className="progress-transfer__sr-only">Current progress compared with the imported file</caption>
        <thead><tr><th scope="col">Progress</th><th scope="col">This browser</th><th scope="col">File</th></tr></thead>
        <tbody>
          <tr><th scope="row">Level</th><td>{preview.current.level}</td><td>{preview.incoming.level}</td></tr>
          <tr><th scope="row">Collected</th><td>{preview.current.collected}</td><td>{preview.incoming.collected}</td></tr>
          {(preview.current.pendingCardReviews > 0 || preview.incoming.pendingCardReviews > 0) &&
            <tr><th scope="row">Older card selections to review</th><td>{preview.current.pendingCardReviews}</td><td>{preview.incoming.pendingCardReviews}</td></tr>}
          <tr><th scope="row">Map pins</th><td>{preview.current.pins}</td><td>{preview.incoming.pins}</td></tr>
        </tbody>
      </table>
      <p>Exported {new Date(preview.incoming.exportedAt).toLocaleString()}</p>
      <p><strong>This replaces this browser’s stats, checklist and map save.</strong> It does not merge saves. A recovery copy of your current progress will be kept before anything changes.</p>
      <div className="progress-transfer__actions">
        <button type="button" className="progress-transfer__replace" onClick={importProgress}>Replace browser progress</button>
        <button type="button" onClick={() => { setPreview(null); setError(""); }}>Cancel import</button>
      </div>
    </div>}
    {notice && <p role="status" className="progress-transfer__notice">{notice}</p>}
    {error && <p role="alert" className="progress-transfer__error">{error}</p>}
    {recovery && <div className="progress-transfer__recovery">
      {recovery.backupText && <>
        <button type="button" onClick={() => download(recovery.backupText, `pikapp-previous-save-${filenameDate()}.json`)}>Download previous save</button>
        <p className="progress-transfer__hint">Previous save from {new Date(recovery.createdAt).toLocaleString()}. Import this file to restore it. A new import attempt may replace this recovery copy.</p>
      </>}
      {(showRawRecovery || !recovery.backupText) && <>
        <button type="button" onClick={() => download(recovery.rawText, `pikapp-recovery-details-${filenameDate()}.json`)}>Download recovery details</button>
        <p className="progress-transfer__hint">Keep these recovery details for troubleshooting. This file cannot be imported as a progress backup.</p>
      </>}
    </div>}
  </section>;
}
