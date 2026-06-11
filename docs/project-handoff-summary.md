# Project Handoff Summary — Praying 4 You

A compact, current-state snapshot to preserve context. For detail, see
`implementation-plan.md`, `prototype-roadmap.md`, `product-requirements.md`,
`design-direction.md`, and the per-phase reviews in `reviews/`.

## Purpose

Rebuild the legacy Firebase prayer-request web app as a cross-platform **React Native /
Expo** mobile app. Near-term goal: a **functional local prototype** for portfolio/demo.
Long-term: a Firebase-backed iOS/Android app, possibly app-store-ready. Three milestones:
local prototype → Firebase MVP → app-store release. We are in **milestone 1**.

## Repo structure

```
praying4you/
  README.md, .gitignore
  legacy-web-app/     # preserved original (do NOT modify)
  docs/               # plans, PRD, design direction, agents/, reviews/
  mobile-app/         # the Expo app (active work)
```

`mobile-app/` layout: `app/` (Expo Router routes: `index` welcome, `(auth)/` =
create-profile + sign-in, `(app)/` = tabs Feed/Verse/Settings with a `feed/` stack);
`src/` = `context/` (AuthContext, PrayerContext), `services/` (prayerService — the
Firebase-swap seam), `data/` (mockPrayers), `models/` (types), `components/`
(Button, TextField, Screen, PrayerCard, CategoryTag, EmptyState), `theme/`, `utils/`
(validation, format).

## App status: runs in public iOS Expo Go; local mock data only.

## Completed phases

- **Phase A — Expo foundation:** Expo (managed) + TypeScript + Expo Router scaffold,
  folder structure, placeholder screens, root README.
- **Phase B — Local auth/profile (simulated):** `AuthContext` (display name + email),
  create-profile + simulated sign-in/out, signed-in/out `<Redirect>` gating, AsyncStorage
  persistence. Email is private (never public).
- **Expo Go SDK compatibility fix:** pinned to **Expo SDK 54** — the SDK supported by the
  current public iOS App Store Expo Go (54.0.2). SDK 55/56 are too new for public Expo Go.
  Do not upgrade SDK until public Expo Go supports it (or we move to dev builds/EAS).
- **Phase C — Mock prayer feed + detail (read path):** `mockPrayers → prayerService →
  PrayerContext → screens`; journal-style feed cards (newest first, loading/empty/error,
  pull-to-refresh); reflective detail screen. Theme moved to the heritage palette.
- **Phase C.5 — Prayer categories:** added `category` (controlled set, stable keys +
  label map) to the model + all mock data; subtle `CategoryTag` chip on feed/detail; PRD
  and plan updated.
- **Phase D — Local prayer request submission (write path):** a "Share a prayer request"
  form (text + counter + 10–500 validation, category selector, named/anonymous choice)
  reachable from the feed; `prayerService.createPrayer` + `PrayerContext.addPrayer`
  prepend the new request to local state (top of feed → opens in detail). Local owner
  retained; anonymous shows "Anonymous"; email never shown. Session-only (in-memory).
- **Phase E — "I prayed for this" (local interaction):** on a request's detail, a
  signed-in user taps to mark they prayed; the count increments locally, a race-safe
  one-per-user guard prevents double-counting, and a "You prayed for this" state shows
  (subtle "🙏 You prayed" on the feed card). Can't pray for your own request. Via
  `prayerService.recordPrayerInteraction` + `PrayerContext.pray`/`hasPrayed`; session-only.

## Design direction

Old-school **Bible / prayer journal made modern**: warm **parchment/cream** background,
deep warm **ink** text, **muted gold/bronze, burgundy, deep navy, muted purple** accents
used sparingly. Calm, reverent, trustworthy — **not** social-media-like or a bright
startup; journal-style cards; encouraging (not gamified) prayer counts; understated
identity and category tags. See `design-direction.md`.

## AI development team (review roles in `docs/agents/`)

Product Owner · UI/UX Designer · React Native Engineer · Code Reviewer · Security
Reviewer · Test Engineer · QA Engineer · Release Manager. Each phase ends with an
eight-role go/no-go completion review in `docs/reviews/`.

## Technical approach

React Native / **Expo SDK 54** · TypeScript · Expo Router · React Context + hooks ·
AsyncStorage (local persistence) · **local/mock data first**. No Firebase, no AdMob, no
app-store/EAS setup yet. Run: `cd mobile-app && npm install && npx expo start` (use
`npx expo start -c` after SDK/dep changes). No secrets in the repo, ever.

## Functional status (works today)

App runs in Expo Go on iPhone · local profile creation · simulated sign-in/out · three
tabs (Feed, Verse, Settings) · feed shows mock prayer cards (newest first) · detail screen
works · categories show on feed + detail · **submitting a new request works** (top of
feed) · **"I prayed for this" works** (count increments, one per user, prayed state) ·
**email is never shown publicly**. The Verse tab is still a placeholder (Phase F).

## Next phase

**Phase F — Verse of the day:** a local/mock daily verse experience. `mockVerses` +
`verseService` pick a deterministic verse for the current day (same day → same verse) from
bundled local data — no external Bible API. The Verse screen shows the verse text +
reference and a short app-generated reflection (clearly distinct from scripture), in the
calm parchment/journal style. (Production verse sourcing/licensing to be reviewed before
public release.)
