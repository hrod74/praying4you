/**
 * Pure validation helpers for the local profile form.
 *
 * Framework-agnostic and side-effect-free so they are easy to unit test later and to
 * reuse when real (Firebase) auth replaces the simulated local flow. They validate
 * shape only — there is no backend or account check in the prototype.
 */

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 40;

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
