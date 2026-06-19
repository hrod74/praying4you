import { test, before, after, beforeEach } from 'node:test';

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

import { makeTestEnv, reportDoc, requestDoc } from './helpers.mjs';

/**
 * Rules tests for `reports/{uid}_{requestId}` (Phase J.2g).
 *
 * Proves the private moderation model: a reporter may create their own report on someone else's
 * ACTIVE request, exactly once, and may read only their own report; no one may report their own or a
 * removed request, file for another reporter, store an email, use a disallowed reason, create a
 * non-open status, change a status, delete, or list reports.
 */

let testEnv;

before(async () => {
  testEnv = await makeTestEnv();
});

after(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

/** Seed a request (active by default) with rules disabled. */
async function seedRequest(id, authorUid, overrides = {}) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `prayerRequests/${id}`), requestDoc(authorUid, overrides));
  });
}

/** Seed a report doc with rules disabled (for update/delete/duplicate tests). */
async function seedReport(reporterUid, requestId, requestAuthorUid) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(
      doc(ctx.firestore(), `reports/${reporterUid}_${requestId}`),
      reportDoc(reporterUid, requestId, requestAuthorUid),
    );
  });
}

test('a signed-in user can report another user\'s active request', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(
    setDoc(doc(bob, 'reports/bob_req1'), reportDoc('bob', 'req1', 'alice')),
  );
});

test('an unauthenticated user cannot report', async () => {
  await seedRequest('req1', 'alice');
  const anon = testEnv.unauthenticatedContext().firestore();
  await assertFails(setDoc(doc(anon, 'reports/anon_req1'), reportDoc('anon', 'req1', 'alice')));
});

test('a user cannot report their own request', async () => {
  await seedRequest('req1', 'alice');
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(setDoc(doc(alice, 'reports/alice_req1'), reportDoc('alice', 'req1', 'alice')));
});

test('a user cannot report a removed request', async () => {
  await seedRequest('reqRemoved', 'alice', { status: 'removed', removedAt: new Date() });
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(
    setDoc(doc(bob, 'reports/bob_reqRemoved'), reportDoc('bob', 'reqRemoved', 'alice')),
  );
});

test('a user cannot report the same request twice', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(setDoc(doc(bob, 'reports/bob_req1'), reportDoc('bob', 'req1', 'alice')));
  // A second write targets the same deterministic id -> it is an update -> denied.
  await assertFails(setDoc(doc(bob, 'reports/bob_req1'), reportDoc('bob', 'req1', 'alice')));
});

test('a user cannot create a report for another reporterUid', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  // reporterUid claims to be carol (but auth + id are bob) -> blocked.
  await assertFails(
    setDoc(doc(bob, 'reports/bob_req1'), reportDoc('bob', 'req1', 'alice', { reporterUid: 'carol' })),
  );
  // doc id does not match `{uid}_{requestId}` for the caller -> blocked.
  await assertFails(
    setDoc(doc(bob, 'reports/carol_req1'), reportDoc('carol', 'req1', 'alice')),
  );
});

test('a report cannot contain an email', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(
    setDoc(
      doc(bob, 'reports/bob_req1'),
      reportDoc('bob', 'req1', 'alice', { email: 'bob@example.com' }),
    ),
  );
});

test('a report reason must be an allowed value', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(
    setDoc(doc(bob, 'reports/bob_req1'), reportDoc('bob', 'req1', 'alice', { reason: 'banana' })),
  );
});

test('a report status must be open on create', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(
    setDoc(doc(bob, 'reports/bob_req1'), reportDoc('bob', 'req1', 'alice', { status: 'closed' })),
  );
});

test('a report requestAuthorUid must match the real request author', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  // Claiming the wrong author is rejected (the rule pins it to the real request author).
  await assertFails(
    setDoc(doc(bob, 'reports/bob_req1'), reportDoc('bob', 'req1', 'mallory')),
  );
});

test('the client cannot update a report status', async () => {
  await seedReport('bob', 'req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(updateDoc(doc(bob, 'reports/bob_req1'), { status: 'closed' }));
});

test('the client cannot delete a report', async () => {
  await seedReport('bob', 'req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(deleteDoc(doc(bob, 'reports/bob_req1')));
});

test('the client cannot list reports', async () => {
  await seedReport('bob', 'req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(getDocs(collection(bob, 'reports')));
});

test('a user can get their OWN report doc but not another user\'s', async () => {
  await seedRequest('req1', 'alice');
  await seedReport('alice', 'req1', 'bob'); // alice's report on bob's request (seeded)
  const bob = testEnv.authenticatedContext('bob').firestore();
  // Own report doc: readable even before it exists (the duplicate pre-check the app performs).
  await assertSucceeds(getDoc(doc(bob, 'reports/bob_req1')));
  // Another user's report doc: never readable.
  await assertFails(getDoc(doc(bob, 'reports/alice_req1')));
});
