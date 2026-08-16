import type { PrayerRequest } from '../models/types';

/**
 * Pure hidden-account filtering ("Hide requests from this account"; see
 * `docs/firebase-hidden-accounts-implementation.md`).
 *
 * Framework-free and side-effect-free (type-only imports), mirroring `src/feed/feedQuery.ts`, so
 * the exact "which requests disappear" logic can be unit-tested in isolation from React Native
 * and Firebase. `PrayerContext` calls this once when deriving the displayed `prayers` list from
 * `baseline`; it never reads or writes stored data itself, and it never looks at `isAnonymous`:
 * a hidden account's requests are removed the same way whether posted with a name or anonymously.
 */

/**
 * Every request authored by an account in `hiddenUids`, removed. Preserves order and does not
 * mutate `requests`. Returns the same array reference when there is nothing to filter, so an
 * unchanged hidden-account set does not defeat memoization upstream.
 */
export function filterHiddenAccounts(
  requests: PrayerRequest[],
  hiddenUids: ReadonlySet<string>,
): PrayerRequest[] {
  if (hiddenUids.size === 0) return requests;
  return requests.filter((p) => !hiddenUids.has(p.userId));
}
