import React from "react";
import { DEFAULT_MUSHROOM_DRAFT, MUSHROOM_SOURCES } from "./data.js";
import MushroomReference from "./MushroomReference.jsx";
import MushroomOptions from "./MushroomOptions.jsx";
import MushroomComparison from "./MushroomComparison.jsx";
import { toggleMushroomSelection } from "./selection.js";
import { addMushroomChoice } from "./calculations.js";
import "./mushrooms.css";

export default function MushroomsSection({ draft, setDraft }) {
  const current = draft ?? DEFAULT_MUSHROOM_DRAFT;
  function change(updater) { setDraft(previous => updater(previous ?? DEFAULT_MUSHROOM_DRAFT)); }
  function toggle(row) { change(previous => ({ ...previous, choices: toggleMushroomSelection(previous.choices, row.type.id, row.size, previous.newStars ?? 4) })); }
  function duplicate(id) { change(previous => {
    const choice = previous.choices.find(value => value.id === id);
    return choice ? { ...previous, choices: addMushroomChoice(previous.choices, choice) } : previous;
  }); }
  return <section className="mushrooms-section" aria-labelledby="mushrooms-title">
    <header className="mushrooms-heading"><span className="mushroom-eyebrow">PLAN YOUR NEXT PICK</span><h1 id="mushrooms-title">Mushroom rewards <span aria-hidden="true">🍄</span></h1><p>Select the mushrooms you can join, then compare their nectar rewards.</p></header>
    <div className="mushrooms-layout">
      <MushroomOptions draft={current} onChange={change} />
      <div className="mushrooms-charts"><MushroomReference choices={current.choices} onToggle={toggle} /><MushroomComparison draft={current} onDuplicate={duplicate} /></div>
    </div>
    <section className="mushroom-card mushroom-source-notes" aria-labelledby="mushroom-source-title"><h2 id="mushroom-source-title">About these ranges</h2><p>Includes Small–Large regular and elemental mushrooms. Giant and event mushrooms will need their own reviewed data.</p><p>Ranges combine possible fruits of each displayed size and color, using player-researched nectar amounts. They cover total nectar of a color, including regular or seasonal nectar, and assume every reward is carried back. They do not predict a particular flower species. Special Nectar is separate.</p><p>Reviewed {MUSHROOM_SOURCES.reviewed}.</p><div className="mushroom-source-links"><a href={MUSHROOM_SOURCES.rewards} target="_blank" rel="noopener noreferrer">Pikipedia reward table ↗</a><a href={MUSHROOM_SOURCES.fruits} target="_blank" rel="noopener noreferrer">Fruit yields ↗</a><a href={MUSHROOM_SOURCES.official} target="_blank" rel="noopener noreferrer">Official reward rules ↗</a></div></section>
  </section>;
}
