import type { HiddenAccount } from '../models/types';

/**
 * Pure parsing and validation for the on-device "Hide requests from this account" storage
 * payload (see `docs/firebase-hidden-accounts-implementation.md`).
 *
 * Framework-free (only a type-only import), mirroring `src/feed/feedQuery.ts` and
 * `src/utils/hiddenAccountFilter.ts`, so the fail-closed corruption handling required for local
 * mode can be unit-tested in isolation under plain Node, with no AsyncStorage, React Native, or
 * cross-file value import to resolve. `src/services/hiddenAccounts.ts` owns the actual
 * AsyncStorage read/write, calls into this module to parse/validate what comes back, and maps a
 * thrown `HiddenAccountStorageCorruptedError` to the app's safe, user-facing `HiddenAccountError`.
 */

/**
 * Thrown when stored hidden-account data is corrupted or has an invalid shape. Deliberately not
 * `HiddenAccountError` itself, so this module stays free of any cross-file value import; the
 * caller in `src/services/hiddenAccounts.ts` maps it to `HiddenAccountError('generic')`.
 */
export class HiddenAccountStorageCorruptedError extends Error {
  constructor() {
    super('Stored hidden-account data is corrupted or has an invalid shape.');
    this.name = 'HiddenAccountStorageCorruptedError';
  }
}

/** Minimal structural check that a parsed value looks like a valid stored HiddenAccount record. */
export function isValidStoredHiddenAccount(value: unknown): value is HiddenAccount {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.hiddenUid === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.fromAnonymous === 'boolean' &&
    (v.displayLabelSnapshot === undefined || typeof v.displayLabelSnapshot === 'string')
  );
}

/**
 * Parse and validate the raw stored hidden-accounts payload (FAILS CLOSED).
 *
 * `null` (the storage key has never been written) correctly returns [], the legitimate "nothing
 * hidden yet" case. Any other value that is not valid JSON, or that does not parse to an array of
 * valid hidden-account records, is corruption, not "nothing hidden": this throws
 * `HiddenAccountStorageCorruptedError` rather than returning [], so corrupted or tampered local
 * storage can never silently show a previously-hidden account's requests again.
 */
export function parseStoredHiddenAccounts(raw: string | null): HiddenAccount[] {
  if (raw === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HiddenAccountStorageCorruptedError();
  }
  if (!Array.isArray(parsed) || !parsed.every(isValidStoredHiddenAccount)) {
    throw new HiddenAccountStorageCorruptedError();
  }
  return parsed;
}
