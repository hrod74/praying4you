import assert from 'node:assert/strict';
import { test } from 'node:test';

import { filterHiddenAccounts } from './hiddenAccountFilter.ts';
import type { PrayerRequest } from '../models/types.ts';

/**
 * Pure unit tests for hidden-account filtering. Runs under Node's built-in test runner
 * (`node --test`), no React Native, no Firebase. See package.json `test:hidden-accounts`.
 */

function makeRequest(overrides: Partial<PrayerRequest> & { id: string; userId: string }): PrayerRequest {
  return {
    id: overrides.id,
    userId: overrides.userId,
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

test('an empty hidden set filters nothing, and returns the same array reference', () => {
  const requests = [makeRequest({ id: 'r1', userId: 'alice' })];
  assert.equal(filterHiddenAccounts(requests, new Set()), requests);
});

test('removes every request authored by a hidden account', () => {
  const requests = [
    makeRequest({ id: 'r1', userId: 'alice' }),
    makeRequest({ id: 'r2', userId: 'bob' }),
    makeRequest({ id: 'r3', userId: 'alice' }),
  ];
  const result = filterHiddenAccounts(requests, new Set(['alice']));
  assert.deepEqual(result.map((r) => r.id), ['r2']);
});

test('removes a hidden account\'s requests whether named or Anonymous', () => {
  const requests = [
    makeRequest({ id: 'r1', userId: 'alice', isAnonymous: true, displayName: 'Anonymous' }),
    makeRequest({ id: 'r2', userId: 'bob' }),
  ];
  const result = filterHiddenAccounts(requests, new Set(['alice']));
  assert.deepEqual(result.map((r) => r.id), ['r2']);
});

test('hiding multiple accounts filters requests from all of them', () => {
  const requests = [
    makeRequest({ id: 'r1', userId: 'alice' }),
    makeRequest({ id: 'r2', userId: 'bob' }),
    makeRequest({ id: 'r3', userId: 'carol' }),
  ];
  const result = filterHiddenAccounts(requests, new Set(['alice', 'carol']));
  assert.deepEqual(result.map((r) => r.id), ['r2']);
});

test('does not mutate the input array', () => {
  const requests = [makeRequest({ id: 'r1', userId: 'alice' }), makeRequest({ id: 'r2', userId: 'bob' })];
  const before = [...requests];
  filterHiddenAccounts(requests, new Set(['alice']));
  assert.deepEqual(requests, before);
});

test('a request from a non-hidden account is preserved with all its fields intact', () => {
  const requests = [makeRequest({ id: 'r1', userId: 'bob', prayerCount: 7, category: 'grief' })];
  const result = filterHiddenAccounts(requests, new Set(['alice']));
  assert.deepEqual(result, requests);
});
