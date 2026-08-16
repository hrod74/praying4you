import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch, type Firestore } from 'firebase/firestore';

import { getFirebaseDb } from './firebaseApp';
import {
  isEligibleForDisplayNameRename,
  planDisplayNameRenameBatch,
  RENAME_PROPAGATION_ERROR_MESSAGE,
} from '../../utils/displayNameRenamePlan';

/**
 * Firebase display-name propagation: renames a user's public identity everywhere it is shown.
 *
 * A display name represents the account's current public identity: when it changes, every
 * active, non-Anonymous prayer request owned by that account must show the new name. This module
 * performs the Firestore half of that rename. The private `users/{uid}` profile doc and every
 * matching `prayerRequests` document are updated in ONE atomic write batch (see
 * `../../utils/displayNameRenamePlan.ts` for the pure selection and planning logic shared with
 * the local/mock propagation), so a partial rename can never be observed: either every matching
 * document updates together, or none of them do.
 *
 * Cross-service limitation: Firebase Authentication (the display name on the Auth user record)
 * and this Firestore batch are two separate products and cannot be committed as one atomic
 * operation across both. The caller (AuthContext) is responsible for sequencing: update Auth
 * first, then call this function, and only report success or update in-memory profile state once
 * this Firestore batch has also succeeded. If Auth succeeds but this batch fails, the caller
 * surfaces a calm retryable error rather than silently treating the Firestore half as best-effort.
 * Both halves are idempotent (each writes an absolute value, not a delta), so retrying with the
 * same desired name is always safe.
 */

/** Thrown when propagating a display-name rename cannot proceed or fails partway. Calm, safe copy only. */
export class DisplayNameRenameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DisplayNameRenameError';
  }
}

/**
 * Every currently active, non-Anonymous request authored by `uid`, as their document ids. Queries
 * by `authorUid` only (a single equality filter, already indexed elsewhere in this collection)
 * and filters `isAnonymous`/`status` client-side with the shared pure predicate, matching the
 * existing `listMine` query pattern, so no new composite index is required for this beta.
 */
async function findMatchingRequestIds(db: Firestore, uid: string): Promise<string[]> {
  const snap = await getDocs(query(collection(db, 'prayerRequests'), where('authorUid', '==', uid)));
  return snap.docs
    .filter((d) => {
      const data = d.data();
      return isEligibleForDisplayNameRename(
        {
          id: d.id,
          userId: typeof data.authorUid === 'string' ? data.authorUid : '',
          isAnonymous: Boolean(data.isAnonymous),
          status: typeof data.status === 'string' ? data.status : 'active',
        },
        uid,
      );
    })
    .map((d) => d.id);
}

/**
 * Renames `uid`'s public identity in Firestore: the private profile doc's `displayName`, and the
 * `displayName` of every active, non-Anonymous request that account owns, all `updatedAt`, all in
 * one atomic write batch. Anonymous requests, removed requests, and every other request field
 * (body, category, authorUid, createdAt, prayerCount, status) are never touched. Throws
 * `DisplayNameRenameError` with calm, safe copy if the batch would exceed
 * `MAX_NAMED_REQUESTS_FOR_ATOMIC_RENAME` matching requests (checked BEFORE any write is
 * attempted, via the pure `planDisplayNameRenameBatch`) or if the batch commit itself fails for
 * any other reason. No-op if Firebase is not configured (local/mock fallback handles renaming
 * separately).
 */
export async function renamePublicDisplayName(uid: string, displayName: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  let matchingIds: string[];
  try {
    matchingIds = await findMatchingRequestIds(db, uid);
  } catch {
    throw new DisplayNameRenameError(RENAME_PROPAGATION_ERROR_MESSAGE);
  }

  const plan = planDisplayNameRenameBatch(uid, displayName, matchingIds);
  if (plan.status === 'tooManyRequests') {
    throw new DisplayNameRenameError(RENAME_PROPAGATION_ERROR_MESSAGE);
  }

  try {
    const batch = writeBatch(db);
    for (const write of plan.writes) {
      batch.update(doc(db, write.path), { displayName: write.data.displayName, updatedAt: serverTimestamp() });
    }
    await batch.commit();
  } catch {
    throw new DisplayNameRenameError(RENAME_PROPAGATION_ERROR_MESSAGE);
  }
}
