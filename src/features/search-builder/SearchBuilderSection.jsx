import React, { useLayoutEffect, useRef, useState } from "react";
import { EMPTY_SEARCH_DRAFT, editSearchText, lockSearchGroup, searchGroupAt, searchTextEdit, undoSearchEdit, unlockSearchGroup } from "./commandEditor.js";
import { friendshipCommand, friendshipError, KEYWORD_GROUPS, OPERATORS, textCommand, textError } from "./gameSearch.js";
import SearchGuide from "./SearchGuide.jsx";
import "./search-builder.css";

const HEARTS = Array.from({ length: 9 }, (_, index) => String(index));
const capitalize = word => word[0].toUpperCase() + word.slice(1);

function InsertTile({ label, token, title, insert }) {
  return (
    <button type="button" draggable aria-label={title} title={title}
      onClick={() => insert(token)}
      onDragStart={event => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/plain", token);
      }}>
      {label}
    </button>
  );
}

function CustomFilters({ insert }) {
  const [phrase, setPhrase] = useState("");
  const [bounds, setBounds] = useState({ min: "", max: "" });
  const phraseToken = textCommand(phrase);
  const heartsToken = friendshipCommand(bounds);
  const hasBounds = bounds.min !== "" || bounds.max !== "";

  return (
    <section className="search-builder__surface" aria-labelledby="search-builder-custom">
      <h2 id="search-builder-custom">Text and friendship</h2>
      <form className="search-builder__custom" onSubmit={event => {
        event.preventDefault();
        if (phraseToken) insert(phraseToken);
      }}>
        <label htmlFor="builder-phrase">Text phrase</label>
        <div className="search-builder__fields">
          <input id="builder-phrase" value={phrase} onChange={event => setPhrase(event.target.value)}
            placeholder="e.g. Chef Hat" autoComplete="off" />
          <button type="submit" disabled={!phraseToken}>Insert phrase</button>
        </div>
        {phrase.trim() && !phraseToken && <p className="search-builder__error">{textError(phrase)}</p>}
        <p className="search-builder__muted">Adds straight quotes around a name, place, decor, or flower phrase.</p>
      </form>
      <form className="search-builder__custom" onSubmit={event => {
        event.preventDefault();
        if (heartsToken) insert(heartsToken);
      }}>
        <div className="search-builder__fields">
          {[["min", "Minimum hearts"], ["max", "Maximum hearts"]].map(([key, label]) => (
            <label key={key}>{label}
              <select value={bounds[key]} onChange={event => setBounds(previous => ({ ...previous, [key]: event.target.value }))}>
                <option value="">Any</option>
                {HEARTS.map(hearts => <option key={hearts} value={hearts}>{hearts}</option>)}
              </select>
            </label>
          ))}
        </div>
        {hasBounds && !heartsToken && <p className="search-builder__error">{friendshipError(bounds)}</p>}
        <button type="submit" disabled={!heartsToken}>Insert heart range</button>
      </form>
    </section>
  );
}

export default function SearchBuilderSection({ draft: savedDraft, setDraft }) {
  const draft = typeof savedDraft === "string" ? { ...EMPTY_SEARCH_DRAFT, command: savedDraft } : savedDraft ?? EMPTY_SEARCH_DRAFT;
  const { command, locks, history } = draft;
  const commandPanel = useRef(null);
  const editor = useRef(null);
  const nextSelection = useRef(null);
  const [notice, setNotice] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useLayoutEffect(() => {
    if (!nextSelection.current) return;
    const { start, end } = nextSelection.current;
    editor.current.setSelectionRange(start, end);
    nextSelection.current = null;
  }, [draft]);

  function getSelection() {
    const field = editor.current;
    return { start: field.selectionStart, end: field.selectionEnd };
  }

  function insert(fragment) {
    const selection = getSelection();
    const next = editSearchText(draft, { ...selection, text: fragment });
    if (!next) {
      setNotice("Unlock the group to edit it.");
      return;
    }
    const caret = selection.start + fragment.length;
    if (next === draft) {
      editor.current.setSelectionRange(caret, caret);
    } else {
      nextSelection.current = { start: caret, end: caret };
      setDraft(next);
    }
    setNotice("");
  }

  function undo() {
    const previous = undoSearchEdit(draft);
    if (!previous) return;
    nextSelection.current = previous.selection;
    setDraft(previous.draft);
    setNotice("Undid the last edit.");
  }

  function handleCommandChange(event) {
    const field = event.currentTarget;
    const inputType = event.nativeEvent.inputType;
    if (inputType === "historyUndo" || inputType === "historyRedo") {
      field.value = command;
      if (inputType === "historyUndo") undo();
      return;
    }
    const edit = searchTextEdit(command, field.value, field.selectionEnd);
    const next = editSearchText(draft, edit);
    if (!next) {
      field.value = command;
      field.setSelectionRange(edit.start, edit.end);
      setNotice("Unlock the group to edit it.");
      return;
    }
    setDraft(next);
    setNotice("");
  }

  function handleUndoShortcut(event) {
    if (event.defaultPrevented || event.nativeEvent.isComposing || !(event.ctrlKey || event.metaKey)
      || event.altKey || event.shiftKey || event.key.toLowerCase() !== "z") return;
    if (event.target !== editor.current && event.target.matches("input, textarea, select")) return;
    if (!history.length && event.target !== editor.current) return;
    event.preventDefault();
    undo();
  }

  function lockGroup() {
    const selection = getSelection();
    const group = searchGroupAt(command, selection);
    if (!group) {
      setNotice("Place the cursor inside a pair of parentheses to lock that group.");
      return;
    }
    const next = lockSearchGroup(draft, group, selection);
    if (next === draft) {
      setNotice("Unlock the overlapping group first.");
      return;
    }
    setDraft(next);
    setNotice("Group locked.");
  }

  function unlockGroup(group) {
    setDraft(unlockSearchGroup(draft, group, getSelection()));
    setNotice("Group unlocked.");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setNotice("Copied. Paste it into Pikmin Bloom.");
    } catch {
      editor.current?.focus();
      editor.current?.select();
      setNotice("The command is selected. Use your device’s copy shortcut.");
    }
  }

  return (
    <section className="search-builder" aria-labelledby="search-builder-heading" onKeyDown={handleUndoShortcut}>
      <header className="search-builder__intro">
        <h1 id="search-builder-heading">Search Builder</h1>
      </header>
      <SearchGuide skipToBuilder={() => {
        commandPanel.current.focus({ preventScroll: true });
        commandPanel.current.scrollIntoView({ block: "start" });
      }} />
      <section ref={commandPanel} className="search-builder__surface" tabIndex={-1} aria-label="Search command editor">
        <div className="search-builder__command-header">
          <label htmlFor="game-search-command">Search command</label>
          <div className="search-builder__fields">
            <button type="button" aria-keyshortcuts="Control+Z Meta+Z" onClick={undo} disabled={!history.length}>Undo</button>
            <button type="button" onClick={lockGroup} disabled={!command}>Lock group</button>
            <button type="button" className="search-builder__primary" onClick={copy} disabled={!command.trim()}>
              Copy for Pikmin Bloom
            </button>
          </div>
        </div>
        <textarea ref={editor} id="game-search-command" value={command} rows={3} spellCheck={false}
          aria-describedby="game-search-help" autoCapitalize="off" autoCorrect="off"
          placeholder="(red|yellow)&=bud&4-8"
          className={dragOver ? "search-builder__editor search-builder__editor--drop" : "search-builder__editor"}
          onDragOver={() => setDragOver(true)} onDragLeave={() => setDragOver(false)}
          onDrop={() => setDragOver(false)}
          onChange={handleCommandChange} />
        <p id="game-search-help" className="search-builder__muted">Tap a tile, drag it into the command, or type directly. Place the cursor inside parentheses to lock a group.</p>
        {!!locks.length && <ul className="search-builder__locks" aria-label="Locked groups">
          {locks.map(group => <li key={group.start}>
            <button type="button" onClick={() => unlockGroup(group)}>
              Unlock <code>{command.slice(group.start, group.end)}</code>
            </button>
          </li>)}
        </ul>}
        <p className="search-builder__muted search-builder__notice" role="status">{notice}</p>
        <div className="search-builder__chips search-builder__operators" role="group" aria-label="Operators">
          {OPERATORS.map(({ token, label }) => (
            <InsertTile key={token} label={<><code>{token}</code> {label}</>} token={token}
              title={`Insert ${label} (${token})`} insert={insert} />
          ))}
        </div>
      </section>
      <div className="search-builder__workspace">
        <section className="search-builder__surface" aria-labelledby="search-builder-palette">
          <h2 id="search-builder-palette">Filter tiles</h2>
          {KEYWORD_GROUPS.map(({ name, keywords }) => (
            <div className="search-builder__filter-group" key={name}>
              <h3>{name}</h3>
              <div className="search-builder__chips">
                {keywords.map(keyword => <InsertTile key={keyword} label={capitalize(keyword)} token={keyword} insert={insert} />)}
              </div>
            </div>
          ))}
        </section>
        <CustomFilters insert={insert} />
      </div>
    </section>
  );
}
