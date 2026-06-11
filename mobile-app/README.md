# Praying 4 You — Mobile App

A React Native / **Expo (managed workflow)** app, written in **TypeScript** with
**Expo Router** (file-based navigation). This is the functional local prototype of
Praying 4 You — built **mock-data-first**, with **no backend**. Firebase, AdMob, and
app-store configuration are intentionally deferred to later milestones.

> **Status: Phase F — Verse of the day.** The **Verse** tab now shows a real, calm daily
> verse from bundled **local** data (KJV, public domain) via a `verseService` that picks a
> **deterministic verse for the current day** (same day → same verse) — **no external
> Bible API**, no network, no keys. The screen shows the verse + reference and a short
> app-written reflection, clearly distinct from scripture, in the parchment/journal style.
> Earlier phases (auth, feed, submit, "I prayed for this") are unchanged. Still
> **local/mock only — no backend**. Reporting is Phase G.

## Requirements

- [Node.js](https://nodejs.org/) 18+ (developed on Node 24)
- npm (ships with Node)
- The **Expo Go** app on a physical iOS/Android device, **or** an iOS Simulator
  (Xcode) / Android Emulator (Android Studio)

No Expo/EAS account is required to run the app locally.

> **Expo SDK / Expo Go compatibility:** this app is pinned to **Expo SDK 54**, the SDK
> supported by the current public **Expo Go** app from the iOS App Store (Expo Go 54.x).
> It is intentionally *not* on the newer SDK 55/56 edge, which the public Expo Go does
> not yet run. Use the latest public Expo Go and it will open this project. **Do not
> upgrade the Expo SDK** until public Expo Go ships support for the target SDK, or until
> the project moves to a development build / EAS (out of scope for this prototype).
> After any SDK change, start with a cleared cache: `npx expo start -c`.

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

## What you can do in Phase F

After creating a local profile (Phase B), once signed in:

- **Feed tab** shows journal-style cards, **newest first**, each with a category tag, the
  poster's name (or **"Anonymous"**), date, preview, and an encouraging prayer count.
  Cards you've prayed for show a subtle **"🙏 You prayed"** indicator. Pull to refresh.
- **Share a prayer request** (button atop the feed) opens the submit form (text + counter,
  category, named/anonymous); on submit it appears at the **top of the feed** and opens in
  detail.
- **Tap any card** → the reflective **prayer detail** screen. There you can tap
  **I prayed for this** to mark that you prayed: the count increments, a second tap won't
  inflate it, and it shows **"🙏 You prayed for this"**. You can't pray for your **own**
  request (it shows "This is your request" instead).
- **Anonymous** requests show "Anonymous"; named requests show only the display name.
  **Email never appears** on any prayer surface.
- **Verse tab** shows the **Verse of the day** — a calm parchment card with the verse and
  reference, plus a short, clearly-labeled app **Reflection**. It's deterministic by day
  (the same day shows the same verse) and comes entirely from local data — no Bible API.
- **Settings** still shows your profile and **Sign out**.

Everything is local mock data — submitted requests and prayed-state live in memory for the
session; no backend, no real auth.

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
│       ├── _layout.tsx        # Tabs: Feed, Verse, Settings; PrayerProvider; gating
│       ├── feed/
│       │   ├── _layout.tsx    # Feed stack
│       │   ├── index.tsx      # Prayer feed (mock cards, newest first) + Share button
│       │   ├── [id].tsx       # Prayer detail (reflective read view)
│       │   └── submit.tsx     # Share a prayer request (write path, local)
│       ├── verse.tsx          # Verse of the day (deterministic daily verse, local)
│       └── settings.tsx       # Profile (name + private email) + sign out
│
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx     # Local profile + simulated session (AsyncStorage-backed)
│   │   └── PrayerContext.tsx   # In-memory prayer list (read path) via the service seam
│   ├── services/
│   │   ├── prayerService.ts    # Prayer read / create / pray-interaction seam (Firestore later)
│   │   └── verseService.ts     # Deterministic daily verse from local data (no API)
│   ├── data/
│   │   ├── mockPrayers.ts      # Seed prayer requests (fictional, model-shaped)
│   │   └── mockVerses.ts       # Seed verses (KJV, public domain) + app reflections
│   ├── models/
│   │   └── types.ts           # TypeScript contracts (mirror future Firestore shapes)
│   ├── components/
│   │   ├── Button.tsx          # Primary/secondary action button
│   │   ├── CategorySelect.tsx  # Selectable category chips (submit form)
│   │   ├── CategoryTag.tsx     # Subtle category chip (feed/detail)
│   │   ├── EmptyState.tsx      # Calm empty / not-found / error state
│   │   ├── PrayerCard.tsx      # Journal-style prayer feed card
│   │   ├── Screen.tsx          # Padded, keyboard-aware screen container
│   │   └── TextField.tsx       # Labeled input with helper/inline-error text
│   ├── theme/
│   │   └── theme.ts           # Warm parchment palette, spacing, typography
│   └── utils/
│       ├── format.ts           # Pure date / truncate / prayer-count helpers
│       └── validation.ts       # Pure display-name / email validators
│
├── assets/                    # App icons / splash
├── app.json                   # Expo config (no secrets)
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

## Scope guardrails (prototype milestone)

- **No** Firebase (Auth, Firestore, config, SDK).
- **No** AdMob or any ad/analytics/tracking SDK.
- **No** app-store configuration or EAS cloud build.
- **No** production authentication (local/simulated only, from Phase B).
- **No** secrets, API keys, database URLs, bucket names, tokens, or credentials —
  ever. (`.env*` and Firebase service-account files are git-ignored.)

See [`../docs/prototype-roadmap.md`](../docs/prototype-roadmap.md) and
[`../docs/implementation-plan.md`](../docs/implementation-plan.md) for the full plan.
