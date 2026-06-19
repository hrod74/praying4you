import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';

import { getFirebaseDb } from './firebaseApp';
import {
  INTERACTION_ERROR_COPY,
  PrayerInteractionError,
  prayerInteractionError,
} from './interactionErrors';
import type { PrayerInteractionService } from './contracts';

/**
 * Firebase prayer-interaction service (Phase J.2f.3) — the `prayerInteractions/{uid}_{requestId}`
 * collection plus the request's aggregate `prayerCount`.
 *
 * AGGREGATE-ONLY to other users: the only cross-user signal is `prayerRequests/{id}.prayerCount`.
 * An interaction document is owner-private (a user can read only their own), there is deliberately
 * NO "list who prayed" method, and an interaction stores no email and no display name — only the
 * user's own UID, the request id, a timestamp, and a schema version.
 *
 * The live app reaches this only through the mode-aware seam (`src/services/prayerInteractions.ts`);
 * when Firebase is not configured the seam uses the original local/mock interaction path instead, so
 * the prototype still runs with no `.env.local`.
 */

/** The Firestore collection name. */
const COLLECTION = 'prayerInteractions';
/** The collection holding the requests whose aggregate count we increment. */
const REQUESTS = 'prayerRequests';
/** Bumped if the stored interaction shape changes, so future migrations can detect old docs. */
const SCHEMA_VERSION = 1;

/**
 * Deterministic interaction document id. One doc per user+request guarantees "one prayer per user
 * per request": a second attempt targets the same id, so it can never create a duplicate. Firestore
 * auto-ids and Firebase UIDs contain no underscores, so this id is unambiguous.
 */
function interactionDocId(userUid: string, requestId: string): string {
  return `${userUid}_${requestId}`;
}

/** Firestore or a thrown safe error (the seam only calls this when Firebase is configured). */
function requireDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) throw new PrayerInteractionError('generic');
  return db;
}

export const firebasePrayerInteractionService: PrayerInteractionService = {
  async pray(userUid, requestId) {
    const db = requireDb();
    const interactionRef = doc(db, COLLECTION, interactionDocId(userUid, requestId));
    const requestRef = doc(db, REQUESTS, requestId);
    try {
      // A transaction keeps interaction creation and the count increment consistent: either both
      // happen or neither does. It is also idempotent — if the user already prayed we make no
      // change. The security rules separately enforce that the +1 is tied to creating this user's
      // brand-new interaction doc, so the count can never be inflated on its own.
      return await runTransaction(db, async (tx) => {
        const requestSnap = await tx.get(requestRef);
        if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
          // Removed or missing request: never create an interaction, never increment.
          throw new PrayerInteractionError('unavailable');
        }
        const existing = await tx.get(interactionRef);
        if (existing.exists()) {
          // Already prayed: no double-count, no write.
          return { created: false };
        }
        // Compute the new count as a LITERAL from the value we just read in this transaction. We
        // deliberately do NOT use FieldValue.increment() here: increment() is a server-side
        // transform whose result is not a concrete number during security-rule evaluation, so the
        // rule's exact-value check (`prayerCount == resource.data.prayerCount + 1`) would fail and
        // reject the update. Because the update and the interaction set commit atomically, that
        // rejection would roll back BOTH writes, so no interaction doc would be created either. The
        // transaction's read/retry semantics keep this literal `+ 1` race-safe.
        const currentCount =
          typeof requestSnap.data().prayerCount === 'number' ? requestSnap.data().prayerCount : 0;
        // No email, no display name — only the user's own UID, the request id, and metadata.
        tx.set(interactionRef, {
          id: interactionDocId(userUid, requestId),
          userUid,
          requestId,
          schemaVersion: SCHEMA_VERSION,
          createdAt: serverTimestamp(),
        });
        tx.update(requestRef, { prayerCount: currentCount + 1 });
        return { created: true };
      });
    } catch (error) {
      // Dev-only diagnostics: log the Firestore error CODE only (e.g. "permission-denied"), which is
      // non-sensitive. Never log the uid, request body, email, config, or any private value.
      if (__DEV__) {
        const code = (error as { code?: string })?.code ?? 'unknown';
        if (code !== 'unknown' || !(error instanceof PrayerInteractionError)) {
          console.warn(
            `[pray] interaction write failed (code: ${code}). If this is "permission-denied", ` +
              'republish mobile-app/firestore.rules in the Firebase Console (Firestore Database > Rules).',
          );
        }
      }
      throw prayerInteractionError(error);
    }
  },

  async hasPrayed(userUid, requestId) {
    const db = requireDb();
    try {
      const snap = await getDoc(doc(db, COLLECTION, interactionDocId(userUid, requestId)));
      return snap.exists();
    } catch (error) {
      throw prayerInteractionError(error);
    }
  },

  async listMinePrayedFor(userUid) {
    const db = requireDb();
    try {
      // Own records only (the read rule allows a user to read only interactions where
      // userUid == their uid). Returns request ids, never who-prayed data about anyone else.
      const snap = await getDocs(query(collection(db, COLLECTION), where('userUid', '==', userUid)));
      return snap.docs
        .map((d) => (typeof d.data().requestId === 'string' ? (d.data().requestId as string) : ''))
        .filter((id) => id.length > 0);
    } catch (error) {
      throw prayerInteractionError(error);
    }
  },

  async deleteAllMine(userUid) {
    const db = requireDb();
    // Account-deletion cleanup (Phase J.2h): remove ONLY this user's own interaction docs. The list
    // query is owner-scoped (the rule allows listing only interactions where userUid == the caller),
    // and each delete is owner-scoped too. We deliberately do NOT touch any request's prayerCount —
    // aggregate counts are preserved for MVP (there is no "who prayed" UI, so a count that is not
    // decremented exposes nothing about anyone). The raw Firebase error propagates so the caller (the
    // account-deletion seam) can decide how to handle it; deletion treats this as best-effort.
    const snap = await getDocs(query(collection(db, COLLECTION), where('userUid', '==', userUid)));
    if (snap.empty) return;
    // Firestore caps a write batch at 500 operations; chunk to stay well under that.
    const CHUNK = 450;
    for (let i = 0; i < snap.docs.length; i += CHUNK) {
      const batch = writeBatch(db);
      for (const d of snap.docs.slice(i, i + CHUNK)) {
        batch.delete(d.ref);
      }
      await batch.commit();
    }
  },
};

// Re-export so callers can map/branch without reaching into the errors module directly.
export { INTERACTION_ERROR_COPY, PrayerInteractionError, prayerInteractionError };
