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
import {
  accountDeletionError,
  CHANGE_PASSWORD_COPY,
  PasswordChangeError,
} from '../services/firebase/authErrors';
import { firebaseUserService } from '../services/firebase/userService';
import { renamePublicDisplayName } from '../services/firebase/displayNameRenameService';
import { removeOwnRequestsForAccountDeletion } from '../services/prayerRequests';
import { renameLocalPrayers } from '../services/prayerService';
import { deleteMyInteractionsForAccountDeletion } from '../services/prayerInteractions';
import { deleteMyReportsForAccountDeletion } from '../services/reports';
import { deleteMyHiddenAccountsForAccountDeletion } from '../services/hiddenAccounts';
import { RENAME_PROPAGATION_ERROR_MESSAGE } from '../utils/displayNameRenamePlan';
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
 * Run an account-deletion cleanup step BEST-EFFORT, awaiting it but swallowing failures (Phase J.2h).
 *
 * The cleanup of the user's own `prayerInteractions`, `reports`, and outgoing `hiddenAccounts`
 * removes the records that identify them as an actor, but it must NEVER trap a user in an
 * undeletable account: if a cleanup write fails (for example because the new delete rules have not
 * been republished yet, or a transient network error), we log in dev and continue, so the critical
 * steps (profile-doc delete, Auth delete) still run. Any orphaned interaction/report/hide doc is
 * low-risk: it carries only an opaque UID, is never listable across users, and has no "who
 * prayed"/"who reported"/"who hid" surface. The dev log records only the Firebase error code
 * (non-sensitive); never a uid, email, or any private value.
 */
async function cleanupBestEffort(label: string, run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch (error) {
    if (!__DEV__) return;
    const code = (error as { code?: string })?.code ?? 'unknown';
    const hint =
      code === 'permission-denied'
        ? ' Republish mobile-app/firestore.rules in the Firebase Console (Firestore Database > Rules).'
        : '';
    console.warn(
      `[delete] best-effort cleanup "${label}" failed (code: ${code}); continuing with account ` +
        `deletion.${hint}`,
    );
  }
}

/**
 * AuthContext, the single auth seam, with two interchangeable modes behind one API.
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
const TERMS_VERSION_KEY = 'p4u.termsAcceptedVersion';
const LOCAL_USER_ID = 'local-user';
export const CURRENT_TERMS_VERSION = '2026-08-15';

/** Active auth mode, decided once at load from whether Firebase config is present. */
export type AuthMode = 'firebase' | 'local';
const AUTH_MODE: AuthMode = isFirebaseConfigured() ? 'firebase' : 'local';

export interface CreateProfileInput {
  displayName: string;
  email: string;
  /** Required in Firebase mode (email/password). Ignored in local mode. */
  password?: string;
  /** Must be true after an explicit, non-skippable account-creation acknowledgment. */
  acceptedTerms: boolean;
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
  /**
   * Change the signed-in user's password (Firebase mode only). Reauthenticates with the current
   * password, then updates to the new one. Throws a PasswordChangeError with safe copy on failure
   * (including `requiresRecentLogin`). In local mode there is no password, so it throws a calm
   * PasswordChangeError explaining the feature needs Firebase.
   */
  changePassword: (input: { currentPassword: string; newPassword: string }) => Promise<void>;
  /**
   * Permanently delete the signed-in account and return to the signed-out state.
   *
   * Firebase mode (in order, while still authenticated): soft-removes the user's active
   * `prayerRequests` (status -> removed, removedReason -> accountDeleted; never hard-deleted), then
   * best-effort deletes the records that identify the user as an actor, their own
   * `prayerInteractions` and their own `reports` (Phase J.2h; aggregate `prayerCount` is preserved by
   * design), then deletes the private `users/{uid}` profile doc, then deletes the Firebase Auth user,
   * then clears any local session state. Local mode: soft-removes the user's own submitted requests,
   * then clears the on-device profile/session. On failure of a CRITICAL step (request soft-remove,
   * profile-doc delete, Auth delete) it throws an AccountDeletionError with safe copy (and
   * `requiresRecentLogin` when a fresh sign-in is needed) and leaves the account intact; the
   * interaction/report cleanup is best-effort and never blocks deletion.
   */
  deleteAccount: () => Promise<void>;
  /** Whether the current account has accepted the currently published Terms version. */
  hasAcceptedCurrentTerms: boolean;
  /** One-time catch-up for accounts created before versioned acceptance was introduced. */
  acceptCurrentTerms: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [termsAcceptedVersion, setTermsAcceptedVersion] = useState<string | null>(null);

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
        const [[, storedProfile], [, storedSignedIn], [, storedTermsVersion]] = await AsyncStorage.multiGet([
          PROFILE_KEY,
          SIGNED_IN_KEY,
          TERMS_VERSION_KEY,
        ]);
        if (!active) return;
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile) as UserProfile);
          setIsSignedIn(storedSignedIn === 'true');
          setTermsAcceptedVersion(storedTermsVersion);
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

  // Firebase Auth is the UI session source, while the private profile doc carries versioned consent.
  useEffect(() => {
    if (AUTH_MODE !== 'firebase' || !profile || !isSignedIn) {
      if (!isSignedIn) setTermsAcceptedVersion(null);
      return;
    }
    let active = true;
    void firebaseUserService.getOwnProfile(profile.id).then((stored) => {
      if (active) setTermsAcceptedVersion(stored?.termsAcceptedVersion ?? null);
    }).catch(() => {
      if (active) setTermsAcceptedVersion(null);
    });
    return () => { active = false; };
  }, [profile?.id, isSignedIn]);

  const createProfile = useCallback(async ({ displayName, email, password, acceptedTerms }: CreateProfileInput) => {
    if (!acceptedTerms) throw new Error('You must accept the Terms of Use to create an account.');
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
      // Await the trust record. If Firestore is temporarily unavailable, the Auth account still
      // exists; leave the version unset so the one-time catch-up gate retries before first posting.
      try {
        await firebaseUserService.ensureProfileForSignUp(
          created.id,
          created.displayName,
          CURRENT_TERMS_VERSION,
        );
        setTermsAcceptedVersion(CURRENT_TERMS_VERSION);
      } catch (error) {
        if (__DEV__) {
          const code = (error as { code?: string })?.code ?? 'unknown';
          console.warn(`[profile] Terms acceptance sync will retry before first post (${code}).`);
        }
      }
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
        [TERMS_VERSION_KEY, CURRENT_TERMS_VERSION],
      ]);
      setTermsAcceptedVersion(CURRENT_TERMS_VERSION);
    } catch {
      // Non-fatal: the session still works for this run, just not across restarts.
    }
  }, []);

  const acceptCurrentTerms = useCallback(async () => {
    if (!profile) throw new Error('Sign in before accepting the Terms of Use.');
    if (AUTH_MODE === 'firebase') {
      await firebaseUserService.ensureProfileForSignUp(
        profile.id,
        profile.displayName,
        CURRENT_TERMS_VERSION,
      );
    } else {
      await AsyncStorage.setItem(TERMS_VERSION_KEY, CURRENT_TERMS_VERSION);
    }
    setTermsAcceptedVersion(CURRENT_TERMS_VERSION);
  }, [profile]);

  // Edit profile. A display name represents the account's current public identity: changing it
  // must also rename every active, non-Anonymous prayer request this account owns, everywhere
  // that name is shown. Firebase mode updates the display name only (email change is deferred to
  // a later phase as it needs verification/reauth); local mode updates name + email on-device.
  //
  // Cross-service honesty (Firebase mode): Firebase Authentication (the display name on the Auth
  // user record) and the Firestore batch that renames the profile doc plus every matching request
  // are two separate products and cannot be committed as one atomic operation across both. Auth is
  // updated first, since it is the sign-in source of truth; success and in-memory profile state
  // are reported only once the Firestore batch has ALSO succeeded, never treating that batch as
  // best-effort. If Auth succeeds but the batch fails, the thrown error (calm, safe copy) is
  // rethrown to the caller instead of being swallowed, so the Settings screen shows a retryable
  // error rather than a false "Profile updated." Both halves are idempotent (each writes an
  // absolute value, not a delta), so retrying with the same desired name is always safe. Local
  // mode mirrors the same honesty: the on-device profile write and the request-propagation write
  // both happen before in-memory state is updated, and neither is swallowed as best-effort.
  const updateProfile = useCallback(
    async ({ displayName, email }: { displayName: string; email: string }) => {
      if (AUTH_MODE === 'firebase') {
        const updated = await firebaseAuthService.updateDisplayName(displayName);
        await renamePublicDisplayName(updated.id, updated.displayName);
        setProfile(updated);
        return;
      }

      if (!profile) return;
      const next: UserProfile = {
        ...profile,
        displayName: displayName.trim(),
        email: email.trim(),
      };
      try {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
        await renameLocalPrayers(next.id, next.displayName);
      } catch {
        throw new Error(RENAME_PROPAGATION_ERROR_MESSAGE);
      }
      setProfile(next);
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

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      // Local/mock mode has no password to change; surface calm copy instead of crashing.
      if (AUTH_MODE !== 'firebase') {
        throw new PasswordChangeError(CHANGE_PASSWORD_COPY.localUnavailable);
      }
      // By the book: Firebase reauthenticates and updates the password. Errors arrive as a
      // PasswordChangeError carrying safe copy (and `requiresRecentLogin` when relevant).
      await firebaseAuthService.changePassword({ currentPassword, newPassword });
    },
    [],
  );

  const deleteAccount = useCallback(async () => {
    if (AUTH_MODE === 'firebase') {
      const uid = profile?.id;
      if (uid) {
        // 1. Soft-remove the user's active prayer requests FIRST, while still authenticated
        //    (owner-only rules require request.auth.uid == authorUid). Requests are marked removed,
        //    never hard-deleted, so reports/interactions can't reference a missing request. We stop
        //    on failure so we never delete the account while their requests are still in the feed.
        try {
          await removeOwnRequestsForAccountDeletion(uid);
        } catch (error) {
          throw accountDeletionError(error);
        }
        // 2. Clean up the records that directly identify this user as an actor (Phase J.2h):
        //    their own prayerInteractions and their own reports. BEST-EFFORT: a failure here (e.g.
        //    the new delete rules not yet republished) must never trap the user in an undeletable
        //    account, and any orphaned doc is low-risk (opaque UID, never listable across users, no
        //    who-prayed/who-reported surface). prayerCount is intentionally NOT decremented.
        await cleanupBestEffort('prayerInteractions', () =>
          deleteMyInteractionsForAccountDeletion(uid),
        );
        await cleanupBestEffort('reports', () => deleteMyReportsForAccountDeletion(uid));
        // Also remove this user's own OUTGOING hides ("Hide requests from this account"), same
        // best-effort treatment. INCOMING hides (other users' hides of this account) are
        // intentionally left untouched; see docs/firebase-hidden-accounts-implementation.md.
        await cleanupBestEffort('hiddenAccounts', () =>
          deleteMyHiddenAccountsForAccountDeletion(uid),
        );
        // 3. Delete the private Firestore profile doc, still while authenticated (owner-only rules).
        //    We stop here on failure so we never orphan the doc by deleting Auth first.
        try {
          await firebaseUserService.deleteOwnProfile(uid);
        } catch (error) {
          throw accountDeletionError(error);
        }
      }
      // 4. Delete the Firebase Auth user (throws AccountDeletionError, e.g. requires-recent-login).
      await firebaseAuthService.deleteAccount();
      // 5. onAuthStateChanged will clear profile/isSignedIn; also clear any local fallback state.
      try {
        await AsyncStorage.multiRemove([PROFILE_KEY, SIGNED_IN_KEY, TERMS_VERSION_KEY]);
      } catch {
        // Non-fatal: the Firebase session is already gone.
      }
      return;
    }

    // Local/mock fallback: soft-remove the user's own submitted requests (best-effort; mirrors the
    // Firebase behavior so they leave the feed), then clear the on-device profile/session.
    const uid = profile?.id;
    if (uid) {
      try {
        await removeOwnRequestsForAccountDeletion(uid);
      } catch {
        // Non-fatal: local soft-remove is best-effort and must never block account deletion.
      }
      try {
        // Also remove the on-device "Hide requests from this account" storage, same best-effort
        // treatment as the soft-remove above.
        await deleteMyHiddenAccountsForAccountDeletion(uid);
      } catch {
        // Non-fatal: local cleanup is best-effort and must never block account deletion.
      }
    }
    setProfile(null);
    setIsSignedIn(false);
    try {
      await AsyncStorage.multiRemove([PROFILE_KEY, SIGNED_IN_KEY, TERMS_VERSION_KEY]);
    } catch {
      // Non-fatal: state is already cleared for this run.
    }
  }, [profile]);

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
      changePassword,
      deleteAccount,
      hasAcceptedCurrentTerms: termsAcceptedVersion === CURRENT_TERMS_VERSION,
      acceptCurrentTerms,
    }),
    [
      profile,
      isSignedIn,
      isHydrating,
      createProfile,
      updateProfile,
      signIn,
      signOut,
      sendPasswordReset,
      changePassword,
      deleteAccount,
      termsAcceptedVersion,
      acceptCurrentTerms,
    ],
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
