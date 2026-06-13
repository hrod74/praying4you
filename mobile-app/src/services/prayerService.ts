import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockPrayers } from '../data/mockPrayers';
import type {
  PrayerCategory,
  PrayerInteraction,
  PrayerRequest,
  Report,
  ReportReason,
} from '../models/types';

/**
 * prayerService — the data-access seam for prayer requests.
 *
 * Screens and context call this module; it is the ONLY place that knows where prayer
 * data comes from. Today it reads from bundled mock data (`src/data/mockPrayers.ts`) and
 * layers any locally-submitted requests / interactions / reports on top from on-device
 * storage (AsyncStorage). When the Firebase-backed MVP arrives, only this file changes —
 * the queries here map directly onto Firestore reads:
 *   - listActivePrayers()  ->  prayerRequests where status == "active", orderBy createdAt desc
 *   - getPrayerById(id)    ->  prayerRequests/{id}
 *
 * Functions are async (Promise-based) so the call sites already handle loading/error
 * the way they will against a real backend. Returned objects are copies, so callers
 * never mutate the underlying seed data.
 *
 * Local persistence (Phase H): submitted prayers, "I prayed for this" interactions, and
 * reports survive app restarts so demos feel less fragile. Stored records always hold
 * BASE values (submitted requests at count 0); the displayed prayer/report counts are
 * derived in PrayerContext from the interaction/report lists, so a refresh or restart can
 * never double-count. Storage is best-effort: a failure degrades to seed-only, never a
 * crash. Nothing private is stored here — no email ever touches prayer/interaction/report
 * data. Keys are namespaced `p4u.*`, matching the local profile keys in AuthContext.
 *
 * Owner controls (Phase H.1): the owner of a request can edit or remove it.
 *   - Edits are stored as per-id OVERRIDES (body/category/anonymous + cached name) layered
 *     on top of the base record, so editing a seed request works without mutating the seed.
 *   - Remove is a SOFT remove: the id is added to a removed-by-owner set and filtered out of
 *     feeds and detail. Records are never hard-deleted, mirroring the future Firebase
 *     `removedByOwner` status. Reset clears overrides and removals back to the seed.
 */

// On-device storage keys (local prototype only; no secrets, no email).
const SUBMITTED_KEY = 'p4u.prayers'; // locally-submitted requests (base records)
const INTERACTIONS_KEY = 'p4u.interactions'; // "I prayed for this" records
const REPORTS_KEY = 'p4u.reports'; // local report records
const OVERRIDES_KEY = 'p4u.overrides'; // owner edits, keyed by request id
const REMOVED_KEY = 'p4u.removed'; // request ids soft-removed by their owner

/** Parse a stored JSON array, returning [] on any absence/corruption (best-effort). */
async function readArray<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Persist an array as JSON (best-effort; a failure is non-fatal for the session). */
async function writeArray<T>(key: string, value: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Non-fatal: the session keeps working, just not across restarts.
  }
}

const byNewestFirst = (a: PrayerRequest, b: PrayerRequest): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/** Locally-submitted prayer requests (base records), as stored. */
export async function loadSubmittedPrayers(): Promise<PrayerRequest[]> {
  return readArray<PrayerRequest>(SUBMITTED_KEY);
}

/** Replace the stored set of locally-submitted prayer requests. */
export async function saveSubmittedPrayers(list: PrayerRequest[]): Promise<void> {
  await writeArray(SUBMITTED_KEY, list);
}

/** Stored "I prayed for this" interactions. */
export async function loadInteractions(): Promise<PrayerInteraction[]> {
  return readArray<PrayerInteraction>(INTERACTIONS_KEY);
}

/** Replace the stored set of interactions. */
export async function saveInteractions(list: PrayerInteraction[]): Promise<void> {
  await writeArray(INTERACTIONS_KEY, list);
}

/** Stored local reports. */
export async function loadReports(): Promise<Report[]> {
  return readArray<Report>(REPORTS_KEY);
}

/** Replace the stored set of reports. */
export async function saveReports(list: Report[]): Promise<void> {
  await writeArray(REPORTS_KEY, list);
}

/**
 * An owner's edit to a single request, layered over the base record by id. Stored
 * separately so editing a seed request never mutates the bundled seed data.
 */
export interface PrayerOverride {
  body?: string;
  category?: PrayerCategory;
  isAnonymous?: boolean;
  /** Cached display name, recomputed on edit ("Anonymous" when posting anonymously). */
  displayName?: string;
}

/** Stored owner edits, keyed by request id (best-effort; {} on absence/corruption). */
export async function loadOverrides(): Promise<Record<string, PrayerOverride>> {
  try {
    const raw = await AsyncStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, PrayerOverride>)
      : {};
  } catch {
    return {};
  }
}

/** Replace the stored map of owner edits. */
export async function saveOverrides(map: Record<string, PrayerOverride>): Promise<void> {
  try {
    await AsyncStorage.setItem(OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    // Non-fatal.
  }
}

/** Request ids the owner has soft-removed (hidden from feeds/detail, never hard-deleted). */
export async function loadRemovedIds(): Promise<string[]> {
  return readArray<string>(REMOVED_KEY);
}

/** Replace the stored set of owner-removed request ids. */
export async function saveRemovedIds(ids: string[]): Promise<void> {
  await writeArray(REMOVED_KEY, ids);
}

/** Layer an owner edit onto a base record (only the edited fields change). */
function applyOverride(p: PrayerRequest, override?: PrayerOverride): PrayerRequest {
  if (!override) return p;
  return {
    ...p,
    body: override.body ?? p.body,
    category: override.category ?? p.category,
    isAnonymous: override.isAnonymous ?? p.isAnonymous,
    displayName: override.displayName ?? p.displayName,
  };
}

/**
 * Clear all locally-stored prototype activity (submitted requests, interactions, reports,
 * owner edits, and soft-removals). The local profile is owned by AuthContext and is
 * intentionally left untouched, so a reset returns the feed to the original seed.
 */
export async function clearLocalPrayerData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      SUBMITTED_KEY,
      INTERACTIONS_KEY,
      REPORTS_KEY,
      OVERRIDES_KEY,
      REMOVED_KEY,
    ]);
  } catch {
    // Non-fatal.
  }
}

/**
 * Active prayer requests, newest first. Mirrors the prayer feed query, layering any
 * locally-submitted requests on top of the bundled seed. Submitted requests win on id
 * collision (defensive dedupe), so a refresh/restart never produces duplicate rows. Owner
 * edits are applied per id, and owner-removed ids are filtered out (soft remove).
 */
export async function listActivePrayers(): Promise<PrayerRequest[]> {
  const [submitted, overrides, removedIds] = await Promise.all([
    loadSubmittedPrayers(),
    loadOverrides(),
    loadRemovedIds(),
  ]);
  const removed = new Set(removedIds);
  const seen = new Set<string>();
  const merged: PrayerRequest[] = [];
  for (const p of [...submitted, ...mockPrayers]) {
    if (seen.has(p.id) || p.status === 'removed' || removed.has(p.id)) continue;
    seen.add(p.id);
    merged.push(applyOverride({ ...p }, overrides[p.id]));
  }
  return merged.sort(byNewestFirst);
}

/**
 * A single prayer request by id, or null if it does not exist / is removed (including a
 * soft remove by its owner). Checks locally-submitted requests first, then the seed (a
 * self-sufficient fallback for the detail screen on a direct link). Owner edits are applied;
 * returns a BASE record otherwise — live counts are derived in PrayerContext.
 */
export async function getPrayerById(id: string): Promise<PrayerRequest | null> {
  const [submitted, overrides, removedIds] = await Promise.all([
    loadSubmittedPrayers(),
    loadOverrides(),
    loadRemovedIds(),
  ]);
  if (removedIds.includes(id)) return null;
  const found =
    submitted.find((p) => p.id === id) ??
    mockPrayers.find((p) => p.id === id && p.status === 'active');
  return found ? applyOverride({ ...found }, overrides[id]) : null;
}

/**
 * Input for creating a new prayer request. The owner (userId) and the owner's display
 * name are always supplied — ownership is retained even when posting anonymously.
 */
export interface NewPrayerInput {
  userId: string;
  /** The owner's display name (cached). Ignored for display when isAnonymous is true. */
  displayName: string;
  isAnonymous: boolean;
  body: string;
  category: PrayerCategory;
}

/** Generate a unique local id for a newly created prayer (prototype only). */
function generateLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create a new prayer request (local/mock). Mirrors a Firestore `add` that returns the
 * created document: it assigns the id/timestamp/initial counters and caches the display
 * name ("Anonymous" when posting anonymously, per the PRD). When Firebase replaces this
 * seam, only this function changes — call sites stay the same.
 */
export async function createPrayer(input: NewPrayerInput): Promise<PrayerRequest> {
  return {
    id: generateLocalId(),
    userId: input.userId,
    isAnonymous: input.isAnonymous,
    displayName: input.isAnonymous ? 'Anonymous' : input.displayName,
    body: input.body.trim(),
    category: input.category,
    createdAt: new Date().toISOString(),
    status: 'active',
    prayerCount: 0,
    reportCount: 0,
  };
}

/** Stable, one-per-user-per-request key (mirrors the PRD interaction doc id). */
export function interactionKey(userId: string, requestId: string): string {
  return `${userId}_${requestId}`;
}

/**
 * Record an "I prayed for this" interaction (local/mock). Mirrors the future Firestore
 * write: create `prayerInteractions/{userId}_{requestId}` (existence = the user prayed)
 * and atomically `FieldValue.increment(prayerCount)` on the parent request. Here it just
 * returns the interaction record; the context applies the local count increment. When
 * Firebase replaces this seam, only this function changes.
 */
export async function recordPrayerInteraction(
  userId: string,
  requestId: string,
): Promise<PrayerInteraction> {
  return {
    userId,
    requestId,
    prayedAt: new Date().toISOString(),
  };
}

/** Input for reporting a prayer request. */
export interface NewReportInput {
  requestId: string;
  reportedBy: string;
  reason: ReportReason;
  /** Optional free-text note (<= 300 chars). */
  notes?: string;
}

/**
 * Record a report against a prayer request (local/mock). Mirrors the future Firestore
 * write: create a `reports` document and `FieldValue.increment(reportCount)` on the target
 * request (the context applies the local count/status change). No real moderation backend
 * exists in the prototype. When Firebase replaces this seam, only this function changes.
 */
export async function recordReport(input: NewReportInput): Promise<Report> {
  return {
    id: generateLocalId(),
    requestId: input.requestId,
    reportedBy: input.reportedBy,
    reason: input.reason,
    notes: input.notes?.trim() ? input.notes.trim() : undefined,
    createdAt: new Date().toISOString(),
  };
}
