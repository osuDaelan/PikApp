import React, { useMemo } from "react";
import { NECTAR_COLORS, MAX_MUSHROOM_CHOICES } from "./data.js";
import { nectarRange, updateMushroomChoice } from "./calculations.js";
import { compareMushroomGroups, addMushroomToGroup, removeMushroomFromGroup, setMushroomGroupStars } from "./groups.js";
import MushroomImage from "./MushroomImage.jsx";
import MushroomPreferences from "./MushroomPreferences.jsx";

const selectedRange = (member, colors) => nectarRange(
  colors.reduce((sum, color) => sum + member.byColor[color].min, 0),
  colors.reduce((sum, color) => sum + member.byColor[color].max, 0),
);

export default function MushroomComparisonPanel({ draft, onChange }) {
  const result = useMemo(() => compareMushroomGroups(draft.choices, draft.colors, draft.sortBy), [draft]);
  const metric = draft.sortBy === "min" ? "minimum" : "maximum";
  const atLimit = draft.choices.length >= MAX_MUSHROOM_CHOICES;
  function changeChoices(updater) { onChange(previous => ({ ...previous, choices: updater(previous.choices) })); }
  function edit(id, patch) { changeChoices(choices => choices.map(choice => choice.id === id ? updateMushroomChoice(choice, patch) : choice)); }
  function remove(id) { changeChoices(choices => choices.filter(choice => choice.id !== id)); }
  return <section className="mushroom-card mushroom-comparison" aria-labelledby="mushroom-comparison-title">
    <div className="mushroom-comparison-heading"><h2 id="mushroom-comparison-title">Your comparison</h2>
      {!!draft.choices.length && <button type="button" onClick={() => changeChoices(() => [])}>Clear selections</button>}
    </div>
    <p className="mushroom-description" role="status">{draft.choices.length
      ? `${draft.choices.length} mushrooms · ${result.rows.length} quantity-based options · ranked by total ${metric}`
      : "Choose mushrooms in the reference, then adjust quantities and stars here."}</p>
    <MushroomPreferences draft={draft} onChange={onChange} />
    {!draft.choices.length ? <div className="mushroom-empty-state"><h3>Which mushrooms can you join?</h3><p>Check a mushroom in the reference to compare one of it against several of another.</p></div> : <>
      {!draft.colors.length && <p className="mushroom-comparison-notice" role="status">Choose a nectar color to calculate and rank nectar totals. You can still edit your mushrooms.</p>}
      {atLimit && <p className="mushroom-comparison-notice" role="status">Limit: {MAX_MUSHROOM_CHOICES} mushrooms. Remove one to add another.</p>}
      <table className="mushroom-data-table mushroom-group-table" role="table" aria-label="Combined mushroom comparison">
        <caption>Totals for each row's quantity · nectar minimum–maximum</caption>
        <colgroup><col /><col className="mushroom-quantity-column" /><col className="mushroom-stars-column" /><col className="mushroom-total-column" /></colgroup>
        <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Mushroom</th><th scope="col" role="columnheader">Quantity</th><th scope="col" role="columnheader">Stars</th><th scope="col" role="columnheader">Total nectar</th></tr></thead>
        <tbody role="rowgroup">{result.rows.map(group => {
          const best = result.bestIds.includes(group.id);
          return <React.Fragment key={group.id}>
            <tr role="row" data-mushroom-group={group.id} className={best ? "mushroom-result-best" : undefined}>
              <th scope="row" role="rowheader"><div className="mushroom-result-name"><MushroomImage typeId={group.type.id} /><div>
                <strong>{group.label}</strong><span className="mushroom-result-meta">{group.stars === null ? "Mixed stars" : `Each: ${selectedRange(group.members[0], draft.colors)} nectar`}</span>
                {best && <span className="mushroom-best-badge">Best total {metric}{result.bestIds.length > 1 ? " · tie" : ""}</span>}
              </div></div></th>
              <td role="cell"><span className="mushroom-cell-label" aria-hidden="true">Quantity</span><div className="mushroom-quantity">
                <button type="button" aria-label={`Remove one ${group.label}`} title="Removes the last copy" onClick={() => changeChoices(choices => removeMushroomFromGroup(choices, group.id))}>−</button>
                <output aria-label={`${group.label} quantity`}>{group.quantity}</output>
                <button type="button" aria-label={`Add one ${group.label}`} disabled={atLimit} onClick={() => changeChoices(choices => addMushroomToGroup(choices, group.id))}>＋</button>
              </div></td>
              <td role="cell"><span className="mushroom-cell-label" aria-hidden="true">Stars</span><select aria-label={`Expected stars for ${group.label}`} value={group.stars ?? ""}
                onChange={event => { const stars = Number(event.target.value); changeChoices(choices => setMushroomGroupStars(choices, group.id, stars)); }}>
                {group.stars === null && <option value="" disabled>Mixed</option>}{[1, 2, 3, 4].map(stars => <option key={stars} value={stars}>{stars}★</option>)}
              </select></td>
              <td role="cell" className="mushroom-group-total"><span className="mushroom-cell-label" aria-hidden="true">Total nectar</span><strong>{nectarRange(group.selectedMin, group.selectedMax)}</strong><small>Special: {group.special}</small></td>
            </tr>
            <tr role="row" className="mushroom-group-detail-row"><td role="cell" colSpan={4}>
              <details className="mushroom-individuals"><summary>{group.label} · individual mushrooms ({group.quantity})</summary>
                <div className="mushroom-individual-list">{group.members.map((member, index) => {
                  const choice = draft.choices.find(value => value.id === member.id);
                  return <div className="mushroom-individual" key={member.id}>
                    <label>Name (optional)<input aria-label={`Mushroom ${member.id} name`} value={choice.label} maxLength={40} placeholder={`Copy ${index + 1}`} autoComplete="off" onChange={event => edit(member.id, { label: event.target.value })} /></label>
                    <label>Stars<select aria-label={`Mushroom ${member.id} expected stars`} value={member.stars} onChange={event => edit(member.id, { stars: Number(event.target.value) })}>{[1, 2, 3, 4].map(stars => <option key={stars} value={stars}>{stars}★</option>)}</select></label>
                    <span className="mushroom-individual-yield">{selectedRange(member, draft.colors)} nectar<small>Special: {member.special}</small></span>
                    <button type="button" aria-label={`Remove mushroom ${member.id}`} onClick={() => remove(member.id)}>Remove</button>
                  </div>;
                })}</div>
              </details>
            </td></tr>
          </React.Fragment>;
        })}</tbody>
      </table>
      <p className="mushroom-caption">Each option combines all its copies. Row stars apply to the whole group; expand individual mushrooms for separate stars and names. The − button removes the last copy.</p>
      <p className="mushroom-caption">Documented ranges can overlap; a higher total minimum or maximum is not a guaranteed outcome.</p>
      <details className="mushroom-details"><summary>Totals by nectar color</summary><div className="mushroom-breakdown-wrap">
        <table className="mushroom-data-table mushroom-breakdown-table"><caption>Combined rewards for each option</caption><thead><tr><th scope="col">Option</th>{NECTAR_COLORS.map(color => <th key={color.id} scope="col">{color.label}</th>)}<th scope="col">Special</th></tr></thead><tbody>
          {result.rows.map(group => <tr key={group.id}><th scope="row">{group.quantity} × {group.label}</th>{NECTAR_COLORS.map(color => <td key={color.id} className={result.winners[color.id]?.includes(group.id) ? "mushroom-result-best" : undefined}>{nectarRange(group.byColor[color.id].min, group.byColor[color.id].max)}</td>)}<td>{group.special}</td></tr>)}
        </tbody></table>
      </div></details>
      <details className="mushroom-details"><summary>Per-mushroom reward details</summary>{result.rows.flatMap(group => group.members.map(member => <div className="mushroom-reward-detail" key={member.id}>
        <h3>{member.label} · {member.stars}★</h3><p>At least {member.minPikmin} Pikmin to carry every reward, including the postcard. Score threshold: {member.score.toLocaleString("en-US")}.</p>
        <ul>{member.fruitGroups.map((fruit, index) => <li key={index}>{fruit.count} {fruit.size} {fruit.color} {fruit.count === 1 ? "fruit" : "fruits"} ({fruit.fruits.join(" or ")}): {nectarRange(fruit.min * fruit.count, fruit.max * fruit.count)} nectar</li>)}</ul>
      </div>))}</details>
    </>}
    <p className="mushroom-caption">Up to {MAX_MUSHROOM_CHOICES} mushrooms. Your comparison stays while switching pages; refreshing or closing this page resets it.</p>
  </section>;
}
