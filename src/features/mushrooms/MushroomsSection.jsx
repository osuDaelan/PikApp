import React from "react";
import { DEFAULT_MUSHROOM_DRAFT, MUSHROOM_SOURCES } from "./data.js";
import MushroomReference from "./MushroomReference.jsx";
import MushroomComparisonPanel from "./MushroomComparisonPanel.jsx";
import { toggleMushroomSelection } from "./selection.js";
import "./mushrooms.css";

export default function MushroomsSection({ draft, setDraft }) {
  const current = draft ?? DEFAULT_MUSHROOM_DRAFT;
  function change(updater) { setDraft(previous => updater(previous ?? DEFAULT_MUSHROOM_DRAFT)); }
  function toggle(row) { change(previous => ({ ...previous, choices: toggleMushroomSelection(previous.choices, row.type.id, row.size, previous.newStars ?? 4) })); }
  return <section className="mushrooms-section" aria-labelledby="mushrooms-title">
    <div className="mushroom-workspace">
    <header className="mushrooms-heading"><h1 id="mushrooms-title">Mushroom rewards <span aria-hidden="true">🍄</span></h1><p>Pick the mushrooms you can join and compare their combined nectar.</p></header>
    <div className="mushrooms-layout">
      <MushroomComparisonPanel draft={current} onChange={change} />
      <MushroomReference choices={current.choices} onToggle={toggle} newStars={current.newStars ?? 4}
        onNewStars={newStars => change(previous => ({ ...previous, newStars }))} />
    </div>
    <details className="mushroom-source-notes"><summary>About these ranges</summary><p>Includes Small–Large regular and elemental mushrooms. Giant and event mushrooms will need their own reviewed data.</p><p>Ranges combine possible fruits of each displayed size and color, using player-researched nectar amounts. They cover total nectar of a color, including regular or seasonal nectar, and assume every reward is carried back. They do not predict a particular flower species. Special Nectar is separate.</p><p>Reviewed {MUSHROOM_SOURCES.reviewed}.</p><div className="mushroom-source-links"><a href={MUSHROOM_SOURCES.rewards} target="_blank" rel="noopener noreferrer">Pikipedia reward table ↗</a><a href={MUSHROOM_SOURCES.fruits} target="_blank" rel="noopener noreferrer">Fruit yields ↗</a><a href={MUSHROOM_SOURCES.official} target="_blank" rel="noopener noreferrer">Official reward rules ↗</a></div></details>
    </div>
  </section>;
}
