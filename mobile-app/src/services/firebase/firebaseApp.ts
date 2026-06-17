import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

import { firebaseConfig, isFirebaseConfigured } from '../../config/firebaseConfig';

/**
 * Guarded Firebase app accessor (Phase J.2a scaffold).
 *
 * This is the single, lazy entry point for the Firebase app instance. It is intentionally
 * INERT by default: when no real config is present (the case in this phase, since no
 * `EXPO_PUBLIC_FIREBASE_*` env vars are set), it returns `null` and never calls
 * `initializeApp`, so the app makes no network connection and reads/writes no Firebase data.
 *
 * Initialization is deferred until a caller explicitly opts in (a later phase). Nothing in
 * the current app imports or calls this, so the local/mock prototype behavior is unchanged.
 */

let cached: FirebaseApp | null = null;

/**
 * Returns the initialized Firebase app, or `null` when Firebase is not configured.
 * Safe to call repeatedly (memoized; reuses an existing app if one was already created).
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (cached) return cached;
  cached = getApps().length > 0 ? getApp() : initializeApp({ ...firebaseConfig });
  return cached;
}

/** Whether a real Firebase app is available (config present). False in this phase. */
export function isFirebaseReady(): boolean {
  return isFirebaseConfigured();
}
