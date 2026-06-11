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
- **Phase F — Verse of the day:** the Verse tab shows a deterministic daily verse (same
  day → same verse) from bundled local data (`mockVerses`, KJV public domain) via
  `verseService` — no external Bible API. Verse + reference + a clearly-distinct app
  reflection, in the parchment style. (Production verse licensing to be reviewed.)
- **Phase G — Navigation, Settings/About, Reporting:** persistent **bottom-tab icons**
  (FontAwesome5: dove/quill/bible/user) and a persistent **Create Prayer** tab (always
  reachable); a fuller **Settings/Profile** (profile + privacy language + About); and a
  local **Report request** flow on detail (reason + optional note → calm confirmation;
  increments `reportCount`, flags locally; hidden on own posts). All local/mock.

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

App runs in Expo Go on iPhone · local profile creation · simulated sign-in/out · **four
tabs with concept icons (Feed, Create Prayer, Verse, Settings)** · feed shows mock prayer
cards (newest first) · **Create Prayer is always reachable from the tab bar** · detail
screen works · categories on feed + detail · submitting works (top of feed) · "I prayed
for this" works · **Verse of the day works** · **Settings shows profile + privacy + About**
· **Report request works locally** on others' posts (hidden on own) · **email is never
shown publicly**.

## Next phase

**Phase H — Polish + persistence (optional) + demo capture:** empty/loading/error-state
polish, accessibility/tap-target passes, optional AsyncStorage persistence for the local
profile + submitted requests, and screenshots / a screen recording of the full loop for
the portfolio. Still local/mock; Firebase remains the next *milestone* after the prototype.
