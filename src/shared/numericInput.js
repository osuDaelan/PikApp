export const MAX_NUMERIC_INPUT = 999_999_999;

// Both calculator input styles must reject overflow before changing live state.
export function validateWholeNumberInput(raw) {
  const digits = raw.replace(/,/g, "");
  if (digits === "") return "Please enter a number.";
  if (!/^\d+$/.test(digits)) return "Numbers only — no letters, symbols, or negatives.";
  const value = Number(digits);
  if (!Number.isSafeInteger(value) || value > MAX_NUMERIC_INPUT) return "That's a very large number!";
  return "";
}
