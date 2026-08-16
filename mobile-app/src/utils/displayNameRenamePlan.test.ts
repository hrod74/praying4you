import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isEligibleForDisplayNameRename,
  MAX_NAMED_REQUESTS_FOR_ATOMIC_RENAME,
  planDisplayNameRenameBatch,
  selectRequestsForDisplayNameRename,
  type RenamePropagationCandidate,
} from './displayNameRenamePlan.ts';

/**
 * Pure unit tests for display-name rename selection and batch planning. Runs under Node's
 * built-in test runner (`node --test`), no React Native, no Firebase, no AsyncStorage. See
 * package.json `test:display-name-rename-plan`.
 *
 * This is the smallest testable seam for the rename-propagation feature: both the Firebase batch
 * service and the local/mock propagation call these exact functions, so proving their behavior
 * here proves both modes select the same requests using the same rules.
 */

function candidate(overrides: Partial<RenamePropagationCandidate> = {}): RenamePropagationCandidate {
  return {
    id: 'req-1',
    userId: 'alice',
    isAnonymous: false,
    status: 'active',
    ...overrides,
  };
}

test('an active, named request owned by the renaming account is eligible', () => {
  assert.equal(isEligibleForDisplayNameRename(candidate(), 'alice'), true);
});

test('an active Anonymous request is excluded, even when owned by the renaming account', () => {
  assert.equal(isEligibleForDisplayNameRename(candidate({ isAnonymous: true }), 'alice'), false);
});

test('a removed request is excluded, even when named and owned by the renaming account', () => {
  assert.equal(isEligibleForDisplayNameRename(candidate({ status: 'removed' }), 'alice'), false);
});

test('a request owned by a different account is excluded', () => {
  assert.equal(isEligibleForDisplayNameRename(candidate({ userId: 'bob' }), 'alice'), false);
});

test('selectRequestsForDisplayNameRename returns only the eligible requests, order preserved', () => {
  const requests = [
    candidate({ id: 'req-1' }),
    candidate({ id: 'req-2', isAnonymous: true }),
    candidate({ id: 'req-3', status: 'removed' }),
    candidate({ id: 'req-4', userId: 'bob' }),
    candidate({ id: 'req-5' }),
  ];
  const selected = selectRequestsForDisplayNameRename(requests, 'alice');
  assert.deepEqual(
    selected.map((r) => r.id),
    ['req-1', 'req-5'],
  );
});

test('selectRequestsForDisplayNameRename returns an empty array when nothing is eligible', () => {
  const requests = [candidate({ isAnonymous: true }), candidate({ status: 'removed' })];
  assert.deepEqual(selectRequestsForDisplayNameRename(requests, 'alice'), []);
});

test('planDisplayNameRenameBatch plans one profile write plus one write per matching request', () => {
  const plan = planDisplayNameRenameBatch('alice', 'Alice Renamed', ['req-1', 'req-2']);
  assert.equal(plan.status, 'ok');
  if (plan.status === 'ok') {
    assert.equal(plan.writes.length, 3);
    assert.deepEqual(plan.writes[0], { path: 'users/alice', data: { displayName: 'Alice Renamed' } });
    assert.deepEqual(plan.writes[1], {
      path: 'prayerRequests/req-1',
      data: { displayName: 'Alice Renamed' },
    });
    assert.deepEqual(plan.writes[2], {
      path: 'prayerRequests/req-2',
      data: { displayName: 'Alice Renamed' },
    });
  }
});

test('planDisplayNameRenameBatch trims the display name in every write', () => {
  const plan = planDisplayNameRenameBatch('alice', '  Alice Renamed  ', ['req-1']);
  assert.equal(plan.status, 'ok');
  if (plan.status === 'ok') {
    for (const write of plan.writes) {
      assert.equal(write.data.displayName, 'Alice Renamed');
    }
  }
});

test('every planned write changes only the displayName field', () => {
  const plan = planDisplayNameRenameBatch('alice', 'Alice Renamed', ['req-1', 'req-2', 'req-3']);
  assert.equal(plan.status, 'ok');
  if (plan.status === 'ok') {
    for (const write of plan.writes) {
      assert.deepEqual(Object.keys(write.data), ['displayName']);
    }
  }
});

test('the 499-request limit is enforced before any write is planned', () => {
  const tooMany = Array.from({ length: MAX_NAMED_REQUESTS_FOR_ATOMIC_RENAME + 1 }, (_, i) => `req-${i}`);
  const plan = planDisplayNameRenameBatch('alice', 'Alice Renamed', tooMany);
  assert.deepEqual(plan, { status: 'tooManyRequests' });
});

test('exactly the 499-request limit is allowed (500 total writes including the profile doc)', () => {
  const atLimit = Array.from({ length: MAX_NAMED_REQUESTS_FOR_ATOMIC_RENAME }, (_, i) => `req-${i}`);
  const plan = planDisplayNameRenameBatch('alice', 'Alice Renamed', atLimit);
  assert.equal(plan.status, 'ok');
  if (plan.status === 'ok') {
    assert.equal(plan.writes.length, MAX_NAMED_REQUESTS_FOR_ATOMIC_RENAME + 1);
  }
});

test('planDisplayNameRenameBatch is deterministic, so retrying the same desired name is idempotent', () => {
  const inputs: [string, string, string[]][] = [
    ['alice', 'Alice Renamed', ['req-1', 'req-2']],
    ['alice', 'Alice Renamed', []],
  ];
  for (const [uid, name, ids] of inputs) {
    const first = planDisplayNameRenameBatch(uid, name, ids);
    for (let i = 0; i < 10; i++) {
      assert.deepEqual(planDisplayNameRenameBatch(uid, name, ids), first);
    }
  }
});
