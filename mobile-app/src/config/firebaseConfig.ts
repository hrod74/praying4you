/**
 * Firebase web config, sourced ONLY from environment variables (Phase J.2a scaffold).
 *
 * No real Firebase values live in this repo. The values are read from Expo public env vars
 * (`EXPO_PUBLIC_FIREBASE_*`), which Expo inlines at build time and which are compatible with
 * Expo Go. Real values belong in a local, gitignored `.env` (see `.env.example` for the
 * placeholder names and `docs/firebase-implementation-readiness.md` for the policy).
 *
 * The Firebase *web* config (apiKey, authDomain, projectId, etc.) is shipped in client apps
 * and is not a private service-account key; even so, by project policy it is kept out of git
 * and handled through env vars only. Service-account keys are never used in the client and
 * are never committed.
 *
 * Nothing here connects to Firebase. With no env vars set (the default in this phase),
 * `isFirebaseConfigured()` returns false and the app stays fully local/mock.
 */

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  /** Optional (Analytics). Empty when unused. */
  measurementId?: string;
}

/** Normalizes a public Expo env value while keeping direct access visible to Expo's bundler. */
function env(value: string | undefined): string {
  return (value ?? '').trim();
}

export const firebaseConfig: FirebaseWebConfig = {
  apiKey: env(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain: env(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: env(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: env(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: env(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: env(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
  measurementId: env(process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID) || undefined,
};

/**
 * True only when the minimum real config is present. Used to gate any Firebase
 * initialization so the app never tries to connect with empty/placeholder values. In this
 * phase no env vars are set, so this is false and the app remains local/mock.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}
