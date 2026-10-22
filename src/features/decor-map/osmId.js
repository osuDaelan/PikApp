// Keep saved-pin validation independent of the map geometry converter.
export function validOsmId(id) {
  return typeof id === "string" && /^(node|way|relation)\/[1-9]\d{0,15}$/.test(id);
}
