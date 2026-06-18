import { isFirebaseConfigured } from '../config/firebaseConfig';
import { firebasePrayerRequestService } from './firebase/prayerRequestService';
import {
  createPrayer,
  getPrayerById,
  listActivePrayers,
  loadOverrides,
  loadRemovedIds,
  saveOverrides,
  saveRemovedIds,
  type NewPrayerInput,
} from './prayerService';
import type { PrayerCategory, PrayerRequest } from '../models/types';

/**
 * Mode-aware prayer-request seam (Phase J.2e).
 *
 * This is the ONE place that decides where prayer-request data lives:
 *  - Firebase mode (when `EXPO_PUBLIC_FIREBASE_*` is configured): reads/writes the Firestore
 *    `prayerRequests` collection via `firebasePrayerRequestService`.
 *  - Local mode (no config): the original local/mock behavior (`prayerService` + on-device
 *    overrides/removed-ids), so the prototype still runs with no `.env.local`.
 *
 * Only prayer REQUESTS are routed here. Prayer interactions ("I prayed for this") and reports stay
 * local/mock in both modes and are owned by `PrayerContext` / `prayerService`. The public display
 * name rule (anonymous shows "Anonymous"; the real name is never stored on an anonymous request)
 * is applied on the Firebase side; the local override path mirrors it here.
 */

/** Fields an owner may change when editing their own request (mirrors the local edit input). */
export interface EditRequestInput {
  body: string;
  category: PrayerCategory;
  isAnonymous: boolean;
  /** The owner's real display name, used as the public name when the request is not anonymous. */
  ownerDisplayName: string;
}

const useFirebase = (): boolean => isFirebaseConfigured();

/** Active prayer requests, newest first (feed). */
export async function listActiveRequests(): Promise<PrayerRequest[]> {
  return useFirebase() ? firebasePrayerRequestService.listActive() : listActivePrayers();
}

/** A single request by id, or null if missing / removed. Used by the detail screen's fallback. */
export async function getRequestById(id: string): Promise<PrayerRequest | null> {
  return useFirebase() ? firebasePrayerRequestService.getById(id) : getPrayerById(id);
}

/** Create a request (owner retained even when anonymous; never writes email; count starts at 0). */
export async function createRequest(input: NewPrayerInput): Promise<PrayerRequest> {
  return useFirebase() ? firebasePrayerRequestService.create(input) : createPrayer(input);
}

/** Owner-only edit of allowed fields. Firebase enforces ownership + protected fields via rules. */
export async function editRequest(
  requestId: string,
  userId: string,
  input: EditRequestInput,
): Promise<void> {
  if (useFirebase()) {
    await firebasePrayerRequestService.edit(requestId, userId, input);
    return;
  }
  // Local: persist a per-id override so editing a seed request never mutates the bundled seed.
  const displayName = input.isAnonymous ? 'Anonymous' : input.ownerDisplayName;
  const overrides = await loadOverrides();
  overrides[requestId] = {
    body: input.body.trim(),
    category: input.category,
    isAnonymous: input.isAnonymous,
    displayName,
  };
  await saveOverrides(overrides);
}

/** Owner-only soft remove (status -> removed; never a hard delete). */
export async function removeRequest(requestId: string, userId: string): Promise<void> {
  if (useFirebase()) {
    await firebasePrayerRequestService.remove(requestId, userId);
    return;
  }
  // Local: add the id to the soft-removed set (hidden from feed/detail; never hard-deleted).
  const removedIds = await loadRemovedIds();
  if (!removedIds.includes(requestId)) {
    await saveRemovedIds([...removedIds, requestId]);
  }
}

/**
 * Whether locally-submitted requests should be persisted to on-device storage after create
 * (local mode only). In Firebase mode the Firestore document is the source of truth, so there is
 * nothing to persist on-device.
 */
export function persistsRequestsLocally(): boolean {
  return !useFirebase();
}
