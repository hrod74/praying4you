import { isFirebaseConfigured } from '../config/firebaseConfig';
import { firebaseReportService } from './firebase/reportService';
import type { ReportReason } from '../models/types';

/**
 * Mode-aware reporting seam (Phase J.2g).
 *
 * This is the ONE place that decides where prayer-request reports live:
 *  - Firebase mode (when `EXPO_PUBLIC_FIREBASE_*` is configured): writes a private report doc to the
 *    Firestore `reports` collection for manual Console review, via `firebaseReportService`.
 *  - Local mode (no config): the original local/mock report behavior owned by `PrayerContext` +
 *    `prayerService`, so the prototype still runs with no `.env.local`.
 *
 * Reports are a private moderation record: never listed in the app, never publicly readable, and they
 * never store an email, display name, or phone. There is no "who reported" surface anywhere.
 */

const useFirebase = (): boolean => isFirebaseConfigured();

/** Whether reports are Firebase-backed in the current mode (else local/mock in PrayerContext). */
export function reportsUseFirebase(): boolean {
  return useFirebase();
}

/**
 * File a report against another user's active request (Firebase mode). Idempotent-safe: throws a
 * `ReportError` with code `already` if the user already reported it. Local mode does not use this —
 * `PrayerContext` keeps its on-device report list there.
 */
export async function reportRequest(input: {
  reporterUid: string;
  requestId: string;
  requestAuthorUid: string;
  reason: ReportReason;
  notes?: string;
}): Promise<void> {
  return firebaseReportService.report(input);
}

/**
 * Account-deletion cleanup (Phase J.2h): delete ALL of the user's own report docs so the records that
 * identify them as the reporter are removed. Firebase mode only — in local mode reports live on-device
 * under the single local profile and there is no backend to clean, so this is a no-op. Reports filed
 * by OTHER users are never touched. Run while the user is still authenticated.
 */
export async function deleteMyReportsForAccountDeletion(reporterUid: string): Promise<void> {
  if (!useFirebase()) return;
  await firebaseReportService.deleteAllMine(reporterUid);
}
