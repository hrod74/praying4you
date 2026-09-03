import assert from 'node:assert/strict';
import test from 'node:test';

import type { PrayerInteraction } from '../models/types.ts';
import { withoutPrayerInteraction } from './interactionUndo.ts';

const interactions: PrayerInteraction[] = [
  { userId: 'me', requestId: 'request-1', prayedAt: '2026-09-02T12:00:00.000Z' },
  { userId: 'other', requestId: 'request-1', prayedAt: '2026-09-02T12:01:00.000Z' },
  { userId: 'me', requestId: 'request-2', prayedAt: '2026-09-02T12:02:00.000Z' },
];

test('local correction removes only the caller matching interaction', () => {
  assert.deepEqual(withoutPrayerInteraction(interactions, 'me', 'request-1'), interactions.slice(1));
  assert.equal(interactions.length, 3, 'the original interaction list is not mutated');
});

test('repeating a local correction is an idempotent no-op', () => {
  const once = withoutPrayerInteraction(interactions, 'me', 'request-1');
  const twice = withoutPrayerInteraction(once, 'me', 'request-1');
  assert.deepEqual(twice, once);
});
