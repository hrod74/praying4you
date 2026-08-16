import { test, before, after, beforeEach } from 'node:test';

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { makeTestEnv, profileDoc } from './helpers.mjs';

/**
 * Rules tests for `users/{uid}` — the private, owner-only profile document.
 *
 * Proves: a signed-in user can create/read/update only their OWN profile, cannot read another
 * user's profile, an unauthenticated user cannot read/write, and a profile is valid WITHOUT an
 * email (email is never required or stored in Firestore; Auth owns it).
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

test('owner can create their own profile (no email field needed)', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(setDoc(doc(alice, 'users/alice'), profileDoc('alice', 'Alice')));
});

test('owner can read their own profile', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/alice'), profileDoc('alice'));
  });
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(getDoc(doc(alice, 'users/alice')));
});

test('owner can update their own profile', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/alice'), profileDoc('alice'));
  });
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(updateDoc(doc(alice, 'users/alice'), { displayName: 'Alice B.' }));
});

test('owner can record a versioned Terms acceptance on their private profile', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/alice'), profileDoc('alice'));
  });
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(
    updateDoc(doc(alice, 'users/alice'), {
      termsAcceptedVersion: '2026-08-15',
      termsAcceptedAt: new Date(),
    }),
  );
});

test('a signed-in user cannot read another user profile', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/alice'), profileDoc('alice'));
  });
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(getDoc(doc(bob, 'users/alice')));
});

test('a signed-in user cannot create a profile owned by someone else', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(setDoc(doc(bob, 'users/alice'), profileDoc('alice')));
});

test('an unauthenticated user cannot read a profile', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/alice'), profileDoc('alice'));
  });
  const anon = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anon, 'users/alice')));
});

test('an unauthenticated user cannot write a profile', async () => {
  const anon = testEnv.unauthenticatedContext().firestore();
  await assertFails(setDoc(doc(anon, 'users/alice'), profileDoc('alice')));
});
