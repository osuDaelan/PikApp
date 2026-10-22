import test from "node:test";
import assert from "node:assert/strict";
import { MAX_NUMERIC_INPUT, validateWholeNumberInput } from "../src/shared/numericInput.js";

test("calculator numeric input accepts bounded whole numbers and rejects overflow before live state updates", () => {
  assert.equal(MAX_NUMERIC_INPUT, 999_999_999);
  for (const input of ["0", "50", "50,000", String(MAX_NUMERIC_INPUT), "999,999,999"]) {
    assert.equal(validateWholeNumberInput(input), "", input);
  }
  for (const input of ["", "-1", "1.5", "1e3", "Infinity", "NaN", "cats", "1000000000", "9".repeat(400)]) {
    assert.ok(validateWholeNumberInput(input), input);
  }
});
