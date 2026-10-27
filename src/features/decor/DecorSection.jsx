import React, { useMemo } from "react";
import DecorGroup from "./DecorGroup.jsx";
import DecorSearch from "./DecorSearch.jsx";
import LegacyDecorReview from "./LegacyDecorReview.jsx";
import { compileDecorSearch, searchDecorCatalog, regularDecorGroups } from "./search.js";
import { DECOR_SPECIAL_CATEGORIES } from "./catalog.js";
import { countDecorGroups } from "./collection.js";
import { colors, cardStyle } from "../../shared/styles/theme.js";
const { orange: O, darkGreen: DG } = colors;

// Small inline toggle for bulk "Select all" mode — sits in each section's own header
// instead of as a separate banner, since it's a mode for the lists directly below it.
function QuickSelectToggle({ decorBulkMode, setDecorBulkMode }) {
  return (
    <button
      onClick={() => setDecorBulkMode(v => !v)}
      title='Adds "Select all" buttons to mark a whole costume or location done at once'
      style={{
        display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
        background: decorBulkMode ? "#fff3de" : "#f5f5f5", border: `1px solid ${decorBulkMode ? O : "transparent"}`,
        borderRadius: 20, padding: "4px 10px 4px 8px", cursor: "pointer", fontFamily: "inherit",
        fontSize: 10, fontWeight: 700, color: decorBulkMode ? O : "#999", transition: "all 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span style={{ fontSize: 11 }}>⚡</span>
      <span>Quick select</span>
    </button>
  );
}

// Toggle for bypassing the Rare-decor unlock filter — off by default, since Rare Decor
// Pikmin don't actually appear in-game until their base costume set is fully collected.
function ShowAllToggle({ showAllDecor, toggleShowAllDecor }) {
  return (
    <button
      onClick={toggleShowAllDecor}
      title="Rare decor unlocks when its base set is collected. Café requires the original seven colors, excluding Ice. Toggle to view everything."
      style={{
        display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
        background: showAllDecor ? "#fde9e7" : "#f5f5f5", border: `1px solid ${showAllDecor ? "#e0453c" : "transparent"}`,
        borderRadius: 20, padding: "4px 10px 4px 8px", cursor: "pointer", fontFamily: "inherit",
        fontSize: 10, fontWeight: 700, color: showAllDecor ? "#e0453c" : "#999", transition: "all 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span style={{ fontSize: 11 }}>{showAllDecor ? "🔓" : "🔒"}</span>
      <span>Show all</span>
    </button>
  );
}


export default function DecorSection({ decor, isWide }) {
  const { decorCollected, decorBulkMode, setDecorBulkMode, decorSearchQuery, setDecorSearchQuery, recentDecorEdits, showAllDecor, toggleShowAllDecor, showShrineDecor, setShowShrineDecor, toggleDecor, bulkSetDecor } = decor;
  const search = useMemo(() => compileDecorSearch(decorSearchQuery), [decorSearchQuery]);
  const results = useMemo(() => searchDecorCatalog(search, decorCollected, recentDecorEdits, { showShrineDecor }), [search, decorCollected, recentDecorEdits, showShrineDecor]);
  const regularMatches = countDecorGroups(results.regular, decorCollected);
  const specialMatches = countDecorGroups(results.special, decorCollected);
  const regularStats = countDecorGroups(regularDecorGroups(showShrineDecor), decorCollected);
  const specialStats = countDecorGroups(DECOR_SPECIAL_CATEGORIES, decorCollected);
  return (
    <>
      <DecorSearch query={decorSearchQuery} onQueryChange={setDecorSearchQuery} search={search}
        matchCount={regularMatches.total + specialMatches.total - results.retainedCount} retainedCount={results.retainedCount} />
      <div style={{ display: "flex", flexDirection: isWide ? "row" : "column", gap: 12, alignItems: isWide ? "flex-start" : "stretch" }}>
      <div style={{ flex: 1, width: "100%", ...cardStyle }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
          <div style={{ fontWeight: 800, color: DG, fontSize: 13 }}>🎀 Regular Decor</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {!search.active && <ShowAllToggle showAllDecor={showAllDecor} toggleShowAllDecor={toggleShowAllDecor} />}
            <QuickSelectToggle decorBulkMode={decorBulkMode} setDecorBulkMode={setDecorBulkMode} />
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#aaa" }}>{regularStats.done}/{regularStats.total} collected{search.active ? ` overall · ${regularMatches.total} shown` : " · tap a color to toggle"}</div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 11, color: DG, cursor: "pointer" }}>
          <input type="checkbox" checked={showShrineDecor} onChange={event => setShowShrineDecor(event.target.checked)} />
          Shrine &amp; Temple <span style={{ color: "#777" }}>(Japan)</span>
        </label>
        <LegacyDecorReview collected={decorCollected} section="regular" onReviewed={ids => bulkSetDecor(ids, false)} />
        {search.active && !search.error && !results.regular.length && <p style={{ color: "#666", fontSize: 12 }}>No matching regular decor. Try another search or clear it.</p>}
        {results.regular.map((g, i) => (
          <DecorGroup key={g.location} group={g} collected={decorCollected} onToggleColor={toggleDecor} isFirst={i === 0} bulkMode={decorBulkMode} onBulkSet={bulkSetDecor} showAllDecor={showAllDecor || search.active} />
        ))}
      </div>

      <div style={{ flex: 1, width: "100%", ...cardStyle }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
          <div style={{ fontWeight: 800, color: DG, fontSize: 13 }}>✨ Special &amp; Event Decor</div>
          <QuickSelectToggle decorBulkMode={decorBulkMode} setDecorBulkMode={setDecorBulkMode} />
        </div>
        <div style={{ fontSize: 11, color: "#aaa" }}>{specialStats.done}/{specialStats.total} collected{search.active ? ` overall · ${specialMatches.total} shown` : " · tap a color to toggle"}</div>
        <LegacyDecorReview collected={decorCollected} section="special" onReviewed={ids => bulkSetDecor(ids, false)} />
        {search.active && !search.error && !results.special.length && <p style={{ color: "#666", fontSize: 12 }}>No matching special or event decor. Try another search or clear it.</p>}
        {results.special.map((g, i) => (
          <DecorGroup key={g.location} group={g} collected={decorCollected} onToggleColor={toggleDecor} isFirst={i === 0} bulkMode={decorBulkMode} onBulkSet={bulkSetDecor} showAllDecor={showAllDecor || search.active} />
        ))}
      </div>
      </div>
    </>
  );
}
