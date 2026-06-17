/**
 * Pure validation helpers for the app's forms (profile, prayer submission).
 *
 * Framework-agnostic and side-effect-free so they are easy to unit test later and to
 * reuse when real (Firebase) services replace the simulated local flow. They validate
 * shape only — there is no backend in the prototype.
 */

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 40;

// Minimum password length. Mirrors Firebase Auth's own minimum (6) so the client check and the
// server agree. Only used when Firebase Auth is the active mode (email/password).
export const PASSWORD_MIN = 6;

// Prayer body length bounds (mirrors the PRD: 10–500 characters).
export const PRAYER_BODY_MIN = 10;
export const PRAYER_BODY_MAX = 500;

/** Pragmatic email shape check — intentionally simple, not RFC-exhaustive. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns a calm, plain-language error string, or null when the value is valid. */
export function validateDisplayName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Please enter a display name.';
  if (trimmed.length < DISPLAY_NAME_MIN) {
    return `Display name must be at least ${DISPLAY_NAME_MIN} characters.`;
  }
  if (trimmed.length > DISPLAY_NAME_MAX) {
    return `Display name must be ${DISPLAY_NAME_MAX} characters or fewer.`;
  }
  return null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Please enter your email.';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Please enter a valid email address.';
  return null;
}

/**
 * Validates a password for Firebase email/password sign-up. Returns a calm error string, or
 * null when valid. Not trimmed (spaces can be part of a password).
 */
export function validatePassword(value: string): string | null {
  if (value.length === 0) return 'Please enter a password.';
  if (value.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  return null;
}

/** Validates the prayer request body length. Returns an error string, or null if valid. */
export function validatePrayerBody(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Please write your prayer request.';
  if (trimmed.length < PRAYER_BODY_MIN) {
    return `Please write at least ${PRAYER_BODY_MIN} characters.`;
  }
  if (trimmed.length > PRAYER_BODY_MAX) {
    return `Please keep it to ${PRAYER_BODY_MAX} characters or fewer.`;
  }
  return null;
}
