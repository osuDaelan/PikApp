const HISTORY_LIMIT = 50;

export const EMPTY_SEARCH_DRAFT = { command: "", locks: [], history: [] };

export function searchGroupAt(command, { start, end }) {
  const openings = [];
  let quoted = false;
  for (let index = 0; index < command.length; index++) {
    const character = command[index];
    if (character === '"') quoted = !quoted;
    if (quoted) continue;
    if (character === "(") openings.push(index);
    if (character === ")" && openings.length) {
      const opening = openings.pop();
      if (opening <= start && end <= index + 1) return { start: opening, end: index + 1 };
    }
  }
  return null;
}

// Use the caret to anchor changes among repeated text, such as two identical groups.
export function searchTextEdit(previous, next, caret) {
  let suffixLength = next.length - caret;
  if (!previous.endsWith(next.slice(caret))) {
    suffixLength = 0;
    while (suffixLength < Math.min(previous.length, next.length)
      && previous[previous.length - suffixLength - 1] === next[next.length - suffixLength - 1]) {
      suffixLength++;
    }
  }
  const end = previous.length - suffixLength;
  const nextEnd = next.length - suffixLength;
  let start = 0;
  while (start < Math.min(end, nextEnd) && previous[start] === next[start]) start++;
  return { start, end, text: next.slice(start, nextEnd) };
}

function recordEdit(draft, command, locks, selection) {
  const previous = { command: draft.command, locks: draft.locks, selection };
  return { command, locks, history: [...draft.history.slice(1 - HISTORY_LIMIT), previous] };
}

export function editSearchText(draft, { start, end, text }) {
  if (draft.command.slice(start, end) === text) return draft;
  if (draft.locks.some(lock => start < lock.end && end > lock.start)) return null;
  const shift = text.length - (end - start);
  const locks = draft.locks.map(lock => end <= lock.start
    ? { start: lock.start + shift, end: lock.end + shift }
    : lock);
  const command = draft.command.slice(0, start) + text + draft.command.slice(end);
  return recordEdit(draft, command, locks, { start, end });
}

export function lockSearchGroup(draft, group, selection) {
  if (draft.locks.some(lock => group.start < lock.end && group.end > lock.start)) return draft;
  const locks = [...draft.locks, group].sort((a, b) => a.start - b.start);
  return recordEdit(draft, draft.command, locks, selection);
}

export function unlockSearchGroup(draft, group, selection) {
  return recordEdit(draft, draft.command, draft.locks.filter(lock => lock !== group), selection);
}

export function undoSearchEdit(draft) {
  const previous = draft.history.at(-1);
  if (!previous) return null;
  const { command, locks, selection } = previous;
  return { draft: { command, locks, history: draft.history.slice(0, -1) }, selection };
}
