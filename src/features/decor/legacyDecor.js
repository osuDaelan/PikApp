import { decorId } from "./collection.js";

// These saved marks meant "a decor of this color", not a specific design.
// Keep them readable in browser saves and backups; never fan them out to new IDs.
const colors = ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"];
const definitions = [
  ["Hanafuda Card", "Hanafuda Card (Volume 1)", colors.slice(0, 4)],
  ["Hanafuda Card", "Hanafuda Card (Volume 2)", colors],
  ["Mahjong Tile", "Mahjong Tile", colors],
  ["Playing Card", "Playing Card", colors],
  ["Weather", "Rainy Day: Leaf Hat", ["Blue"]],
  ["Chess Piece", "Chess Piece", colors],
  ["Theme Park", "Theme Park Ticket", ["Red", "Yellow", "Blue"]],
];

export const LEGACY_GROUPED_ENTRIES = definitions.flatMap(([location, costume, species]) =>
  species.map(color => ({ id: decorId(location, costume, color), location, costume, color })));

export function pendingLegacyDecor(collected, section) {
  return LEGACY_GROUPED_ENTRIES.filter(entry => collected[entry.id] === true &&
    (!section || (section === "regular" ? ["Weather", "Theme Park"].includes(entry.location) : !["Weather", "Theme Park"].includes(entry.location))));
}
