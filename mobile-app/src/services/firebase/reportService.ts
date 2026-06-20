import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';

import { getFirebaseDb } from './firebaseApp';
import { REPORT_ERROR_COPY, ReportError, reportError } from './reportErrors';
import type { ReportService } from './contracts';

/**
 * Firebase report service (Phase J.2g) — the `reports/{uid}_{requestId}` collection.
 *
 * Lightweight reporting for MANUAL Firebase Console review (no admin dashboard, no notifications, no
 * automation). A report is a private moderation record:
 *  - One doc per user+request (deterministic id) so a user can never file a duplicate.
 *  - Owner-private to the REPORTER only: a user may read their own report (for duplicate handling);
 *    no one can list reports or read another user's report from the client.
 *  - Stores only opaque UIDs, the reason, a status, a timestamp, and an optional reviewer note —
 *    NEVER an email, display name, or phone number.
 *
 * The live app reaches this only through the mode-aware seam (`src/services/reports.ts`); when
 * Firebase is not configured the seam uses the original local/mock report path instead.
 */

/** The Firestore collection name. */
const COLLECTION = 'reports';
/** Bumped if the stored report shape changes, so future migrations can detect old docs. */
const SCHEMA_VERSION = 1;
/** Reports are created open; status changes happen only via manual Console review, never the client. */
const INITIAL_STATUS = 'open';

/** Deterministic report document id. One per reporter+request guarantees no duplicate report. */
function reportDocId(reporterUid: string, requestId: string): string {
  return `${reporterUid}_${requestId}`;
}

/** Firestore or a thrown safe error (the seam only calls this when Firebase is configured). */
function requireDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) throw new ReportError('generic');
  return db;
}

export const firebaseReportService: ReportService = {
  async report({ reporterUid, requestId, requestAuthorUid, reason, notes }) {
    const db = requireDb();
    const ref = doc(db, COLLECTION, reportDocId(reporterUid, requestId));
    try {
      // Pre-check the user's OWN report doc (allowed by rules) so a duplicate is handled calmly
      // rather than as a raw write rejection. The rules are still the hard guarantee (create-only +
      // no update), so a race cannot create or overwrite a duplicate.
      const existing = await getDoc(ref);
      if (existing.exists()) {
        throw new ReportError('already');
      }
      // Only opaque UIDs + moderation metadata. No email, no display name, no phone. `notes` is the
      // reporter's optional message to the reviewer; omitted entirely when blank.
      const trimmedNotes = notes?.trim();
      await setDoc(ref, {
        id: reportDocId(reporterUid, requestId),
        reporterUid,
        requestId,
        requestAuthorUid,
        reason,
        status: INITIAL_STATUS,
        schemaVersion: SCHEMA_VERSION,
        createdAt: serverTimestamp(),
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
      });
    } catch (error) {
      throw reportError(error);
    }
  },

  async hasReported(reporterUid, requestId) {
    const db = requireDb();
    try {
      const snap = await getDoc(doc(db, COLLECTION, reportDocId(reporterUid, requestId)));
      return snap.exists();
    } catch (error) {
      throw reportError(error);
    }
  },

  async deleteAllMine(reporterUid) {
    const db = requireDb();
    // Account-deletion cleanup (Phase J.2h): remove ONLY this user's own report docs, so deleting an
    // account removes the records that identify them as the reporter. The list query is owner-scoped
    // (the rule allows listing only reports where reporterUid == the caller), and each delete is
    // owner-scoped too — reports filed by OTHER users are never touched and remain for manual review.
    // The raw Firebase error propagates so the caller (the account-deletion seam) can handle it;
    // deletion treats this as best-effort.
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('reporterUid', '==', reporterUid)),
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
export { REPORT_ERROR_COPY, ReportError, reportError };
