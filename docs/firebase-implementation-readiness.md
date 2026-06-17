# Firebase Implementation Readiness (Phase J.2a)

**Status:** safe config scaffold only. The app remains **fully local/mock**. No Firebase
project values, keys, or service-account files are in the repo, and nothing connects to
Firebase by default.

**Scope of this phase:** prepare the mobile app for Firebase integration in a safe, reversible
way — add the Expo Go-compatible SDK, a guarded (inert) init path, env-driven config, and typed
service boundaries — **without** replacing local/mock behavior or reading/writing real data.

---

## Package strategy (decision)

- **Firebase JS SDK** (`firebase`) is used, not the native `@react-native-firebase`. The JS SDK
  is pure JavaScript with no native modules, so it works in **Expo Go** and needs **no EAS /
  custom development build** and **no Expo SDK upgrade**. This matches the documented plan
  (`product-requirements.md`: "Firebase JS SDK (modular v9+)").
- Expo SDK 54 enables Metro package exports by default, so the modular SDK resolves without a
  custom `metro.config.js`.
- Added with the project's package manager via `npx expo install firebase`. Expo SDK is
  unchanged (still `~54.0.x`). Native Firebase modules were **not** added.

## What was scaffolded

All new code lives under `mobile-app/` and is **not imported by the running app yet**:

- `src/config/firebaseConfig.ts` — builds the Firebase web config from `EXPO_PUBLIC_FIREBASE_*`
  env vars (no real values in the repo). `isFirebaseConfigured()` returns **false** when env
  vars are unset (the case now), which keeps the app local/mock.
- `src/services/firebase/firebaseApp.ts` — a **guarded, lazy** app accessor. `getFirebaseApp()`
  returns `null` and never calls `initializeApp` unless real config is present. **Inert by
  default**, so there is no network connection and no Firebase reads/writes.
- `src/services/firebase/contracts.ts` — typed service interfaces mirroring the local seam and
  the plan: `AuthService`, `UserService`, `PrayerRequestService`, `PrayerInteractionService`,
  `ReportService`, plus a `NotImplementedError`.
- `src/services/firebase/{authService,userService,prayerRequestService,prayerInteractionService,reportService}.ts`
  — **stubs** implementing those interfaces; every method throws `NotImplementedError`, so
  nothing can accidentally hit Firebase in this phase.
- `src/services/firebase/index.ts` — barrel exports for the module.
- `.env.example` — placeholder env names only (no real values). `.gitignore` updated so real
  env / Firebase config files are never committed.

Privacy invariants are encoded in the contracts and stub comments so they carry into
implementation: email stays private; feed/detail must not expose raw user IDs or unnecessary
owner identifiers; prayer interactions are **aggregate-only** to other users (counts only, never
who prayed — there is deliberately no "list who prayed" method); reporting stays lightweight
(manual console review, duplicates prevented, no admin dashboard); email/password is the MVP auth
method and **anonymous Firebase auth is not implemented**.

## Where Firebase config will eventually go

- Real values are read from **environment variables** with the `EXPO_PUBLIC_FIREBASE_*` prefix
  (Expo inlines these at build time; compatible with Expo Go).
- For local development, copy `.env.example` to **`.env.local`** (gitignored) and fill in the
  real values from the Firebase console (Project settings > Your apps > Web app).
- The values flow: `.env.local` → `process.env.EXPO_PUBLIC_FIREBASE_*` → `firebaseConfig.ts` →
  (a later phase) `getFirebaseApp()`.

## What must NEVER be committed

- Real Firebase web config values: **API keys, app IDs, measurement IDs, project IDs, auth
  domains, storage buckets, messaging sender IDs, database URLs.**
- Any **`.env`** / `.env.*` file with real values (only `.env.example` with placeholders is
  committed).
- **Service-account keys** (`serviceAccountKey.json`, `firebase-adminsdk*.json`) and native
  config (`google-services.json`, `GoogleService-Info.plist`).
- No real values should be pasted into chat tools, screenshots, or public docs.

`.gitignore` (both repo root and `mobile-app/`) is configured to enforce this. Run a secret scan
before every config-touching commit (see `docs/workflows.md` §2).

## What remains local/mock (unchanged this phase)

- **Auth/profile:** `src/context/AuthContext.tsx` (simulated local profile + session).
- **Prayer data, interactions, reports:** `src/context/PrayerContext.tsx` +
  `src/services/prayerService.ts` (AsyncStorage, derived counts).
- **Verses:** bundled local KJV (`verseService.ts`).
- The app **opens in Expo Go and behaves exactly as before**; the Firebase scaffold is dormant.

## Next phase recommendation (J.2b)

Wire Firebase in **behind the existing `src/services/` seam, one concern at a time**, without
changing screens or shared types, and only with real config supplied locally via `.env.local`:

1. Implement `firebaseApp` Auth/Firestore accessors (Auth with React Native persistence).
2. Implement and swap in **auth** first (email/password, `auth/email-already-in-use` handling),
   keeping the local simulation as a fallback behind a flag.
3. Then `prayerRequests` reads (feed/detail), then `create/edit/remove`, then
   `prayerInteractions` (aggregate-only), then `reports`.
4. Add **Firestore security rules + emulator tests** before any external tester (plan J.6).
5. Keep a clean rollback: the local/mock path stays runnable until rules are proven.

No active Firestore reads/writes, no push notifications, no AI verse matching, and no anonymous
auth are introduced before those gates.
