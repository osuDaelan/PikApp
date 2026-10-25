export const FEEDBACK_TYPES = Object.freeze([
  { id: "bug", label: "Bug report" },
  { id: "suggestion", label: "Suggestion" },
  { id: "question", label: "Question" },
].map(Object.freeze));

export const FEEDBACK_SECTIONS = Object.freeze([
  { id: "general", label: "General" },
  { id: "decor", label: "Decor checklist" },
  { id: "map", label: "Decor map" },
  { id: "mushrooms", label: "Mushroom rewards" },
  { id: "now", label: "Calculator" },
].map(Object.freeze));

export const FEEDBACK_STORAGE_KEY = "pb_feedback_v1";
export const MAX_FEEDBACK_URL_LENGTH = 7500;
const ISSUE_URL = "https://github.com/osuDaelan/PikApp/issues/new";
const MIN_INTERVAL_MS = 60_000, HOUR_MS = 3_600_000, DAY_MS = 86_400_000;
const MAX_HOURLY = 3, MAX_HISTORY = 96;
const memoryHistories = new WeakMap();
const defaultStorage = () => window.localStorage;

export function normalizeFeedback(value) {
  const fields = ["type", "section", "title", "message", "website"];
  if (!value || typeof value !== "object" || Array.isArray(value)
      || Object.keys(value).some(key => !fields.includes(key))) throw new Error("Check the feedback form and try again.");
  if (!FEEDBACK_TYPES.some(type => type.id === value.type)) throw new Error("Choose a feedback type.");
  if (!FEEDBACK_SECTIONS.some(section => section.id === value.section)) throw new Error("Choose an app section.");
  if (value.website !== undefined && (typeof value.website !== "string" || value.website.trim())) {
    throw new Error("This feedback form could not be accepted. Please try again.");
  }
  if (typeof value.title !== "string" || typeof value.message !== "string") throw new Error("Enter a title and message.");
  const title = value.title.trim(), message = value.message.trim();
  if (title.length < 8 || title.length > 100) throw new Error("Use a title between 8 and 100 characters.");
  if (message.length < 20 || message.length > 1000) throw new Error("Use a message between 20 and 1,000 characters.");
  return { type: value.type, section: value.section, title, message, website: "" };
}

export function buildFeedbackIssueUrl(value) {
  const draft = normalizeFeedback(value);
  const type = FEEDBACK_TYPES.find(item => item.id === draft.type).label;
  const section = FEEDBACK_SECTIONS.find(item => item.id === draft.section).label;
  const url = new URL(ISSUE_URL);
  url.searchParams.set("title", draft.title);
  url.searchParams.set("body", `Feedback type: ${type}\nApp section: ${section}\n\n${draft.message}`);
  if (url.href.length > MAX_FEEDBACK_URL_LENGTH) {
    throw new Error("This feedback is too long to open on GitHub. Shorten the message and try again.");
  }
  return url.href;
}

export function getPrivateFeedbackEndpoint(raw) {
  if (typeof raw !== "string") return "";
  const endpoint = raw.trim();
  return /^https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]{1,100}$/.test(endpoint) ? endpoint : "";
}

export function buildPrivateFeedbackFields(value) {
  const draft = normalizeFeedback(value);
  return { title: draft.title, message: draft.message,
    type: FEEDBACK_TYPES.find(item => item.id === draft.type).label,
    section: FEEDBACK_SECTIONS.find(item => item.id === draft.section).label, _gotcha: "" };
}

// A noncryptographic fingerprint supports best-effort duplicate checks. It is not
// authentication, proof of submission, or protection against someone editing storage.
function fingerprint(value) {
  let hash = 0xcbf29ce484222325n;
  for (const byte of new TextEncoder().encode(value)) hash = ((hash ^ BigInt(byte)) * 0x100000001b3n) & 0xffffffffffffffffn;
  return hash.toString(16).padStart(16, "0");
}

const emptyHistory = () => ({ version: 1, attempts: [], blockedUntil: 0 });

function readHistory(value, time) {
  if (!value || typeof value !== "object" || Array.isArray(value)
      || Object.keys(value).length !== 3 || value.version !== 1
      || !Array.isArray(value.attempts) || value.attempts.length > MAX_HISTORY
      || !Number.isSafeInteger(value.blockedUntil) || value.blockedUntil < 0 || value.blockedUntil > time + MIN_INTERVAL_MS
      || value.attempts.some(attempt => !attempt || typeof attempt !== "object" || Array.isArray(attempt)
        || Object.keys(attempt).length !== 2 || !Number.isSafeInteger(attempt.at) || attempt.at < 0 || attempt.at > time
        || typeof attempt.hash !== "string" || !/^[0-9a-f]{16}$/.test(attempt.hash))) throw new Error("Invalid feedback history");
  return { version: 1, blockedUntil: value.blockedUntil > time ? value.blockedUntil : 0,
    attempts: value.attempts.filter(attempt => attempt.at > time - DAY_MS).map(({ at, hash }) => ({ at, hash })) };
}

function mergeHistory(first, second) {
  const attempts = new Map([...first.attempts, ...second.attempts].map(attempt => [`${attempt.at}:${attempt.hash}`, attempt]));
  return { version: 1, blockedUntil: Math.max(first.blockedUntil, second.blockedUntil),
    attempts: [...attempts.values()].sort((a, b) => a.at - b.at).slice(-MAX_HISTORY) };
}

function generalStatus(history, time) {
  let until = history.blockedUntil;
  let reason = until > time ? "Feedback is temporarily paused while its local history is reset. Try again shortly." : "";
  const last = history.attempts.at(-1);
  if (last && last.at + MIN_INTERVAL_MS > until && last.at + MIN_INTERVAL_MS > time) {
    until = last.at + MIN_INTERVAL_MS;
    reason = "Please wait a minute before continuing with more feedback.";
  }
  const recent = history.attempts.filter(attempt => attempt.at > time - HOUR_MS);
  if (recent.length >= MAX_HOURLY) {
    const hourlyUntil = recent[recent.length - MAX_HOURLY].at + HOUR_MS;
    if (hourlyUntil > until) {
      until = hourlyUntil;
      reason = "You have continued with feedback three times this hour. Please try again later.";
    }
  }
  return { allowed: until <= time, retryAfterMs: Math.max(0, until - time), reason };
}

/** Local, bypassable limits apply to provider handoffs, not confirmed delivery. */
export function createFeedbackGuard({ getStorage = defaultStorage, now = Date.now } = {}) {
  let memory = memoryHistories.get(getStorage);
  if (!memory) {
    memory = { history: emptyHistory(), lastCorruption: null };
    memoryHistories.set(getStorage, memory);
  }

  function currentTime() {
    const time = now();
    if (!Number.isSafeInteger(time) || time < 0) throw new Error("Check your device clock before continuing with feedback.");
    return time;
  }

  function persist() {
    try { getStorage().setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(memory.history)); }
    catch { /* The same page session retains its metadata when browser storage is blocked. */ }
  }

  function quarantine(time, signature) {
    if (memory.lastCorruption !== signature) {
      memory.history = { version: 1, attempts: [], blockedUntil: time + MIN_INTERVAL_MS };
      memory.lastCorruption = signature;
      persist();
    }
  }

  function load(time) {
    try { memory.history = readHistory(memory.history, time); }
    catch { quarantine(time, "clock-moved-backwards"); }
    let raw;
    try { raw = getStorage().getItem(FEEDBACK_STORAGE_KEY); }
    catch { return memory.history; }
    if (raw === null) return memory.history;
    try {
      if (typeof raw !== "string" || raw.length > 32_768) throw new Error();
      const stored = readHistory(JSON.parse(raw), time);
      memory.history = mergeHistory(memory.history, stored);
      memory.lastCorruption = null;
    } catch { quarantine(time, fingerprint(`${String(raw).slice(0, 32_768)}:${String(raw).length}`)); }
    return memory.history;
  }

  function getStatus() {
    try {
      const time = currentTime();
      return generalStatus(load(time), time);
    } catch {
      return { allowed: false, retryAfterMs: MIN_INTERVAL_MS, reason: "Check your device clock before continuing with feedback." };
    }
  }

  return {
    getStatus,
    claim(value, { channel = "github" } = {}) {
      let draft, time;
      try {
        if (!["github", "private"].includes(channel)) throw new Error("Choose an available feedback destination.");
        draft = normalizeFeedback(value);
        if (channel === "github") buildFeedbackIssueUrl(draft);
        else buildPrivateFeedbackFields(draft);
        time = currentTime();
      } catch (error) { return { ok: false, error: error.message, retryAfterMs: 0 }; }
      const history = load(time);
      const status = generalStatus(history, time);
      if (!status.allowed) return { ok: false, error: status.reason, retryAfterMs: status.retryAfterMs };
      // Preserve existing public-draft fingerprints; private handoffs have their own namespace.
      const identity = [draft.type, draft.section, draft.title, draft.message];
      const hash = fingerprint(JSON.stringify(channel === "github" ? identity : ["private", ...identity]));
      const duplicate = history.attempts.filter(attempt => attempt.hash === hash).at(-1);
      if (duplicate) return { ok: false,
        error: "You already continued with this feedback in this browser. Check the destination before trying again.",
        retryAfterMs: duplicate.at + DAY_MS - time };
      memory.history = { ...history, attempts: [...history.attempts, { at: time, hash }] };
      persist();
      return { ok: true };
    },
  };
}
