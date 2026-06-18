import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

import { getFirebaseDb } from './firebaseApp';
import { prayerRequestError } from './prayerErrors';
import type { PrayerRequestService } from './contracts';
import type { PrayerCategory, PrayerRequest } from '../../models/types';

/**
 * Firebase prayer-request service (Phase J.2e) — the `prayerRequests/{requestId}` collection.
 *
 * This is the first prayer DATA in Firestore (after the private `users/{uid}` profile from J.2c).
 * Prayer interactions ("I prayed for this") and reports remain local/mock and are NOT read or
 * written here. The live app reaches this only through the mode-aware seam
 * (`src/services/prayerRequests.ts`); when Firebase is not configured the seam uses the local
 * `prayerService` instead, so the prototype still runs with no `.env.local`.
 *
 * Privacy (carried forward from the plan and the J.2c profile doc):
 *  - Email is NEVER stored in a prayer request and never returned to the UI.
 *  - `authorUid` is stored (ownership is always retained, even for anonymous posts) so security
 *    rules can enforce owner-only edit/remove. It is an opaque Firebase UID, is never shown in the
 *    UI, and cannot be mapped to a person by other users (the `users/{uid}` profile is owner-only).
 *  - For an anonymous post, the public `displayName` is the literal string "Anonymous". The real
 *    name is deliberately NOT stored on the doc, so the identity behind an anonymous post stays
 *    private even though any signed-in user can read the request.
 *  - Prayer interactions stay aggregate-only elsewhere; nothing here exposes "who prayed".
 */

/** The Firestore collection name. The only prayer collection wired in this phase. */
const COLLECTION = 'prayerRequests';

/** Bumped if the stored request shape changes, so future migrations can detect old docs. */
const SCHEMA_VERSION = 1;

/** Convert a Firestore Timestamp to an ISO string, or null if absent / still resolving. */
function timestampToIso(value: unknown): string | null {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

/**
 * Map a Firestore document to the app's PrayerRequest. `userId` mirrors `authorUid`. `reportCount`
 * is always 0 here because reports stay local/mock (the context layers any local report delta on
 * top). Email is never present and never read.
 */
function mapRequest(id: string, data: DocumentData): PrayerRequest {
  return {
    id,
    userId: typeof data.authorUid === 'string' ? data.authorUid : '',
    isAnonymous: Boolean(data.isAnonymous),
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    body: typeof data.body === 'string' ? data.body : '',
    category: (typeof data.category === 'string' ? data.category : 'other') as PrayerCategory,
    // Fall back to epoch when the server timestamp is still resolving so sorting stays stable.
    createdAt: timestampToIso(data.createdAt) ?? new Date(0).toISOString(),
    status: data.status === 'removed' ? 'removed' : 'active',
    prayerCount: typeof data.prayerCount === 'number' ? data.prayerCount : 0,
    reportCount: 0,
  };
}

/** The public display name for a request: literal "Anonymous" when anonymous, else the real name. */
function publicDisplayName(isAnonymous: boolean, displayName: string): string {
  return isAnonymous ? 'Anonymous' : displayName.trim();
}

const byNewestFirst = (a: PrayerRequest, b: PrayerRequest): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/** Firestore or a thrown safe error (the seam only calls this when Firebase is configured). */
function requireDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) throw prayerRequestError('load', undefined);
  return db;
}

export const firebasePrayerRequestService: PrayerRequestService = {
  async listActive() {
    const db = requireDb();
    try {
      // Single equality filter (auto-indexed; no composite index needed). Sorted client-side so
      // the owner never has to create a Firestore composite index for this phase.
      const snap = await getDocs(query(collection(db, COLLECTION), where('status', '==', 'active')));
      return snap.docs.map((d) => mapRequest(d.id, d.data())).sort(byNewestFirst);
    } catch (error) {
      throw prayerRequestError('load', error);
    }
  },

  async getById(id) {
    const db = requireDb();
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return null;
      const data = snap.data();
      if (data.status === 'removed') return null; // soft-removed requests are not shown
      return mapRequest(snap.id, data);
    } catch (error) {
      // A single-doc lookup that is denied (e.g. a non-owner direct link to a removed request)
      // is treated as "not found" so the detail screen shows its calm empty state, not an error.
      if (error instanceof FirebaseError && error.code === 'permission-denied') return null;
      throw prayerRequestError('load', error);
    }
  },

  async create({ userId, displayName, isAnonymous, body, category }) {
    const db = requireDb();
    const name = publicDisplayName(isAnonymous, displayName);
    const trimmedBody = body.trim();
    try {
      // Note: no `email` field is ever written. `authorUid` is the owner; `prayerCount` starts at 0.
      const ref = await addDoc(collection(db, COLLECTION), {
        authorUid: userId,
        isAnonymous,
        displayName: name,
        body: trimmedBody,
        category,
        status: 'active',
        prayerCount: 0,
        schemaVersion: SCHEMA_VERSION,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Return an immediate record (with a client timestamp) so the new request can be prepended
      // to the feed at once; a later refresh reads the resolved server values.
      return {
        id: ref.id,
        userId,
        isAnonymous,
        displayName: name,
        body: trimmedBody,
        category,
        createdAt: new Date().toISOString(),
        status: 'active',
        prayerCount: 0,
        reportCount: 0,
      };
    } catch (error) {
      throw prayerRequestError('create', error);
    }
  },

  async edit(requestId, _userId, input) {
    const db = requireDb();
    try {
      // Owner-only and protected-field rules are enforced by Firestore security rules. We never
      // send authorUid/createdAt/prayerCount, so those stay unchanged. No email is ever written.
      await updateDoc(doc(db, COLLECTION, requestId), {
        body: input.body.trim(),
        category: input.category,
        isAnonymous: input.isAnonymous,
        displayName: publicDisplayName(input.isAnonymous, input.ownerDisplayName),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw prayerRequestError('update', error);
    }
  },

  async remove(requestId, _userId) {
    const db = requireDb();
    try {
      // Soft remove only (never a hard delete): set status + removedAt. Owner-only via rules.
      await updateDoc(doc(db, COLLECTION, requestId), {
        status: 'removed',
        removedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw prayerRequestError('remove', error);
    }
  },

  async listMine(userId) {
    const db = requireDb();
    try {
      // Single equality filter on the owner (auto-indexed); active-only filter + sort client-side.
      const snap = await getDocs(query(collection(db, COLLECTION), where('authorUid', '==', userId)));
      return snap.docs
        .map((d) => mapRequest(d.id, d.data()))
        .filter((p) => p.status === 'active')
        .sort(byNewestFirst);
    } catch (error) {
      throw prayerRequestError('load', error);
    }
  },

  async softRemoveAllByOwner(userId) {
    const db = requireDb();
    // Find the owner's currently active requests, then soft-remove each in batched writes. Owner-only
    // (the update rule requires authorUid == request.auth.uid) and protected fields (authorUid,
    // createdAt, prayerCount) are left untouched. This is the account-deletion cleanup: requests are
    // never hard-deleted, so reports/interactions can never reference a missing request, and a future
    // retention policy can decide whether to purge or anonymize removed records later.
    //
    // Note: the raw Firebase error is allowed to propagate. The only caller (the account-deletion
    // seam) maps it to safe copy via `accountDeletionError`, consistent with the other delete steps.
    const snap = await getDocs(query(collection(db, COLLECTION), where('authorUid', '==', userId)));
    const active = snap.docs.filter((d) => d.data().status !== 'removed');
    if (active.length === 0) return;
    // Firestore caps a write batch at 500 operations; chunk to stay well under that.
    const CHUNK = 450;
    for (let i = 0; i < active.length; i += CHUNK) {
      const batch = writeBatch(db);
      for (const d of active.slice(i, i + CHUNK)) {
        batch.update(d.ref, {
          status: 'removed',
          removedReason: 'accountDeleted',
          removedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }
  },
};
