import { FirebaseError } from 'firebase/app';

/**
 * Calm, safe, user-facing copy for prayer-interaction ("I prayed for this") failures (Phase J.2f.3).
 *
 * Raw Firebase error codes/messages are never shown to users. A permission/auth problem nudges the
 * user to sign in again, a transient network problem asks them to check their connection, a removed
 * or missing request is reported gently, and anything else falls back to generic copy. No em dashes
 * in user-facing copy. There is deliberately no copy that could reveal who prayed for a request.
 */

export const INTERACTION_ERROR_COPY = {
  /** The interaction/increment could not be written. */
  generic: 'We could not mark this as prayed for right now. Please try again.',
  /** An accidental prayer action could not be corrected. */
  undoGeneric: 'We could not correct that prayer action right now. Please try again.',
  /** The user has already prayed for this request (idempotent; usually handled silently in the UI). */
  already: 'You have already prayed for this request.',
  /** The target request was removed or does not exist. */
  unavailable: 'This prayer request is no longer available.',
  /** Lost connection mid-flow. */
  network: 'We could not connect right now. Please check your connection and try again.',
  /** Rules blocked the write, or the session went stale. */
  permission: 'We could not complete that request. Please try signing in again.',
} as const;

/** A short, stable reason code so callers can branch (e.g. "already"/"unavailable") if needed. */
export type InteractionErrorCode = keyof typeof INTERACTION_ERROR_COPY;

/**
 * Error raised by the prayer-interaction flow. Carries already-safe user-facing copy in `message`
 * plus a `code` the UI can branch on. No raw Firebase detail is exposed.
 */
export class PrayerInteractionError extends Error {
  readonly code: InteractionErrorCode;
  constructor(code: InteractionErrorCode, message: string = INTERACTION_ERROR_COPY[code]) {
    super(message);
    this.name = 'PrayerInteractionError';
    this.code = code;
  }
}

/**
 * Maps any prayer-interaction failure to a safe PrayerInteractionError. A `PrayerInteractionError`
 * thrown intentionally inside the flow (e.g. the request is not active) is passed through unchanged;
 * Firestore codes map to permission/network; anything else falls back to generic copy.
 */
export function prayerInteractionError(error: unknown): PrayerInteractionError {
  if (error instanceof PrayerInteractionError) return error;
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'permission-denied':
    case 'unauthenticated':
      return new PrayerInteractionError('permission');
    case 'unavailable':
    case 'deadline-exceeded':
      return new PrayerInteractionError('network');
    default:
      return new PrayerInteractionError('generic');
  }
}
