import { FirebaseError } from 'firebase/app';

/**
 * Maps Firebase Auth errors to calm, safe, user-facing copy (Phase J.2b).
 *
 * Raw Firebase error codes/messages are never shown to users (they can leak which field was
 * wrong or internal detail). Each known code maps to plain language; anything unknown falls back
 * to a generic message. No em dashes in user-facing copy.
 */

export const AUTH_ERROR_COPY = {
  /** Required exact copy for a duplicate email on sign-up / email change. */
  emailInUse:
    'That email is already connected to another profile. Please use a different email or sign in.',
  /** Wrong password / no such user / invalid credential. Do not disclose which field was wrong. */
  invalidCredentials: 'We could not sign you in. Check your email and password and try again.',
  invalidEmail: 'Please enter a valid email address.',
  weakPassword: 'Please choose a longer password. Use at least 6 characters.',
  network: 'We could not reach the server. Please check your connection and try again.',
  tooManyRequests: 'Too many attempts. Please wait a moment and try again.',
  generic: 'Something went wrong. Please try again.',
} as const;

/** Returns safe copy for any Auth error. Never returns raw Firebase detail. */
export function authErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'auth/email-already-in-use':
      return AUTH_ERROR_COPY.emailInUse;
    case 'auth/invalid-email':
      return AUTH_ERROR_COPY.invalidEmail;
    case 'auth/weak-password':
      return AUTH_ERROR_COPY.weakPassword;
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return AUTH_ERROR_COPY.invalidCredentials;
    case 'auth/network-request-failed':
      return AUTH_ERROR_COPY.network;
    case 'auth/too-many-requests':
      return AUTH_ERROR_COPY.tooManyRequests;
    default:
      return AUTH_ERROR_COPY.generic;
  }
}

/**
 * Calm, safe copy for account deletion (Phase J.2d). Raw Firebase detail is never shown.
 * No em dashes in user-facing copy.
 */
export const DELETE_ERROR_COPY = {
  /** Firebase needs a fresh sign-in before deleting (auth/requires-recent-login). */
  requiresRecentLogin: 'For your security, please sign in again before deleting your account.',
  /** Lost connection mid-flow (auth or Firestore). */
  network: 'We could not connect right now. Please check your connection and try again.',
  /** Firestore rules blocked the profile delete, or the session went stale. */
  permission: 'We could not complete that request. Please try signing in again.',
  /** Anything else. */
  generic: 'We could not delete your account right now. Please try again.',
} as const;

/**
 * Error raised by the account-deletion flow. Carries already-safe user-facing copy in `message`
 * plus `requiresRecentLogin`, which the Settings screen uses to guide the user to sign in again
 * (Firebase requires a recent login before deleting a user). No raw Firebase detail is exposed.
 */
export class AccountDeletionError extends Error {
  readonly requiresRecentLogin: boolean;
  constructor(message: string, requiresRecentLogin = false) {
    super(message);
    this.name = 'AccountDeletionError';
    this.requiresRecentLogin = requiresRecentLogin;
  }
}

/**
 * Maps any deletion failure (Firebase Auth or Firestore) to a safe AccountDeletionError.
 * Handles both Auth codes (e.g. `auth/requires-recent-login`) and Firestore codes
 * (`permission-denied`, `unavailable`). Unknown errors fall back to generic copy.
 */
export function accountDeletionError(error: unknown): AccountDeletionError {
  if (error instanceof AccountDeletionError) return error;
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'auth/requires-recent-login':
      return new AccountDeletionError(DELETE_ERROR_COPY.requiresRecentLogin, true);
    case 'auth/network-request-failed':
    case 'unavailable':
    case 'deadline-exceeded':
      return new AccountDeletionError(DELETE_ERROR_COPY.network);
    case 'permission-denied':
    case 'unauthenticated':
      return new AccountDeletionError(DELETE_ERROR_COPY.permission);
    default:
      return new AccountDeletionError(DELETE_ERROR_COPY.generic);
  }
}
