import test from "node:test";
import assert from "node:assert/strict";
import { createAuthSession } from "../src/features/auth/authSession.js";

const person = { uid: "person-1", displayName: "Player", email: "player@example.test" };
const settle = async () => { for (let turn = 0; turn < 6; turn++) await Promise.resolve(); };
function deferred() {
  let resolve, reject;
  const promise = new Promise((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
}
function clientFixture() {
  const observers = [];
  const calls = { signIn: 0, signOut: 0, cleanup: 0 };
  const client = {
    watch(user, error) { observers.push({ user, error }); return () => { calls.cleanup++; }; },
    async signIn() { calls.signIn++; },
    async signOut() { calls.signOut++; observers.at(-1).user(null); },
  };
  return { client, observers, calls };
}
async function ready(user = null) {
  const fixture = clientFixture();
  const session = createAuthSession({ configured: true, loadClient: async () => fixture.client });
  const stop = session.start();
  await settle();
  fixture.observers[0].user(user);
  return { ...fixture, session, stop };
}

test("unconfigured sign-in never loads a client or changes guest progress", async () => {
  let loads = 0;
  const session = createAuthSession({ configured: false, loadClient: async () => { loads++; } });
  const stop = session.start();
  await session.signIn(); await session.signOut(); session.retry(); await settle();
  assert.equal(loads, 0);
  assert.deepEqual(session.getSnapshot(), { status: "unconfigured", user: null, pending: null, error: "" });
  stop();
});

test("restored sessions expose only display identity and preserve snapshot identity", async () => {
  const { session, observers, stop } = await ready({ ...person, accessToken: "do-not-expose", photoURL: "https://example.test/photo" });
  assert.deepEqual(session.getSnapshot().user, person);
  assert.equal(session.getSnapshot().status, "signed-in");
  const restored = session.getSnapshot();
  observers[0].user({ ...person, accessToken: "another-token" });
  assert.strictEqual(session.getSnapshot(), restored);
  let updates = 0;
  const unsubscribe = session.subscribe(() => { updates++; });
  observers[0].user(null);
  assert.equal(updates, 1);
  assert.equal(session.getSnapshot().status, "guest");
  unsubscribe(); observers[0].user(person);
  assert.equal(updates, 1);
  stop();
});

test("actions wait for the observer to finish checking the session", async () => {
  const fixture = clientFixture(), loaded = deferred();
  const session = createAuthSession({ configured: true, loadClient: () => loaded.promise });
  const stop = session.start();
  await session.signIn(); await session.signOut();
  loaded.resolve(fixture.client); await settle();
  await session.signIn();
  assert.equal(session.getSnapshot().status, "loading");
  assert.equal(fixture.calls.signIn, 0);
  assert.equal(fixture.calls.signOut, 0);
  fixture.observers[0].user(null);
  await session.signIn();
  assert.equal(fixture.calls.signIn, 1);
  stop();
});

test("a failed session check clears stale identity and waits for a verified retry", async () => {
  const { session, observers, calls, stop } = await ready(person);
  observers[0].error({ code: "auth/user-token-expired" });
  assert.equal(session.getSnapshot().status, "error");
  assert.equal(session.getSnapshot().user, null);
  assert.match(session.getSnapshot().error, /expired/);
  await session.signIn(); await session.signOut();
  assert.equal(calls.signIn, 0);
  assert.equal(calls.signOut, 0);
  session.retry();
  assert.equal(session.getSnapshot().status, "loading");
  assert.equal(session.getSnapshot().user, null);
  await settle();
  observers[0].user(person); // Old listeners cannot restore the rejected account.
  assert.equal(session.getSnapshot().user, null);
  observers[1].user({ ...person, uid: "verified-account" });
  assert.equal(session.getSnapshot().user.uid, "verified-account");
  assert.equal(session.getSnapshot().status, "signed-in");
  stop();
});

test("invalid observer identities cannot leave a previous account displayed", async () => {
  const { session, observers, stop } = await ready(person);
  observers[0].user({ displayName: "Unverified", accessToken: "private-token" });
  assert.equal(session.getSnapshot().status, "error");
  assert.equal(session.getSnapshot().user, null);
  assert.doesNotMatch(session.getSnapshot().error, /Unverified|private-token/);
  stop();
});

test("sign-in is observer-authoritative and duplicate actions are ignored", async () => {
  const { session, client, observers, stop } = await ready();
  const pending = deferred();
  let calls = 0;
  client.signIn = () => { calls++; return pending.promise; };
  const first = session.signIn();
  assert.equal(session.getSnapshot().pending, "sign-in");
  await session.signIn();
  assert.equal(calls, 1);
  assert.equal(session.getSnapshot().user, null);
  observers[0].user(person);
  assert.equal(session.getSnapshot().status, "signed-in");
  assert.equal(session.getSnapshot().pending, "sign-in");
  pending.resolve(); await first;
  assert.equal(session.getSnapshot().pending, null);
  stop();
});

test("successful sign-out clears identity through the observer", async () => {
  const { session, calls, stop } = await ready(person);
  await session.signOut();
  assert.equal(calls.signOut, 1);
  assert.equal(session.getSnapshot().user, null);
  assert.equal(session.getSnapshot().status, "guest");
  assert.equal(session.getSnapshot().pending, null);
  stop();
});

test("closing Google silently stays in guest mode; blocked pop-ups show safe guidance", async () => {
  const { session, client, stop } = await ready();
  for (const code of ["auth/popup-closed-by-user", "auth/cancelled-popup-request"]) {
    client.signIn = async () => { throw { code, message: "private credential detail" }; };
    await session.signIn();
    assert.equal(session.getSnapshot().status, "guest");
    assert.equal(session.getSnapshot().error, "");
    assert.equal(session.getSnapshot().pending, null);
  }
  client.signIn = async () => { throw { code: "auth/popup-blocked", message: "private credential detail" }; };
  await session.signIn();
  assert.match(session.getSnapshot().error, /blocked.*window/);
  assert.doesNotMatch(session.getSnapshot().error, /private credential detail/);
  stop();
});

test("failed sign-out preserves the current account and remains retryable", async () => {
  const { session, client, observers, stop } = await ready(person);
  client.signOut = async () => { throw new Error("private service response"); };
  await session.signOut();
  assert.deepEqual(session.getSnapshot().user, person);
  assert.equal(session.getSnapshot().status, "signed-in");
  assert.equal(session.getSnapshot().pending, null);
  assert.equal(session.getSnapshot().error, "Couldn't sign out. Please try again.");
  client.signOut = async () => { observers[0].user(null); };
  await session.signOut();
  assert.equal(session.getSnapshot().user, null);
  assert.equal(session.getSnapshot().error, "");
  stop();
});

test("provider, domain, storage and credential errors never expose service response details", async () => {
  const { session, client, stop } = await ready();
  for (const [code, expected] of [
    ["auth/unauthorized-domain", /isn't available/],
    ["auth/operation-not-allowed", /guest mode/],
    ["auth/web-storage-unsupported", /site storage/],
    ["auth/account-exists-with-different-credential", /different sign-in method/],
    ["auth/user-disabled", /can't sign in/],
    ["auth/user-token-expired", /expired/],
    ["auth/too-many-requests", /Wait a moment/],
    ["unknown-private-code", /Couldn't complete/],
  ]) {
    client.signIn = async () => { throw { code, message: "private response with a token" }; };
    await session.signIn();
    assert.match(session.getSnapshot().error, expected);
    assert.doesNotMatch(session.getSnapshot().error, /private|token/);
    assert.equal(session.getSnapshot().pending, null);
  }
  stop();
});

test("StrictMode cleanup rejects stale initialization without installing an observer", async () => {
  const firstLoad = deferred(), first = clientFixture(), second = clientFixture();
  let loads = 0;
  const session = createAuthSession({ configured: true, loadClient: () => ++loads === 1 ? firstLoad.promise : second.client });
  const firstStop = session.start(); await settle(); firstStop();
  const secondStop = session.start(); await settle();
  firstLoad.resolve(first.client); await settle();
  assert.equal(first.observers.length, 0);
  assert.equal(second.observers.length, 1);
  second.observers[0].user(person);
  firstStop();
  assert.equal(session.getSnapshot().status, "signed-in");
  secondStop();
  assert.equal(second.calls.cleanup, 1);
});

test("cleanup ignores late observer/action updates and cannot clear a new action", async () => {
  const first = clientFixture(), second = clientFixture(), oldAction = deferred(), newAction = deferred();
  first.client.signIn = () => oldAction.promise;
  second.client.signIn = () => newAction.promise;
  let loads = 0;
  const session = createAuthSession({ configured: true, loadClient: async () => ++loads === 1 ? first.client : second.client });
  const firstStop = session.start(); await settle(); first.observers[0].user(null);
  const oldAttempt = session.signIn(); firstStop();
  const secondStop = session.start(); await settle(); second.observers[0].user(null);
  const newAttempt = session.signIn();
  first.observers[0].user(person);
  first.observers[0].error({ code: "auth/network-request-failed" });
  oldAction.reject(new Error("stale private failure")); await oldAttempt;
  assert.equal(session.getSnapshot().user, null);
  assert.equal(session.getSnapshot().pending, "sign-in");
  assert.equal(session.getSnapshot().error, "");
  second.observers[0].user({ ...person, uid: "current-person" });
  newAction.resolve(); await newAttempt;
  assert.equal(session.getSnapshot().user.uid, "current-person");
  assert.equal(session.getSnapshot().pending, null);
  secondStop();
});

test("failed initialization and observer errors retry with fresh listeners", async () => {
  const fixture = clientFixture();
  let loads = 0;
  const session = createAuthSession({ configured: true, loadClient: async () => {
    if (++loads === 1) throw { code: "auth/network-request-failed", message: "private details" };
    return fixture.client;
  } });
  const stop = session.start(); await settle();
  assert.equal(session.getSnapshot().status, "error");
  assert.match(session.getSnapshot().error, /connection/);
  session.retry(); await settle(); fixture.observers[0].user(null);
  assert.equal(session.getSnapshot().status, "guest");
  fixture.observers[0].error({ code: "auth/web-storage-unsupported" });
  assert.equal(session.getSnapshot().status, "error");
  assert.match(session.getSnapshot().error, /storage/);
  session.retry(); await settle(); fixture.observers[1].user(person);
  fixture.observers[0].user(null);
  assert.deepEqual(session.getSnapshot().user, person);
  assert.equal(fixture.calls.cleanup, 1);
  stop(); assert.equal(fixture.calls.cleanup, 2);
});
