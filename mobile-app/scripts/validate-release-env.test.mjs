import assert from 'node:assert/strict';
import test from 'node:test';

import { REQUIRED_FIREBASE_ENV, validateReleaseEnvironment } from './validate-release-env.mjs';

function configured(profile) {
  return Object.fromEntries([
    ['EAS_BUILD_PROFILE', profile],
    ...REQUIRED_FIREBASE_ENV.map((name) => [name, `test-${name.toLowerCase()}`]),
  ]);
}

test('production passes only when every Firebase setting is present', () => {
  assert.deepEqual(validateReleaseEnvironment(configured('production')), {
    guarded: true,
    profile: 'production',
  });
});

test('preview fails when a Firebase setting is missing', () => {
  const env = configured('preview');
  delete env.EXPO_PUBLIC_FIREBASE_APP_ID;
  assert.throws(
    () => validateReleaseEnvironment(env),
    /Blocked preview build:.*EXPO_PUBLIC_FIREBASE_APP_ID/,
  );
});

test('production fails when a Firebase setting is a placeholder', () => {
  const env = configured('production');
  env.EXPO_PUBLIC_FIREBASE_API_KEY = 'REPLACE_WITH_API_KEY';
  assert.throws(
    () => validateReleaseEnvironment(env),
    /Blocked production build:.*EXPO_PUBLIC_FIREBASE_API_KEY/,
  );
});

test('local development remains available without Firebase settings', () => {
  assert.deepEqual(validateReleaseEnvironment({}), { guarded: false, profile: 'local' });
});
