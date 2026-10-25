import React from "react";
import { NECTAR_COLORS } from "./data.js";

export default function MushroomPreferences({ draft, onChange }) {
  function toggleColor(id) {
    onChange(previous => ({ ...previous, colors: previous.colors.includes(id) ? previous.colors.filter(color => color !== id) : [...previous.colors, id] }));
  }
  return <div className="mushroom-preferences" role="group" aria-label="Comparison preferences">
    <fieldset className="mushroom-color-options"><legend>Desired nectar</legend>
      <div className="mushroom-color-options__buttons">{NECTAR_COLORS.map(color => <label key={color.id} style={{ "--nectar-color": color.hex }}>
        <input type="checkbox" checked={draft.colors.includes(color.id)} onChange={() => toggleColor(color.id)} /><span className="mushroom-color-dot" aria-hidden="true" />{color.label}
      </label>)}</div>
      <div className="mushroom-small-actions"><button type="button" onClick={() => onChange(previous => ({ ...previous, colors: NECTAR_COLORS.map(color => color.id) }))}>All colors</button>
        <button type="button" onClick={() => onChange(previous => ({ ...previous, colors: [] }))}>Clear colors</button></div>
    </fieldset>
    <label className="mushroom-ranking">Rank by<select value={draft.sortBy} onChange={event => { const sortBy = event.target.value; onChange(previous => ({ ...previous, sortBy })); }}>
      <option value="min">Highest total minimum</option><option value="max">Highest total maximum</option>
    </select></label>
  </div>;
}
