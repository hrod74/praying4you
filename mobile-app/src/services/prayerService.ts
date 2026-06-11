import { mockPrayers } from '../data/mockPrayers';
import type { PrayerRequest } from '../models/types';

/**
 * prayerService — the data-access seam for prayer requests.
 *
 * Screens and context call this module; it is the ONLY place that knows where prayer
 * data comes from. Today it reads from local mock data (`src/data/mockPrayers.ts`).
 * When the Firebase-backed MVP arrives, only this file changes — the queries here map
 * directly onto Firestore reads:
 *   - listActivePrayers()  ->  prayerRequests where status == "active", orderBy createdAt desc
 *   - getPrayerById(id)    ->  prayerRequests/{id}
 *
 * Functions are async (Promise-based) so the call sites already handle loading/error
 * the way they will against a real backend. Returned objects are copies, so callers
 * never mutate the underlying seed data.
 */

const byNewestFirst = (a: PrayerRequest, b: PrayerRequest): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/** Active prayer requests, newest first. Mirrors the prayer feed query. */
export async function listActivePrayers(): Promise<PrayerRequest[]> {
  const active = mockPrayers
    .filter((p) => p.status === 'active')
    .slice()
    .sort(byNewestFirst)
    .map((p) => ({ ...p }));
  return active;
}

/** A single prayer request by id, or null if it does not exist / is not active. */
export async function getPrayerById(id: string): Promise<PrayerRequest | null> {
  const found = mockPrayers.find((p) => p.id === id && p.status === 'active');
  return found ? { ...found } : null;
}
