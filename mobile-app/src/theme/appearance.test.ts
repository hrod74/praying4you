import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSystemAppearance } from './appearance.ts';

test('the app follows the device appearance', () => {
  assert.equal(resolveSystemAppearance('light'), 'light');
  assert.equal(resolveSystemAppearance('dark'), 'dark');
});
test('the app safely defaults to light when device appearance is unavailable', () => {
  assert.equal(resolveSystemAppearance(null), 'light');
  assert.equal(resolveSystemAppearance(undefined), 'light');
});
