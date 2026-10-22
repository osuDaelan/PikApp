import React, { memo, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { guestProgressStore } from "../../storage/progressStore.js";
import "./browser-save.css";

function BrowserSaveStatus() {
  const save = useSyncExternalStore(
    guestProgressStore.subscribeSaveStatus,
    guestProgressStore.getSaveStatus,
    guestProgressStore.getSaveStatus,
  );
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const titleId = useId();
  const failed = save.status === "error";
  const label = failed ? "Changes not saved" : save.status === "saved" ? "Saved in this browser" : "Autosave ready";

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
      onCancel={() => setOpen(false)} onClose={() => setOpen(false)}>
      <button type="button" className="browser-save-dialog__close" aria-label="Close browser saves" onClick={() => setOpen(false)}>×</button>
      <h2 id={titleId}>Browser saves</h2>
      <div className={`browser-save-dialog__status${failed ? " browser-save-dialog__status--error" : ""}`}>
        <strong role="status">{label}</strong>
        {failed ? <>
          <p>Your latest calculator or checklist changes could not be saved. Keep this tab open and allow site storage, then try again.</p>
          <button type="button" className="browser-save-dialog__retry" onClick={() => guestProgressStore.retryFailedWrites()}>Try saving again</button>
        </> : <p>Your calculator and checklist save automatically. No account needed.</p>}
      </div>
      <p>Use <strong>Save</strong> to apply edits in the stats form. Daily averages and checklist selections save as you change them.</p>
      <p>Come back using the <strong>same browser, device and website address</strong> to restore your progress. Localhost and the published site keep separate saves.</p>
      <p>Map pins and map preferences also save in this browser. Check the map’s own save status; you can export your pins there for a backup.</p>
      <p className="browser-save-dialog__hint">Clearing this site’s browser data removes its saves. Private browsing may discard saves when you close it. Progress does not sync between devices yet.</p>
    </dialog>
  </div>;
}

export default memo(BrowserSaveStatus);
