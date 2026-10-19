import React from "react";
import { PIKMIN_COLORS, PIKMIN_COLOR_HEX, PIKMIN_COLOR_ABBR, DECOR_ICONS } from "./catalog.js";
import { decorId, countDecorGroups, isRareLocked, isRareCostume } from "./collection.js";
import { colors } from "../../shared/styles/theme.js";
import DecorImageTile from "./DecorImageTile.jsx";
import { getDecorImage } from "./decorImages.js";
import { decorSetId } from "./setCompletion.js";
const { green: G, orange: O, darkGreen: DG } = colors;

// Placeholder color-coded tile — swap for real per-color artwork later
function ColorTile({ color, available, collected, onToggle }) {
  const hex = PIKMIN_COLOR_HEX[color];
  if (!available) {
    return (
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#ccc", flexShrink: 0 }}>
        –
      </div>
    );
  }
  return (
    <button
      onClick={onToggle}
      title={color}
      style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        border: collected ? "none" : `2px solid ${hex}`,
        background: collected ? hex : "#fff",
        color: collected ? "#fff" : hex,
        fontSize: 9, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: collected ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
        transition: "background 0.15s, box-shadow 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {PIKMIN_COLOR_ABBR[color]}
    </button>
  );
}

// Numbered design toggle — for costumes with multiple non-color design variants (e.g. Battery sizes)
function DesignTile({ label, color, collected, onToggle }) {
  const hex = PIKMIN_COLOR_HEX[color];
  return (
    <button
      onClick={onToggle}
      title={`${color} · design ${label}`}
      style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        border: collected ? "none" : `2px solid ${hex}`,
        background: collected ? hex : "#fff",
        color: collected ? "#fff" : hex,
        fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: collected ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
        transition: "background 0.15s, box-shadow 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </button>
  );
}

// One costume variant's row of toggles — either up to 8 color toggles, or numbered design toggles
function CostumeRow({ groupLocation, costume, collected, onToggleColor, bulkMode, onBulkSet }) {
  const isDesignBased = !!costume.designs;
  const rare = isRareCostume(costume);
  const availSet = new Set(costume.colors);
  const ids = (costume.designs || costume.colors).map(v => decorId(groupLocation, costume.name, v));
  const collectedCount = ids.filter(id => collected[id]).length;
  const allCollected = collectedCount === ids.length;
  return (
    <div role="group" aria-label={`${groupLocation} · ${costume.name}`} data-decor-set={decorSetId(groupLocation, costume.name)} style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5, gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#555", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{costume.name}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
          {bulkMode && (
            <button
              onClick={() => onBulkSet(ids, !allCollected)}
              style={{ fontSize: 10, fontWeight: 700, color: allCollected ? "#bbb" : O, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, whiteSpace: "nowrap" }}
            >
              {allCollected ? "Clear" : "Select all"}
            </button>
          )}
          <span style={{ fontSize: 10, color: "#bbb", whiteSpace: "nowrap" }}>{collectedCount}/{ids.length}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
        {isDesignBased
          ? costume.designs.map(design => {
              const id = decorId(groupLocation, costume.name, design);
              const image = getDecorImage(id);
              if (image) return (
                <DecorImageTile key={design} id={id} image={image} rare={rare} color={`${costume.color} ${design}`}
                  label={`${groupLocation} · ${costume.name} · ${costume.color} Pikmin · design ${design}`}
                  collected={!!collected[id]} onToggle={onToggleColor} />
              );
              return <DesignTile
                key={design}
                label={design}
                color={costume.color}
                collected={!!collected[id]}
                onToggle={() => onToggleColor(id)}
              />;
            })
          : PIKMIN_COLORS.map(color => {
              const id = decorId(groupLocation, costume.name, color);
              const image = availSet.has(color) ? getDecorImage(id) : null;
              if (image) return (
                <DecorImageTile key={color} id={id} image={image} rare={rare} color={color}
                  label={`${groupLocation} · ${costume.name} · ${color} Pikmin`}
                  collected={!!collected[id]} onToggle={onToggleColor} />
              );
              return (
              <ColorTile
                key={color}
                color={color}
                available={availSet.has(color)}
                collected={!!collected[decorId(groupLocation, costume.name, color)]}
                onToggle={() => onToggleColor(decorId(groupLocation, costume.name, color))}
              />
              );
            })}
      </div>
    </div>
  );
}

// A location (or special-decor category) section: header + its costume rows
export default function DecorGroup({ group, collected, onToggleColor, isFirst, bulkMode, onBulkSet, showAllDecor }) {
  const { total, done } = countDecorGroups([group], collected);
  const groupIds = group.costumes.flatMap(c => (c.designs || c.colors).map(variant => decorId(group.location, c.name, variant)));
  const allCollected = done === total;
  const visibleCostumes = group.costumes.filter(c => showAllDecor || !isRareLocked(group, c, collected));
  return (
    <div style={{ padding: "12px 0", borderTop: isFirst ? "none" : "1px solid #f0f8ec" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 8 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: DG, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{DECOR_ICONS[group.location] || "🎀"} {group.location}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexShrink: 0 }}>
          {bulkMode && (
            <button
              onClick={() => onBulkSet(groupIds, !allCollected)}
              style={{ fontSize: 11, fontWeight: 800, color: allCollected ? "#bbb" : G, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, whiteSpace: "nowrap" }}
            >
              {allCollected ? "Clear all" : "Select all"}
            </button>
          )}
          <span style={{ fontSize: 10, color: "#bbb", whiteSpace: "nowrap" }}>{done}/{total}</span>
        </div>
      </div>
      {visibleCostumes.map(c => (
        <CostumeRow key={c.name} groupLocation={group.location} costume={c} collected={collected} onToggleColor={onToggleColor} bulkMode={bulkMode} onBulkSet={onBulkSet} />
      ))}
    </div>
  );
}
