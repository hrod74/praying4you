import { CONTENT_FILTER_MESSAGE, filterProhibitedContent } from './contentFilter.ts';
import { validatePrayerBody } from './validation.ts';

/**
 * Pure submission gate for the shared prayer-request form (`PrayerForm`).
 *
 * This is the smallest testable seam for Part 2 of pre-publication content filtering: a plain
 * function with no React Native dependency, so the ordering and fail-closed behavior can be
 * unit tested directly under Node, the same way `contentFilter.ts` is. `PrayerForm` calls this
 * once from its submit handler; both the create screen and the edit screen render `PrayerForm`,
 * so both get the same gate without either screen duplicating filtering logic.
 *
 * Order matters: the existing required-field and length check (`validatePrayerBody`) runs
 * first, exactly as before this feature existed. The content filter only runs once that check
 * has already passed, so a too-short or empty draft always surfaces the ordinary validation
 * message, never the content-filter message.
 *
 * No side effects: no persistence, no Firebase call, no logging, and the returned message never
 * includes the submitted text or the filter's internal reason category.
 *
 * Fails closed: if anything in here throws unexpectedly, the result is `blockedByFilter` with
 * the shared calm message, never `ready`.
 */
export type PrayerSubmissionGateResult =
  | { status: 'blockedByValidation'; message: string }
  | { status: 'blockedByFilter'; message: string }
  | { status: 'ready' };

export function evaluatePrayerSubmission(body: string): PrayerSubmissionGateResult {
  try {
    const validationError = validatePrayerBody(body);
    if (validationError) {
      return { status: 'blockedByValidation', message: validationError };
    }
    const filterResult = filterProhibitedContent(body);
    if (!filterResult.allowed) {
      return { status: 'blockedByFilter', message: filterResult.message };
    }
    return { status: 'ready' };
  } catch {
    return { status: 'blockedByFilter', message: CONTENT_FILTER_MESSAGE };
  }
}
