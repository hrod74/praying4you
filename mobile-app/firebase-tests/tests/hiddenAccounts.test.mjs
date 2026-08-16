import { test, before, after, beforeEach } from 'node:test';

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

import { hiddenAccountDoc, makeTestEnv } from './helpers.mjs';

/**
 * Rules tests for `hiddenAccounts/{blockerUid}_{hiddenUid}` ("Hide requests from this account,"
 * an account-level, one-directional user-blocking control).
 *
 * Proves the private safety-record model: a user may create their own outgoing hide of another
 * account, exactly once (idempotent via deterministic id), and may read/list/delete ONLY their
 * own outgoing hides; no one may hide themselves, store an email or any other disallowed field,
 * update a hide, list/read another user's outgoing hides, or list/query by hiddenUid (which would
 * reveal who hid a given account).
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

/** Seed a hiddenAccounts doc with rules disabled (for list/delete/duplicate tests). */
async function seedHide(blockerUid, hiddenUid, overrides = {}) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(
      doc(ctx.firestore(), `hiddenAccounts/${blockerUid}_${hiddenUid}`),
      hiddenAccountDoc(blockerUid, hiddenUid, overrides),
    );
  });
}

test('a signed-in user can hide another account (named request)', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(
    setDoc(
      doc(bob, 'hiddenAccounts/bob_alice'),
      hiddenAccountDoc('bob', 'alice', { fromAnonymous: false, displayLabelSnapshot: 'Alice' }),
    ),
  );
});

test('a signed-in user can hide another account from an Anonymous request (no name stored)', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(
    setDoc(doc(bob, 'hiddenAccounts/bob_alice'), hiddenAccountDoc('bob', 'alice', { fromAnonymous: true })),
  );
});

test('an unauthenticated user cannot hide an account', async () => {
  const anon = testEnv.unauthenticatedContext().firestore();
  await assertFails(setDoc(doc(anon, 'hiddenAccounts/anon_alice'), hiddenAccountDoc('anon', 'alice')));
});

test('a user cannot hide their own account', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(setDoc(doc(alice, 'hiddenAccounts/alice_alice'), hiddenAccountDoc('alice', 'alice')));
});

test('a repeat hide of the same account is denied as a write (idempotent no-op is handled client-side)', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(setDoc(doc(bob, 'hiddenAccounts/bob_alice'), hiddenAccountDoc('bob', 'alice')));
  // A second write targets the same deterministic id -> it is an update -> denied. The service
  // layer pre-checks with a GET so the app never attempts this write for a real duplicate.
  await assertFails(setDoc(doc(bob, 'hiddenAccounts/bob_alice'), hiddenAccountDoc('bob', 'alice')));
});

test('a user cannot create a hide for another blockerUid', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  // blockerUid claims to be carol (but auth + id are bob) -> blocked.
  await assertFails(
    setDoc(doc(bob, 'hiddenAccounts/bob_alice'), hiddenAccountDoc('bob', 'alice', { blockerUid: 'carol' })),
  );
  // doc id does not match `{auth.uid}_{hiddenUid}` for the caller -> blocked.
  await assertFails(setDoc(doc(bob, 'hiddenAccounts/carol_alice'), hiddenAccountDoc('carol', 'alice')));
});

test('a hide cannot contain an email', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(
    setDoc(
      doc(bob, 'hiddenAccounts/bob_alice'),
      hiddenAccountDoc('bob', 'alice', { email: 'bob@example.com' }),
    ),
  );
});

test('a hide cannot contain prayer-request text, a reason, or device information', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(
    setDoc(
      doc(bob, 'hiddenAccounts/bob_alice'),
      hiddenAccountDoc('bob', 'alice', { body: 'some prayer text' }),
    ),
  );
  await assertFails(
    setDoc(doc(bob, 'hiddenAccounts/bob_alice'), hiddenAccountDoc('bob', 'alice', { reason: 'spam' })),
  );
  await assertFails(
    setDoc(
      doc(bob, 'hiddenAccounts/bob_alice'),
      hiddenAccountDoc('bob', 'alice', { deviceId: 'abc123' }),
    ),
  );
});

test('fromAnonymous must be a boolean', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(
    setDoc(
      doc(bob, 'hiddenAccounts/bob_alice'),
      hiddenAccountDoc('bob', 'alice', { fromAnonymous: 'yes' }),
    ),
  );
});

test('the client cannot update a hide', async () => {
  await seedHide('bob', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(updateDoc(doc(bob, 'hiddenAccounts/bob_alice'), { fromAnonymous: true }));
});

test('a user can delete (Unhide) their OWN hide', async () => {
  await seedHide('bob', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(deleteDoc(doc(bob, 'hiddenAccounts/bob_alice')));
});

test('a user cannot delete another user\'s hide', async () => {
  await seedHide('alice', 'carol'); // alice hid carol
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(deleteDoc(doc(bob, 'hiddenAccounts/alice_carol')));
});

test('an unauthenticated user cannot delete a hide', async () => {
  await seedHide('bob', 'alice');
  const anon = testEnv.unauthenticatedContext().firestore();
  await assertFails(deleteDoc(doc(anon, 'hiddenAccounts/bob_alice')));
});

// The Settings "Hidden accounts" list, and account-deletion cleanup, both need to enumerate the
// blocker's OWN outgoing hides, and ONLY their own.
test('a user can list ONLY their own outgoing hides', async () => {
  await seedHide('bob', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertSucceeds(
    getDocs(query(collection(bob, 'hiddenAccounts'), where('blockerUid', '==', 'bob'))),
  );
});

test('a user cannot list another user\'s outgoing hides', async () => {
  await seedHide('alice', 'carol');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(
    getDocs(query(collection(bob, 'hiddenAccounts'), where('blockerUid', '==', 'alice'))),
  );
});

test('the client cannot list ALL hides (unfiltered enumeration denied)', async () => {
  await seedHide('bob', 'alice');
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(getDocs(collection(bob, 'hiddenAccounts')));
});

// The critical privacy assumption: no query can reveal WHO has hidden a given account.
test('a user cannot query hides filtered by hiddenUid (no "who hid me" surface)', async () => {
  await seedHide('alice', 'bob'); // alice hid bob
  const bob = testEnv.authenticatedContext('bob').firestore();
  // Bob tries to discover who hid him by filtering on hiddenUid == himself. The list rule only
  // authorizes docs where blockerUid == the caller, so this is denied regardless of the filter.
  await assertFails(
    getDocs(query(collection(bob, 'hiddenAccounts'), where('hiddenUid', '==', 'bob'))),
  );
});

test('a user can get their OWN hide doc but not another user\'s', async () => {
  await seedHide('alice', 'bob'); // alice's hide of bob (seeded)
  const bob = testEnv.authenticatedContext('bob').firestore();
  // Bob's own hide doc (of some third account): readable even before it exists (idempotent
  // pre-check the app performs).
  await assertSucceeds(getDoc(doc(bob, 'hiddenAccounts/bob_carol')));
  // Alice's hide doc: never readable by bob, including the one where bob is the hidden party.
  await assertFails(getDoc(doc(bob, 'hiddenAccounts/alice_bob')));
});
