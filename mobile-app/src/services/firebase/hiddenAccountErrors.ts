import { FirebaseError } from 'firebase/app';

/**
 * Calm, safe, user-facing copy for "Hide requests from this account" failures.
 *
 * Raw Firebase error codes/messages are never shown to users. Hidden-account records are a
 * private per-user safety record (no client list/read of anyone else's), so copy never reveals
 * who hid or was hidden. No em dashes in user-facing copy.
 */

export const HIDDEN_ACCOUNT_ERROR_COPY = {
  /** The hide or unhide could not be written. */
  generic: 'We could not update this right now. Please try again.',
  /** Defensive: a user cannot hide their own account (the UI also prevents this). */
  ownAccount: 'You cannot hide your own account.',
  /** The triggering request could not be found (e.g. already removed). */
  unavailable: 'This prayer request is no longer available.',
  /** Lost connection mid-flow. */
  network: 'We could not connect right now. Please check your connection and try again.',
  /** Rules blocked the write, or the session went stale. */
  permission: 'We could not complete that request. Please try signing in again.',
} as const;

/** A short, stable reason code so the UI can branch. */
export type HiddenAccountErrorCode = keyof typeof HIDDEN_ACCOUNT_ERROR_COPY;

/**
 * Error raised by the hide/unhide flow. Carries already-safe user-facing copy in `message` plus a
 * `code` the UI can branch on. No raw Firebase detail is exposed.
 */
export class HiddenAccountError extends Error {
  readonly code: HiddenAccountErrorCode;
  constructor(code: HiddenAccountErrorCode, message: string = HIDDEN_ACCOUNT_ERROR_COPY[code]) {
    super(message);
    this.name = 'HiddenAccountError';
    this.code = code;
  }
}

/**
 * Maps any hide/unhide failure to a safe HiddenAccountError. A `HiddenAccountError` thrown
 * intentionally inside the flow (e.g. `ownAccount`, `unavailable`) is passed through; Firestore
 * codes map to permission/network; anything else falls back to generic copy.
 */
export function hiddenAccountError(error: unknown): HiddenAccountError {
  if (error instanceof HiddenAccountError) return error;
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'permission-denied':
    case 'unauthenticated':
      return new HiddenAccountError('permission');
    case 'unavailable':
    case 'deadline-exceeded':
      return new HiddenAccountError('network');
    default:
      return new HiddenAccountError('generic');
  }
}
