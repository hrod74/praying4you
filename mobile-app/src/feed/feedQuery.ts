import type { PrayerCategory, PrayerRequest } from '../models/types';

/**
 * Pure feed sorting + filtering logic (Feed Scale Readiness phase).
 *
 * This module is deliberately framework-free (type-only imports) and side-effect-free so the
 * feed's sort/filter behavior can be reasoned about and unit-tested in isolation from React Native.
 * The Feed screen owns the control state and the live data; this module only DERIVES the visible
 * list from already-loaded requests. It never reads or mutates stored data, so changing sort or
 * filter can never alter what is in Firestore or on-device.
 *
 * Honesty note (pagination): these helpers operate over whatever list they are given. The Feed
 * loads the full set of ACTIVE requests, so for this pre-beta phase the client-side sort/filter
 * represents the complete active dataset, not a partial page. See
 * docs/QA_feed_sort_filter_performance.md for the documented pagination decision and the future
 * server-side query/index work to adopt before the active set grows large.
 */

/** The three supported sort orders. `newest` is the calm default. */
export type FeedSort = 'newest' | 'oldest' | 'mostPrayed';

/** Sentinel for "all categories" (no category filter applied). */
export const CATEGORY_ALL = 'all' as const;

/** The category filter value: a specific category key, or `all` for no category filter. */
export type FeedCategory = PrayerCategory | typeof CATEGORY_ALL;

/** The full feed-control state (one sort + a small set of independent, combinable filters). */
export interface FeedControls {
  sort: FeedSort;
  /** Category filter, or `all` for every category. */
  category: FeedCategory;
  /** Only requests the viewer has not yet prayed for (excludes the viewer's own requests). */
  onlyUnprayed: boolean;
  /** Only requests the viewer owns (backend ownership by userId; never by name). */
  onlyMine: boolean;
}

/** The calm starting point: newest first, no filters. */
export const DEFAULT_FEED_CONTROLS: FeedControls = {
  sort: 'newest',
  category: CATEGORY_ALL,
  onlyUnprayed: false,
  onlyMine: false,
};

/**
 * What the logic needs to know about the viewer to evaluate the "mine" and "unprayed" filters.
 * `hasPrayed` is the viewer's OWN prayed state for a request id; it never exposes who else prayed.
 */
export interface FeedViewerContext {
  /** The signed-in user's id (backend ownership match), or null when unknown. */
  userId: string | null;
  /** Whether the viewer has already prayed for the given request (own interaction data only). */
  hasPrayed: (requestId: string) => boolean;
}

/** Whether any FILTER is active (sort is not a filter). Drives the "filter active" indicator. */
export function isFeedFiltered(controls: FeedControls): boolean {
  return controls.category !== CATEGORY_ALL || controls.onlyUnprayed || controls.onlyMine;
}

/** Whether the controls differ from the calm default at all (a non-default sort OR any filter). */
export function isFeedCustomized(controls: FeedControls): boolean {
  return controls.sort !== DEFAULT_FEED_CONTROLS.sort || isFeedFiltered(controls);
}

const newestFirst = (a: PrayerRequest, b: PrayerRequest): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

const oldestFirst = (a: PrayerRequest, b: PrayerRequest): number =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

// Most prayed for, with newest as a stable tie-break so equal counts keep a sensible order.
const mostPrayedFirst = (a: PrayerRequest, b: PrayerRequest): number =>
  b.prayerCount - a.prayerCount || newestFirst(a, b);

function comparatorFor(sort: FeedSort): (a: PrayerRequest, b: PrayerRequest) => number {
  switch (sort) {
    case 'oldest':
      return oldestFirst;
    case 'mostPrayed':
      return mostPrayedFirst;
    case 'newest':
    default:
      return newestFirst;
  }
}

/**
 * Derive the visible feed from the loaded requests, applying every active filter and then the sort.
 *
 * Rules:
 *  - Removed requests NEVER appear (defensive: the data layer already excludes them).
 *  - Filters combine (AND): a request must satisfy every active filter.
 *  - "My requests" matches by backend ownership (userId), never by display name.
 *  - "Not prayed for" excludes the viewer's OWN requests (you cannot pray for your own), so the
 *    filter only ever surfaces other people's requests the viewer can still pray for.
 *  - Sorting is applied to a COPY, so the input array is never mutated.
 */
export function applyFeedControls(
  prayers: PrayerRequest[],
  controls: FeedControls,
  viewer: FeedViewerContext,
): PrayerRequest[] {
  const filtered = prayers.filter((p) => {
    // Removed requests must never appear, regardless of any other control.
    if (p.status === 'removed') return false;

    if (controls.category !== CATEGORY_ALL && p.category !== controls.category) return false;

    const isOwn = Boolean(viewer.userId && p.userId === viewer.userId);

    if (controls.onlyMine && !isOwn) return false;

    if (controls.onlyUnprayed) {
      // Own requests are not prayable, so they are not "still to pray for".
      if (isOwn) return false;
      if (viewer.hasPrayed(p.id)) return false;
    }

    return true;
  });

  // Copy before sorting so we never mutate the caller's array (it may be memoized React state).
  return filtered.slice().sort(comparatorFor(controls.sort));
}
