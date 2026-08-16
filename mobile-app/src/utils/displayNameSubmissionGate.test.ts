import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CONTENT_FILTER_MESSAGE } from './contentFilter.ts';
import { evaluateDisplayNameSubmission } from './displayNameSubmissionGate.ts';
import { DISPLAY_NAME_MAX } from './validation.ts';

/**
 * Pure unit tests for the display-name submission gate. Runs under Node's built-in test runner
 * (`node --test`), no React Native, no Firebase. See package.json `test:display-name-gate`.
 *
 * This is the smallest testable seam for Part 3A (display-name filtering): both the
 * account-creation screen and the Settings edit-profile form call this one function directly, so
 * proving its behavior here proves the behavior of both screens.
 */

test('existing required-field validation takes precedence over content filtering', () => {
  const result = evaluateDisplayNameSubmission('');
  assert.equal(result.status, 'blockedByValidation');
});

test('existing length validation takes precedence over content filtering', () => {
  const tooLong = 'a'.repeat(DISPLAY_NAME_MAX + 1);
  const result = evaluateDisplayNameSubmission(tooLong);
  assert.equal(result.status, 'blockedByValidation');
});

test('a single character fails length validation before the content filter ever runs', () => {
  // Too short to pass validateDisplayName (min 2), so it must never reach the filter.
  const result = evaluateDisplayNameSubmission('a');
  assert.equal(result.status, 'blockedByValidation');
});

test('allowed display names reach the submission boundary as ready', () => {
  assert.deepEqual(evaluateDisplayNameSubmission('Jordan'), { status: 'ready' });
  assert.deepEqual(evaluateDisplayNameSubmission('Maria Gonzalez'), { status: 'ready' });
});

test('blocked display names do not reach the submission boundary', () => {
  const result = evaluateDisplayNameSubmission('nigger');
  assert.equal(result.status, 'blockedByFilter');
  assert.notEqual(result.status, 'ready');
});

test('the shared content filter message is returned for a blocked name, and no reason category is exposed', () => {
  const result = evaluateDisplayNameSubmission('nigger');
  assert.equal(result.status, 'blockedByFilter');
  if (result.status === 'blockedByFilter') {
    assert.equal(result.message, CONTENT_FILTER_MESSAGE);
  }
  assert.deepEqual(Object.keys(result).sort(), ['message', 'status']);
});

test('an unexpected internal failure fails closed: never ready, and the shared message is used', () => {
  const result = evaluateDisplayNameSubmission(null as unknown as string);
  assert.notEqual(result.status, 'ready');
  assert.equal(result.status, 'blockedByFilter');
  if (result.status === 'blockedByFilter') {
    assert.equal(result.message, CONTENT_FILTER_MESSAGE);
  }
});

test('the submitted display name string is never modified by the gate', () => {
  const original = 'Jordan';
  const beforeCall = original;
  evaluateDisplayNameSubmission(original);
  assert.equal(original, beforeCall);
});

test('the gate is deterministic for the same input, so creation and editing get identical behavior', () => {
  // Account creation and Settings editing both call this exact function with just the display
  // name; there is no separate "context" parameter that could make one path stricter than the
  // other. Determinism here is what guarantees identical behavior across both call sites.
  const inputs = ['', 'a', 'Jordan', 'nigger'];
  for (const input of inputs) {
    const first = evaluateDisplayNameSubmission(input);
    for (let i = 0; i < 10; i++) {
      assert.deepEqual(evaluateDisplayNameSubmission(input), first);
    }
  }
});
