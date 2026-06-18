import { FirebaseError } from 'firebase/app';

/**
 * Calm, safe, user-facing copy for prayer-request Firestore failures (Phase J.2e).
 *
 * Raw Firebase error codes/messages are never shown to users. Each operation maps to plain
 * language; a permission/auth problem nudges the user to sign in again, a transient network
 * problem asks them to check their connection, and anything else falls back to per-operation copy.
 * No em dashes in user-facing copy.
 */

export const PRAYER_ERROR_COPY = {
  load: 'We could not load prayer requests right now. Please try again.',
  create: 'We could not share your request right now. Please try again.',
  update: 'We could not update your request right now. Please try again.',
  remove: 'We could not remove your request right now. Please try again.',
  permission: 'We could not complete that request. Please try signing in again.',
  network: 'We could not connect right now. Please check your connection and try again.',
} as const;

export type PrayerOp = 'load' | 'create' | 'update' | 'remove';

/**
 * Maps a Firestore failure for a prayer-request operation to a safe Error with user-facing copy.
 * Never returns raw Firebase detail.
 */
export function prayerRequestError(op: PrayerOp, error: unknown): Error {
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'permission-denied':
    case 'unauthenticated':
      return new Error(PRAYER_ERROR_COPY.permission);
    case 'unavailable':
    case 'deadline-exceeded':
      return new Error(PRAYER_ERROR_COPY.network);
    default:
      return new Error(PRAYER_ERROR_COPY[op]);
  }
}
