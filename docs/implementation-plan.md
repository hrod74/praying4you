# Implementation Plan: Praying For You — Functional Local Prototype

**Scope of this document:** the **functional local React Native / Expo prototype
only** — milestone 1 of the three defined in `prototype-roadmap.md`. It does **not**
cover Firebase, AdMob, or app-store setup. Those belong to the Firebase-backed MVP
and app-store-ready release milestones and are intentionally deferred.

This plan turns the product thinking already captured in `product-requirements.md`
and `prototype-roadmap.md` into a concrete build path. It assumes the Expo app does
**not exist yet** — creating it is the step that follows approval of this plan.

Related docs:
- `product-requirements.md` — full product scope and data model (production target).
- `prototype-roadmap.md` — prototype goal, scope, and the three-milestone framing.
- `legacy-app-audit.md` — what to preserve, redesign, and avoid from the legacy app.
- `cost-and-publishing-considerations.md` — why nothing here requires paid accounts.
- `workflows.md` — the prototype-build and git-commit workflows this plan follows.

---

## 1. Objective

Build a **functional local prototype** of Praying For You as a React Native / Expo
app that runs locally and lets a user complete the core prayer flow end to end,
using mock / local data. It must be demonstrable in a portfolio (screenshots and a
screen recording) and serve as a credible foundation for the later Firebase-backed
MVP.

The prototype is "done" when a user can, on a simulator/emulator or via Expo Go:

- Create a local profile using a name and email.
- Simulate signing in and signing out locally.
- Submit a prayer request.
- Choose whether the request displays publicly as their name or as "Anonymous."
- View prayer requests in a feed.
- Open a prayer detail screen.
- Tap "I prayed for this" and see the prayer count update.
- View a verse of the day.
- Report a prayer request.
- Open a settings / about screen.

Explicit non-goals for this milestone: real Firebase Authentication, Firestore
persistence, real reporting backend, AdMob, push notifications, and any app-store
submission. No secrets or Firebase config values are introduced at any point.

---

## 2. Technical Approach

- **Framework:** React Native via **Expo (managed workflow)** — the fastest path to
  iOS + Android from one codebase, runnable in Expo Go with no developer accounts.
- **Language:** **TypeScript** from day one, so the mock data model doubles as typed
  contracts that carry forward into the Firebase-backed MVP.
- **Navigation:** **Expo Router** (file-based routing), as recommended in the audit.
  A tab layout for the main areas (Feed, Verse, Settings) plus stacked detail and
  modal-style submit/report screens.
- **State management:** lightweight **React Context + hooks** — no Redux needed at
  this scale. Two main contexts:
  - `AuthContext` — holds the local profile (name, email) and a simulated
    signed-in/signed-out state.
  - `PrayerContext` — holds the in-memory list of prayer requests and the set of
    requests the current user has "prayed for," and exposes actions (submit, pray,
    report).
- **Local persistence (optional, nice-to-have):** `@react-native-async-storage/
  async-storage` to persist the local profile and submitted requests across app
  restarts. The prototype works without it (in-memory only); persistence just makes
  demos smoother. Not required for milestone completion.
- **Styling:** React Native `StyleSheet` (or NativeWind if preferred later). Keep a
  small shared theme (colors, spacing, typography) for a warm, card-based, mobile-
  first feel — a deliberate contrast to the legacy Bootstrap-3 table layout.
- **Data layer abstraction:** all data access goes through a small service module
  (for example `services/prayerService.ts`) that today reads/writes mock/local
  data. This is the seam where Firebase will later be swapped in **without touching
  the screens** — a key design decision for a clean MVP migration.
- **No backend, no network calls** for core data in this milestone. The verse of the
  day is served from a bundled local list (no third-party API yet), avoiding the
  legacy app's plain-HTTP/JSONP dependency. The prototype's seed verses use the
  **King James Version (public domain)** to avoid translation-licensing concerns.
  **Production note:** before any public release, review verse sourcing and translation
  licensing (e.g., NIV/ESV require permission/attribution) — keep to public-domain
  translations or obtain the appropriate license.

---

## 3. Why Mock / Local Data Comes First

- **Speed of iteration.** Screens and flows can be built and demonstrated in days
  without provisioning Firebase, writing security rules, or managing config.
- **Zero cost and zero secrets.** Nothing requires a Firebase project, paid
  accounts, or any API key — so there is no risk of committing sensitive config.
  This directly honors the project's no-secrets rule.
- **Validate product, not plumbing.** The prototype's job is to prove the *experience*
  (the prayer loop, anonymity choice, the "I prayed for this" moment). Mock data lets
  that be judged on its own before backend complexity is introduced.
- **A clean migration seam.** Because all data access is funneled through a service
  module returning typed objects shaped like the eventual Firestore documents,
  swapping mock data for Firebase later is a localized change, not a rewrite.
- **Runs anywhere.** A reviewer can clone, install, and run with no backend setup —
  ideal for a portfolio.

This mirrors the **Prototype Build Workflow** in `workflows.md`: mock/local data
first, core screens before Firebase, validate locally, then move toward Firebase.

---

## 4. Proposed `mobile-app/` Folder Structure

Created later (not in this step). Proposed Expo Router + TypeScript layout:

```
mobile-app/
├── app/                          # Expo Router routes (file-based navigation)
│   ├── _layout.tsx               # Root layout; wraps app in Auth + Prayer providers
│   ├── index.tsx                 # Welcome / onboarding (entry)
│   ├── (auth)/
│   │   ├── _layout.tsx           # Auth stack (shown when signed out)
│   │   ├── sign-in.tsx           # Simulated sign in (local)
│   │   └── create-profile.tsx    # Create local profile (name + email)
│   └── (app)/
│       ├── _layout.tsx           # Tab navigator (shown when signed in)
│       ├── feed/
│       │   ├── index.tsx         # Prayer feed
│       │   └── [id].tsx          # Prayer detail (by request id)
│       ├── submit.tsx            # Submit prayer request (with anonymous toggle)
│       ├── verse.tsx             # Verse of the day
│       └── settings.tsx          # Settings / about
│
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx       # Local profile + simulated sign in/out
│   │   └── PrayerContext.tsx     # In-memory prayer list + interactions
│   ├── services/
│   │   ├── prayerService.ts      # Data access seam (mock now, Firebase later)
│   │   └── verseService.ts       # Returns the day's verse from local data
│   ├── data/
│   │   ├── mockPrayers.ts        # Seed prayer requests
│   │   └── mockVerses.ts         # Seed verses
│   ├── models/
│   │   └── types.ts              # TypeScript types (User, PrayerRequest, etc.)
│   ├── components/
│   │   ├── PrayerCard.tsx        # Feed card
│   │   ├── PrayedButton.tsx      # "I prayed for this" button + count
│   │   ├── AnonymousToggle.tsx   # Name vs. Anonymous switch
│   │   ├── ReportSheet.tsx       # Report reason picker
│   │   └── EmptyState.tsx        # Friendly empty / offline-style states
│   ├── theme/
│   │   └── theme.ts              # Colors, spacing, typography
│   └── utils/
│       └── format.ts             # Date formatting, text truncation
│
├── assets/                       # Icons, fonts, images
├── app.json                      # Expo config (no secrets)
├── package.json
├── tsconfig.json
└── README.md                     # How to run the prototype
```

Notes:
- `app.json` / `app.config` will hold **no** Firebase keys at this stage. When
  Firebase is added later, config moves to environment/config patterns excluded by
  `.gitignore` (already prepared: `.env*`, `serviceAccountKey.json`, etc.).
- The `services/` layer is intentionally the only place that knows where data comes
  from — screens import services, never raw mock files.

---

## 5. Prototype Screens

Matches the screen set in `prototype-roadmap.md`:

| Screen | Purpose | Key interactions |
|---|---|---|
| **Welcome / onboarding** | Explain the concept in a sentence or two; entry point. | Continue → sign in / create profile. |
| **Sign in (simulated)** | Local-only sign-in placeholder. | "Sign in" sets signed-in state; link to create profile. |
| **Create profile** | Collect name + email locally. | Save → stores local profile, marks user signed in. |
| **Prayer feed** | Scrollable card list of requests, newest first. | Tap card → detail; report from card menu; pull-to-refresh. |
| **Submit prayer request** | Compose a request. | Text input + character counter; **name vs. Anonymous toggle**; submit → success → back to feed. |
| **Prayer detail** | Full request + prayer count. | **"I prayed for this"** (count updates, one-per-user locally); report. |
| **Verse of the day** | A daily verse card. | Display-only; verse pulled from local data. |
| **Settings / about** | Profile + app info. | Edit display name; sign out; "about this app"; placeholders for future privacy/terms links. |

Behavioral rules carried from the PRD (enforced locally):
- A user cannot "pray for" their own request; the button is hidden/disabled on own posts.
- Each user registers at most one prayer interaction per request (tracked in local state).
- Email is **never** displayed publicly anywhere — it lives only in the local profile/settings.
- Anonymous posts always retain the owning user locally (so ownership/report logic works),
  but display "Anonymous" in the feed and detail views.

---

## 6. Mock Data Model

TypeScript types mirror the PRD's Firestore entities so they carry forward. Mock
records are plain in-memory objects (no backend). IDs are generated locally.

```ts
// src/models/types.ts

export interface UserProfile {
  id: string;            // local id (e.g., "local-user")
  displayName: string;   // public name
  email: string;         // PRIVATE — never shown publicly
  createdAt: string;     // ISO string
}

export type PrayerStatus = "active" | "flagged" | "removed";

// A small controlled set; stored as stable keys, shown via a label map (Phase C.5).
export type PrayerCategory =
  | "health" | "family" | "finances" | "relationships" | "grief"
  | "work" | "guidance" | "praise" | "other";

export interface PrayerRequest {
  id: string;            // local id
  userId: string;        // owner (always set, even when anonymous)
  isAnonymous: boolean;  // controls display only
  displayName: string;   // cached name, or "Anonymous"
  body: string;          // 10–500 chars
  category: PrayerCategory; // how the request is framed (scan + future filtering)
  createdAt: string;     // ISO string
  status: PrayerStatus;  // "active" by default; "flagged" after a report
  prayerCount: number;   // incremented by "I prayed for this"
  reportCount: number;   // incremented by report
}

export interface PrayerInteraction {
  userId: string;        // who prayed
  requestId: string;     // what they prayed for
  prayedAt: string;      // ISO string
}

export type ReportReason = "spam" | "inappropriate" | "harmful" | "other";

export interface Report {
  id: string;
  requestId: string;
  reportedBy: string;
  reason: ReportReason;
  notes?: string;        // optional, <= 300 chars
  createdAt: string;
}

export interface Verse {
  reference: string;     // e.g., "John 3:16"
  text: string;
  translation: string;   // e.g., "NIV"
}
```

- **Seed data:** `mockPrayers.ts` provides ~8–12 varied requests (mix of named and
  anonymous, across categories, a range of prayer counts) so the feed looks alive.
  `mockVerses.ts` provides a small curated set; `verseService` picks one
  deterministically per day.
- **No real names, no real personal data, no secrets** in seed data — use clearly
  fictional sample content.
- These types are the same shapes the Firebase-backed MVP will read/write, so the
  `services/` layer is the only thing that changes at migration time.

---

## 7. Build Phases

Sequenced so the app runs end-to-end as early as possible, then gains depth.

**Phase A — Project foundation**
- Create the Expo app (managed workflow, TypeScript) in `mobile-app/`.
- Add Expo Router, set up the root layout and theme.
- Verify a blank app boots in Expo Go / simulator.

**Phase B — Local auth + profile (simulated)**
- Build `AuthContext`, Welcome, Create profile (name + email), and simulated
  Sign in / Sign out.
- Gate the app: signed-out users see auth screens; signed-in users see the tabs.

**Phase C — Feed + detail (read path)**
- Wire `PrayerContext` + `prayerService` to `mockPrayers`.
- Build the feed (cards, newest first) and the prayer detail screen.

**Phase D — Submit + anonymity (write path)**
- Build the submit screen with validation, character counter, and the
  name-vs-Anonymous toggle; new requests appear at the top of the feed.

**Phase E — Prayer interaction**
- Build the "I prayed for this" action: increments `prayerCount`, records a local
  interaction, enforces one-per-user, disables on own posts.

**Phase F — Verse of the day**
- Build the verse screen/card from `mockVerses` via `verseService` (local, no API).

**Phase G — Reporting + settings/about**
- Build the report flow (reason picker + optional note; increments `reportCount`,
  sets status to "flagged" locally).
- Build settings/about: edit display name, sign out, about section, placeholder
  privacy/terms links.

**Phase H — Polish + persistence (optional) + demo capture**
- Empty/loading/error states, accessibility labels, tap-target sizing.
- Optional AsyncStorage persistence for profile + submitted requests.
- Capture screenshots and a screen recording; write the `mobile-app/README.md`.

---

## 8. Validation Plan

The prototype is validated by exercising each Objective capability locally:

- [ ] App boots in Expo Go and on at least one simulator/emulator (iOS or Android).
- [ ] Create profile with name + email; profile is stored locally.
- [ ] Sign out returns to auth screens; sign in restores the signed-in state.
- [ ] Submit a prayer request; it appears at the top of the feed.
- [ ] Submitting with the Anonymous toggle on shows "Anonymous" in feed + detail,
      while the request is still owned by the local user internally.
- [ ] Feed renders mock + newly submitted requests, newest first.
- [ ] Opening a card navigates to the correct detail screen.
- [ ] "I prayed for this" increments the count; a second tap does not double-count;
      the button is hidden/disabled on the user's own posts.
- [ ] Verse of the day renders from local data (no network).
- [ ] Reporting a request records a report and updates report state locally.
- [ ] Settings: display-name edit, sign out, and about section all work.
- [ ] Email never appears in the feed, detail, or any public surface.
- [ ] **Secret check** (per the workflows): `grep -rniE
      "AIza|apiKey|databaseURL|storageBucket|firebaseio|appspot"` over the repo
      returns no real values — only documentation examples / grep commands.
- [ ] No Firebase, AdMob, or app-store dependencies are present in `mobile-app/`.

---

## 9. Portfolio / Demo Plan

Per `prototype-roadmap.md` Section 8 (Portfolio Deliverables):

- **Screenshots** of each core screen (welcome, feed, submit with anonymous toggle,
  detail with prayer count, verse, settings).
- **Screen recording** walking the full loop: create profile → submit (named) →
  submit (anonymous) → open detail → "I prayed for this" → report → verse → sign out.
- **`mobile-app/README.md`** with exact run instructions (`npm install`, `npx expo
  start`) and a note that the prototype uses mock/local data with no backend.
- **Case study write-up** (can live in `docs/`): the problem (legacy app gaps from
  the audit), the approach (mock-first Expo prototype), and the outcome.
- **Product decisions summary**: anonymity-as-display-choice, no public email,
  reporting/moderation intent, and the deliberately phased, non-intrusive ad strategy.
- **Architecture notes**: Expo Router, Context state, the `services/` migration seam,
  and the path to the Firebase-backed MVP.

---

## 10. Next Build Prompt (for creating the Expo app later)

When ready to scaffold the app, the following is a ready-to-use prompt. **Do not run
it as part of this plan** — it is the next step after approval.

> Create the functional local prototype for Praying For You as a new Expo app in
> `mobile-app/`, following `docs/implementation-plan.md`.
>
> - Use Expo (managed workflow) with TypeScript and Expo Router.
> - Implement the folder structure, screens, contexts, services, and TypeScript
>   models exactly as described in the plan.
> - Use mock / local data only (`src/data/mockPrayers.ts`, `src/data/mockVerses.ts`).
>   Do **not** add Firebase, AdMob, networking for core data, or any API keys.
> - Build the phases in order (A→H), keeping the app runnable after each phase.
> - All data access must go through `src/services/` so Firebase can be swapped in
>   later without changing screens.
> - Do not introduce any secrets or Firebase config values. Confirm the secret check
>   passes before committing.
> - When done, write `mobile-app/README.md` with run instructions and capture
>   screenshots / a screen recording for the portfolio.

After the app exists and runs, the project advances to **milestone 2: the
Firebase-backed MVP** (auth, Firestore, security rules, reporting) using the same
typed models and the `services/` seam — and only later to **milestone 3: the
app-store-ready release**.
