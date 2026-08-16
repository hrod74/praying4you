import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CONTENT_FILTER_MESSAGE } from './contentFilter.ts';
import { evaluatePrayerSubmission } from './prayerSubmissionGate.ts';
import { PRAYER_BODY_MIN } from './validation.ts';

/**
 * Pure unit tests for the prayer-form submission gate. Runs under Node's built-in test runner
 * (`node --test`), no React Native, no Firebase. See package.json `test:submission-gate`.
 *
 * This is the smallest testable seam for Part 2 (integration) of pre-publication content
 * filtering: PrayerForm.handleSubmit calls this function directly, so proving its behavior here
 * proves the behavior of both the create and edit screens, which both render PrayerForm.
 */

test('existing required-field validation takes precedence over content filtering', () => {
  const result = evaluatePrayerSubmission('');
  assert.equal(result.status, 'blockedByValidation');
});

test('existing length validation takes precedence over content filtering', () => {
  const tooShort = 'a'.repeat(PRAYER_BODY_MIN - 1);
  const result = evaluatePrayerSubmission(tooShort);
  assert.equal(result.status, 'blockedByValidation');
});

test('a draft that fails length validation is never routed through the content filter, even if it also contains blocked language', () => {
  // Short enough on its own to fail validatePrayerBody (below PRAYER_BODY_MIN), but this exact
  // word would also match the identitySlur rule if the filter ran on it. Validation must win,
  // proving the ordering, not just the outcome.
  const result = evaluatePrayerSubmission('nigger');
  assert.equal(result.status, 'blockedByValidation');
});

test('allowed content reaches the submission boundary as ready', () => {
  const result = evaluatePrayerSubmission('Please pray for my family during this hard season.');
  assert.deepEqual(result, { status: 'ready' });
});

test('blocked content does not reach the submission boundary', () => {
  const result = evaluatePrayerSubmission('I will kill you');
  assert.equal(result.status, 'blockedByFilter');
  assert.notEqual(result.status, 'ready');
});

test('the shared content filter message is returned for blocked content, and no reason category is exposed', () => {
  const result = evaluatePrayerSubmission('I will kill you');
  assert.equal(result.status, 'blockedByFilter');
  if (result.status === 'blockedByFilter') {
    assert.equal(result.message, CONTENT_FILTER_MESSAGE);
  }
  assert.deepEqual(Object.keys(result).sort(), ['message', 'status']);
});

test('an unexpected internal failure fails closed: never ready, and the shared message is used', () => {
  const result = evaluatePrayerSubmission(null as unknown as string);
  assert.notEqual(result.status, 'ready');
  assert.equal(result.status, 'blockedByFilter');
  if (result.status === 'blockedByFilter') {
    assert.equal(result.message, CONTENT_FILTER_MESSAGE);
  }
});

test('the submitted draft string is never modified by the gate', () => {
  const original = 'Please pray for my family, we are going through a hard season.';
  const beforeCall = original;
  evaluatePrayerSubmission(original);
  assert.equal(original, beforeCall);
});

test('the gate is deterministic for the same input', () => {
  const inputs = ['', 'kill u', 'I will kill you', 'Please pray for my family.'];
  for (const input of inputs) {
    const first = evaluatePrayerSubmission(input);
    for (let i = 0; i < 10; i++) {
      assert.deepEqual(evaluatePrayerSubmission(input), first);
    }
  }
});

test('the anonymous and named choices do not change the body-filtering result, since the gate only evaluates the body', () => {
  const namedDraft = { body: 'I will kill you', category: 'other', isAnonymous: false } as const;
  const anonymousDraft = { body: 'I will kill you', category: 'other', isAnonymous: true } as const;
  const namedResult = evaluatePrayerSubmission(namedDraft.body);
  const anonymousResult = evaluatePrayerSubmission(anonymousDraft.body);
  assert.deepEqual(namedResult, anonymousResult);
  assert.equal(namedResult.status, 'blockedByFilter');

  const namedAllowed = evaluatePrayerSubmission('Please pray for my family.');
  const anonymousAllowed = evaluatePrayerSubmission('Please pray for my family.');
  assert.deepEqual(namedAllowed, anonymousAllowed);
  assert.deepEqual(namedAllowed, { status: 'ready' });
});
