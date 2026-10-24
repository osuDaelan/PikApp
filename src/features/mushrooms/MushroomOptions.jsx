import React, { useState } from "react";
import { MUSHROOM_TYPES, NECTAR_COLORS, SIZES, MAX_MUSHROOM_CHOICES } from "./data.js";
import { availableSizes, addMushroomChoice, updateMushroomChoice } from "./calculations.js";

function ChoiceFields({ choice, onChange, label }) {
  const sizes = availableSizes(choice.typeId);
  return <div className="mushroom-choice-fields">
    <label className="mushroom-choice-fields__name">Name <span>(optional)</span><input aria-label={`${label} name`} value={choice.label} maxLength={40} placeholder="Near home, friend's invite…" autoComplete="off" onChange={event => onChange({ label: event.target.value })} /></label>
    <label>Type<select aria-label={`${label} type`} value={choice.typeId} onChange={event => onChange({ typeId: event.target.value })}>
      {["regular", "elemental"].map(kind => <optgroup key={kind} label={kind === "regular" ? "Regular" : "Elemental"}>{MUSHROOM_TYPES.filter(type => type.kind === kind).map(type => <option key={type.id} value={type.id}>{type.label}</option>)}</optgroup>)}
    </select></label>
    <label>Size<select aria-label={`${label} size`} value={choice.size} onChange={event => onChange({ size: event.target.value })}>{SIZES.filter(size => sizes.includes(size.id)).map(size => <option key={size.id} value={size.id}>{size.label}</option>)}</select></label>
    <label>Expected stars<select aria-label={`${label} expected stars`} value={choice.stars} onChange={event => onChange({ stars: Number(event.target.value) })}>{[1, 2, 3, 4].map(value => <option key={value} value={value}>{value} {value === 1 ? "star" : "stars"}</option>)}</select></label>
  </div>;
}

export default function MushroomOptions({ draft, onChange }) {
  const [newChoice, setNewChoice] = useState({ typeId: "red", size: "normal", stars: 4, label: "" });
  function toggleColor(id) {
    onChange(previous => ({ ...previous, colors: previous.colors.includes(id) ? previous.colors.filter(color => color !== id) : [...previous.colors, id] }));
  }
  function add(event) {
    event.preventDefault();
    onChange(previous => ({ ...previous, choices: addMushroomChoice(previous.choices, newChoice) }));
    setNewChoice(previous => ({ ...previous, label: "" }));
  }
  function edit(id, patch) {
    onChange(previous => ({ ...previous, choices: previous.choices.map(choice => choice.id === id ? updateMushroomChoice(choice, patch) : choice) }));
  }
  return <aside className="mushroom-card mushroom-options" aria-labelledby="mushroom-options-title">
    <span className="mushroom-eyebrow">YOUR NEXT BATTLE</span><h2 id="mushroom-options-title">Choose your options</h2>
    <p className="mushroom-description">Add mushrooms you can join, then choose the nectar colors you need. Expected stars are your estimate.</p>
    <fieldset className="mushroom-color-options"><legend>Desired nectar colors</legend><div className="mushroom-color-options__buttons">
      {NECTAR_COLORS.map(color => <label key={color.id} style={{ "--nectar-color": color.hex }}><input type="checkbox" checked={draft.colors.includes(color.id)} onChange={() => toggleColor(color.id)} /><span className="mushroom-color-dot" aria-hidden="true" />{color.label}</label>)}
    </div><div className="mushroom-small-actions"><button type="button" onClick={() => onChange(previous => ({ ...previous, colors: NECTAR_COLORS.map(color => color.id) }))}>All colors</button><button type="button" onClick={() => onChange(previous => ({ ...previous, colors: [] }))}>Clear colors</button></div></fieldset>
    <label className="mushroom-ranking">Rank the comparison by<select value={draft.sortBy} onChange={event => { const sortBy = event.target.value; onChange(previous => ({ ...previous, sortBy })); }}><option value="min">Highest minimum yield</option><option value="max">Highest maximum yield</option></select></label>
    <form className="mushroom-add-form" onSubmit={add}>
      <fieldset><legend>Add an available mushroom</legend><ChoiceFields choice={newChoice} label="New mushroom" onChange={patch => setNewChoice(previous => updateMushroomChoice(previous, patch))} />
        <button className="mushroom-primary-button" type="submit" disabled={draft.choices.length >= MAX_MUSHROOM_CHOICES}>＋ Add mushroom</button>
        {draft.choices.length >= MAX_MUSHROOM_CHOICES && <p className="mushroom-caption">You can compare up to {MAX_MUSHROOM_CHOICES} mushrooms. Remove one to add another.</p>}
      </fieldset>
    </form>
    <p className="mushroom-choice-status" role="status">{draft.choices.length} available {draft.choices.length === 1 ? "mushroom" : "mushrooms"} · this list resets when you refresh or close the page.</p>
    <div className="mushroom-choice-list" role="region" aria-label="Available mushrooms" tabIndex={draft.choices.length ? 0 : undefined}>
      {draft.choices.map(choice => <fieldset className="mushroom-choice" key={choice.id}><legend>Mushroom {choice.id}</legend>
        <ChoiceFields choice={choice} label={`Mushroom ${choice.id}`} onChange={patch => edit(choice.id, patch)} />
        <button type="button" className="mushroom-remove-button" aria-label={`Remove mushroom ${choice.id}`} onClick={() => onChange(previous => ({ ...previous, choices: previous.choices.filter(value => value.id !== choice.id) }))}>Remove</button>
      </fieldset>)}
      {!draft.choices.length && <p className="mushroom-empty-list">Your available mushrooms will appear here. You can add the same type more than once.</p>}
    </div>
  </aside>;
}
