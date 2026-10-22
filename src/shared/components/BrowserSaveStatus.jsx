import React, { memo, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { guestProgressStore } from "../../storage/progressStore.js";
import ProgressTransfer from "./ProgressTransfer.jsx";
import "./browser-save.css";

function BrowserSaveStatus({ getProgressSnapshot, onProgressImported, importComplete }) {
  const save = useSyncExternalStore(
    guestProgressStore.subscribeSaveStatus,
    guestProgressStore.getSaveStatus,
    guestProgressStore.getSaveStatus,
  );
  const [open, setOpen] = useState(Boolean(importComplete));
  const [showImportNotice, setShowImportNotice] = useState(Boolean(importComplete));
  const dialog = useRef(null);
  const titleId = useId();
  const failed = save.status === "error";
  const label = failed ? "Changes not saved" : save.status === "saved" ? "Saved in this browser" : "Autosave ready";
  function close() { setOpen(false); setShowImportNotice(false); }

  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);

  return <div className="browser-save">
    <button type="button" className={`browser-save__trigger${failed ? " browser-save__trigger--error" : ""}`}
      onClick={() => setOpen(true)} aria-label={`Calculator and checklist: ${label}`}
      aria-haspopup="dialog" aria-expanded={open}>
      <span aria-hidden="true">{failed ? "!" : "✓"}</span>
      <span role="status">{label}</span>
    </button>
    <dialog className="browser-save-dialog" ref={dialog} aria-labelledby={titleId}
      onCancel={close} onClose={close}>
      <button type="button" className="browser-save-dialog__close" aria-label="Close browser saves" onClick={close}>×</button>
      <h2 id={titleId}>Browser saves</h2>
      <div className={`browser-save-dialog__status${failed ? " browser-save-dialog__status--error" : ""}`}>
        <strong role="status">{label}</strong>
        {failed ? <>
          <p>Your latest calculator or checklist changes could not be saved. Keep this tab open and allow site storage, then try again.</p>
          <button type="button" className="browser-save-dialog__retry" onClick={() => guestProgressStore.retryFailedWrites()}>Try saving again</button>
        </> : <p>Your calculator and checklist save automatically. No account needed.</p>}
      </div>
      {open && <ProgressTransfer getSnapshot={getProgressSnapshot} onImported={onProgressImported} importComplete={showImportNotice} />}
      <p>Use <strong>Save</strong> to apply stats form edits. Daily averages and checklist selections save as you change them. Map saving has its own status.</p>
      <p className="browser-save-dialog__hint">Return in the same browser and device to restore this site’s save. Clearing site data or closing private browsing can remove it. Localhost and the published site keep separate saves.</p>
    </dialog>
  </div>;
}

export default memo(BrowserSaveStatus);
