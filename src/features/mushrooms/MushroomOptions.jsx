import React from "react";
import { NECTAR_COLORS, MAX_MUSHROOM_CHOICES } from "./data.js";
import { updateMushroomChoice } from "./calculations.js";
import { MUSHROOM_REFERENCE_ROWS } from "./selection.js";

export default function MushroomOptions({ draft, onChange }) {
  const atLimit = draft.choices.length >= MAX_MUSHROOM_CHOICES;
  function toggleColor(id) {
    onChange(previous => ({ ...previous, colors: previous.colors.includes(id) ? previous.colors.filter(color => color !== id) : [...previous.colors, id] }));
  }
  function edit(id, patch) {
    onChange(previous => ({ ...previous, choices: previous.choices.map(choice => choice.id === id ? updateMushroomChoice(choice, patch) : choice) }));
  }
  return <aside className="mushroom-card mushroom-options" aria-labelledby="mushroom-options-title">
    <span className="mushroom-eyebrow">YOUR NEXT BATTLE</span><h2 id="mushroom-options-title">Comparison settings</h2>
    <p className="mushroom-description">Select mushrooms in the table, then adjust their expected stars and your nectar preferences here.</p>
    <label className="mushroom-new-stars">Stars for new selections<select value={draft.newStars ?? 4} onChange={event => { const newStars = Number(event.target.value); onChange(previous => ({ ...previous, newStars })); }}>
      {[1, 2, 3, 4].map(stars => <option key={stars} value={stars}>{stars} {stars === 1 ? "star" : "stars"}</option>)}
    </select></label>
    <div className="mushroom-selected-heading"><h3>Selected mushrooms ({draft.choices.length})</h3>{draft.choices.length > 0 && <button type="button" onClick={() => onChange(previous => ({ ...previous, choices: [] }))}>Clear selections</button>}</div>
    {atLimit && <p className="mushroom-caption" role="status">You can compare up to {MAX_MUSHROOM_CHOICES} mushrooms. Remove one to select another.</p>}
    <div className="mushroom-choice-list" role="region" aria-label="Selected mushrooms" tabIndex={draft.choices.length ? 0 : undefined}>
      {draft.choices.map(choice => {
        const row = MUSHROOM_REFERENCE_ROWS.find(value => value.type.id === choice.typeId && value.size === choice.size);
        const copies = draft.choices.filter(value => value.typeId === choice.typeId && value.size === choice.size);
        return <fieldset className="mushroom-choice" key={choice.id}><legend>{row.label}{copies.length > 1 ? ` (${copies.findIndex(value => value.id === choice.id) + 1}/${copies.length})` : ""}</legend>
          <div className="mushroom-selected-fields"><label>Name <span>(optional)</span><input aria-label={`Mushroom ${choice.id} name`} value={choice.label} maxLength={40} placeholder="Optional name" autoComplete="off" onChange={event => edit(choice.id, { label: event.target.value })} /></label>
            <label>Expected stars<select aria-label={`Mushroom ${choice.id} expected stars`} value={choice.stars} onChange={event => edit(choice.id, { stars: Number(event.target.value) })}>{[1, 2, 3, 4].map(stars => <option key={stars} value={stars}>{stars}★</option>)}</select></label></div>
          <div className="mushroom-choice-actions"><button type="button" aria-label={`Remove mushroom ${choice.id}`} onClick={() => onChange(previous => ({ ...previous, choices: previous.choices.filter(value => value.id !== choice.id) }))}>Remove</button></div>
        </fieldset>;
      })}
      {!draft.choices.length && <p className="mushroom-empty-list">Check mushrooms in the reward table to start comparing.</p>}
    </div>
    <p className="mushroom-caption">Expected stars are your estimate. This list resets on refresh or when you close the page. Unchecking a type and size removes all its copies.</p>
    <fieldset className="mushroom-color-options"><legend>Desired nectar colors</legend><div className="mushroom-color-options__buttons">
      {NECTAR_COLORS.map(color => <label key={color.id} style={{ "--nectar-color": color.hex }}><input type="checkbox" checked={draft.colors.includes(color.id)} onChange={() => toggleColor(color.id)} /><span className="mushroom-color-dot" aria-hidden="true" />{color.label}</label>)}
    </div><div className="mushroom-small-actions"><button type="button" onClick={() => onChange(previous => ({ ...previous, colors: NECTAR_COLORS.map(color => color.id) }))}>All colors</button><button type="button" onClick={() => onChange(previous => ({ ...previous, colors: [] }))}>Clear colors</button></div></fieldset>
    <label className="mushroom-ranking">Rank the comparison by<select value={draft.sortBy} onChange={event => { const sortBy = event.target.value; onChange(previous => ({ ...previous, sortBy })); }}><option value="min">Highest minimum yield</option><option value="max">Highest maximum yield</option></select></label>
  </aside>;
}
