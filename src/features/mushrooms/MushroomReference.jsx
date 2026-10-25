import React, { memo, useMemo, useState } from "react";
import { MAX_MUSHROOM_CHOICES } from "./data.js";
import { nectarRange } from "./calculations.js";
import { filterMushrooms } from "./selection.js";
import MushroomImage from "./MushroomImage.jsx";

function MushroomReference({ choices, onToggle, newStars, onNewStars }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => filterMushrooms(query), [query]);
  return <section className="mushroom-card mushroom-reference-card" aria-labelledby="mushroom-reference-title">
    <h2 id="mushroom-reference-title">Mushroom reward table</h2>
    <p className="mushroom-description">Nectar per mushroom at each star rating. Check a row to add it to your comparison.</p>
    <div role="search" aria-label="Search mushroom table" className="mushroom-search">
      <div className="mushroom-reference-controls"><label>Find a mushroom<input type="search" value={query} maxLength={160} placeholder="Small blue, normal yellow…" aria-controls="mushroom-reference-table" aria-describedby="mushroom-search-help" onChange={event => setQuery(event.target.value)} /></label>
      <label>Stars for new selections<select value={newStars} onChange={event => onNewStars(Number(event.target.value))}>{[1, 2, 3, 4].map(stars => <option key={stars} value={stars}>{stars}★</option>)}</select></label></div>
      <p id="mushroom-search-help" className="mushroom-caption">Search by type or size. Use commas for alternatives. Searching keeps your selections.</p>
      <div className="mushroom-search-status"><span role="status">Showing {matches.length} of 34 combinations</span>{query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}</div>
    </div>
    <div className="mushroom-reference" role="region" aria-label="Full mushroom reward table">
      <table id="mushroom-reference-table" className="mushroom-data-table mushroom-reference-table" role="table">
        <caption>Special Nectar is awarded at four stars only.</caption>
        <colgroup><col className="mushroom-name-column" /><col span={5} /></colgroup>
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Compare / mushroom</th>{[1, 2, 3, 4].map(stars => <th scope="col" role="columnheader" key={stars}>{stars}★ nectar</th>)}<th scope="col" role="columnheader">4★ Special</th></tr></thead>
        <tbody role="rowgroup">{matches.map(row => {
          const selected = choices.filter(choice => choice.typeId === row.type.id && choice.size === row.size);
          const disabled = !selected.length && choices.length >= MAX_MUSHROOM_CHOICES;
          const checkboxId = `mushroom-reference-${row.type.id}-${row.size}`;
          return <tr role="row" key={row.key} className={selected.length ? "mushroom-reference-row is-selected" : "mushroom-reference-row"} data-mushroom-row={row.key} aria-disabled={disabled || undefined}
            onClick={event => { if (!disabled && !event.target.closest("input, label, button, a, select")) onToggle(row); }}>
            <th scope="row" role="rowheader"><div className="mushroom-table-choice"><input id={checkboxId} type="checkbox" aria-label={`Compare ${row.label} from table`} checked={selected.length > 0} disabled={disabled} onChange={() => onToggle(row)} />
              <label htmlFor={checkboxId}><MushroomImage typeId={row.type.id} /><span className="mushroom-label-text"><strong>{row.label}</strong><small style={{ "--nectar-color": row.color.hex }}><i className="mushroom-color-dot" aria-hidden="true" />{row.color.label} nectar{selected.length > 1 ? ` · ${selected.length} selected` : ""}</small></span></label></div></th>
            {row.rewards.map(reward => <td role="cell" key={reward.stars} className={selected.some(choice => choice.stars === reward.stars) ? "mushroom-used-rating" : undefined}>
              <span className="mushroom-cell-label" aria-hidden="true">{reward.stars}★ nectar</span>{nectarRange(reward.min, reward.max)}
            </td>)}
            <td role="cell" className="mushroom-special-cell"><span className="mushroom-cell-label" aria-hidden="true">4★ Special Nectar</span>{row.rewards[3].special}</td>
          </tr>;
        })}{!matches.length && <tr role="row"><td role="cell" colSpan={6} className="mushroom-no-results">No mushrooms match. Try another type or size.</td></tr>}</tbody>
      </table>
    </div>
    <p className="mushroom-caption">Highlighted star cells are in your comparison. Unchecking a row removes all its copies.</p>
  </section>;
}
export default memo(MushroomReference);
