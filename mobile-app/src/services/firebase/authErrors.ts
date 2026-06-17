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
