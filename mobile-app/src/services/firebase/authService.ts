import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  type Auth,
  type Persistence,
  type User,
} from 'firebase/auth';
import * as FirebaseAuthModule from 'firebase/auth';

import type { UserProfile } from '../../models/types';

/**
 * `getReactNativePersistence` ships only in Firebase's React Native build (which Metro resolves
 * via the "react-native" condition); it is present at runtime in Expo Go but is absent from the
 * default TypeScript entry. Access it through the module with a typed shim so it stays type-safe
 * without a brittle ts-expect-error, and without any native module.
 */
const getReactNativePersistence = (
  FirebaseAuthModule as unknown as {
    getReactNativePersistence: (storage: unknown) => Persistence;
  }
).getReactNativePersistence;
import { getFirebaseApp } from './firebaseApp';
import { authErrorMessage } from './authErrors';
import { NotImplementedError, type AuthService } from './contracts';

/**
 * Firebase Auth service (Phase J.2b) — email/password, by the book.
 *
 * This is the first real Firebase integration. It uses the Firebase JS SDK (Expo Go compatible,
 * no native modules) and persists the session with React Native AsyncStorage (already a project
 * dependency), so a signed-in user stays signed in across app restarts.
 *
 * By the book: all credential handling, hashing, session/token management, and email uniqueness
 * are Firebase's responsibility. We only call the SDK and map errors to calm, safe copy. No
 * custom auth logic, no anonymous auth, no social/passwordless sign-in.
 *
 * Privacy: email lives in Firebase Auth and is treated as private (never written to prayer data,
 * never shown to other users). Display name is stored on the Firebase Auth user profile. The
 * Firestore `users/{uid}` profile doc is deferred to the Firestore phase (not created here).
 */

let authInstance: Auth | null = null;

/**
 * Lazily get the Auth instance, or null when Firebase is not configured (local/mock fallback).
 * Initialized once with React Native persistence; falls back to getAuth() if already initialized
 * (e.g. across a fast refresh).
 */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (authInstance) return authInstance;
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth throws if it was already initialized; reuse the existing instance.
    authInstance = getAuth(app);
  }
  return authInstance;
}

/** Auth or a thrown generic error (callers gate on Firebase being configured first). */
function requireAuth(): Auth {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error(authErrorMessage(undefined));
  return auth;
}

/** Build the app's UserProfile from a Firebase user. Email is private; never exposed publicly. */
function toProfile(user: User): UserProfile {
  const created = user.metadata.creationTime;
  return {
    id: user.uid,
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    createdAt: created ? new Date(created).toISOString() : new Date().toISOString(),
  };
}

/**
 * Subscribe to auth state. Fires immediately with the current user (or null) and on every
 * sign-in/out. Returns an unsubscribe function. Used by AuthContext to hydrate the session.
 */
export function subscribeToProfile(callback: (profile: UserProfile | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    // Not configured: report signed-out once so hydration can complete.
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => callback(user ? toProfile(user) : null));
}

export const firebaseAuthService: AuthService = {
  async signUp({ email, password, displayName }) {
    const auth = requireAuth();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await firebaseUpdateProfile(cred.user, { displayName: displayName.trim() });
      return toProfile(cred.user);
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  },

  async signIn({ email, password }) {
    const auth = requireAuth();
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      return toProfile(cred.user);
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  },

  async signOut() {
    const auth = requireAuth();
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  },

  async getCurrentProfile() {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser ?? null;
    return user ? toProfile(user) : null;
  },

  async updateDisplayName(displayName) {
    const auth = requireAuth();
    const user = auth.currentUser;
    if (!user) throw new Error(authErrorMessage(undefined));
    try {
      await firebaseUpdateProfile(user, { displayName: displayName.trim() });
      return toProfile(user);
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  },

  async sendPasswordReset(email) {
    const auth = requireAuth();
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      throw new Error(authErrorMessage(error));
    }
  },

  async deleteAccount() {
    // Documented gate (not implemented in J.2b). User-initiated account deletion is required
    // before alpha/beta with real testers; it is implemented and verified in a later phase.
    throw new NotImplementedError('firebaseAuthService.deleteAccount');
  },
};
