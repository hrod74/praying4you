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

import type { UserProfile } from '../models/types';

/**
 * AuthContext — local profile + simulated sign-in/out state.
 *
 * Prototype scope (Phase B): this is NOT real authentication and is NOT a real account
 * boundary. It holds a single local profile (display name + email) on the device and a
 * simulated "signed in" flag. There is no server, no password, and no token — email is
 * stored locally only and is never shown on any public surface.
 *
 * Persistence uses AsyncStorage (local device storage) so a profile survives app
 * restarts for smoother demos. Storage failures never break the flow — in-memory state
 * is always updated first; persistence is best-effort.
 *
 * Migration seam: screens call this context's API (createProfile / signIn / signOut),
 * never storage directly. When the Firebase-backed MVP replaces the simulation, only
 * this module changes.
 */

const PROFILE_KEY = 'p4u.profile';
const SIGNED_IN_KEY = 'p4u.signedIn';
const LOCAL_USER_ID = 'local-user';

export interface CreateProfileInput {
  displayName: string;
  email: string;
}

interface AuthContextValue {
  /** The local profile, if one has been created (persists across sign-out). */
  profile: UserProfile | null;
  /** Simulated signed-in state. */
  isSignedIn: boolean;
  /** True while the persisted state is being loaded on startup. */
  isHydrating: boolean;
  /** Create the local profile and enter the app (simulated sign-in). */
  createProfile: (input: CreateProfileInput) => Promise<void>;
  /** Update the local profile's display name + email (local prototype only). No-op if none. */
  updateProfile: (input: CreateProfileInput) => Promise<void>;
  /** Simulate signing in an existing local profile. Returns false if none exists. */
  signIn: () => Promise<boolean>;
  /** Simulate signing out. Keeps the stored profile so the user can sign back in. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // Load any persisted profile / session on startup.
  useEffect(() => {
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

  const createProfile = useCallback(async ({ displayName, email }: CreateProfileInput) => {
    const newProfile: UserProfile = {
      id: LOCAL_USER_ID,
      displayName: displayName.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
    };
    // Update in-memory state first so the UI is correct even if storage fails.
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

  // Local profile edit (display name + email). In-memory first so the UI is correct even if
  // storage fails; persistence is best-effort. Email stays on-device and is never public.
  // No real auth: there is no duplicate-email check here — that belongs to the future
  // Firebase/Auth layer (see docs/product-requirements.md §19 and implementation-plan.md §11).
  const updateProfile = useCallback(
    async ({ displayName, email }: CreateProfileInput) => {
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
        // Non-fatal: the session still reflects the change, just not across restarts.
      }
    },
    [profile],
  );

  const signIn = useCallback(async () => {
    if (!profile) return false;
    setIsSignedIn(true);
    try {
      await AsyncStorage.setItem(SIGNED_IN_KEY, 'true');
    } catch {
      // Non-fatal.
    }
    return true;
  }, [profile]);

  const signOut = useCallback(async () => {
    setIsSignedIn(false);
    try {
      await AsyncStorage.setItem(SIGNED_IN_KEY, 'false');
    } catch {
      // Non-fatal.
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      isSignedIn,
      isHydrating,
      createProfile,
      updateProfile,
      signIn,
      signOut,
    }),
    [profile, isSignedIn, isHydrating, createProfile, updateProfile, signIn, signOut],
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
