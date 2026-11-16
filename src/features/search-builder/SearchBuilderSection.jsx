import React, { useId, useRef, useState } from "react";
import { buildGameSearch, friendshipError, KEYWORD_GROUPS, moveSearchBlock, SEARCH_REFERENCE, textError } from "./gameSearch.js";
import "./search-builder.css";

const HEARTS = Array.from({ length: 9 }, (_, index) => String(index));
const capitalize = word => word[0].toUpperCase() + word.slice(1);

function CommandOutput({ blocks }) {
  const field = useRef(null);
  const [notice, setNotice] = useState(null);
  const { command, incomplete } = buildGameSearch(blocks);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setNotice({ command, text: "Copied. Paste it into Pikmin Bloom." });
    } catch {
      field.current?.focus();
      field.current?.select();
      setNotice({ command, text: "The command is selected. Use your device’s copy shortcut." });
    }
  }

  return (
    <div className="search-builder__surface search-builder__output">
      <label htmlFor="game-search-command">Search command</label>
      <div className="search-builder__command">
        <input ref={field} id="game-search-command" readOnly value={command} spellCheck={false}
          placeholder="Add a filter to build a command" />
        <button type="button" className="search-builder__primary" onClick={copy} disabled={!command || incomplete}>
          Copy for Pikmin Bloom
        </button>
      </div>
      <p className="search-builder__muted" role="status">
        {incomplete
          ? "Complete or remove unfinished tiles and empty groups to copy."
          : notice?.command === command ? notice.text : "Paste the generated command into the game’s Pikmin search."}
      </p>
    </div>
  );
}

function FilterFields({ block, label, update }) {
  if (block.type === "keyword") {
    return block.keyword === "bud" && block.exact
      ? <p className="search-builder__muted">Matches Pikmin with a bud and exact text such as the nickname Bud.</p>
      : null;
  }

  const error = block.type === "text" ? textError(block.value) : friendshipError(block);
  const errorId = `${block.id}-error`;
  return (
    <div className="search-builder__fields">
      {block.type === "text" ? (
        <label>Search phrase
          <input value={block.value} aria-label={label} aria-invalid={!!error} aria-describedby={error ? errorId : undefined}
            onChange={event => update({ value: event.target.value })} placeholder="e.g. Chef Hat" />
        </label>
      ) : (
        <div className="search-builder__heart-bounds">
          {[["min", "Minimum"], ["max", "Maximum"]].map(([key, title]) => (
            <label key={key}>{title}
              <select value={block[key]} aria-label={`${title} for ${label}`}
                aria-invalid={!!error} aria-describedby={error ? errorId : undefined}
                onChange={event => update({ [key]: event.target.value })}>
                <option value="">Any</option>
                {HEARTS.map(hearts => <option key={hearts} value={hearts}>{hearts}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}
      {error && <p className="search-builder__error" id={errorId}>{error}</p>}
    </div>
  );
}

export default function SearchBuilderSection({ blocks, setBlocks }) {
  const idPrefix = useId();
  const sequence = useRef(0);
  const paletteRef = useRef(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [dragged, setDragged] = useState(null);
  const groups = blocks.filter(block => block.type === "group");
  const groupOptions = groups.map((group, index) => ({ id: group.id, name: `Group ${index + 1}` }));
  const addTo = groupOptions.some(option => option.id === selectedGroup) ? selectedGroup : null;

  function changeList(groupId, update) {
    setBlocks(current => groupId === null ? update(current) : current.map(block =>
      block.id === groupId ? { ...block, children: update(block.children) } : block));
  }

  function addBlock(value, groupId = addTo, beforeId = null) {
    const id = `${idPrefix}-${++sequence.current}`;
    const block = { id, join: "and", exclude: false, exact: false, ...value };
    changeList(groupId, list => {
      const index = list.findIndex(item => item.id === beforeId);
      return index < 0 ? [...list, block] : [...list.slice(0, index), block, ...list.slice(index)];
    });
  }

  function moveBlock(id, groupId, beforeId = null) {
    setBlocks(current => moveSearchBlock(current, id, groupId, beforeId));
  }

  function dropEvents(groupId, beforeId = null) {
    if (!dragged || dragged.id === beforeId || (groupId !== null && dragged.type === "group")) return {};
    return {
      "data-drop-target": true,
      onDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = dragged.palette ? "copy" : "move";
      },
      onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        if (dragged.palette) addBlock(dragged.palette, groupId, beforeId);
        else moveBlock(dragged.id, groupId, beforeId);
        setDragged(null);
      },
    };
  }

  function paletteButton(label, block) {
    return (
      <button key={label} type="button" draggable onClick={() => addBlock(block)}
        onDragStart={event => {
          event.dataTransfer.setData("text/plain", label);
          event.dataTransfer.effectAllowed = "copy";
          setDragged({ palette: block });
        }}
        onDragEnd={() => setDragged(null)}>{label}</button>
    );
  }

  function chooseGroup(groupId) {
    setSelectedGroup(groupId);
    paletteRef.current?.focus();
  }

  function renderList(list, groupId = null) {
    return (
      <div className="search-builder__list">
        {list.map((block, index) => {
          const isGroup = block.type === "group";
          const label = isGroup ? groupOptions.find(option => option.id === block.id).name
            : block.type === "keyword" ? capitalize(block.keyword)
              : block.type === "text" ? "Text filter" : "Completed hearts";
          const update = change => changeList(groupId, current => current.map(item =>
            item.id === block.id ? { ...item, ...change } : item));
          return (
            <div key={block.id} className="search-builder__entry">
              {index > 0 && (
                <select className="search-builder__join" aria-label={`Combine with ${label}`} value={block.join}
                  onChange={event => update({ join: event.target.value })}>
                  <option value="and">AND</option>
                  <option value="or">OR</option>
                </select>
              )}
              <div role="group" aria-label={label} className={`search-builder__tile${isGroup ? " search-builder__tile--group" : ""}`}>
                <div className="search-builder__tile-header" {...dropEvents(groupId, block.id)}>
                  <span className="search-builder__drag" draggable title="Drag to move" aria-hidden="true"
                    onDragStart={event => {
                      event.dataTransfer.setData("text/plain", label);
                      event.dataTransfer.effectAllowed = "move";
                      setDragged(block);
                    }}
                    onDragEnd={() => setDragged(null)}>⠿</span>
                  <strong>{label}</strong>
                  <div className="search-builder__tile-actions">
                    <button type="button" aria-label={`Move ${label} up`} disabled={index === 0}
                      onClick={() => moveBlock(block.id, groupId, list[index - 1].id)}>↑</button>
                    <button type="button" aria-label={`Move ${label} down`} disabled={index === list.length - 1}
                      onClick={() => moveBlock(block.id, groupId, list[index + 2]?.id)}>↓</button>
                    <button type="button" aria-label={`Remove ${label}`}
                      onClick={() => changeList(groupId, current => current.filter(item => item.id !== block.id))}>×</button>
                  </div>
                </div>
                <div className="search-builder__tile-body">
                  <div className="search-builder__options">
                    {(block.type === "keyword" || block.type === "text") && (
                      <label><input type="checkbox" checked={block.exact} onChange={event => update({ exact: event.target.checked })} /> Exact match</label>
                    )}
                    <label><input type="checkbox" checked={block.exclude} onChange={event => update({ exclude: event.target.checked })} /> Exclude (NOT)</label>
                    {!isGroup && groupOptions.length > 0 && (
                      <select value={groupId ?? ""} aria-label={`Move ${label} to another group`}
                        onChange={event => moveBlock(block.id, event.target.value || null)}>
                        <option value="">Main search</option>
                        {groupOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                      </select>
                    )}
                  </div>
                  {isGroup ? (
                    <>
                      {renderList(block.children, block.id)}
                      <button type="button" onClick={() => chooseGroup(block.id)}>Add filters to {label}</button>
                    </>
                  ) : <FilterFields block={block} label={label} update={update} />}
                </div>
              </div>
            </div>
          );
        })}
        {dragged && (groupId === null || dragged.type !== "group") && (
          <div className="search-builder__drop" {...dropEvents(groupId)}>
            {groupId === null ? "Drop at end of search" : "Drop into this group"}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="search-builder" aria-labelledby="search-builder-heading">
      <header className="search-builder__surface search-builder__intro">
        <h1 id="search-builder-heading">Search Builder</h1>
        <p>Build a search for your Pikmin in the game. Tap a filter or drag a tile to arrange it.</p>
      </header>
      <CommandOutput blocks={blocks} />
      <div className="search-builder__workspace">
        <section className="search-builder__surface" aria-labelledby="search-builder-workspace">
          <div className="search-builder__section-heading">
            <h2 id="search-builder-workspace">Build your search</h2>
            <button type="button" onClick={() => addBlock({ type: "group", children: [] }, null)}>+ Add group</button>
          </div>
          {blocks.length === 0 && <p className="search-builder__empty">Choose a filter to start. Add a group to combine filters with parentheses.</p>}
          {renderList(blocks)}
        </section>
        <section className="search-builder__surface" aria-labelledby="search-builder-palette">
          <div className="search-builder__section-heading">
            <h2 id="search-builder-palette">Available filters</h2>
            {groupOptions.length > 0 && (
              <label className="search-builder__destination">Add to
                <select ref={paletteRef} value={addTo ?? ""} onChange={event => setSelectedGroup(event.target.value || null)}>
                  <option value="">Main search</option>
                  {groupOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
              </label>
            )}
          </div>
          {KEYWORD_GROUPS.map(({ name, keywords }) => (
            <div className="search-builder__filter-group" key={name}>
              <h3>{name}</h3>
              <div className="search-builder__chips">
                {keywords.map(keyword => paletteButton(capitalize(keyword), { type: "keyword", keyword }))}
              </div>
            </div>
          ))}
          <div className="search-builder__filter-group">
            <h3>Friendship and text</h3>
            <div className="search-builder__chips">
              {paletteButton("+ Heart range", { type: "range", min: "", max: "" })}
              {paletteButton("+ Text filter", { type: "text", value: "" })}
            </div>
            <p className="search-builder__muted">Search names, found locations, towns, decor, or flower names. Exact match can still match nicknames and other text fields.</p>
          </div>
          <p className="search-builder__muted"><a href={SEARCH_REFERENCE} target="_blank" rel="noreferrer">Pikipedia search reference ↗</a></p>
        </section>
      </div>
    </section>
  );
}
