# Praying 4 You — Mobile App

A React Native / **Expo (managed workflow)** app, written in **TypeScript** with
**Expo Router** (file-based navigation). This is the functional local prototype of
Praying 4 You — built **mock-data-first**, with **no backend**. Firebase, AdMob, and
app-store configuration are intentionally deferred to later milestones.

> **Status: Phase A — Project foundation.** This phase scaffolds the project, the
> navigation skeleton, and the folder structure, with **minimal placeholder screens**
> to confirm navigation. No real features, data, or authentication yet — those arrive
> in Phases B–H (see [`../docs/implementation-plan.md`](../docs/implementation-plan.md)).

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

## What you can do in Phase A

The app boots to a **Welcome** screen, from which you can confirm navigation:

- **Enter app shell (tabs)** → a tab navigator with **Feed**, **Verse**, and
  **Settings** tabs.
- From **Feed**, tap the sample card → a stacked **Prayer detail** screen
  (confirms dynamic/stacked routing).
- **Auth screens (Phase B placeholder)** → placeholder **Sign in** and
  **Create profile** screens.

Every screen is clearly labeled as a placeholder. There is no real data, persistence,
or authentication yet.

## Project structure

```text
mobile-app/
├── app/                       # Expo Router routes (file-based navigation)
│   ├── _layout.tsx            # Root stack (future: Auth/Prayer providers + gating)
│   ├── index.tsx              # Welcome / entry
│   ├── (auth)/                # Auth route group (placeholders)
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── create-profile.tsx
│   └── (app)/                 # Main app tab shell
│       ├── _layout.tsx        # Tabs: Feed, Verse, Settings
│       ├── feed/
│       │   ├── _layout.tsx    # Feed stack
│       │   ├── index.tsx      # Prayer feed (placeholder)
│       │   └── [id].tsx       # Prayer detail (placeholder)
│       ├── verse.tsx
│       └── settings.tsx
│
├── src/
│   ├── context/               # (empty in Phase A) AuthContext, PrayerContext later
│   ├── services/              # (empty) data-access seam — Firebase swaps in here later
│   ├── data/                  # (empty) mock seed data later
│   ├── models/
│   │   └── types.ts           # TypeScript contracts (mirror future Firestore shapes)
│   ├── components/            # (empty) reusable feature components later
│   ├── theme/
│   │   └── theme.ts           # Colors, spacing, typography
│   └── utils/                 # (empty) pure helpers later
│
├── assets/                    # App icons / splash
├── app.json                   # Expo config (no secrets)
├── package.json
└── tsconfig.json
```

### Architecture notes

- **Services seam:** all data access will go through `src/services/`. Screens import
  services, never raw data — this is the boundary where Firebase is added later
  **without changing the screens**.
- **Typed contracts:** `src/models/types.ts` mirrors the eventual Firestore document
  shapes so the same types carry forward into the Firebase-backed MVP.
- **State:** lightweight React Context + hooks (added in later phases); no Redux.

## Scope guardrails (prototype milestone)

- **No** Firebase (Auth, Firestore, config, SDK).
- **No** AdMob or any ad/analytics/tracking SDK.
- **No** app-store configuration or EAS cloud build.
- **No** production authentication (local/simulated only, from Phase B).
- **No** secrets, API keys, database URLs, bucket names, tokens, or credentials —
  ever. (`.env*` and Firebase service-account files are git-ignored.)

See [`../docs/prototype-roadmap.md`](../docs/prototype-roadmap.md) and
[`../docs/implementation-plan.md`](../docs/implementation-plan.md) for the full plan.
