import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  HiddenAccountStorageCorruptedError,
  isValidStoredHiddenAccount,
  parseStoredHiddenAccounts,
} from './hiddenAccountStorage.ts';

/**
 * Pure unit tests for local hidden-account storage parsing (the fail-closed corruption handling
 * required for local/mock mode). Runs under Node's built-in test runner (`node --test`), no
 * AsyncStorage, no React Native. See package.json `test:hidden-accounts`.
 */

function validEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'blocker_hidden',
    hiddenUid: 'hidden',
    createdAt: '2026-01-01T00:00:00.000Z',
    fromAnonymous: false,
    ...overrides,
  };
}

test('missing storage (null) is the legitimate "nothing hidden yet" case, not corruption', () => {
  assert.deepEqual(parseStoredHiddenAccounts(null), []);
});

test('an empty stored array is valid and returns []', () => {
  assert.deepEqual(parseStoredHiddenAccounts('[]'), []);
});

test('a valid stored array round-trips, including the optional displayLabelSnapshot', () => {
  const entries = [validEntry(), validEntry({ id: 'b_c', hiddenUid: 'c', displayLabelSnapshot: 'Bob' })];
  assert.deepEqual(parseStoredHiddenAccounts(JSON.stringify(entries)), entries);
});

test('malformed JSON throws a safe corruption error, never returns []', () => {
  assert.throws(() => parseStoredHiddenAccounts('{not valid json'), HiddenAccountStorageCorruptedError);
});

test('valid JSON that is not an array (an object) throws', () => {
  assert.throws(() => parseStoredHiddenAccounts(JSON.stringify({ foo: 'bar' })), HiddenAccountStorageCorruptedError);
});

test('valid JSON that is not an array (a string) throws', () => {
  assert.throws(() => parseStoredHiddenAccounts(JSON.stringify('just a string')), HiddenAccountStorageCorruptedError);
});

test('an array containing one invalid entry throws for the whole read', () => {
  const entries = [validEntry(), { id: 'missing-fields' }];
  assert.throws(() => parseStoredHiddenAccounts(JSON.stringify(entries)), HiddenAccountStorageCorruptedError);
});

test('an entry missing a required field is invalid', () => {
  const { hiddenUid: _omit, ...rest } = validEntry();
  assert.equal(isValidStoredHiddenAccount(rest), false);
});

test('an entry with fromAnonymous as a non-boolean is invalid', () => {
  assert.equal(isValidStoredHiddenAccount(validEntry({ fromAnonymous: 'false' })), false);
});

test('an entry with a non-string displayLabelSnapshot is invalid', () => {
  assert.equal(isValidStoredHiddenAccount(validEntry({ displayLabelSnapshot: 42 })), false);
});

test('a valid entry with no displayLabelSnapshot at all is valid (the Anonymous case)', () => {
  assert.equal(isValidStoredHiddenAccount(validEntry()), true);
});

test('null and non-object values are invalid entries', () => {
  assert.equal(isValidStoredHiddenAccount(null), false);
  assert.equal(isValidStoredHiddenAccount('a string'), false);
  assert.equal(isValidStoredHiddenAccount(42), false);
});
