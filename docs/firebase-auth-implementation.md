# Firebase Auth Implementation (Phase J.2b)

**Status:** Firebase **Authentication** is now wired as the first real Firebase integration. All
prayer data (requests, interactions, reports) and verses remain **local/mock**. No real Firebase
values are committed; the app runs in a **local/mock fallback** whenever Firebase is not
configured.

---

## What Firebase Auth now handles

When `EXPO_PUBLIC_FIREBASE_*` is configured (via local `.env.local`), the app uses real Firebase
Authentication (email/password, by the book) through the Firebase JS SDK:

- **Sign up** — `createUserWithEmailAndPassword` + set the display name on the Firebase Auth user
  profile. (The Firestore `users/{uid}` profile doc is **deferred** to the Firestore phase.)
- **Sign in** — `signInWithEmailAndPassword`.
- **Sign out** — `signOut`.
- **Edit display name** — `updateProfile({ displayName })`. (Email change is deferred; it needs
  verification/reauth.)
- **Password reset** — `sendPasswordResetEmail` (a "Forgot password" link on the sign-in screen).
- **Session persistence** — `initializeAuth` with **React Native AsyncStorage** persistence, so a
  signed-in user stays signed in across app restarts. Hydration uses `onAuthStateChanged`.

By the book: Firebase owns credential storage/hashing, sessions/tokens, and **email uniqueness**.
We do not custom-build auth logic. There is **no anonymous Firebase auth**, no social login, and
no email-link/passwordless. ("Anonymous" remains a per-post display choice, handled elsewhere.)

Files:
- `src/services/firebase/authService.ts` — real Auth service (lazy `getFirebaseAuth`, RN
  persistence, `subscribeToProfile`).
- `src/services/firebase/authErrors.ts` — maps Firebase error codes to safe, calm copy.
- `src/context/AuthContext.tsx` — mode-aware seam used by all screens.
- `app/(auth)/create-profile.tsx`, `app/(auth)/sign-in.tsx`, `app/(app)/settings.tsx` — show a
  password field / credential sign-in only when Firebase is active.

## Fallback behavior when Firebase is not configured

`isFirebaseConfigured()` returns false when the env vars are absent. The app then runs in
**local mode**, exactly as before J.2b:

- Simulated local profile (display name + email) in AsyncStorage, no password, no server.
- "Continue as <name>" sign-in; local sign out; local profile edit (name + email).
- This is the default with no `.env.local`, so the prototype always runs.

The UI adapts automatically: `authMode` / `requiresPassword` from `AuthContext` decide whether the
create-profile and sign-in screens show a password field and credential sign-in.

## Required Firebase Console settings

- **Authentication > Sign-in method > Email/Password: Enabled.**
- Email link (passwordless): **off**. Google / Apple / other providers: **off** (not used in MVP).
- A **Web app** registered in the project (the web config feeds the `EXPO_PUBLIC_FIREBASE_*` vars).
- No Firestore rules/data are required for this phase (auth only).

## How `.env.local` is used without committing values

- Real Firebase **web config** lives only in `mobile-app/.env.local` (gitignored, never committed).
- Expo inlines `EXPO_PUBLIC_FIREBASE_*` at build time; `src/config/firebaseConfig.ts` reads only
  those names. No real values appear anywhere in the repo.
- `.env.example` holds **placeholder names only** and is the committed template.
- `.gitignore` (root + `mobile-app/`) ignores `.env` / `.env.*` (except `.env.example`) and the
  Firebase native/admin config file names. **Service-account keys are never used or committed.**
- Run a secret scan before every config-touching commit (`docs/workflows.md` §2).

## Error handling (safe, user-facing copy)

Raw Firebase detail is never shown. `authErrorMessage()` maps codes to calm copy:

- Duplicate email (`auth/email-already-in-use`): *"That email is already connected to another
  profile. Please use a different email or sign in."*
- Wrong password / no user / invalid credential: *"We could not sign you in. Check your email and
  password and try again."* (does not disclose which field was wrong)
- Invalid email, weak password, network error, too many requests, and a generic fallback each have
  their own calm copy. No em dashes in user-facing strings.

## Remaining Auth gaps (follow-ups)

- **Account deletion** — required before alpha/beta with real testers. Documented gate;
  `firebaseAuthService.deleteAccount()` intentionally throws `NotImplementedError` for now. Not
  implemented in this phase because it must be built and verified carefully (and is not trivially
  safe). Do not delete real users via untested code.
- **Email change** in Firebase mode (needs verification/reauth) — deferred; settings edits the
  display name only when Firebase is active.
- **Email verification** gating — recommended but not gating sign-in for now (revisit before
  public launch).
- **Firestore `users/{uid}` profile doc** — deferred to the Firestore phase; display name lives on
  the Firebase Auth user for now.

## Privacy invariants (unchanged)

- Email is **private**: stored in Firebase Auth, never written to prayer data, never shown to other
  users.
- Display name is the only public identity; "Anonymous" is a per-post display choice (not anonymous
  Firebase auth).
- No raw user IDs or owner identifiers are exposed in any feed/detail assumption; prayer
  interactions remain aggregate-only (no "who prayed" is shown). None of that changes here.

## Validation performed

- TypeScript type-check passes.
- Production bundle builds (Expo `export`) with `firebase/auth` reachable — Expo Go compatible,
  no native modules, no SDK upgrade.
- Metro dev server boots with `.env.local` loaded (Firebase mode) and with config absent (local
  fallback path preserved).
- No Firestore is imported or used; prayer data stays local/mock.

**Interactive auth flows** (create account, duplicate-email copy, sign in, sign out, restart/session
persistence) should be verified by the owner in **Expo Go on a device/simulator** with `.env.local`
present, since they require real UI interaction and network.

## Next recommended phase (J.2c / Firestore)

1. Owner verifies the interactive auth flows on a device (account creation, duplicate email, sign
   in/out, persistence across restart).
2. Implement **account deletion** (user-initiated) and verify it — required before alpha/beta.
3. Begin Firestore behind the existing seam: `users/{uid}` profile doc, then `prayerRequests`
   reads (feed/detail), then create/edit/remove, then aggregate-only interactions, then reports —
   each with **security rules + emulator tests** before any external tester (plan J.6).
