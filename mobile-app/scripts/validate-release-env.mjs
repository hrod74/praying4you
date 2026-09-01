const guardedProfiles = new Set(['preview', 'production']);

export const REQUIRED_FIREBASE_ENV = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
];

export function validateReleaseEnvironment(env = process.env) {
  const profile = (env.EAS_BUILD_PROFILE ?? '').trim();
  if (!guardedProfiles.has(profile)) {
    return { guarded: false, profile: profile || 'local' };
  }

  const missing = REQUIRED_FIREBASE_ENV.filter((name) => {
    const value = (env[name] ?? '').trim();
    return !value || value.startsWith('REPLACE_WITH_');
  });

  if (missing.length > 0) {
    throw new Error(
      `Blocked ${profile} build: required Firebase configuration is missing or placeholder-only: ${missing.join(', ')}`,
    );
  }

  return { guarded: true, profile };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    const result = validateReleaseEnvironment();
    console.log(
      result.guarded
        ? `Release environment gate passed for ${result.profile}.`
        : `Release environment gate skipped for ${result.profile}.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
