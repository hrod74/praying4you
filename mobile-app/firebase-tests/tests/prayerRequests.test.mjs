import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';

import { makeTestEnv, profileDoc, requestDoc } from './helpers.mjs';

/**
 * Rules tests for `prayerRequests/{requestId}`.
 *
 * Proves: signed-in read of ACTIVE requests; no unauthenticated read; owner-only create with safe
 * shape and no email; owner-only edit/soft-remove; non-owners blocked; no client hard delete;
 * protected fields (authorUid, createdAt, prayerCount) cannot change via an edit; a removed request
 * is not readable by non-owners (cannot be treated as active); a named request's displayName must
 * match the owner's current private profile name, an Anonymous request's must be the literal
 * "Anonymous", and the atomic profile-plus-requests rename batch is validated correctly via
 * getAfter() against the profile state after that same batch, at both small and large batch sizes
 * (see "Large-batch rename validation" below for why the large sizes matter).
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
  // Most tests in this file act as "alice" creating or editing her own named request. A named
  // request's displayName must now match the owner's current private profile name (see the
  // isLegitimatePublicName rule invariant), so seed a matching profile once here rather than in
  // every individual test. requestDoc()'s own default displayName ("Test User") already matches
  // profileDoc()'s default, so this is a no-op for tests that do not touch either default.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/alice'), profileDoc('alice'));
  });
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

test('a named request using the current private profile display name can be created', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(
    setDoc(doc(alice, 'prayerRequests/new6'), requestDoc('alice', { displayName: 'Test User' })),
  );
});

test('a named request using a different arbitrary name is denied', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(
    setDoc(doc(alice, 'prayerRequests/new7'), requestDoc('alice', { displayName: 'Not My Real Name' })),
  );
});

test('an Anonymous request with displayName "Anonymous" can be created', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(
    setDoc(
      doc(alice, 'prayerRequests/new8'),
      requestDoc('alice', { isAnonymous: true, displayName: 'Anonymous' }),
    ),
  );
});

test('an Anonymous request containing the real profile name is denied', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(
    setDoc(
      doc(alice, 'prayerRequests/new9'),
      requestDoc('alice', { isAnonymous: true, displayName: 'Test User' }),
    ),
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

test('a normal owner edit cannot substitute an arbitrary display name', async () => {
  await seedActive('req1', 'alice');
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(
    updateDoc(doc(alice, 'prayerRequests/req1'), { displayName: 'Someone Else Entirely' }),
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

test('the atomic profile rename plus active named-request propagation is allowed', async () => {
  await seedActive('req1', 'alice');
  await seedActive('req2', 'alice');
  const alice = testEnv.authenticatedContext('alice').firestore();
  const batch = writeBatch(alice);
  batch.update(doc(alice, 'users/alice'), { displayName: 'Alice Renamed', updatedAt: new Date() });
  batch.update(doc(alice, 'prayerRequests/req1'), { displayName: 'Alice Renamed', updatedAt: new Date() });
  batch.update(doc(alice, 'prayerRequests/req2'), { displayName: 'Alice Renamed', updatedAt: new Date() });
  await assertSucceeds(batch.commit());
});

test('a rename attempt against another users request is denied', async () => {
  await seedActive('req1', 'alice');
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/bob'), profileDoc('bob', 'Bob Original'));
  });
  const bob = testEnv.authenticatedContext('bob').firestore();
  const batch = writeBatch(bob);
  batch.update(doc(bob, 'users/bob'), { displayName: 'Bob Renamed', updatedAt: new Date() });
  batch.update(doc(bob, 'prayerRequests/req1'), { displayName: 'Bob Renamed', updatedAt: new Date() });
  await assertFails(batch.commit());
  // Alice's request must be completely untouched: the batch is atomic, so bob's own (otherwise
  // legal) profile write must also have been rejected along with the illegal request write.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const snap = await getDoc(doc(ctx.firestore(), 'prayerRequests/req1'));
    if (snap.data().displayName !== 'Test User') {
      throw new Error('alice request was renamed by a denied batch');
    }
  });
});

test('an owner soft-remove is not blocked by a pre-existing mismatched display name', async () => {
  // Simulates legacy data from before this invariant existed: a request whose cached displayName
  // no longer matches the current profile. A status-only soft-remove does not touch displayName
  // or isAnonymous, so it must still succeed regardless of this mismatch.
  await seedActive('reqDrifted', 'alice', { displayName: 'An Old Cached Name' });
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(
    updateDoc(doc(alice, 'prayerRequests/reqDrifted'), { status: 'removed', removedAt: new Date() }),
  );
});

// ---------------------------------------------------------------------------
// Large-batch rename validation.
//
// The isLegitimatePublicName rule calls existsAfter() and getAfter() against the SAME
// users/{uid} document once per matching prayerRequest write in the rename batch. Firestore's
// documented limits for a transaction or batched write are 10 document-access calls per
// individual operation and 20 across the complete atomic operation, with repeated calls to the
// same path SOMETIMES cached, never guaranteed. The smaller "atomic profile rename plus active
// named-request propagation is allowed" test above only exercises 2 request writes (well under
// any plausible cache-related limit), which is not strong evidence for the production ceiling of
// 499 matching requests. These tests seed real batches at increasing size, through 499, and
// prove: the batch is accepted by the emulator, the rename is durably committed for the first and
// last request in the batch (not just a subset), and an unrelated/Anonymous request is left alone.
// ---------------------------------------------------------------------------

/** Seed `count` active, named requests owned by `authorUid`, chunked under the 500-write cap. */
async function seedManyActive(count, authorUid) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const CHUNK = 450;
    for (let start = 0; start < count; start += CHUNK) {
      const end = Math.min(start + CHUNK, count);
      const batch = writeBatch(db);
      for (let i = start; i < end; i++) {
        batch.set(doc(db, `prayerRequests/large${i}`), requestDoc(authorUid, { displayName: 'Test User' }));
      }
      await batch.commit();
    }
  });
}

/** Read a single field with rules disabled (verification only, never counted against the rules budget). */
async function readFieldDisabled(path, field) {
  let value;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const snap = await getDoc(doc(ctx.firestore(), path));
    if (!snap.exists()) throw new Error(`readFieldDisabled: ${path} does not exist`);
    value = snap.data()[field];
  });
  return value;
}

/**
 * Seeds `count` active named requests for alice, plus one untouched Anonymous request and one
 * untouched other-user request, then performs the real atomic rename batch (as alice, with rules
 * enforced) and verifies: the batch succeeds, the profile and the first and last request in the
 * batch all show the new name, and the two untouched requests are unchanged.
 */
async function verifyLargeRenamePropagates(count) {
  await seedManyActive(count, 'alice');
  await seedActive('largeAnon', 'alice', { isAnonymous: true, displayName: 'Anonymous' });
  await seedActive('largeOther', 'mallory', { displayName: 'Test User' });

  const newName = `Alice Renamed At ${count}`;
  const alice = testEnv.authenticatedContext('alice').firestore();
  const batch = writeBatch(alice);
  batch.update(doc(alice, 'users/alice'), { displayName: newName, updatedAt: new Date() });
  for (let i = 0; i < count; i++) {
    batch.update(doc(alice, `prayerRequests/large${i}`), { displayName: newName, updatedAt: new Date() });
  }
  await assertSucceeds(batch.commit());

  assert.equal(await readFieldDisabled('users/alice', 'displayName'), newName);
  assert.equal(await readFieldDisabled('prayerRequests/large0', 'displayName'), newName);
  assert.equal(await readFieldDisabled(`prayerRequests/large${count - 1}`, 'displayName'), newName);
  assert.equal(await readFieldDisabled('prayerRequests/largeAnon', 'displayName'), 'Anonymous');
  assert.equal(await readFieldDisabled('prayerRequests/largeOther', 'displayName'), 'Test User');
}

test('an atomic rename batch of 25 active named requests plus the profile succeeds and commits', async () => {
  await verifyLargeRenamePropagates(25);
});

test('an atomic rename batch of 100 active named requests plus the profile succeeds and commits', async () => {
  await verifyLargeRenamePropagates(100);
});

test('an atomic rename batch of 499 active named requests plus the profile succeeds and commits', async () => {
  await verifyLargeRenamePropagates(499);
});
