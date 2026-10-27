import { decorId } from "./collection.js";

// These saved marks meant "a card of this color", not a specific design.
// Keep them readable in browser saves and backups; never fan them out to new IDs.
const colors = ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"];
const definitions = [
  ["Hanafuda Card", "Hanafuda Card (Volume 1)", colors.slice(0, 4)],
  ["Hanafuda Card", "Hanafuda Card (Volume 2)", colors],
  ["Mahjong Tile", "Mahjong Tile", colors],
  ["Playing Card", "Playing Card", colors],
];

export const LEGACY_CARD_ENTRIES = definitions.flatMap(([location, costume, species]) =>
  species.map(color => ({ id: decorId(location, costume, color), location, costume, color })));

export function pendingLegacyCards(collected) {
  return LEGACY_CARD_ENTRIES.filter(entry => collected[entry.id] === true);
}
