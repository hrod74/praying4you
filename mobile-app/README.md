# Praying 4 You — Mobile App

A React Native / **Expo (managed workflow)** app, written in **TypeScript** with
**Expo Router** (file-based navigation). This is the functional local prototype of
Praying 4 You — built **mock-data-first**, with **no backend**. Firebase, AdMob, and
app-store configuration are intentionally deferred to later milestones.

> **Status: Phase G — Navigation, Settings/About, Reporting.** The bottom navigation now
> has four tabs with quiet, concept-matched icons (a dove for **Feed**, a quill for
> **Share**, a Bible for **Verse**, a person for **Settings**), and **Create/Share Prayer
> is a persistent tab** so it's always reachable — even after scrolling. **Settings** is a
> fuller Profile/Privacy/About screen, and the prayer **detail** screen has a calm, local
> **Report request** flow (reason + optional note → gentle confirmation; flagged locally;
> hidden on your own posts). Still **local/mock only — no backend**. Polish + demo capture
> is Phase H.

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

## What you can do in Phase G

After creating a local profile (Phase B), once signed in, the bottom navigation has four
tabs — **Feed** (dove), **Share** (quill), **Verse** (Bible), **Settings** (person):

- **Feed** shows journal-style cards, **newest first**, each with a category tag, the
  poster's name (or **"Anonymous"**), date, preview, and an encouraging prayer count.
  Cards you've prayed for show a subtle **"🙏 You prayed"** indicator. Pull to refresh.
- **Share** (persistent tab — always reachable, even after scrolling) opens the compose
  form (text + counter, category, named/anonymous); on submit it appears at the **top of
  the feed** and opens in detail.
- **Tap any card** → the reflective **prayer detail**. Tap **I prayed for this** to mark
  that you prayed (count increments, second tap won't inflate it, shows **"🙏 You prayed
  for this"**); you can't pray for your **own** request. A quiet **Report this request**
  link (hidden on your own posts) opens a calm reason picker + optional note → a gentle
  confirmation; the request is flagged locally (no real moderation backend).
- **Anonymous** requests show "Anonymous"; named requests show only the display name.
  **Email never appears** on any prayer surface.
- **Verse** shows the **Verse of the day** — verse + reference + a labeled app
  **Reflection**, deterministic by day, from local data (no Bible API).
- **Settings** shows your **Profile** (display name + private email), plain-language
  **Privacy** guidance, an **About** section, and **Sign out**.

Everything is local mock data — submitted requests, prayed-state, and reports live in
memory for the session; no backend, no real auth.

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
│       ├── _layout.tsx        # Tabs (icons): Feed, Share, Verse, Settings; PrayerProvider; gating
│       ├── submit.tsx         # Share/create a prayer request (persistent tab, write path)
│       ├── feed/
│       │   ├── _layout.tsx    # Feed stack
│       │   ├── index.tsx      # Prayer feed (mock cards, newest first)
│       │   ├── [id].tsx       # Prayer detail (read + "I prayed" + report link)
│       │   └── report.tsx     # Report a request (modal: reason + note → confirmation)
│       ├── verse.tsx          # Verse of the day (deterministic daily verse, local)
│       └── settings.tsx       # Profile + privacy + about + sign out
│
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx     # Local profile + simulated session (AsyncStorage-backed)
│   │   └── PrayerContext.tsx   # In-memory prayer list (read path) via the service seam
│   ├── services/
│   │   ├── prayerService.ts    # Prayer read / create / pray / report seam (Firestore later)
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
  profile and the simulated session flag on-device so they survive app restarts. It needs
  no backend and stores no secrets.
- **Navigation:** a four-tab bottom bar (Feed / Share / Verse / Settings). "Share"
  (create a prayer request) is its own persistent tab so it's always reachable. Icons use
  **`@expo/vector-icons`** (FontAwesome5) with **`expo-font`** (both SDK-54 versions).
- **Dependency note:** `package.json` pins `overrides.react-dom` to match React. A
  web-only transitive (`react-dom`) otherwise resolves to a newer React than Expo SDK 54
  pins, which would break a clean `npm install`. The override keeps strict installs
  working with no global `legacy-peer-deps`; it configures nothing sensitive.

## Scope guardrails (prototype milestone)

- **No** Firebase (Auth, Firestore, config, SDK).
- **No** AdMob or any ad/analytics/tracking SDK.
- **No** app-store configuration or EAS cloud build.
- **No** production authentication (local/simulated only, from Phase B).
- **No** secrets, API keys, database URLs, bucket names, tokens, or credentials —
  ever. (`.env*` and Firebase service-account files are git-ignored.)

See [`../docs/prototype-roadmap.md`](../docs/prototype-roadmap.md) and
[`../docs/implementation-plan.md`](../docs/implementation-plan.md) for the full plan.
