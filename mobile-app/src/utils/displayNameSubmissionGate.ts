import { CONTENT_FILTER_MESSAGE, filterProhibitedContent } from './contentFilter.ts';
import { validateDisplayName } from './validation.ts';

/**
 * Pure submission gate for a public display name (Part 3A: account creation and Settings
 * profile editing).
 *
 * This mirrors `prayerSubmissionGate.ts`: a plain function with no React Native dependency, so
 * the ordering and fail-closed behavior can be unit tested directly under Node. Both the
 * account-creation screen and the Settings edit-profile form call this same function from their
 * submit handlers, before either one calls into `AuthContext` (which is what performs the
 * Firebase Auth / local-persistence write), so both are protected identically without either
 * screen duplicating the check.
 *
 * Order matters: the existing required-length-and-format check (`validateDisplayName`) runs
 * first, exactly as before this feature existed. The content filter only runs once that check
 * has already passed, so an empty or too-short/too-long name always surfaces the ordinary
 * validation message, never the content-filter message.
 *
 * No side effects: no persistence, no Firebase call, no logging, and the returned message never
 * includes the submitted name or the filter's internal reason category.
 *
 * Fails closed: if anything in here throws unexpectedly, the result is `blockedByFilter` with
 * the shared calm message, never `ready`.
 */
export type DisplayNameSubmissionGateResult =
  | { status: 'blockedByValidation'; message: string }
  | { status: 'blockedByFilter'; message: string }
  | { status: 'ready' };

export function evaluateDisplayNameSubmission(displayName: string): DisplayNameSubmissionGateResult {
  try {
    const validationError = validateDisplayName(displayName);
    if (validationError) {
      return { status: 'blockedByValidation', message: validationError };
    }
    const filterResult = filterProhibitedContent(displayName);
    if (!filterResult.allowed) {
      return { status: 'blockedByFilter', message: filterResult.message };
    }
    return { status: 'ready' };
  } catch {
    return { status: 'blockedByFilter', message: CONTENT_FILTER_MESSAGE };
  }
}
