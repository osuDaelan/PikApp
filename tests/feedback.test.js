import test from "node:test";
import assert from "node:assert/strict";
import { normalizeFeedback, buildFeedbackIssueUrl, createFeedbackGuard, FEEDBACK_TYPES, FEEDBACK_SECTIONS,
  FEEDBACK_STORAGE_KEY, MAX_FEEDBACK_URL_LENGTH, getPrivateFeedbackEndpoint,
  buildPrivateFeedbackFields } from "../src/features/feedback/feedback.js";

const MINUTE = 60_000, HOUR = 3_600_000, DAY = 86_400_000;
const draft = (title = "A useful feedback title") => ({ type: "bug", section: "map", title,
  message: "The map control could be easier to find." });
function fixture(initial = null) {
  const values = new Map(initial === null ? [] : [[FEEDBACK_STORAGE_KEY, initial]]);
  let time = 10 * DAY;
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
  const getStorage = () => storage, now = () => time;
  return { values, storage, getStorage, now, advance: milliseconds => { time += milliseconds; },
    guard: () => createFeedbackGuard({ getStorage, now }) };
}

test("feedback fields are trimmed, bounded and restricted to known choices", () => {
  assert.deepEqual(normalizeFeedback({ ...draft(), title: "  A valid title  ", message: "  A clear description of this feedback.  " }),
    { type: "bug", section: "map", title: "A valid title", message: "A clear description of this feedback.", website: "" });
  assert.equal(FEEDBACK_TYPES.length, 3);
  assert.equal(FEEDBACK_SECTIONS.length, 5);
  assert.equal(normalizeFeedback({ ...draft(), section: "mushrooms" }).section, "mushrooms");
  for (const changes of [
    { type: "private" }, { section: "unknown" }, { title: "x".repeat(7) }, { title: "x".repeat(101) },
    { message: "x".repeat(19) }, { message: "x".repeat(1001) }, { title: null }, { message: 42 },
    { website: "https://bot.example" }, { website: null }, { currentUrl: "should not be included" },
  ]) assert.throws(() => normalizeFeedback({ ...draft(), ...changes }));
  assert.equal(normalizeFeedback({ ...draft(), title: "x".repeat(8), message: "x".repeat(20) }).title.length, 8);
  assert.equal(normalizeFeedback({ ...draft(), title: "x".repeat(100), message: "x".repeat(1000), website: " " }).message.length, 1000);
});

test("issue links keep a fixed destination and encode user text only as title/body", () => {
  const value = { ...draft("A title &labels=security#fragment"), message: "Testing &assignees=someone\nhttps://example.test/?x=1#anything" };
  const url = new URL(buildFeedbackIssueUrl(value));
  assert.equal(url.origin, "https://github.com");
  assert.equal(url.pathname, "/osuDaelan/PikApp/issues/new");
  assert.equal(url.hash, "");
  assert.deepEqual([...url.searchParams.keys()], ["title", "body"]);
  assert.equal(url.searchParams.get("title"), value.title);
  assert.equal(url.searchParams.get("body"), `Feedback type: Bug report\nApp section: Decor map\n\n${value.message}`);
  assert.equal(url.searchParams.has("labels"), false);
  assert.equal(url.searchParams.has("assignees"), false);
  assert.equal(url.searchParams.has("template"), false);
});

test("private feedback accepts only a plain HTTPS Formspree form endpoint", () => {
  assert.equal(getPrivateFeedbackEndpoint("  https://formspree.io/f/xabc1234  "), "https://formspree.io/f/xabc1234");
  for (const endpoint of [undefined, null, "", " ", "http://formspree.io/f/xabc1234", "javascript:alert(1)",
    "https://example.test/f/xabc1234", "https://formspree.io.example.test/f/xabc1234",
    "https://user@formspree.io/f/xabc1234", "https://formspree.io:443/f/xabc1234",
    "https://formspree.io:8443/f/xabc1234", "https://formspree.io/f/xabc1234?next=elsewhere",
    "https://formspree.io/f/xabc1234#fragment", "https://formspree.io/f/", "https://formspree.io/f/xabc1234/",
    "https://formspree.io/f/../other", "https://formspree.io/f/xabc1234%2fother", "https://formspree.io/f/id/other"])
    assert.equal(getPrivateFeedbackEndpoint(endpoint), "", String(endpoint));
});

test("private form payload contains only the reviewed text, category labels and empty honeypot", () => {
  const fields = buildPrivateFeedbackFields({ ...draft(), title: "  A private feedback title  " });
  assert.deepEqual(fields, { title: "A private feedback title", message: draft().message,
    type: "Bug report", section: "Decor map", _gotcha: "" });
  assert.ok(Object.values(fields).every(value => typeof value === "string"));
  assert.throws(() => buildPrivateFeedbackFields({ ...draft(), email: "not-requested@example.test" }));
  assert.throws(() => buildPrivateFeedbackFields({ ...draft(), currentUrl: "https://example.test/private" }));
  assert.throws(() => buildPrivateFeedbackFields({ ...draft(), website: "honeypot filled" }));
});

test("encoded URL limits fail before a draft opening is claimed", () => {
  const f = fixture(), guard = f.guard();
  const tooLong = { ...draft(), message: "花".repeat(1000) };
  assert.throws(() => buildFeedbackIssueUrl(tooLong), /too long/);
  assert.equal(guard.claim(tooLong).ok, false);
  assert.equal(f.values.has(FEEDBACK_STORAGE_KEY), false);
  assert.equal(guard.getStatus().allowed, true);
  assert.ok(buildFeedbackIssueUrl({ ...draft(), message: "x".repeat(1000) }).length <= MAX_FEEDBACK_URL_LENGTH);
});

test("private POST handoffs allow bounded Unicode text without GitHub URL restrictions", () => {
  const f = fixture(), guard = f.guard(), value = { ...draft(), message: "花".repeat(1000) };
  assert.throws(() => buildFeedbackIssueUrl(value), /too long/);
  assert.equal(guard.claim(value).ok, false);
  assert.equal(f.values.size, 0);
  assert.equal(buildPrivateFeedbackFields(value).message, value.message);
  assert.deepEqual(guard.claim(value, { channel: "private" }), { ok: true });
  assert.equal(guard.getStatus().retryAfterMs, MINUTE);
  f.advance(MINUTE);
  const duplicate = guard.claim(value, { channel: "private" });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.retryAfterMs, DAY - MINUTE);
  assert.match(duplicate.error, /already continued/);
  assert.doesNotMatch(duplicate.error, /GitHub|submitted|received/);
  assert.equal(f.values.get(FEEDBACK_STORAGE_KEY).includes("花"), false);
});

test("legacy GitHub fingerprints stay valid while private duplicates have a separate namespace", () => {
  // Actual fingerprint produced by the original GitHub-only helper for draft().
  const f = fixture(JSON.stringify({ version: 1, attempts: [{ at: 10 * DAY - MINUTE, hash: "892e4f743c3c672e" }], blockedUntil: 0 }));
  const guard = f.guard();
  assert.equal(guard.claim(draft()).ok, false);
  assert.equal(guard.claim(draft(), { channel: "not-a-channel" }).ok, false);
  assert.deepEqual(guard.claim(draft(), { channel: "private" }), { ok: true });
  assert.equal(guard.claim(draft("A different public draft")).retryAfterMs, MINUTE);
  assert.equal(JSON.parse(f.values.get(FEEDBACK_STORAGE_KEY)).version, 1);
});

test("opening cooldown and rolling hourly limits survive fresh guard instances", () => {
  const f = fixture();
  assert.deepEqual(f.guard().getStatus(), { allowed: true, retryAfterMs: 0, reason: "" });
  assert.deepEqual(f.guard().claim(draft("First distinct feedback")), { ok: true });
  assert.equal(f.guard().getStatus().retryAfterMs, MINUTE);
  f.advance(MINUTE - 1);
  assert.equal(f.guard().claim(draft("Second distinct feedback")).retryAfterMs, 1);
  f.advance(1);
  assert.deepEqual(f.guard().claim(draft("Second distinct feedback")), { ok: true });
  f.advance(MINUTE);
  assert.deepEqual(f.guard().claim(draft("Third distinct feedback")), { ok: true });
  f.advance(MINUTE);
  const blocked = f.guard().claim(draft("Fourth distinct feedback"));
  assert.equal(blocked.ok, false);
  assert.equal(blocked.retryAfterMs, HOUR - 3 * MINUTE);
  f.advance(HOUR - 3 * MINUTE);
  assert.deepEqual(f.guard().claim(draft("Fourth distinct feedback")), { ok: true });
});

test("duplicate normalized drafts wait 24 hours and history contains no feedback text", () => {
  const f = fixture();
  assert.equal(f.guard().claim(draft()).ok, true);
  f.advance(MINUTE);
  const duplicate = f.guard().claim({ ...draft(), title: ` ${draft().title} `, message: ` ${draft().message} ` });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.retryAfterMs, DAY - MINUTE);
  assert.match(duplicate.error, /already continued/);
  const stored = f.values.get(FEEDBACK_STORAGE_KEY);
  assert.equal(stored.includes(draft().title), false);
  assert.equal(stored.includes(draft().message), false);
  const history = JSON.parse(stored);
  assert.deepEqual(Object.keys(history).sort(), ["attempts", "blockedUntil", "version"]);
  assert.deepEqual(Object.keys(history.attempts[0]).sort(), ["at", "hash"]);
  assert.match(history.attempts[0].hash, /^[0-9a-f]{16}$/);
  assert.equal(f.values.size, 1);
  f.advance(DAY - MINUTE);
  assert.deepEqual(f.guard().claim(draft()), { ok: true });
});

test("persisted limits apply even when a new guard cannot share the old memory context", () => {
  const f = fixture();
  const fresh = () => createFeedbackGuard({ getStorage: () => f.storage, now: f.now });
  assert.equal(fresh().claim(draft()).ok, true);
  assert.equal(fresh().getStatus().retryAfterMs, MINUTE);
  f.advance(MINUTE);
  assert.equal(fresh().claim(draft()).ok, false);
  assert.equal(fresh().claim(draft("A second persistent draft")).ok, true);
});

test("blocked storage keeps limits in memory across guards sharing the storage provider", () => {
  let time = DAY;
  const getStorage = () => { throw new Error("Storage blocked"); }, now = () => time;
  const first = createFeedbackGuard({ getStorage, now });
  assert.equal(first.claim(draft()).ok, true);
  const second = createFeedbackGuard({ getStorage, now });
  assert.equal(second.getStatus().retryAfterMs, MINUTE);
  time += MINUTE;
  assert.equal(second.claim(draft()).ok, false);
  assert.equal(second.claim(draft("Another independent draft")).ok, true);
});

test("quota failures do not erase in-memory opening history on the next storage read", () => {
  const f = fixture();
  f.storage.setItem = () => { throw new Error("Quota exceeded"); };
  const guard = f.guard();
  assert.equal(guard.claim(draft()).ok, true);
  assert.equal(f.values.has(FEEDBACK_STORAGE_KEY), false);
  assert.equal(guard.getStatus().allowed, false);
  f.advance(MINUTE);
  assert.equal(f.guard().claim(draft()).ok, false);
});

test("corrupt or future history enters one bounded cooldown instead of a permanent lock", () => {
  for (const raw of ["not JSON", JSON.stringify({ version: 2, attempts: [], blockedUntil: 0 }),
    JSON.stringify({ version: 1, attempts: [{ at: 20 * DAY, hash: "0123456789abcdef" }], blockedUntil: 0 })]) {
    const f = fixture(raw);
    assert.equal(f.guard().getStatus().retryAfterMs, MINUTE);
    f.advance(MINUTE - 1);
    assert.equal(f.guard().getStatus().retryAfterMs, 1);
    f.advance(1);
    assert.deepEqual(f.guard().claim(draft()), { ok: true });
  }
});

test("a failed repair cannot restart corruption cooldown on every status check", () => {
  const f = fixture("not JSON");
  f.storage.setItem = () => { throw new Error("Quota exceeded"); };
  const guard = f.guard();
  assert.equal(guard.getStatus().retryAfterMs, MINUTE);
  f.advance(MINUTE);
  assert.equal(f.guard().getStatus().allowed, true);
  assert.equal(guard.claim(draft()).ok, true);
  assert.equal(guard.getStatus().allowed, false);
});

test("large invalid history is repaired with a bounded cooldown and unrelated saves untouched", () => {
  const f = fixture("x".repeat(5 * 1024 * 1024));
  f.values.set("pb_level", "50");
  f.values.set("firebase:authUser:synthetic", "unchanged");
  assert.equal(f.guard().getStatus().retryAfterMs, MINUTE);
  assert.ok(f.values.get(FEEDBACK_STORAGE_KEY).length < 200);
  f.advance(MINUTE);
  assert.equal(createFeedbackGuard({ getStorage: () => f.storage, now: f.now }).claim(draft()).ok, true);
  assert.equal(f.values.get("pb_level"), "50");
  assert.equal(f.values.get("firebase:authUser:synthetic"), "unchanged");
});

test("invalid drafts and honeypot responses consume no opening allowance", () => {
  const f = fixture(), guard = f.guard();
  assert.equal(guard.claim({ ...draft(), website: "spam" }).ok, false);
  assert.equal(guard.claim({ ...draft(), title: "tiny" }).ok, false);
  assert.equal(f.values.size, 0);
  assert.equal(guard.claim(draft()).ok, true);
});
