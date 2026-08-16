import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

/**
 * Shared setup for the Firestore security-rules tests (Phase J.2f.4).
 *
 * These tests run ONLY against the Firebase Local Emulator Suite via
 * `firebase emulators:exec` (which sets FIRESTORE_EMULATOR_HOST). They never touch production
 * Firebase, never need a service account, and never read the owner's real `.env.local`. The
 * project id is a fake `demo-*` id, which puts the emulator in offline mode with no credentials.
 *
 * The rules under test are the REAL app rules at `mobile-app/firestore.rules`, loaded from disk so
 * the harness always validates exactly what the app ships.
 */

const here = dirname(fileURLToPath(import.meta.url));
/** The app's real rules file (mobile-app/firestore.rules), two levels up from tests/. */
const RULES_PATH = resolve(here, '../../firestore.rules');

export const PROJECT_ID = 'demo-praying4you';

/** Create a fresh test environment with the app's real rules loaded into the emulator. */
export async function makeTestEnv() {
  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(RULES_PATH, 'utf8'),
    },
  });
}

/** A minimal valid users/{uid} profile doc (mirrors userService; never includes an email). */
export function profileDoc(uid, displayName = 'Test User') {
  return {
    uid,
    displayName,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedInAt: new Date(),
    profileVersion: 2,
    accountStatus: 'active',
    termsAcceptedVersion: '2026-08-15',
    termsAcceptedAt: new Date(),
  };
}

/** A minimal valid active prayerRequests doc owned by `authorUid` (never includes an email). */
export function requestDoc(authorUid, overrides = {}) {
  return {
    authorUid,
    isAnonymous: false,
    displayName: 'Test User',
    body: 'Please pray for safe travels.',
    category: 'other',
    status: 'active',
    prayerCount: 0,
    schemaVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/** A minimal valid prayerInteractions doc (id must be `{userUid}_{requestId}`; never an email). */
export function interactionDoc(userUid, requestId) {
  return {
    id: `${userUid}_${requestId}`,
    userUid,
    requestId,
    schemaVersion: 1,
    createdAt: new Date(),
  };
}

/**
 * A minimal valid reports doc. Id must be `{reporterUid}_{requestId}`; `requestAuthorUid` must be the
 * target request's real author; reason must be an allowed value; status must be `open`. Never stores
 * an email, display name, or phone.
 */
export function reportDoc(reporterUid, requestId, requestAuthorUid, overrides = {}) {
  return {
    id: `${reporterUid}_${requestId}`,
    reporterUid,
    requestId,
    requestAuthorUid,
    reason: 'inappropriate',
    status: 'open',
    schemaVersion: 1,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * A minimal valid hiddenAccounts doc ("Hide requests from this account"). Id must be
 * `{blockerUid}_{hiddenUid}`. Never stores an email, prayer-request text, the real name behind an
 * anonymous post, device information, or a reason.
 */
export function hiddenAccountDoc(blockerUid, hiddenUid, overrides = {}) {
  return {
    id: `${blockerUid}_${hiddenUid}`,
    blockerUid,
    hiddenUid,
    fromAnonymous: false,
    schemaVersion: 1,
    createdAt: new Date(),
    ...overrides,
  };
}
