import React, { useMemo } from "react";
import DecorGroup from "./DecorGroup.jsx";
import DecorSearch from "./DecorSearch.jsx";
import LegacyDecorReview from "./LegacyDecorReview.jsx";
import { compileDecorSearch, searchDecorCatalog, regularDecorGroups } from "./search.js";
import { DECOR_SPECIAL_CATEGORIES } from "./catalog.js";
import { countDecorGroups } from "./collection.js";
import { cardStyle } from "../../shared/styles/theme.js";
import "./decor-checklist.css";

const COLLECTION_VIEWS = [
  { value: "all", label: "All" },
  { value: "regular", label: "Regular" },
  { value: "special", label: "Event" },
];

export default function DecorSection({ decor }) {
  const {
    decorCollected, decorBulkMode, setDecorBulkMode, collectionView, setCollectionView,
    decorSearchQuery, setDecorSearchQuery, recentDecorEdits, showAllDecor, toggleShowAllDecor,
    showShrineDecor, setShowShrineDecor, toggleDecor, bulkSetDecor,
  } = decor;
  const search = useMemo(() => compileDecorSearch(decorSearchQuery), [decorSearchQuery]);
  const results = useMemo(() => searchDecorCatalog(search, decorCollected, recentDecorEdits, {
    showShrineDecor, showAllDecor, collectionView,
  }), [search, decorCollected, recentDecorEdits, showShrineDecor, showAllDecor, collectionView]);
  const collections = [
    {
      id: "regular", title: "Regular Decor", icon: "🎀",
      allGroups: regularDecorGroups(showShrineDecor), visibleGroups: results.regular,
      empty: "No matching regular decor.",
    },
    {
      id: "special", title: "Special & Event Decor", icon: "✨",
      allGroups: DECOR_SPECIAL_CATEGORIES, visibleGroups: results.special,
      empty: "No matching special or event decor.",
    },
  ].filter(({ id }) => collectionView === "all" || collectionView === id);
  const shownCount = collections.reduce(
    (total, { visibleGroups }) => total + countDecorGroups(visibleGroups, decorCollected).total, 0,
  );

  return (
    <div className="decor-checklist">
      <DecorSearch query={decorSearchQuery} onQueryChange={setDecorSearchQuery} search={search}
        matchCount={shownCount - results.retainedCount} retainedCount={results.retainedCount} />
      <div style={cardStyle}>
        <div className="decor-checklist__toolbar">
          <div className="decor-checklist__views" role="group" aria-label="Decor collection view">
            {COLLECTION_VIEWS.map(({ value, label }) => (
              <button key={value} type="button" aria-pressed={collectionView === value}
                onClick={() => setCollectionView(value)}>{label}</button>
            ))}
          </div>
          <button type="button" className="decor-checklist__action" aria-pressed={decorBulkMode}
            onClick={() => setDecorBulkMode(value => !value)}
            title="Show bulk selection buttons for the displayed locations and costumes">
            <span aria-hidden="true">⚡</span> Quick select
          </button>
        </div>
        {collections.map(({ id, title, icon, allGroups, visibleGroups, empty }) => {
          const stats = countDecorGroups(allGroups, decorCollected);
          const visibleCount = countDecorGroups(visibleGroups, decorCollected).total;
          const headingId = `decor-checklist-${id}`;
          return (
            <section key={id} className="decor-checklist__collection" aria-labelledby={headingId}>
              <div className="decor-checklist__heading">
                <div>
                  <h2 id={headingId}><span aria-hidden="true">{icon}</span> {title}</h2>
                  <div className="decor-checklist__count">
                    {stats.done}/{stats.total} collected{search.active && ` overall · ${visibleCount} shown`}
                  </div>
                </div>
                {id === "regular" && (
                  <button type="button" className="decor-checklist__action decor-checklist__rare-toggle"
                    onClick={toggleShowAllDecor} aria-pressed={showAllDecor}
                    title="Preview rare decor before its required base sets are collected">
                    <span aria-hidden="true">{showAllDecor ? "🔓" : "🔒"}</span> Show locked rares
                  </button>
                )}
              </div>
              {id === "regular" && (
                <label className="decor-checklist__shrine">
                  <input type="checkbox" checked={showShrineDecor} onChange={event => setShowShrineDecor(event.target.checked)} />
                  Shrine &amp; Temple (Japan)
                </label>
              )}
              <LegacyDecorReview collected={decorCollected} section={id} onReviewed={ids => bulkSetDecor(ids, false)} />
              {search.active && !search.error && !visibleGroups.length && (
                <p className="decor-checklist__empty">{empty} Try another search or clear it.</p>
              )}
              {visibleGroups.map((group, index) => (
                <DecorGroup key={group.location} group={group} collected={decorCollected} onToggleColor={toggleDecor}
                  isFirst={index === 0} bulkMode={decorBulkMode} onBulkSet={bulkSetDecor} showAllDecor={showAllDecor} />
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
