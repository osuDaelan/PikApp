import React from "react";
import { NECTAR_COLORS } from "./data.js";
import { nectarRange } from "./calculations.js";

export default function MushroomRangeChart({ rows, comparison = false, bestIds = [], sortBy = "min", label }) {
  const upper = Math.max(1, ...rows.map(row => comparison ? row.selectedMax : row.max));
  const scale = Math.max(10, Math.ceil(upper / 50) * 50);
  return <div className="mushroom-range-chart" role="group" aria-label={label}>
    <div className={comparison ? "mushroom-range-chart__rows" : "mushroom-range-chart__rows mushroom-reference-scroll"} tabIndex={comparison ? undefined : 0} aria-label={comparison ? undefined : "All 34 mushroom and size combinations"}>
      <div className="mushroom-range-chart__scale" aria-hidden="true"><div className="mushroom-range-chart__ticks"><span>0</span><span>{scale / 2}</span><span>{scale} nectar</span></div></div>
      {rows.map(row => {
        const min = comparison ? row.selectedMin : row.min, max = comparison ? row.selectedMax : row.max;
        const color = NECTAR_COLORS.find(value => value.id === row.type.color);
        const best = bestIds.includes(row.id);
        return <div key={row.id} className={`mushroom-range-row${best ? " mushroom-range-row--best" : ""}`} data-mushroom-row={row.id}>
          <div className="mushroom-range-row__name">
            <strong>{comparison ? row.label : `${row.type.label} · ${row.size}`}</strong>
            <span>{comparison ? `${row.type.label} · ${row.size} · ${row.stars}★ · ` : ""}{color.label} nectar</span>
            {best && <span className="mushroom-best-badge">Best {sortBy === "min" ? "minimum" : "maximum"}{bestIds.length > 1 ? " · tie" : ""}</span>}
          </div>
          <div className="mushroom-range-row__track" aria-hidden="true">
            {max > 0 && <><span className="mushroom-range-row__bar" style={{ left: `${min / scale * 100}%`, width: `${(max - min) / scale * 100}%`, background: color.hex }} />
              <span className="mushroom-range-row__floor" style={{ left: `${min / scale * 100}%`, background: color.hex }} /></>}
          </div>
          <div className="mushroom-range-row__value"><strong>{nectarRange(min, max)}</strong><span>nectar</span></div>
          <div className="mushroom-range-row__special"><strong>{row.special ? `+${row.special}` : "0"}</strong><span>Special</span></div>
        </div>;
      })}
    </div>
    <p className="mushroom-caption">Each bar runs from the lowest to highest documented yield. Special Nectar is counted separately.</p>
  </div>;
}
