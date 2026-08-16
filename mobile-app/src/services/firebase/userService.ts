import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  Timestamp,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';

import { getFirebaseDb } from './firebaseApp';
import type { StoredUserProfile, UserService } from './contracts';

/**
 * Firebase user-profile service (Phase J.2c): the private `users/{uid}` Firestore document.
 *
 * This is the ONLY Firestore collection wired so far. Prayer requests, interactions, and reports
 * remain local/mock and are never read or written here.
 *
 * Privacy: the profile doc holds the display name and account metadata only. Email is NOT stored
 * (Firebase Auth already owns it), so email never enters Firestore, never reaches any public
 * surface, and never appears in prayer/interaction/report data. The doc is owner-private by the
 * security rules (a user can read/write only their own `users/{uid}`).
 *
 * All methods no-op (or return null) when Firebase is not configured, so the local/mock fallback
 * keeps working with no `.env.local`. Callers also run these best-effort so a Firestore failure
 * (for example, rules not yet deployed) never blocks the auth flow.
 */

/** Bumped when the stored profile shape changes, so future migrations can detect old docs. */
const PROFILE_VERSION = 2;

/** Convert a Firestore Timestamp to an ISO string, or null if absent / still resolving. */
function timestampToIso(value: unknown): string | null {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

function mapProfile(uid: string, data: DocumentData): StoredUserProfile {
  return {
    uid,
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
    lastSignedInAt: timestampToIso(data.lastSignedInAt),
    profileVersion: typeof data.profileVersion === 'number' ? data.profileVersion : PROFILE_VERSION,
    accountStatus: typeof data.accountStatus === 'string' ? data.accountStatus : 'active',
    termsAcceptedVersion:
      typeof data.termsAcceptedVersion === 'string' ? data.termsAcceptedVersion : null,
    termsAcceptedAt: timestampToIso(data.termsAcceptedAt),
  };
}

/** The full field set for a brand-new profile doc (server timestamps + safe defaults). */
function newProfileData(uid: string, displayName: string, termsVersion?: string) {
  return {
    uid,
    displayName: displayName.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastSignedInAt: serverTimestamp(),
    profileVersion: PROFILE_VERSION,
    accountStatus: 'active',
    termsAcceptedVersion: termsVersion ?? null,
    termsAcceptedAt: termsVersion ? serverTimestamp() : null,
  };
}

async function readProfile(db: Firestore, uid: string): Promise<StoredUserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? mapProfile(uid, snap.data()) : null;
}

export const firebaseUserService: UserService = {
  async getOwnProfile(uid) {
    const db = getFirebaseDb();
    if (!db) return null;
    return readProfile(db, uid);
  },

  async ensureProfileForSignUp(uid, displayName, termsVersion) {
    const db = getFirebaseDb();
    if (!db) return;
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      // Legacy accounts may predate versioned Terms consent. Update only the consent metadata,
      // never overwrite the rest of an existing private profile.
      if (snap.data().termsAcceptedVersion !== termsVersion) {
        await updateDoc(ref, {
          termsAcceptedVersion: termsVersion,
          termsAcceptedAt: serverTimestamp(),
          profileVersion: PROFILE_VERSION,
          updatedAt: serverTimestamp(),
        });
      }
      return;
    }
    await setDoc(ref, newProfileData(uid, displayName, termsVersion));
  },

  async recordSignIn(uid, displayName) {
    const db = getFirebaseDb();
    if (!db) return null;
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      // Backfill: accounts created before this phase have no profile doc yet.
      await setDoc(ref, newProfileData(uid, displayName));
    } else {
      await updateDoc(ref, {
        lastSignedInAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return readProfile(db, uid);
  },

  async acceptTerms(uid, termsVersion) {
    const db = getFirebaseDb();
    if (!db) return;
    await updateDoc(doc(db, 'users', uid), {
      termsAcceptedVersion: termsVersion,
      termsAcceptedAt: serverTimestamp(),
      profileVersion: PROFILE_VERSION,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteOwnProfile(uid) {
    const db = getFirebaseDb();
    if (!db) return;
    // Owner-only delete (enforced by the security rules). deleteDoc is a no-op if the doc is
    // already gone. Only the signed-in user's own users/{uid} is touched; no prayer data.
    await deleteDoc(doc(db, 'users', uid));
  },
};
