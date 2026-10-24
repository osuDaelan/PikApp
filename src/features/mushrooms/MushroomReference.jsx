import React, { memo, useMemo, useState } from "react";
import { referenceRewards, mushroomReward, nectarRange } from "./calculations.js";
import MushroomRangeChart from "./MushroomRangeChart.jsx";

function MushroomReference() {
  const [stars, setStars] = useState(4);
  const rows = useMemo(() => referenceRewards(stars), [stars]);
  return <section className="mushroom-card" aria-labelledby="mushroom-reference-title">
    <div className="mushroom-card__heading"><div><span className="mushroom-eyebrow">THE FULL PICTURE</span><h2 id="mushroom-reference-title">Nectar reference</h2></div>
      <label className="mushroom-inline-select">Reference stars<select value={stars} onChange={event => setStars(Number(event.target.value))}>{[1, 2, 3, 4].map(value => <option key={value} value={value}>{"★".repeat(value)} · {value} {value === 1 ? "star" : "stars"}</option>)}</select></label>
    </div>
    <p className="mushroom-description">All 34 mushroom and size combinations, ordered by maximum nectar. Your comparison options do not change this chart.</p>
    <MushroomRangeChart rows={rows} label={`Full reference at ${stars} stars`} />
    <details className="mushroom-details"><summary>View the complete 1–4 star table</summary>
      <div className="mushroom-table-scroll" tabIndex={0} role="region" aria-label="Complete nectar reward table"><table><caption>Documented nectar ranges · Special column applies to four stars</caption><thead><tr><th scope="col">Mushroom</th><th scope="col">Size</th>{[1, 2, 3, 4].map(value => <th key={value} scope="col">{value}★</th>)}<th scope="col">Special</th></tr></thead><tbody>
        {rows.map(row => <tr key={row.id}><th scope="row">{row.type.label}</th><td>{row.size}</td>{[1, 2, 3, 4].map(value => {
          const reward = mushroomReward(row.type.id, row.size, value);
          return <td key={value}>{nectarRange(reward.min, reward.max)}</td>;
        })}<td>{mushroomReward(row.type.id, row.size, 4).special}</td></tr>)}
      </tbody></table></div>
    </details>
  </section>;
}
export default memo(MushroomReference);
