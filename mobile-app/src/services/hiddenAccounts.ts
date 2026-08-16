import AsyncStorage from '@react-native-async-storage/async-storage';

import { isFirebaseConfigured } from '../config/firebaseConfig';
import { firebaseHiddenAccountService } from './firebase/hiddenAccountService';
import { HiddenAccountError } from './firebase/hiddenAccountErrors';
import {
  HiddenAccountStorageCorruptedError,
  parseStoredHiddenAccounts,
} from '../utils/hiddenAccountStorage';
import type { HiddenAccount } from '../models/types';

/**
 * Mode-aware "Hide requests from this account" seam.
 *
 * This is the ONE place that decides where hidden-account records live:
 *  - Firebase mode (when `EXPO_PUBLIC_FIREBASE_*` is configured): writes a private per-user
 *    record to the Firestore `hiddenAccounts` collection via `firebaseHiddenAccountService`.
 *  - Local mode (no config): an on-device list under a namespaced AsyncStorage key, following the
 *    same pattern as the other local prototype data in `src/services/prayerService.ts`.
 *
 * An account-level hide is a private safety record: never listed publicly, never readable by
 * anyone but the person who hid the account, and it never stores an email, prayer-request text,
 * the real name behind an anonymous post, device information, or a reason. See
 * `docs/firebase-hidden-accounts-implementation.md` for the full design.
 */

/** On-device storage key (local prototype only; no secrets, no email). Namespaced like `p4u.*`. */
const HIDDEN_KEY = 'p4u.hiddenAccounts';

const useFirebase = (): boolean => isFirebaseConfigured();

/** Whether hidden accounts are Firebase-backed in the current mode (else local/mock). */
export function hiddenAccountsUseFirebase(): boolean {
  return useFirebase();
}

/**
 * Read the local hidden-account list. FAILS CLOSED: an AsyncStorage read failure throws a safe
 * `HiddenAccountError` (never silently returns []); the raw result is then handed to
 * `parseStoredHiddenAccounts`, which also fails closed on malformed JSON or an invalid stored
 * shape, and only returns [] for the legitimate "the key has never been written" case. Callers
 * (the mode-aware functions below, and PrayerContext.load) let all of this propagate; it is never
 * swallowed here.
 */
async function readLocalHidden(): Promise<HiddenAccount[]> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(HIDDEN_KEY);
  } catch {
    throw new HiddenAccountError('generic');
  }
  try {
    return parseStoredHiddenAccounts(raw);
  } catch (error) {
    if (error instanceof HiddenAccountStorageCorruptedError) {
      throw new HiddenAccountError('generic');
    }
    throw error;
  }
}

/**
 * Replace the stored local hidden-account list. Throws a safe `HiddenAccountError` if the write
 * does not persist, so callers (which always await this before updating in-memory state or
 * reporting success) never claim a hide or unhide succeeded when it was not actually saved.
 */
async function writeLocalHidden(list: HiddenAccount[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify(list));
  } catch {
    throw new HiddenAccountError('generic');
  }
}

export interface HideAccountInput {
  blockerUid: string;
  hiddenUid: string;
  /** Whether the triggering request was shown as Anonymous. */
  fromAnonymous: boolean;
  /** Only set when the triggering request showed a public display name (never for Anonymous). */
  displayLabelSnapshot?: string;
}

/**
 * Hide all current and future prayer requests from an account, for the given blocker. Idempotent:
 * hiding an already-hidden account is a harmless no-op, never an error. Self-hide is rejected
 * defensively (the UI never offers this).
 */
export async function hideAccount(input: HideAccountInput): Promise<void> {
  if (input.blockerUid === input.hiddenUid) {
    throw new HiddenAccountError('ownAccount');
  }
  if (useFirebase()) {
    await firebaseHiddenAccountService.hide(input);
    return;
  }
  // Local: append to the on-device list unless already present (idempotent, same as Firebase).
  const list = await readLocalHidden();
  if (list.some((h) => h.hiddenUid === input.hiddenUid)) return;
  const trimmedLabel = input.displayLabelSnapshot?.trim();
  const entry: HiddenAccount = {
    id: `${input.blockerUid}_${input.hiddenUid}`,
    hiddenUid: input.hiddenUid,
    createdAt: new Date().toISOString(),
    fromAnonymous: input.fromAnonymous,
    ...(trimmedLabel ? { displayLabelSnapshot: trimmedLabel } : {}),
  };
  await writeLocalHidden([...list, entry]);
}

/**
 * The signed-in user's own hidden-account list (own outgoing hides only), for the "Hidden
 * accounts" Settings section and for filtering the feed. Both modes let a load failure
 * PROPAGATE, never a silent fallback to []: a caller that needs hidden requests to stay hidden
 * can fail safely instead of showing an unfiltered feed. See PrayerContext.load, which relies on
 * this in both Firebase and local mode.
 */
export async function listMyHiddenAccounts(blockerUid: string): Promise<HiddenAccount[]> {
  if (useFirebase()) {
    const stored = await firebaseHiddenAccountService.listMine(blockerUid);
    return stored.map((s) => ({
      id: s.id,
      hiddenUid: s.hiddenUid,
      createdAt: s.createdAt ?? new Date(0).toISOString(),
      fromAnonymous: s.fromAnonymous,
      ...(s.displayLabelSnapshot ? { displayLabelSnapshot: s.displayLabelSnapshot } : {}),
    }));
  }
  return readLocalHidden();
}

/** Reverse a hide ("Unhide"). Idempotent: unhiding an account that is not hidden is a no-op. */
export async function unhideAccount(blockerUid: string, hiddenUid: string): Promise<void> {
  if (useFirebase()) {
    await firebaseHiddenAccountService.unhide(blockerUid, hiddenUid);
    return;
  }
  const list = await readLocalHidden();
  await writeLocalHidden(list.filter((h) => h.hiddenUid !== hiddenUid));
}

/**
 * Account-deletion cleanup: delete ALL of the user's own OUTGOING hide records so the records
 * that identify them as having hidden someone are removed.
 *  - Firebase mode: deletes each of the user's own `hiddenAccounts` documents.
 *  - Local mode: removes the entire on-device `p4u.hiddenAccounts` key. Local mode has only a
 *    single simulated profile, so there is no other user's outgoing hides stored under this key
 *    that would need to be preserved.
 * In both modes this throws on failure (never swallowed here) so the caller's existing
 * best-effort cleanup wrapper (Firebase: `cleanupBestEffort`; local: the inline try/catch in
 * `AuthContext.deleteAccount`'s local branch) can log and continue, consistent with how
 * `deleteMyReportsForAccountDeletion` / `deleteMyInteractionsForAccountDeletion` are already
 * handled. INCOMING hides (other users' hides of the deleting account) are never touched here, in
 * either mode; see the implementation doc for why.
 */
export async function deleteMyHiddenAccountsForAccountDeletion(blockerUid: string): Promise<void> {
  if (useFirebase()) {
    await firebaseHiddenAccountService.deleteAllMine(blockerUid);
    return;
  }
  try {
    await AsyncStorage.removeItem(HIDDEN_KEY);
  } catch {
    throw new HiddenAccountError('generic');
  }
}
