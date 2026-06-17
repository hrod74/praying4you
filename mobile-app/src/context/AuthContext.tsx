import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isFirebaseConfigured } from '../config/firebaseConfig';
import { firebaseAuthService, subscribeToProfile } from '../services/firebase/authService';
import { firebaseUserService } from '../services/firebase/userService';
import type { UserProfile } from '../models/types';

/**
 * Run a Firestore profile-doc side effect best-effort. The private `users/{uid}` doc is durable
 * infrastructure, not the source of truth for the signed-in UI (Firebase Auth is), so a failure
 * here (e.g. security rules not deployed, or transient network) must never block sign-in, sign-up,
 * or profile edits, and is never surfaced to the user.
 *
 * In development it logs the Firebase error code + message so failures are diagnosable. These are
 * non-sensitive (a code like "permission-denied" and a generic message); no email, UID, password,
 * or config value is logged.
 */
function syncProfileDoc(label: string, run: () => Promise<unknown>): void {
  void run().catch((error: unknown) => {
    if (!__DEV__) return;
    const code = (error as { code?: string })?.code ?? 'unknown';
    const message = error instanceof Error ? error.message : String(error);
    const hint =
      code === 'permission-denied'
        ? ' Republish mobile-app/firestore.rules in the Firebase Console (Firestore Database > Rules).'
        : '';
    console.warn(
      `[profile] Firestore profile sync failed at "${label}" (code: ${code}). ` +
        `Auth still succeeded; will retry on next sign-in.${hint} Detail: ${message}`,
    );
  });
}

/**
 * AuthContext — the single auth seam, with two interchangeable modes behind one API.
 *
 * - Firebase mode (when `EXPO_PUBLIC_FIREBASE_*` is configured): real Firebase Auth
 *   (email/password, by the book), with the session persisted across restarts via AsyncStorage.
 * - Local mode (no Firebase config): the original simulated local profile + session (Phase B).
 *   This is the fallback so the prototype always runs, even with no backend.
 *
 * Screens call this context's API (createProfile / signIn / signOut / updateProfile); they never
 * talk to Firebase or storage directly. `authMode` / `requiresPassword` let screens add a
 * password field and credential sign-in only when Firebase is active.
 *
 * Privacy: email is private in both modes (stored in Firebase Auth or on-device only) and is
 * never shown on any public surface. Display name is the only public identity. There is no
 * anonymous Firebase auth; "Anonymous" remains a per-post display choice handled elsewhere.
 */

const PROFILE_KEY = 'p4u.profile';
const SIGNED_IN_KEY = 'p4u.signedIn';
const LOCAL_USER_ID = 'local-user';

/** Active auth mode, decided once at load from whether Firebase config is present. */
export type AuthMode = 'firebase' | 'local';
const AUTH_MODE: AuthMode = isFirebaseConfigured() ? 'firebase' : 'local';

export interface CreateProfileInput {
  displayName: string;
  email: string;
  /** Required in Firebase mode (email/password). Ignored in local mode. */
  password?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  /** The signed-in profile, if any. */
  profile: UserProfile | null;
  /** Whether a session is active. */
  isSignedIn: boolean;
  /** True while the persisted/Firebase session is being restored on startup. */
  isHydrating: boolean;
  /** 'firebase' when configured, else 'local' (mock fallback). */
  authMode: AuthMode;
  /** True when the active mode needs a password (Firebase). Screens show a password field. */
  requiresPassword: boolean;
  /** Create an account (Firebase sign-up) or local profile, then enter the app. */
  createProfile: (input: CreateProfileInput) => Promise<void>;
  /** Update the display name (and email in local mode). Email change in Firebase mode is deferred. */
  updateProfile: (input: { displayName: string; email: string }) => Promise<void>;
  /**
   * Sign in. Firebase mode requires `credentials`; local mode restores the single stored profile
   * (no args). Returns false when it could not sign in (local: no profile yet). Throws with safe
   * copy on a Firebase failure.
   */
  signIn: (credentials?: SignInCredentials) => Promise<boolean>;
  /** Sign out of the current session. */
  signOut: () => Promise<void>;
  /** Send a password-reset email (Firebase mode only; no-op in local mode). */
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // Hydrate the session on startup. Firebase mode subscribes to auth state (restores a persisted
  // session); local mode reads the simulated profile from AsyncStorage.
  useEffect(() => {
    if (AUTH_MODE === 'firebase') {
      const unsubscribe = subscribeToProfile((p) => {
        setProfile(p);
        setIsSignedIn(Boolean(p));
        setIsHydrating(false);
      });
      return unsubscribe;
    }

    let active = true;
    (async () => {
      try {
        const [[, storedProfile], [, storedSignedIn]] = await AsyncStorage.multiGet([
          PROFILE_KEY,
          SIGNED_IN_KEY,
        ]);
        if (!active) return;
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile) as UserProfile);
          setIsSignedIn(storedSignedIn === 'true');
        }
      } catch {
        // Best-effort: a storage read failure just means we start signed out.
      } finally {
        if (active) setIsHydrating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const createProfile = useCallback(async ({ displayName, email, password }: CreateProfileInput) => {
    if (AUTH_MODE === 'firebase') {
      // By the book: Firebase owns account creation + email uniqueness. Errors arrive as safe copy.
      const created = await firebaseAuthService.signUp({
        email,
        password: password ?? '',
        displayName,
      });
      // Set eagerly for a snappy UI; onAuthStateChanged will also confirm this shortly.
      setProfile(created);
      setIsSignedIn(true);
      // Create the private Firestore profile doc (best-effort; never blocks account creation).
      syncProfileDoc('sign-up', () =>
        firebaseUserService.ensureProfileForSignUp(created.id, created.displayName),
      );
      return;
    }

    const newProfile: UserProfile = {
      id: LOCAL_USER_ID,
      displayName: displayName.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
    };
    setProfile(newProfile);
    setIsSignedIn(true);
    try {
      await AsyncStorage.multiSet([
        [PROFILE_KEY, JSON.stringify(newProfile)],
        [SIGNED_IN_KEY, 'true'],
      ]);
    } catch {
      // Non-fatal: the session still works for this run, just not across restarts.
    }
  }, []);

  // Edit profile. Firebase mode updates the display name only (email change is deferred to a later
  // phase as it needs verification/reauth). Local mode updates name + email on-device.
  const updateProfile = useCallback(
    async ({ displayName, email }: { displayName: string; email: string }) => {
      if (AUTH_MODE === 'firebase') {
        const updated = await firebaseAuthService.updateDisplayName(displayName);
        setProfile(updated);
        // Mirror the display name into the private Firestore profile doc (best-effort).
        syncProfileDoc('update-display-name', () =>
          firebaseUserService.updateDisplayName(updated.id, updated.displayName),
        );
        return;
      }

      if (!profile) return;
      const next: UserProfile = {
        ...profile,
        displayName: displayName.trim(),
        email: email.trim(),
      };
      setProfile(next);
      try {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal.
      }
    },
    [profile],
  );

  const signIn = useCallback(
    async (credentials?: SignInCredentials) => {
      if (AUTH_MODE === 'firebase') {
        if (!credentials) return false;
        const signedIn = await firebaseAuthService.signIn(credentials);
        setProfile(signedIn);
        setIsSignedIn(true);
        // Read/refresh the private Firestore profile doc and update lastSignedInAt (best-effort).
        // Also backfills the doc for accounts created before this phase.
        syncProfileDoc('sign-in', () =>
          firebaseUserService.recordSignIn(signedIn.id, signedIn.displayName),
        );
        return true;
      }

      // Local mode restores the single stored profile (no credentials).
      if (!profile) return false;
      setIsSignedIn(true);
      try {
        await AsyncStorage.setItem(SIGNED_IN_KEY, 'true');
      } catch {
        // Non-fatal.
      }
      return true;
    },
    [profile],
  );

  const signOut = useCallback(async () => {
    if (AUTH_MODE === 'firebase') {
      // onAuthStateChanged will clear profile/isSignedIn after Firebase signs out.
      await firebaseAuthService.signOut();
      return;
    }

    setIsSignedIn(false);
    try {
      await AsyncStorage.setItem(SIGNED_IN_KEY, 'false');
    } catch {
      // Non-fatal.
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (AUTH_MODE !== 'firebase') return;
    await firebaseAuthService.sendPasswordReset(email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      isSignedIn,
      isHydrating,
      authMode: AUTH_MODE,
      requiresPassword: AUTH_MODE === 'firebase',
      createProfile,
      updateProfile,
      signIn,
      signOut,
      sendPasswordReset,
    }),
    [profile, isSignedIn, isHydrating, createProfile, updateProfile, signIn, signOut, sendPasswordReset],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
