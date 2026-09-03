import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { makeTestEnv, interactionDoc, requestDoc } from './helpers.mjs';

/**
 * Rules tests for `prayerInteractions/{uid}_{requestId}` and the tied `prayerCount` +/-1.
 *
 * Proves the AGGREGATE-ONLY model and the bug fixes from J.2f.3:
 *  - a user can GET their own deterministic interaction doc even before it exists (the transaction's
 *    duplicate-prevention read), but cannot read another user's doc and cannot list who prayed;
 *  - a valid first-time pray (interaction create + literal prayerCount +1, in one batch) succeeds and
 *    raises the count by exactly 1; duplicates and same-user repeats are blocked; another user adds a
 *    separate interaction and raises the count again;
 *  - no interaction may contain an email, be created for another user, or target a removed request;
 *  - prayerCount cannot be changed arbitrarily.
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

/** Seed an interaction doc with rules disabled (for duplicate-prevention tests). */
async function seedInteraction(uid, reqId) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(
      doc(ctx.firestore(), `prayerInteractions/${uid}_${reqId}`),
      interactionDoc(uid, reqId),
    );
  });
}

/** Read the authoritative prayerCount with rules disabled. Throws clearly if the request is missing. */
async function readCount(reqId) {
  let count = 0;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const snap = await getDoc(doc(ctx.firestore(), `prayerRequests/${reqId}`));
    if (!snap.exists()) {
      throw new Error(`readCount: prayerRequests/${reqId} does not exist (seed the request first)`);
    }
    count = snap.data().prayerCount;
  });
  return count;
}

/** Whether an interaction doc exists, read with rules disabled (for asserting create succeeded). */
async function interactionExists(uid, reqId) {
  let exists = false;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const snap = await getDoc(doc(ctx.firestore(), `prayerInteractions/${uid}_${reqId}`));
    exists = snap.exists();
  });
  return exists;
}

/** Mirror the app's pray flow: one batch that creates the interaction and writes a literal +1. */
function prayBatch(db, uid, reqId, newCount) {
  const batch = writeBatch(db);
  batch.set(doc(db, `prayerInteractions/${uid}_${reqId}`), interactionDoc(uid, reqId));
  batch.update(doc(db, `prayerRequests/${reqId}`), { prayerCount: newCount });
  return batch.commit();
}

/** Mirror the app's correction flow: delete own interaction and write a literal -1 atomically. */
function undoPrayerBatch(db, uid, reqId, newCount) {
  const batch = writeBatch(db);
  batch.delete(doc(db, `prayerInteractions/${uid}_${reqId}`));
  batch.update(doc(db, `prayerRequests/${reqId}`), { prayerCount: newCount });
  return batch.commit();
}

test('a user can get their OWN interaction doc before it exists (duplicate-check read)', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  // No interaction exists yet; this is exactly the pre-create read the pray transaction performs.
  await assertSucceeds(getDoc(doc(bob, 'prayerInteractions/bob_req1')));
});

test('a user cannot get another user interaction doc', async () => {
  await seedRequest('req1', 'alice');
  await seedInteraction('alice', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(getDoc(doc(bob, 'prayerInteractions/alice_req1')));
});

test('a user cannot list all interactions (no who-prayed enumeration)', async () => {
  await seedRequest('req1', 'alice');
  await seedInteraction('alice', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(getDocs(collection(bob, 'prayerInteractions')));
});

test('a user can query only their own interactions, not another user\'s', async () => {
  await seedRequest('req1', 'alice');
  await seedInteraction('bob', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(
    getDocs(query(collection(bob, 'prayerInteractions'), where('userUid', '==', 'bob'))),
  );
  await assertFails(
    getDocs(query(collection(bob, 'prayerInteractions'), where('userUid', '==', 'alice'))),
  );
});

test('a valid first-time prayer creates the interaction and increments count by exactly 1', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(prayBatch(bob, 'bob', 'req1', (await readCount('req1')) + 1));
  // Proves BOTH outcomes: the interaction doc was created AND the count is now exactly 1.
  assert.equal(await interactionExists('bob', 'req1'), true);
  assert.equal(await readCount('req1'), 1);
});

test('a duplicate interaction is blocked (and does not double-count)', async () => {
  await seedRequest('req1', 'alice'); // count starts at 0
  await seedInteraction('bob', 'req1'); // bob already prayed (count not incremented by the seed)
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(prayBatch(bob, 'bob', 'req1', (await readCount('req1')) + 1));
  assert.equal(await readCount('req1'), 0); // proves the blocked attempt did not double-count
});

test('the same user cannot increment the count twice for the same request', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  // First pray succeeds: interaction created, count 1.
  await assertSucceeds(prayBatch(bob, 'bob', 'req1', (await readCount('req1')) + 1));
  assert.equal(await readCount('req1'), 1);
  // Second attempt by the same user is blocked (its interaction doc already exists, so create is
  // denied and the +1 rule's !exists check fails) and the count does not move.
  await assertFails(prayBatch(bob, 'bob', 'req1', 2));
  assert.equal(await readCount('req1'), 1);
});

test('an interaction cannot contain an email', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  const batch = writeBatch(bob);
  batch.set(doc(bob, 'prayerInteractions/bob_req1'), {
    ...interactionDoc('bob', 'req1'),
    email: 'bob@example.com',
  });
  batch.update(doc(bob, 'prayerRequests/req1'), { prayerCount: 1 });
  await assertFails(batch.commit());
});

test('a user cannot create an interaction for another user', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  // userUid claims to be alice, but the doc id / auth is bob -> blocked.
  await assertFails(
    setDoc(doc(bob, 'prayerInteractions/bob_req1'), interactionDoc('alice', 'req1')),
  );
  // doc id does not match `{uid}_{requestId}` for the caller -> blocked.
  await assertFails(
    setDoc(doc(bob, 'prayerInteractions/alice_req1'), interactionDoc('alice', 'req1')),
  );
});

test('a user cannot pray for a removed request', async () => {
  await seedRequest('reqRemoved', 'alice', { status: 'removed', removedAt: new Date() });
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(prayBatch(bob, 'bob', 'reqRemoved', 1));
});

test('prayerCount cannot be changed arbitrarily (no interaction created)', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  // A bare +1 with no matching brand-new interaction is rejected.
  await assertFails(updateDoc(doc(bob, 'prayerRequests/req1'), { prayerCount: 1 }));
  // An arbitrary jump is rejected too.
  await assertFails(updateDoc(doc(bob, 'prayerRequests/req1'), { prayerCount: 50 }));
});

test('a different user can create a separate interaction and increment the count again', async () => {
  await seedRequest('req1', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  const carol = testEnv.authenticatedContext('carol').firestore();
  await assertSucceeds(prayBatch(bob, 'bob', 'req1', (await readCount('req1')) + 1));
  await assertSucceeds(prayBatch(carol, 'carol', 'req1', (await readCount('req1')) + 1));
  assert.equal(await readCount('req1'), 2);
});

test('a valid correction deletes the caller interaction and decrements count by exactly 1', async () => {
  await seedRequest('req1', 'alice', { prayerCount: 2 });
  await seedInteraction('bob', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(undoPrayerBatch(bob, 'bob', 'req1', 1));
  assert.equal(await interactionExists('bob', 'req1'), false);
  assert.equal(await readCount('req1'), 1);
});

test('prayerCount cannot be decremented without deleting the caller matching interaction', async () => {
  await seedRequest('req1', 'alice', { prayerCount: 2 });
  await seedInteraction('bob', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(updateDoc(doc(bob, 'prayerRequests/req1'), { prayerCount: 1 }));
  assert.equal(await readCount('req1'), 2);
});

test('a correction cannot decrement by more than exactly 1', async () => {
  await seedRequest('req1', 'alice', { prayerCount: 5 });
  await seedInteraction('bob', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(undoPrayerBatch(bob, 'bob', 'req1', 3));
  assert.equal(await interactionExists('bob', 'req1'), true);
  assert.equal(await readCount('req1'), 5);
});

test('a correction can never make prayerCount negative', async () => {
  await seedRequest('req1', 'alice', { prayerCount: 0 });
  await seedInteraction('bob', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(undoPrayerBatch(bob, 'bob', 'req1', -1));
  assert.equal(await interactionExists('bob', 'req1'), true);
  assert.equal(await readCount('req1'), 0);
});

test('a user cannot decrement by deleting another user interaction', async () => {
  await seedRequest('req1', 'alice', { prayerCount: 1 });
  await seedInteraction('carol', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(undoPrayerBatch(bob, 'carol', 'req1', 0));
  assert.equal(await interactionExists('carol', 'req1'), true);
  assert.equal(await readCount('req1'), 1);
});

test('an interaction is immutable: the client cannot update it', async () => {
  await seedRequest('req1', 'alice');
  await seedInteraction('bob', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(updateDoc(doc(bob, 'prayerInteractions/bob_req1'), { schemaVersion: 2 }));
});

// Account-deletion cleanup (Phase J.2h): a user may delete ONLY their own interaction docs.
test('a user can delete their OWN interaction (account-deletion cleanup)', async () => {
  await seedRequest('req1', 'alice');
  await seedInteraction('bob', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(deleteDoc(doc(bob, 'prayerInteractions/bob_req1')));
  assert.equal(await interactionExists('bob', 'req1'), false);
});

test('a user cannot delete another user\'s interaction', async () => {
  await seedRequest('req1', 'alice');
  await seedInteraction('alice', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(deleteDoc(doc(bob, 'prayerInteractions/alice_req1')));
});

test('deleting an own interaction does not change the request prayerCount (count preserved)', async () => {
  await seedRequest('req1', 'alice', { prayerCount: 5 });
  await seedInteraction('bob', 'req1');
  const bob = testEnv.authenticatedContext('bob').firestore();
  // The delete is the ONLY write; it touches the interaction doc, never the request. The aggregate
  // count is intentionally preserved (there is no "who prayed" UI, so a non-decremented count is safe).
  await assertSucceeds(deleteDoc(doc(bob, 'prayerInteractions/bob_req1')));
  assert.equal(await readCount('req1'), 5);
});

test('an unauthenticated user cannot delete an interaction', async () => {
  await seedRequest('req1', 'alice');
  await seedInteraction('bob', 'req1');
  const anon = testEnv.unauthenticatedContext().firestore();
  await assertFails(deleteDoc(doc(anon, 'prayerInteractions/bob_req1')));
});
