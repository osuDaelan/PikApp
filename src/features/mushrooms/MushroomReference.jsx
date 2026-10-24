import React, { memo } from "react";
import { MAX_MUSHROOM_CHOICES } from "./data.js";
import { nectarRange } from "./calculations.js";
import { MUSHROOM_REFERENCE_ROWS } from "./selection.js";
import MushroomImage from "./MushroomImage.jsx";

function MushroomReference({ choices, onToggle }) {
  return <section className="mushroom-card" aria-labelledby="mushroom-reference-title">
    <span className="mushroom-eyebrow">THE FULL REFERENCE</span><h2 id="mushroom-reference-title">Mushroom reward table</h2>
    <p className="mushroom-description">Check a mushroom you can join, or tap its row. Each cell shows lowest–highest nectar at that star rating. Your selections do not hide any rows.</p>
    <div className="mushroom-reference" role="region" aria-label="Full mushroom reward table">
      <table className="mushroom-data-table mushroom-reference-table" role="table">
        <caption>All 34 type and size combinations · Special Nectar is awarded at four stars only.</caption>
        <colgroup><col className="mushroom-name-column" /><col span={5} /></colgroup>
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Compare / mushroom</th>{[1, 2, 3, 4].map(stars => <th scope="col" role="columnheader" key={stars}>{stars}★ nectar</th>)}<th scope="col" role="columnheader">4★ Special</th></tr></thead>
        <tbody role="rowgroup">{MUSHROOM_REFERENCE_ROWS.map(row => {
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
        })}</tbody>
      </table>
    </div>
    <p className="mushroom-caption">A highlighted star cell is used in your comparison. Change expected stars in your selected mushrooms.</p>
  </section>;
}
export default memo(MushroomReference);
