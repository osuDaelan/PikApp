import React, { useMemo } from "react";
import { NECTAR_COLORS, MAX_MUSHROOM_CHOICES } from "./data.js";
import { compareMushrooms, nectarRange } from "./calculations.js";
import MushroomImage from "./MushroomImage.jsx";

export default function MushroomComparison({ draft, onDuplicate }) {
  const result = useMemo(() => compareMushrooms(draft.choices, draft.colors, draft.sortBy), [draft]);
  const metric = draft.sortBy === "min" ? "minimum" : "maximum";
  const selectedColors = NECTAR_COLORS.filter(color => draft.colors.includes(color.id));
  return <section className="mushroom-card mushroom-comparison" aria-labelledby="mushroom-comparison-title">
    <span className="mushroom-eyebrow">ONLY THE MUSHROOMS YOU CAN JOIN</span><h2 id="mushroom-comparison-title">Your best options</h2>
    {!draft.choices.length ? <div className="mushroom-empty-state"><span aria-hidden="true">🍄</span><h3>Check the mushrooms you can join</h3><p>Your best options will appear here. Select checkboxes in the reward table above.</p></div>
      : !selectedColors.length ? <div className="mushroom-empty-state"><h3>Choose a nectar color</h3><p>Select one or more colors in your options to compare these mushrooms.</p></div>
        : <>
          <p className="mushroom-description" role="status">Comparing {result.rows.length} {result.rows.length === 1 ? "mushroom" : "mushrooms"} by highest {metric} yield. {selectedColors.length > 1 ? "Minimum and maximum combine your selected nectar colors. Each color's best options are listed separately." : `Amounts show only ${selectedColors[0].label.toLowerCase()} nectar.`}</p>
          <div className="mushroom-winners">{selectedColors.map(color => {
            const winners = result.rows.filter(row => result.winners[color.id].includes(row.id));
            return <div key={color.id} className="mushroom-winner" style={{ "--nectar-color": color.hex }}><span className="mushroom-color-dot" aria-hidden="true" /><strong>{color.label} · best {metric}</strong>
              {winners.length ? <>{winners.length > 1 && <span>Tied for best {metric}</span>}{winners.map(row => <span key={row.id}>{row.label}: <b>{nectarRange(row.byColor[color.id].min, row.byColor[color.id].max)} nectar</b></span>)}</> : <span>None of your selected mushrooms provides this color.</span>}
            </div>;
          })}</div>
          <table className="mushroom-data-table mushroom-results-table" role="table" aria-label="Selected mushroom comparison"><caption>Highest {metric} first · amounts are nectar</caption>
            <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Available mushroom</th><th scope="col" role="columnheader">Minimum</th><th scope="col" role="columnheader">Maximum</th><th scope="col" role="columnheader">Special</th></tr></thead>
            <tbody role="rowgroup">{result.rows.map(row => {
              const copies = draft.choices.filter(value => value.typeId === row.type.id && value.size === row.size);
              return <tr role="row" key={row.id} data-comparison-row={row.id} className={result.bestIds.includes(row.id) ? "mushroom-result-best" : undefined}>
              <th role="rowheader" scope="row"><div className="mushroom-result-name"><MushroomImage typeId={row.type.id} /><div><strong>{row.label}{copies.length > 1 ? ` (${copies.findIndex(value => value.id === row.id) + 1}/${copies.length})` : ""}</strong><span>{row.type.label} · {row.size} · {row.stars}★</span>{result.bestIds.includes(row.id) && <span className="mushroom-best-badge">Best {metric}{result.bestIds.length > 1 ? " · tie" : ""}</span>}</div></div>
                <button className="mushroom-add-copy" type="button" disabled={draft.choices.length >= MAX_MUSHROOM_CHOICES} aria-label={`Add another ${row.label} (mushroom ${row.id})`} onClick={() => onDuplicate(row.id)}>＋ Add another</button></th>
              <td role="cell"><span className="mushroom-cell-label" aria-hidden="true">Minimum</span>{row.selectedMin}</td><td role="cell"><span className="mushroom-cell-label" aria-hidden="true">Maximum</span>{row.selectedMax}</td><td role="cell" className="mushroom-special-cell"><span className="mushroom-cell-label" aria-hidden="true">Special Nectar</span>{row.special}</td>
            </tr>;
            })}</tbody>
          </table>
          <p className="mushroom-caption">Each row is one available mushroom. Add another to compare multiple of the same type and size, with separate expected stars. Limit: {MAX_MUSHROOM_CHOICES} mushrooms.</p>
          <p className="mushroom-caption">Ranking compares documented bounds, not an average or a guaranteed outcome. Overlapping ranges can produce different results.</p>
          <details className="mushroom-details"><summary>Color breakdown and reward details</summary>
            {result.rows.map(row => <div className="mushroom-reward-detail" key={row.id}><h3>{row.label} · {row.stars}★</h3>
              <dl>{NECTAR_COLORS.map(color => <div key={color.id}><dt>{color.label} nectar</dt><dd>{nectarRange(row.byColor[color.id].min, row.byColor[color.id].max)}</dd></div>)}<div><dt>Special Nectar</dt><dd>{row.special}</dd></div></dl>
              <p>At least {row.minPikmin} Pikmin to carry every reward, including the postcard. Score threshold: {row.score.toLocaleString("en-US")}.</p>
              <ul>{row.fruitGroups.map((group, index) => <li key={index}>{group.count} {group.size} {group.color} {group.count === 1 ? "fruit" : "fruits"} ({group.fruits.join(" or ")}): {nectarRange(group.min * group.count, group.max * group.count)} nectar</li>)}</ul>
            </div>)}
          </details>
        </>}
  </section>;
}
