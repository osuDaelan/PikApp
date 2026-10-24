import React, { useMemo } from "react";
import { NECTAR_COLORS } from "./data.js";
import { compareMushrooms, nectarRange } from "./calculations.js";
import MushroomRangeChart from "./MushroomRangeChart.jsx";

export default function MushroomComparison({ draft }) {
  const result = useMemo(() => compareMushrooms(draft.choices, draft.colors, draft.sortBy), [draft]);
  const metric = draft.sortBy === "min" ? "minimum" : "maximum";
  const selectedColors = NECTAR_COLORS.filter(color => draft.colors.includes(color.id));
  return <section className="mushroom-card mushroom-comparison" aria-labelledby="mushroom-comparison-title">
    <span className="mushroom-eyebrow">ONLY THE MUSHROOMS YOU CAN JOIN</span><h2 id="mushroom-comparison-title">Your best options</h2>
    {!draft.choices.length ? <div className="mushroom-empty-state"><span aria-hidden="true">🍄</span><h3>Add your available mushrooms</h3><p>Your comparison chart will appear here. The full reference above stays unchanged.</p></div>
      : !selectedColors.length ? <div className="mushroom-empty-state"><h3>Choose a nectar color</h3><p>Select one or more colors in your options to compare these mushrooms.</p></div>
        : <>
          <p className="mushroom-description" role="status">Comparing {result.rows.length} {result.rows.length === 1 ? "mushroom" : "mushrooms"} by highest {metric} yield. {selectedColors.length > 1 ? "Bars combine the selected colors; each color's best options are also shown below." : `Bars show only ${selectedColors[0].label.toLowerCase()} nectar.`}</p>
          <div className="mushroom-winners">{selectedColors.map(color => {
            const winners = result.rows.filter(row => result.winners[color.id].includes(row.id));
            return <div key={color.id} className="mushroom-winner" style={{ "--nectar-color": color.hex }}><span className="mushroom-color-dot" aria-hidden="true" /><strong>{color.label} · best {metric}</strong>
              {winners.length ? <>{winners.length > 1 && <span>Tied for best {metric}</span>}{winners.map(row => <span key={row.id}>{row.label}: <b>{nectarRange(row.byColor[color.id].min, row.byColor[color.id].max)} nectar</b></span>)}</> : <span>None of your selected mushrooms provides this color.</span>}
            </div>;
          })}</div>
          <MushroomRangeChart rows={result.rows} comparison bestIds={result.bestIds} sortBy={draft.sortBy} label="Selected mushroom comparison" />
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
