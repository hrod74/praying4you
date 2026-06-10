# Praying 4 You — Mobile App

A React Native / **Expo (managed workflow)** app, written in **TypeScript** with
**Expo Router** (file-based navigation). This is the functional local prototype of
Praying 4 You — built **mock-data-first**, with **no backend**. Firebase, AdMob, and
app-store configuration are intentionally deferred to later milestones.

> **Status: Phase B — Local auth + profile (simulated).** Builds on the Phase A
> foundation with a working create-profile flow, simulated sign-in/sign-out, and
> signed-in vs. signed-out routing. The profile is stored **locally on the device** (no
> backend, no password, no real authentication). The Feed, Verse, and Prayer-detail
> screens remain Phase A placeholders until Phase C+ (see
> [`../docs/implementation-plan.md`](../docs/implementation-plan.md)).

## Requirements

- [Node.js](https://nodejs.org/) 18+ (developed on Node 24)
- npm (ships with Node)
- The **Expo Go** app on a physical iOS/Android device, **or** an iOS Simulator
  (Xcode) / Android Emulator (Android Studio)

No Expo/EAS account is required to run the app locally.

## Setup & run (local only)

```bash
cd mobile-app
npm install
npx expo start
```

With the dev server running, open the app one of these ways:

- **Expo Go** — scan the QR code in the terminal with your phone.
- **iOS Simulator** — press `i`.
- **Android Emulator** — press `a`.
- **Web (preview)** — press `w`.

Other useful scripts:

```bash
npm run ios       # start + open iOS simulator
npm run android   # start + open Android emulator
npm run web       # start + open web
npx tsc --noEmit  # type-check the project
```

## What you can do in Phase B

The app opens to a **Welcome** screen when signed out:

- **Get started** → **Create profile**: enter a display name and email, then enter the
  app. Your email is kept private and is never shown on prayer content.
- **I already have a profile** → **Sign in**: restores the signed-in state for the local
  profile saved on this device (a simulated, password-free sign-in).
- Once signed in, you land in the tab shell (**Feed**, **Verse**, **Settings**). Feed,
  Verse, and Prayer detail are still Phase A placeholders.
- **Settings** shows your display name and (privately) your email, and lets you
  **Sign out** — which returns you to the Welcome screen.
- **Gating:** signed-out users cannot reach the app tabs; signed-in users skip the auth
  screens. The profile persists across app restarts (local device storage).

There is still no backend, no real authentication, and no prayer data yet.

## Project structure

```text
mobile-app/
├── app/                       # Expo Router routes (file-based navigation)
│   ├── _layout.tsx            # Root: AuthProvider + hydration splash + gating stack
│   ├── index.tsx              # Welcome / entry (redirects in when signed in)
│   ├── (auth)/                # Auth route group (shown when signed out)
│   │   ├── _layout.tsx        # Redirects to app when already signed in
│   │   ├── create-profile.tsx # Create local profile (name + email)
│   │   └── sign-in.tsx        # Simulated sign-in for an existing local profile
│   └── (app)/                 # Main app tab shell (signed-in only)
│       ├── _layout.tsx        # Tabs: Feed, Verse, Settings; redirects out if signed out
│       ├── feed/
│       │   ├── _layout.tsx    # Feed stack
│       │   ├── index.tsx      # Prayer feed (placeholder)
│       │   └── [id].tsx       # Prayer detail (placeholder)
│       ├── verse.tsx          # Verse of the day (placeholder)
│       └── settings.tsx       # Profile (name + private email) + sign out
│
├── src/
│   ├── context/
│   │   └── AuthContext.tsx     # Local profile + simulated session (AsyncStorage-backed)
│   ├── services/              # (empty) data-access seam — Firebase swaps in here later
│   ├── data/                  # (empty) mock seed data later
│   ├── models/
│   │   └── types.ts           # TypeScript contracts (mirror future Firestore shapes)
│   ├── components/
│   │   ├── Button.tsx          # Primary/secondary action button
│   │   ├── Screen.tsx          # Padded, keyboard-aware screen container
│   │   └── TextField.tsx       # Labeled input with helper/inline-error text
│   ├── theme/
│   │   └── theme.ts           # Colors, spacing, typography
│   └── utils/
│       └── validation.ts       # Pure display-name / email validators
│
├── assets/                    # App icons / splash
├── app.json                   # Expo config (no secrets)
├── .npmrc                     # legacy-peer-deps=true (see note below)
├── package.json
└── tsconfig.json
```

### Architecture notes

- **Auth seam:** screens call `AuthContext`'s API (`createProfile` / `signIn` /
  `signOut`), never storage directly. When the Firebase-backed MVP replaces the
  simulation, only `src/context/AuthContext.tsx` changes.
- **Services seam:** all prayer/verse data access will go through `src/services/`.
  Screens import services, never raw data — the boundary where Firebase is added later
  **without changing the screens**.
- **Typed contracts:** `src/models/types.ts` mirrors the eventual Firestore document
  shapes so the same types carry forward into the Firebase-backed MVP.
- **State:** lightweight React Context + hooks; no Redux.
- **Local persistence:** `@react-native-async-storage/async-storage` stores the local
  profile and the simulated session flag on-device so they survive app restarts. This
  is the only added runtime dependency in Phase B; it needs no backend and stores no
  secrets.

> **Note on `.npmrc`:** Expo SDK 56 pins `react@19.2.3` while a web-only transitive
> (`react-dom`) requests a slightly newer React. That mismatch only affects the unused
> web target, but npm 11's strict peer resolution would block `npm install`. The
> committed `.npmrc` sets `legacy-peer-deps=true` so `npm install` works from a clean
> clone. It configures no registry credentials.

## Scope guardrails (prototype milestone)

- **No** Firebase (Auth, Firestore, config, SDK).
- **No** AdMob or any ad/analytics/tracking SDK.
- **No** app-store configuration or EAS cloud build.
- **No** production authentication (local/simulated only, from Phase B).
- **No** secrets, API keys, database URLs, bucket names, tokens, or credentials —
  ever. (`.env*` and Firebase service-account files are git-ignored.)

See [`../docs/prototype-roadmap.md`](../docs/prototype-roadmap.md) and
[`../docs/implementation-plan.md`](../docs/implementation-plan.md) for the full plan.
