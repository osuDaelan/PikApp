import React, { useMemo, useState } from "react";
import { NECTAR_COLORS, MAX_MUSHROOM_CHOICES } from "./data.js";
import { addMushroomChoice, updateMushroomChoice } from "./calculations.js";
import { filterMushrooms, MUSHROOM_REFERENCE_ROWS } from "./selection.js";

export default function MushroomOptions({ draft, onChange, onToggle }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => filterMushrooms(query), [query]);
  const atLimit = draft.choices.length >= MAX_MUSHROOM_CHOICES;
  function toggleColor(id) {
    onChange(previous => ({ ...previous, colors: previous.colors.includes(id) ? previous.colors.filter(color => color !== id) : [...previous.colors, id] }));
  }
  function edit(id, patch) {
    onChange(previous => ({ ...previous, choices: previous.choices.map(choice => choice.id === id ? updateMushroomChoice(choice, patch) : choice) }));
  }
  return <aside className="mushroom-card mushroom-options" aria-labelledby="mushroom-options-title">
    <span className="mushroom-eyebrow">YOUR NEXT BATTLE</span><h2 id="mushroom-options-title">Choose your mushrooms</h2>
    <p className="mushroom-description">Check the mushrooms you can join here or in the full reward table.</p>
    <label className="mushroom-new-stars">Stars for new selections<select value={draft.newStars ?? 4} onChange={event => { const newStars = Number(event.target.value); onChange(previous => ({ ...previous, newStars })); }}>
      {[1, 2, 3, 4].map(stars => <option key={stars} value={stars}>{stars} {stars === 1 ? "star" : "stars"}</option>)}
    </select></label>
    <div role="search" aria-label="Find mushrooms" className="mushroom-picker">
      <label>Find a mushroom<input type="search" value={query} maxLength={160} placeholder="Small blue, normal yellow…" aria-describedby="mushroom-search-help" onChange={event => setQuery(event.target.value)} /></label>
      <p id="mushroom-search-help" className="mushroom-caption">Search by type or size. Use commas for alternatives.</p>
      <div className="mushroom-picker-status"><span role="status">{matches.length} of 34 combinations</span>{query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}</div>
      <div className="mushroom-picker-results" role="group" aria-label="Mushroom search results">
        {matches.map(row => {
          const checked = draft.choices.some(choice => choice.typeId === row.type.id && choice.size === row.size);
          return <label key={row.key} className={`mushroom-picker-choice${checked ? " is-selected" : ""}`} style={{ "--nectar-color": row.color.hex }}>
            <input type="checkbox" aria-label={`Compare ${row.label}`} checked={checked} disabled={!checked && atLimit} onChange={() => onToggle(row)} />
            <span><strong>{row.label}</strong><small><i className="mushroom-color-dot" aria-hidden="true" />{row.color.label} nectar</small></span>
          </label>;
        })}
        {!matches.length && <p className="mushroom-empty-list">No mushrooms match. Try a type such as Water, or a size such as Small.</p>}
      </div>
    </div>
    <div className="mushroom-selected-heading"><h3>Selected mushrooms ({draft.choices.length})</h3>{draft.choices.length > 0 && <button type="button" onClick={() => onChange(previous => ({ ...previous, choices: [] }))}>Clear selections</button>}</div>
    {atLimit && <p className="mushroom-caption" role="status">You can compare up to {MAX_MUSHROOM_CHOICES} mushrooms. Remove one to select another.</p>}
    <div className="mushroom-choice-list" role="region" aria-label="Selected mushrooms" tabIndex={draft.choices.length ? 0 : undefined}>
      {draft.choices.map(choice => {
        const row = MUSHROOM_REFERENCE_ROWS.find(value => value.type.id === choice.typeId && value.size === choice.size);
        return <fieldset className="mushroom-choice" key={choice.id}><legend>{row.label}</legend>
          <div className="mushroom-selected-fields"><label>Name <span>(optional)</span><input aria-label={`Mushroom ${choice.id} name`} value={choice.label} maxLength={40} placeholder="Optional name" autoComplete="off" onChange={event => edit(choice.id, { label: event.target.value })} /></label>
            <label>Expected stars<select aria-label={`Mushroom ${choice.id} expected stars`} value={choice.stars} onChange={event => edit(choice.id, { stars: Number(event.target.value) })}>{[1, 2, 3, 4].map(stars => <option key={stars} value={stars}>{stars}★</option>)}</select></label></div>
          <div className="mushroom-choice-actions"><button type="button" disabled={atLimit} aria-label={`Add another mushroom like ${choice.id}`} onClick={() => onChange(previous => ({ ...previous, choices: addMushroomChoice(previous.choices, choice) }))}>Add another</button>
            <button type="button" aria-label={`Remove mushroom ${choice.id}`} onClick={() => onChange(previous => ({ ...previous, choices: previous.choices.filter(value => value.id !== choice.id) }))}>Remove</button></div>
        </fieldset>;
      })}
      {!draft.choices.length && <p className="mushroom-empty-list">Nothing selected yet. Try Small Blue, Normal Yellow and Normal Water.</p>}
    </div>
    <p className="mushroom-caption">Expected stars are your estimate. This list resets on refresh or when you close the page. Unchecking a type and size removes all its copies.</p>
    <fieldset className="mushroom-color-options"><legend>Desired nectar colors</legend><div className="mushroom-color-options__buttons">
      {NECTAR_COLORS.map(color => <label key={color.id} style={{ "--nectar-color": color.hex }}><input type="checkbox" checked={draft.colors.includes(color.id)} onChange={() => toggleColor(color.id)} /><span className="mushroom-color-dot" aria-hidden="true" />{color.label}</label>)}
    </div><div className="mushroom-small-actions"><button type="button" onClick={() => onChange(previous => ({ ...previous, colors: NECTAR_COLORS.map(color => color.id) }))}>All colors</button><button type="button" onClick={() => onChange(previous => ({ ...previous, colors: [] }))}>Clear colors</button></div></fieldset>
    <label className="mushroom-ranking">Rank the comparison by<select value={draft.sortBy} onChange={event => { const sortBy = event.target.value; onChange(previous => ({ ...previous, sortBy })); }}><option value="min">Highest minimum yield</option><option value="max">Highest maximum yield</option></select></label>
  </aside>;
}
