import { isFirebaseConfigured } from '../config/firebaseConfig';
import { firebasePrayerInteractionService } from './firebase/prayerInteractionService';

/**
 * Mode-aware prayer-interaction seam (Phase J.2f.3).
 *
 * This is the ONE place that decides where "I prayed for this" data lives:
 *  - Firebase mode (when `EXPO_PUBLIC_FIREBASE_*` is configured): reads/writes the Firestore
 *    `prayerInteractions` collection (one doc per user+request) and increments the request's
 *    aggregate `prayerCount`, via `firebasePrayerInteractionService`.
 *  - Local mode (no config): the original local/mock interaction behavior owned by `PrayerContext`
 *    + `prayerService`, so the prototype still runs with no `.env.local`.
 *
 * Interactions are AGGREGATE-ONLY to other users: the only cross-user signal is the count. There is
 * deliberately no "who prayed" data anywhere here, and no email is ever stored on an interaction.
 */

const useFirebase = (): boolean => isFirebaseConfigured();

/** Whether interactions are Firebase-backed in the current mode (else local/mock in PrayerContext). */
export function interactionsUseFirebase(): boolean {
  return useFirebase();
}

/**
 * Record a one-per-user prayer for a request (Firebase mode). Creates the interaction doc and
 * increments the request's `prayerCount` atomically. Idempotent: returns `{ created: false }` if the
 * user had already prayed (no double-count). Throws a `PrayerInteractionError` with safe copy on
 * failure (e.g. the request is no longer available). Local mode does not use this — `PrayerContext`
 * keeps its on-device interaction list there.
 */
export async function prayForRequest(
  userUid: string,
  requestId: string,
): Promise<{ created: boolean }> {
  return firebasePrayerInteractionService.pray(userUid, requestId);
}

/**
 * The ids of requests the signed-in user has prayed for (Firebase mode), for hydrating their
 * already-prayed state and the "Prayers I've prayed for" list. Own records only; never who-prayed
 * data about anyone else.
 */
export async function listMyPrayedRequestIds(userUid: string): Promise<string[]> {
  return firebasePrayerInteractionService.listMinePrayedFor(userUid);
}
