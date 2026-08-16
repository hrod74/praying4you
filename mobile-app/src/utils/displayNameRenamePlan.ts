/**
 * Pure selection and batch-planning logic for propagating a display-name rename to every active,
 * non-Anonymous prayer request an account owns.
 *
 * A display name represents the account's current public identity: when it changes, every
 * active, non-Anonymous request that account owns must show the new name. Anonymous requests
 * must always remain "Anonymous", and removed requests are never touched since they are not
 * publicly visible.
 *
 * This module has no side effects and no dependency on Firebase, AsyncStorage, or React Native,
 * so both the Firebase-backed propagation (`../services/firebase/displayNameRenameService.ts`)
 * and the local/mock propagation (`../services/prayerService.ts`) call the exact same selection
 * function, guaranteeing identical selection rules in both modes rather than two independently
 * maintained copies of the same logic.
 */

/** The minimal shape needed to decide whether a stored request is eligible for rename propagation. */
export interface RenamePropagationCandidate {
  id: string;
  userId: string;
  isAnonymous: boolean;
  /** The request's STORED status ('active' or 'removed'; never the UI-only 'flagged' label). */
  status: string;
}

/**
 * Whether a stored request should have its cached display name propagated: owned by the
 * renaming account, not Anonymous, and currently active. A request that has reports and is
 * shown as "flagged" in the UI is still stored as 'active' and is still publicly visible, so it
 * remains eligible; only a genuinely removed request is excluded.
 */
export function isEligibleForDisplayNameRename(
  request: RenamePropagationCandidate,
  ownerId: string,
): boolean {
  return request.userId === ownerId && !request.isAnonymous && request.status === 'active';
}

/** Filters a list of stored requests down to the ones eligible for rename propagation. */
export function selectRequestsForDisplayNameRename<T extends RenamePropagationCandidate>(
  requests: T[],
  ownerId: string,
): T[] {
  return requests.filter((request) => isEligibleForDisplayNameRename(request, ownerId));
}

/**
 * Firestore caps a single write batch at 500 operations. One write is always the private profile
 * doc, leaving at most this many matching request writes in the same atomic batch.
 */
export const MAX_NAMED_REQUESTS_FOR_ATOMIC_RENAME = 499;

/**
 * The single calm, safe message shown when propagating a display-name rename fails or cannot
 * proceed, in either mode. Never names a Firebase code, a document id, a count, or any other
 * internal detail.
 */
export const RENAME_PROPAGATION_ERROR_MESSAGE =
  'We could not update your name everywhere it appears right now. Please try again.';

/** One write in the planned batch: the document path, and the fields it changes. */
export interface RenameBatchWrite {
  path: string;
  /** Only `displayName` is planned here; the caller adds `updatedAt` uniformly at write time. */
  data: { displayName: string };
}

export type RenameBatchPlan =
  | { status: 'tooManyRequests' }
  | { status: 'ok'; writes: RenameBatchWrite[] };

/**
 * Plans the atomic rename batch: one write for the private profile doc, plus one write for each
 * matching request id, all setting `displayName` to the same trimmed value. Returns
 * `tooManyRequests` (and plans no writes at all) if the number of matching requests would push
 * the batch over Firestore's 500-operation cap, so the caller can refuse cleanly before ever
 * attempting a write, rather than performing a partially-successful multi-batch rename.
 *
 * Pure and deterministic: the same inputs always produce the same plan, which is what makes
 * retrying an unfinished or failed rename with the same desired name safe. Every write in the
 * plan sets an absolute value, never a delta, so re-applying the same plan has no additional
 * effect beyond the first time.
 */
export function planDisplayNameRenameBatch(
  uid: string,
  displayName: string,
  matchingRequestIds: string[],
): RenameBatchPlan {
  if (matchingRequestIds.length > MAX_NAMED_REQUESTS_FOR_ATOMIC_RENAME) {
    return { status: 'tooManyRequests' };
  }
  const trimmed = displayName.trim();
  return {
    status: 'ok',
    writes: [
      { path: `users/${uid}`, data: { displayName: trimmed } },
      ...matchingRequestIds.map((id) => ({ path: `prayerRequests/${id}`, data: { displayName: trimmed } })),
    ],
  };
}
