import React, { useRef } from "react";
import { MAX_DECOR_SEARCH_LENGTH } from "./search.js";
import "./decor-search.css";

export default function DecorSearch({ query, onQueryChange, search, matchCount }) {
  const inputRef = useRef(null);
  function clear() {
    onQueryChange("");
    inputRef.current?.focus();
  }
  return (
    <div className="decor-search" role="search" aria-label="Decor checklist">
      <label className="decor-search__label" htmlFor="decor-search-input">Search decor</label>
      <div className="decor-search__controls">
        <input ref={inputRef} id="decor-search-input" type="search" value={query}
          maxLength={MAX_DECOR_SEARCH_LENGTH} autoComplete="off" spellCheck={false}
          placeholder="Try blue restaurant or missing & rare"
          aria-invalid={!!search.error} aria-describedby={search.error ? "decor-search-error" : "decor-search-status"}
          onChange={event => onQueryChange(event.target.value)}
          onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); clear(); } }} />
        {query && <button type="button" onClick={clear}>Clear search</button>}
      </div>
      {search.error
        ? <p id="decor-search-error" className="decor-search__error" role="alert">{search.error}</p>
        : <p id="decor-search-status" className="decor-search__status" role="status">
          {search.active ? `${matchCount} matching ${matchCount === 1 ? "decor" : "decors"} · Search includes locked rare variants.`
            : "Search by species, category, costume, or collection status."}
        </p>}
      <details className="decor-search__help">
        <summary>Search tips</summary>
        <p>Species: <code>red</code>, <code>yellow</code>, <code>blue</code>, <code>purple</code>, <code>white</code>, <code>rock</code>, <code>winged</code>, <code>ice</code>.</p>
        <p>Filters: <code>collected</code>, <code>missing</code>, <code>rare</code>, <code>regular</code>, <code>event</code> (or <code>special</code>). Regular includes rare variants; use <code>regular &amp; !rare</code> for base decor.</p>
        <p>A space, <code>&amp;</code>, or comma means AND. <code>|</code> or <code>;</code> means OR. <code>!</code> excludes; parentheses group conditions. Order: parentheses, NOT, AND, OR.</p>
        <p>Try <code>blue restaurant</code>, <code>missing &amp; (red | yellow)</code>, or <code>event &amp; !collected</code>.</p>
        <p>Use straight quotes for a phrase or literal text: <code>"chef hat"</code>, <code>"Library &amp; Bookstore"</code>. Add <code>=</code> for a whole-field match: <code>="Chef Hat"</code> excludes <code>Chef Hat (Rare)</code>. Case and accents do not matter.</p>
        <p>Numbered designs keep their species: <code>yellow battery "design 2"</code>. Bulk buttons change only the displayed results. Clear search to restore the usual rare unlock rules.</p>
        <p>This checklist tracks decor types. Nicknames, found locations, friendship, squad, and flower states are not tracked.</p>
        <a href="https://www.pikminwiki.com/Pikmin_Bloom_interface#Pikmin" target="_blank" rel="noopener noreferrer">In-game search reference ↗</a>
      </details>
    </div>
  );
}
