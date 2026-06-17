import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

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

let cachedDb: Firestore | null = null;

/**
 * Returns the Cloud Firestore instance, or `null` when Firebase is not configured (local/mock
 * fallback). Memoized. Uses the Firebase JS SDK modular API (Expo Go compatible, no native
 * modules). Phase J.2c uses this only for the private `users/{uid}` profile doc; prayer data
 * (requests, interactions, reports) stays local/mock and is NOT read or written here.
 */
export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(app);
  return cachedDb;
}

/** Whether a real Firebase app is available (config present). */
export function isFirebaseReady(): boolean {
  return isFirebaseConfigured();
}
