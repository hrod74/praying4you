import { test, before, after, beforeEach } from 'node:test';

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { makeTestEnv, requestDoc } from './helpers.mjs';

/**
 * Rules tests for `prayerRequests/{requestId}`.
 *
 * Proves: signed-in read of ACTIVE requests; no unauthenticated read; owner-only create with safe
 * shape and no email; owner-only edit/soft-remove; non-owners blocked; no client hard delete;
 * protected fields (authorUid, createdAt, prayerCount) cannot change via an edit; a removed request
 * is not readable by non-owners (cannot be treated as active).
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

/** Seed an active request owned by `authorUid` with rules disabled. */
async function seedActive(id, authorUid, overrides = {}) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `prayerRequests/${id}`), requestDoc(authorUid, overrides));
  });
}

test('a signed-in user can read an active request', async () => {
  await seedActive('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(getDoc(doc(bob, 'prayerRequests/req1')));
});

test('an unauthenticated user cannot read a request', async () => {
  await seedActive('req1', 'alice');
  const anon = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anon, 'prayerRequests/req1')));
});

test('a signed-in user can create their own request', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(setDoc(doc(alice, 'prayerRequests/new1'), requestDoc('alice')));
});

test('a request cannot be created with an email field', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(
    setDoc(doc(alice, 'prayerRequests/new2'), requestDoc('alice', { email: 'alice@example.com' })),
  );
});

test('a user cannot create a request owned by someone else', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(setDoc(doc(bob, 'prayerRequests/new3'), requestDoc('alice')));
});

test('a request cannot be created already non-active or with a non-zero count', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(
    setDoc(doc(alice, 'prayerRequests/new4'), requestDoc('alice', { status: 'removed' })),
  );
  await assertFails(
    setDoc(doc(alice, 'prayerRequests/new5'), requestDoc('alice', { prayerCount: 5 })),
  );
});

test('the owner can edit allowed fields', async () => {
  await seedActive('req1', 'alice');
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(
    updateDoc(doc(alice, 'prayerRequests/req1'), {
      body: 'Updated body text here.',
      category: 'health',
      isAnonymous: true,
      displayName: 'Anonymous',
      updatedAt: new Date(),
    }),
  );
});

test('a non-owner cannot edit a request', async () => {
  await seedActive('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(updateDoc(doc(bob, 'prayerRequests/req1'), { body: 'malicious edit' }));
});

test('the owner can soft-remove their own request', async () => {
  await seedActive('req1', 'alice');
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(
    updateDoc(doc(alice, 'prayerRequests/req1'), { status: 'removed', removedAt: new Date() }),
  );
});

test('a non-owner cannot soft-remove a request', async () => {
  await seedActive('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(updateDoc(doc(bob, 'prayerRequests/req1'), { status: 'removed' }));
});

test('a client cannot hard-delete a request', async () => {
  await seedActive('req1', 'alice');
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(deleteDoc(doc(alice, 'prayerRequests/req1')));
});

test('the owner cannot change authorUid, createdAt, or prayerCount via an edit', async () => {
  await seedActive('req1', 'alice');
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(updateDoc(doc(alice, 'prayerRequests/req1'), { authorUid: 'mallory' }));
  await assertFails(updateDoc(doc(alice, 'prayerRequests/req1'), { createdAt: new Date(0) }));
  await assertFails(updateDoc(doc(alice, 'prayerRequests/req1'), { prayerCount: 99 }));
});

test('a removed request cannot be read by a non-owner (not treated as active)', async () => {
  await seedActive('reqRemoved', 'alice', { status: 'removed', removedAt: new Date() });
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(getDoc(doc(bob, 'prayerRequests/reqRemoved')));
  // The owner may still read their own removed request.
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(getDoc(doc(alice, 'prayerRequests/reqRemoved')));
});
