import React, { useState } from "react";
import { MAP_CATEGORIES, CATEGORY_BY_ID } from "./categories.js";
import CategoryIcon from "./CategoryIcon.jsx";
import CompletionStar from "./CompletionStar.jsx";

export function CategoryPanel({ selectedIds, stats, completedCategoryIds, onToggle, onSelectAll, onClear, missingOnly, onMissingOnly, results, onPlace }) {
  const [filter, setFilter] = useState("");
  const [shown, setShown] = useState(30);
  const categories = MAP_CATEGORIES.filter(category => category.label.toLowerCase().includes(filter.trim().toLowerCase()));
  return <>
    <div className="decor-map__panel-heading"><h3>Decor categories</h3><span>{selectedIds.length} selected</span></div>
    <label className="decor-map__sr-only" htmlFor="map-category-filter">Filter decor categories</label>
    <input id="map-category-filter" type="search" placeholder="Filter categories…" value={filter} onChange={event => setFilter(event.target.value)} />
    <div className="decor-map__filter-actions"><button onClick={onSelectAll}>Select all</button><button onClick={onClear}>Clear</button>
      <label><input type="checkbox" checked={missingOnly} onChange={onMissingOnly} /> Missing only</label></div>
    <div className="decor-map__category-list" role="group" aria-label="Decor category filters">
      {categories.map(category => {
        const count = stats.get(category.id);
        return <button type="button" key={category.id} aria-pressed={selectedIds.includes(category.id)} onClick={() => onToggle(category.id)}>
          <CategoryIcon categoryId={category.id} />
          <span className="decor-map__category-name"><span className="decor-map__category-title">{category.label}{completedCategoryIds.has(category.id) && <CompletionStar />}</span><small>{count.done}/{count.total} collected</small></span>
          <span className="decor-map__category-check" aria-hidden="true">{selectedIds.includes(category.id) ? "✓" : ""}</span>
        </button>;
      })}
      {!categories.length && <p className="decor-map__hint">No matching categories.</p>}
    </div>
    <p className="decor-map__hint">Gold stars mean the entire category is collected, including rare variants.</p>
    <p className="decor-map__hint">Location categories only. Weather, event decors and rare variants are not predicted by this map.</p>
    {results.hasScan && <div className="decor-map__result-list">
      <h3>Places found · {results.places.length}</h3>
      {results.places.slice(0, shown).map(place => <button type="button" key={place.id} onClick={() => onPlace(place)}>
        <CategoryIcon categoryId={place.categoryIds[0]} /><span><span className="decor-map__category-title">{place.name}{completedCategoryIds.has(place.categoryIds[0]) && <CompletionStar />}</span><small>{place.categoryIds.map(id => CATEGORY_BY_ID.get(id)?.label).join(" · ")}</small></span>
      </button>)}
      {results.places.length > shown && <button type="button" onClick={() => setShown(value => value + 30)}>Show more places</button>}
    </div>}
  </>;
}

export function PlaceDetails({ place, stats, completedCategoryIds, saved, onSave, onBack, onFocus }) {
  return <div className="decor-map__place-details">
    <button type="button" onClick={onBack}>← Categories</button>
    <p className="decor-map__eyebrow">CANDIDATE DECOR LOCATION</p>
    <h3>{place.name}</h3>
    <p className="decor-map__hint">{place.geometry.type === "Point" ? "Mapped place" : "Mapped area or path · pin location is approximate"}</p>
    <div className="decor-map__place-categories">{place.categoryIds.map(id => {
      const category = CATEGORY_BY_ID.get(id), count = stats.get(id);
      return <div key={id}><CategoryIcon categoryId={id} /><div><strong className="decor-map__category-title">{category.label}{completedCategoryIds.has(id) && <CompletionStar />}</strong><small>{count.done}/{count.total} collected in your checklist{completedCategoryIds.has(id) ? " · Complete" : ""}</small></div></div>;
    })}</div>
    <p>OSM tags suggest these categories. Pikmin Bloom may show different results.</p>
    <button type="button" className="decor-map__primary" onClick={onSave}>{saved ? "Edit saved pin" : "Save this place"}</button>
    <button type="button" onClick={onFocus}>Center on place</button>
    <a href={place.sourceUrl} target="_blank" rel="noopener noreferrer">View original place on OSM ↗</a>
    <small>{place.id} · {place.lat.toFixed(5)}, {place.lng.toFixed(5)}</small>
  </div>;
}

export function PinsPanel({ pins, completedCategoryIds, onSelect, onExport, onImport, onAdd }) {
  return <>
    <div className="decor-map__panel-heading"><h3>My pins</h3><span>{pins.length} saved</span></div>
    <p className="decor-map__hint">Private to this browser. Export a backup to keep a copy or move pins to another device.</p>
    <div className="decor-map__pin-actions"><button onClick={onExport} disabled={!pins.length}>Export pins</button>
      <label className="decor-map__file-button">Import pins<input type="file" accept=".json,application/json" onChange={onImport} /></label></div>
    <button type="button" className="decor-map__primary" onClick={onAdd}>Place a new pin</button>
    {!pins.length && <div className="decor-map__empty"><span aria-hidden="true">📍</span><h3>Your places, all together</h3><p>Save a discovered place, or tap the map to pin a spot you want to remember.</p></div>}
    <div className="decor-map__saved-list">{pins.map(pin => <button key={pin.id} type="button" onClick={() => onSelect(pin)}>
      <CategoryIcon categoryId={pin.categoryIds[0]} /><span><strong className="decor-map__category-title">{pin.name}{completedCategoryIds.has(pin.categoryIds[0]) && <CompletionStar />}</strong>
      <small>{pin.categoryIds.map(id => CATEGORY_BY_ID.get(id)?.label).join(" · ") || "Personal pin"}</small>
      {pin.notes && <small>{pin.notes.slice(0, 100)}</small>}</span></button>)}</div>
  </>;
}
