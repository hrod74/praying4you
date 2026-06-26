import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  activeFilterCount,
  applyFeedControls,
  DEFAULT_FEED_CONTROLS,
  feedShowOf,
  isFeedCustomized,
  isFeedFiltered,
  withFeedShow,
  type FeedControls,
  type FeedViewerContext,
} from './feedQuery.ts';
import type { PrayerRequest } from '../models/types.ts';

/**
 * Pure unit tests for the feed sort/filter logic. Runs under Node's built-in test runner
 * (`node --test`), which strips the TypeScript types directly — no extra toolchain, and no
 * React Native, so the logic is validated in isolation. See package.json `test:feed`.
 */

// A tiny request factory so each case states only what it cares about.
function makeRequest(overrides: Partial<PrayerRequest> & { id: string }): PrayerRequest {
  return {
    id: overrides.id,
    userId: overrides.userId ?? 'someone-else',
    isAnonymous: overrides.isAnonymous ?? false,
    displayName: overrides.displayName ?? 'A Friend',
    body: overrides.body ?? 'Please pray.',
    category: overrides.category ?? 'other',
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    status: overrides.status ?? 'active',
    prayerCount: overrides.prayerCount ?? 0,
    reportCount: overrides.reportCount ?? 0,
  };
}

const ME = 'user-me';

// Four requests spanning dates, counts, categories, ownership, and a removed one.
const oldHealth = makeRequest({
  id: 'a',
  createdAt: '2026-01-01T00:00:00.000Z',
  category: 'health',
  prayerCount: 2,
});
const midFamily = makeRequest({
  id: 'b',
  createdAt: '2026-02-01T00:00:00.000Z',
  category: 'family',
  prayerCount: 9,
});
const newMine = makeRequest({
  id: 'c',
  createdAt: '2026-03-01T00:00:00.000Z',
  category: 'work',
  prayerCount: 1,
  userId: ME,
});
const removed = makeRequest({
  id: 'd',
  createdAt: '2026-04-01T00:00:00.000Z',
  category: 'health',
  status: 'removed',
});

const ALL = [oldHealth, midFamily, newMine, removed];

// Viewer: signed in as ME, has prayed for "b" (midFamily) only.
function viewer(prayedIds: string[] = []): FeedViewerContext {
  const set = new Set(prayedIds);
  return { userId: ME, hasPrayed: (id) => set.has(id) };
}

function controls(overrides: Partial<FeedControls> = {}): FeedControls {
  return { ...DEFAULT_FEED_CONTROLS, ...overrides };
}

const ids = (list: PrayerRequest[]): string[] => list.map((p) => p.id);

test('default feed is newest first and excludes removed requests', () => {
  const result = applyFeedControls(ALL, DEFAULT_FEED_CONTROLS, viewer());
  // newMine (Mar), midFamily (Feb), oldHealth (Jan); removed never appears.
  assert.deepEqual(ids(result), ['c', 'b', 'a']);
});

test('oldest sorting works', () => {
  const result = applyFeedControls(ALL, controls({ sort: 'oldest' }), viewer());
  assert.deepEqual(ids(result), ['a', 'b', 'c']);
});

test('most-prayed sorting works', () => {
  const result = applyFeedControls(ALL, controls({ sort: 'mostPrayed' }), viewer());
  // counts: b=9, a=2, c=1.
  assert.deepEqual(ids(result), ['b', 'a', 'c']);
});

test('category filtering works', () => {
  const result = applyFeedControls(ALL, controls({ category: 'health' }), viewer());
  // Only the active health request (the removed one is health but must stay hidden).
  assert.deepEqual(ids(result), ['a']);
});

test('unprayed filtering excludes prayed-for and own requests', () => {
  // Viewer prayed for "b"; "c" is their own. Only "a" remains to pray for.
  const result = applyFeedControls(ALL, controls({ onlyUnprayed: true }), viewer(['b']));
  assert.deepEqual(ids(result), ['a']);
});

test('my-requests filtering matches by ownership only', () => {
  const result = applyFeedControls(ALL, controls({ onlyMine: true }), viewer());
  assert.deepEqual(ids(result), ['c']);
});

test('multiple compatible controls work together', () => {
  // family category + most prayed: only "b" qualifies.
  const result = applyFeedControls(
    ALL,
    controls({ category: 'family', sort: 'mostPrayed' }),
    viewer(),
  );
  assert.deepEqual(ids(result), ['b']);
});

test('reset (default controls) restores the full newest-first feed', () => {
  const filtered = applyFeedControls(ALL, controls({ category: 'family' }), viewer());
  assert.deepEqual(ids(filtered), ['b']);
  const reset = applyFeedControls(ALL, DEFAULT_FEED_CONTROLS, viewer());
  assert.deepEqual(ids(reset), ['c', 'b', 'a']);
});

test('a filter combination with no matches yields an empty list', () => {
  // own + a category none of my requests use.
  const result = applyFeedControls(ALL, controls({ onlyMine: true, category: 'grief' }), viewer());
  assert.deepEqual(ids(result), []);
});

test('the input array is never mutated', () => {
  const snapshot = ids(ALL);
  applyFeedControls(ALL, controls({ sort: 'oldest' }), viewer());
  assert.deepEqual(ids(ALL), snapshot);
});

test('isFeedFiltered / isFeedCustomized reflect control state', () => {
  assert.equal(isFeedFiltered(DEFAULT_FEED_CONTROLS), false);
  assert.equal(isFeedCustomized(DEFAULT_FEED_CONTROLS), false);
  // Sort change is a customization but not a "filter".
  assert.equal(isFeedFiltered(controls({ sort: 'oldest' })), false);
  assert.equal(isFeedCustomized(controls({ sort: 'oldest' })), true);
  // A filter is both.
  assert.equal(isFeedFiltered(controls({ onlyMine: true })), true);
  assert.equal(isFeedCustomized(controls({ onlyMine: true })), true);
});

test('feedShowOf collapses the two scope booleans to one choice', () => {
  assert.equal(feedShowOf(DEFAULT_FEED_CONTROLS), 'all');
  assert.equal(feedShowOf(controls({ onlyUnprayed: true })), 'unprayed');
  assert.equal(feedShowOf(controls({ onlyMine: true })), 'mine');
  // Mine wins if both were somehow set, so the value is always well defined.
  assert.equal(feedShowOf(controls({ onlyUnprayed: true, onlyMine: true })), 'mine');
});

test('withFeedShow sets exclusive scope booleans', () => {
  const mine = withFeedShow(DEFAULT_FEED_CONTROLS, 'mine');
  assert.deepEqual({ onlyMine: mine.onlyMine, onlyUnprayed: mine.onlyUnprayed }, {
    onlyMine: true,
    onlyUnprayed: false,
  });
  const unprayed = withFeedShow(mine, 'unprayed');
  assert.deepEqual({ onlyMine: unprayed.onlyMine, onlyUnprayed: unprayed.onlyUnprayed }, {
    onlyMine: false,
    onlyUnprayed: true,
  });
  const all = withFeedShow(unprayed, 'all');
  assert.deepEqual({ onlyMine: all.onlyMine, onlyUnprayed: all.onlyUnprayed }, {
    onlyMine: false,
    onlyUnprayed: false,
  });
  // Sort and category are preserved when only the scope changes.
  const fromSorted = withFeedShow(controls({ sort: 'oldest', category: 'health' }), 'mine');
  assert.equal(fromSorted.sort, 'oldest');
  assert.equal(fromSorted.category, 'health');
});

test('activeFilterCount counts category and scope, never sort (max 2)', () => {
  assert.equal(activeFilterCount(DEFAULT_FEED_CONTROLS), 0);
  assert.equal(activeFilterCount(controls({ sort: 'mostPrayed' })), 0); // sort is not a filter
  assert.equal(activeFilterCount(controls({ category: 'health' })), 1);
  assert.equal(activeFilterCount(controls({ onlyUnprayed: true })), 1);
  assert.equal(activeFilterCount(controls({ onlyMine: true })), 1);
  assert.equal(activeFilterCount(controls({ category: 'family', onlyMine: true })), 2);
});
