import { FirebaseError } from 'firebase/app';

/**
 * Calm, safe, user-facing copy for prayer-request reporting failures (Phase J.2g).
 *
 * Raw Firebase error codes/messages are never shown to users. Reports are a private moderation
 * record (no client list/read of others), so copy never reveals who reported anything. No em dashes
 * in user-facing copy.
 */

export const REPORT_ERROR_COPY = {
  /** The report could not be written. */
  generic: 'We could not submit your report right now. Please try again.',
  /** The user already reported this request (idempotent; shown calmly). */
  already: 'Thank you. You have already reported this request.',
  /** The target request was removed or does not exist. */
  unavailable: 'This prayer request is no longer available.',
  /** Defensive: a user cannot report their own request (the UI also prevents this). */
  ownRequest: 'You cannot report your own request.',
  /** Lost connection mid-flow. */
  network: 'We could not connect right now. Please check your connection and try again.',
  /** Rules blocked the write, or the session went stale. */
  permission: 'We could not complete that request. Please try signing in again.',
} as const;

/** A short, stable reason code so the UI can branch (e.g. show the calm "already reported" state). */
export type ReportErrorCode = keyof typeof REPORT_ERROR_COPY;

/**
 * Error raised by the reporting flow. Carries already-safe user-facing copy in `message` plus a
 * `code` the UI can branch on. No raw Firebase detail is exposed.
 */
export class ReportError extends Error {
  readonly code: ReportErrorCode;
  constructor(code: ReportErrorCode, message: string = REPORT_ERROR_COPY[code]) {
    super(message);
    this.name = 'ReportError';
    this.code = code;
  }
}

/**
 * Maps any reporting failure to a safe ReportError. A `ReportError` thrown intentionally inside the
 * flow (e.g. `already`, `unavailable`) is passed through; Firestore codes map to permission/network;
 * anything else falls back to generic copy.
 */
export function reportError(error: unknown): ReportError {
  if (error instanceof ReportError) return error;
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'permission-denied':
    case 'unauthenticated':
      return new ReportError('permission');
    case 'unavailable':
    case 'deadline-exceeded':
      return new ReportError('network');
    default:
      return new ReportError('generic');
  }
}
