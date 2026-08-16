import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';

import { getFirebaseDb } from './firebaseApp';
import {
  HIDDEN_ACCOUNT_ERROR_COPY,
  HiddenAccountError,
  hiddenAccountError,
} from './hiddenAccountErrors';
import type { HiddenAccountService, StoredHiddenAccount } from './contracts';

/**
 * Firebase hidden-account service: the `hiddenAccounts/{blockerUid}_{hiddenUid}` collection.
 *
 * "Hide requests from this account" is an account-level, one-directional user-blocking control
 * (see `docs/firebase-hidden-accounts-implementation.md` for the full design and platform-policy
 * framing). A hide is a private per-user safety record:
 *  - One doc per blocker+hidden-account pair (deterministic id), so a hide is naturally
 *    idempotent and can never be duplicated.
 *  - Owner-private to the BLOCKER only: a user may create/read/list/delete only their own
 *    outgoing hides. No one can list or query by `hiddenUid`, so a user can never learn who has
 *    hidden them.
 *  - Stores only opaque UIDs, a boolean, a timestamp, and an OPTIONAL display-label snapshot
 *    (only when the triggering request was not anonymous), NEVER an email, prayer-request text,
 *    the real name behind an anonymous post, device information, or a reason.
 *
 * The live app reaches this only through the mode-aware seam (`src/services/hiddenAccounts.ts`);
 * when Firebase is not configured the seam uses an on-device fallback instead.
 */

/** The Firestore collection name. */
const COLLECTION = 'hiddenAccounts';
/** Bumped if the stored shape changes, so future migrations can detect old docs. */
const SCHEMA_VERSION = 1;

/** Deterministic hide document id. One per blocker+hidden-account guarantees no duplicate. */
function hideDocId(blockerUid: string, hiddenUid: string): string {
  return `${blockerUid}_${hiddenUid}`;
}

/** Convert a Firestore Timestamp to an ISO string, or null if absent / still resolving. */
function timestampToIso(value: unknown): string | null {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

function mapHiddenAccount(id: string, data: DocumentData): StoredHiddenAccount {
  return {
    id,
    blockerUid: typeof data.blockerUid === 'string' ? data.blockerUid : '',
    hiddenUid: typeof data.hiddenUid === 'string' ? data.hiddenUid : '',
    createdAt: timestampToIso(data.createdAt),
    schemaVersion: typeof data.schemaVersion === 'number' ? data.schemaVersion : SCHEMA_VERSION,
    displayLabelSnapshot:
      typeof data.displayLabelSnapshot === 'string' ? data.displayLabelSnapshot : null,
    fromAnonymous: Boolean(data.fromAnonymous),
  };
}

/** Firestore or a thrown safe error (the seam only calls this when Firebase is configured). */
function requireDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) throw new HiddenAccountError('generic');
  return db;
}

export const firebaseHiddenAccountService: HiddenAccountService = {
  async hide({ blockerUid, hiddenUid, fromAnonymous, displayLabelSnapshot }) {
    if (blockerUid === hiddenUid) throw new HiddenAccountError('ownAccount');
    const db = requireDb();
    const ref = doc(db, COLLECTION, hideDocId(blockerUid, hiddenUid));
    try {
      // Idempotent pre-check (mirrors the reporting seam): a repeat hide is a harmless no-op,
      // never an error and never a write to an existing doc. The rules deny update, so this
      // pre-check is what makes a duplicate attempt succeed quietly instead of failing.
      const existing = await getDoc(ref);
      if (existing.exists()) return;
      const trimmedLabel = displayLabelSnapshot?.trim();
      await setDoc(ref, {
        id: hideDocId(blockerUid, hiddenUid),
        blockerUid,
        hiddenUid,
        fromAnonymous,
        schemaVersion: SCHEMA_VERSION,
        createdAt: serverTimestamp(),
        // Omitted entirely (never an empty string) when the triggering request was anonymous.
        ...(trimmedLabel ? { displayLabelSnapshot: trimmedLabel } : {}),
      });
    } catch (error) {
      throw hiddenAccountError(error);
    }
  },

  async listMine(blockerUid) {
    const db = requireDb();
    try {
      // Single equality filter on the blocker (auto-indexed; no composite index needed).
      const snap = await getDocs(
        query(collection(db, COLLECTION), where('blockerUid', '==', blockerUid)),
      );
      return snap.docs.map((d) => mapHiddenAccount(d.id, d.data()));
    } catch (error) {
      throw hiddenAccountError(error);
    }
  },

  async unhide(blockerUid, hiddenUid) {
    const db = requireDb();
    try {
      // deleteDoc on a missing doc is a no-op success, so a repeat unhide is also idempotent.
      await deleteDoc(doc(db, COLLECTION, hideDocId(blockerUid, hiddenUid)));
    } catch (error) {
      throw hiddenAccountError(error);
    }
  },

  async deleteAllMine(blockerUid) {
    const db = requireDb();
    // Account-deletion cleanup: remove ONLY this user's own OUTGOING hide docs. The list query is
    // owner-scoped (the rule allows listing only hides where blockerUid == the caller), and each
    // delete is owner-scoped too. INCOMING hides that reference this uid as hiddenUid (other
    // users' hides of this account) cannot be enumerated without a rule that would let a user
    // discover who hid them, so they are deliberately left in place; see the implementation doc.
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('blockerUid', '==', blockerUid)),
    );
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
export { HIDDEN_ACCOUNT_ERROR_COPY, HiddenAccountError, hiddenAccountError };
