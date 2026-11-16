import assert from "node:assert/strict";
import test from "node:test";
import { friendshipCommand, textCommand } from "../src/features/search-builder/gameSearch.js";
import { EMPTY_SEARCH_DRAFT, editSearchText, lockSearchGroup, searchGroupAt, searchTextEdit, undoSearchEdit, unlockSearchGroup } from "../src/features/search-builder/commandEditor.js";

test("text tile preserves operators within a quoted phrase", () => {
  assert.equal(textCommand(" Library & Bookstore "), '"Library & Bookstore"');
  assert.equal(textCommand('bad"phrase'), "");
  assert.equal(textCommand(""), "");
});

test("friendship tile formats exact, open, and bounded searches", () => {
  assert.equal(friendshipCommand({ min: "4", max: "8" }), "4-8");
  assert.equal(friendshipCommand({ min: "0", max: "0" }), "0");
  assert.equal(friendshipCommand({ min: "4", max: "" }), "4-");
  assert.equal(friendshipCommand({ min: "", max: "3" }), "-3");
  for (const [min, max] of [["4", "2"], ["9", ""], ["", ""]]) {
    assert.equal(friendshipCommand({ min, max }), "");
  }
});

test("the cursor locks the innermost group, ignoring parentheses inside quotes", () => {
  const command = '((red|yellow)&"Near (Boston)")';
  assert.deepEqual(searchGroupAt(command, { start: 6, end: 6 }), { start: 1, end: 13 });
  assert.deepEqual(searchGroupAt(command, { start: 0, end: command.length }), { start: 0, end: command.length });
  assert.equal(searchGroupAt('"(Boston)"', { start: 3, end: 3 }), null);
  assert.equal(searchGroupAt("(red|yellow", { start: 6, end: 6 }), null);
});

test("locked groups block typing, replacement and deletion but track edits from either side", () => {
  const original = { ...EMPTY_SEARCH_DRAFT, command: "(red)&(blue)" };
  const lockedRed = lockSearchGroup(original, { start: 0, end: 5 }, { start: 2, end: 2 });
  const locked = lockSearchGroup(lockedRed, { start: 6, end: 12 }, { start: 8, end: 8 });
  assert.equal(editSearchText(locked, { start: 2, end: 2, text: "x" }), null);
  assert.equal(editSearchText(locked, { start: 3, end: 7, text: "yellow" }), null);
  assert.equal(editSearchText(locked, searchTextEdit(locked.command, "red)&(blue)", 0)), null);
  const prefixed = editSearchText(locked, { start: 0, end: 0, text: "!" });
  const changed = editSearchText(prefixed, { start: 6, end: 7, text: "|!" });
  const amended = editSearchText(changed, { start: 14, end: 14, text: "&bud" });
  assert.equal(amended.command, "!(red)|!(blue)&bud");
  assert.deepEqual(amended.locks.map(lock => amended.command.slice(lock.start, lock.end)), ["(red)", "(blue)"]);
  assert.deepEqual(undoSearchEdit(amended).draft, changed);
  assert.deepEqual(undoSearchEdit(changed).draft, prefixed);
  assert.deepEqual(undoSearchEdit(prefixed).draft, locked);
});

test("deleting identical groups respects the caret and undo can restore a lock", () => {
  const command = "(red)(red)";
  const lock = { start: 5, end: 10 };
  const selection = { start: 7, end: 7 };
  const locked = lockSearchGroup({ ...EMPTY_SEARCH_DRAFT, command }, lock, selection);
  assert.equal(editSearchText(locked, searchTextEdit(command, "(red)", 5)), null);
  const firstRemoved = editSearchText(locked, searchTextEdit(command, "(red)", 0));
  assert.deepEqual(firstRemoved.locks, [{ start: 0, end: 5 }]);
  assert.deepEqual(undoSearchEdit(firstRemoved).draft, locked);
  const unlocked = unlockSearchGroup(locked, lock, selection);
  assert.deepEqual(unlocked.locks, []);
  assert.deepEqual(undoSearchEdit(unlocked), { draft: locked, selection });
});
