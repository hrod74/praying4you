# Prototype Roadmap: Praying For You

This roadmap defines the path from the current planning documents to a working,
portfolio-ready prototype. It sits between the high-level product requirements
(`product-requirements.md`) and the eventual production app, and it deliberately
favors speed of demonstration over completeness.

---

## 1. Prototype Goal

The prototype is a **functional local React Native / Expo mobile app** that
demonstrates the core prayer request experience and can be shown in a portfolio —
even before any App Store or Google Play submission.

"Functional" is the key word: this is **not** a set of static, non-interactive
mockup screens. It is a real, runnable app where the core flow actually works
end to end against local state. A viewer should be able to pick up a phone or
simulator and *use* the app, not just look at it.

### What "functional" means here

In the functional local prototype, a user should be able to:

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

All of this can run on **mock / local data first**. The functional prototype does
**not** need real Firebase Authentication, real Firestore persistence, AdMob, or
app-store submission yet. Local in-memory or on-device state is enough to make every
interaction above work and be demonstrable.

The prototype is not the finished product. Its job is to prove the concept, show
thoughtful product thinking, and serve as a credible pathway toward a real app. It
should run locally, look and feel like a mobile app, and let a viewer walk through
the core flow end to end.

### Three milestones — do not confuse them

This project has three distinct stages, each with a different bar. The prototype is
only the first of the three; the later two remain firm long-term goals.

1. **Functional local prototype (current target).** A runnable Expo app with the
   core flow working against mock / local data. No real backend, no ads, no store
   submission. Goal: a portfolio-ready demonstration that the product works and the
   thinking is sound.

2. **Firebase-backed MVP (next).** The same experience wired to real services:
   Firebase Authentication (email/password), Firestore persistence with strict
   security rules, real reporting/moderation data, and durable prayer counts. Config
   is handled through safe environment/config patterns — never hardcoded secrets.
   Goal: a real, multi-user app backed by a real database.

3. **App-store-ready release (later).** The Firebase-backed MVP hardened for
   production and submitted to the App Store and Google Play: privacy policy and
   terms, finalized moderation, accessibility passes, age rating, store assets, and
   any carefully phased monetization (for example, banner ads in neutral locations).
   Goal: a published iOS/Android app.

The longer-term goal remains a **real, Firebase-backed iOS and Android app** that may
eventually be submitted to the app stores. The functional local prototype is the
fastest credible path toward that goal, not a replacement for it.

---

## 2. What the Prototype Should Prove

A successful prototype demonstrates that:

- Users can understand the purpose of the app quickly (post a prayer, pick up a prayer).
- Users can view prayer requests in a clean feed.
- Users can submit a prayer request.
- Users can choose whether their request appears as anonymous in the public feed.
- Users can tap "I prayed for this" and see the interaction reflected.
- The app delivers a clean, mobile-first experience (touch targets, card layout,
  readable typography).
- The app reflects thoughtful product decisions around privacy, trust, safety, and
  future monetization — even where those systems are only represented, not fully built.

---

## 3. Prototype Scope

In scope for the prototype:

- Expo app setup (managed workflow, TypeScript recommended).
- Basic navigation between screens.
- Welcome screen.
- Prayer feed screen.
- Submit prayer request screen.
- Prayer detail screen.
- Verse of the day screen (or a pinned verse card).
- Settings / about screen.
- Mocked local data first (no backend dependency to start).
- No real ads.
- No app-store submission yet.

---

## 4. Prototype Out of Scope

Explicitly excluded from the prototype:

- Real AdMob integration.
- App Store / Google Play submission.
- Full admin dashboard.
- Push notifications.
- Groups / church communities.
- Comments / direct messaging.
- Paid subscriptions.
- Production-grade moderation tools.

These belong to the production phases described in the PRD, not the prototype.

---

## 5. Suggested Prototype Screens

- **Welcome / onboarding** — explains the concept in one or two sentences and leads
  into the app.
- **Sign in / create profile placeholder** — a UI placeholder only; no real auth in
  the first prototype pass.
- **Prayer feed** — scrollable list of mocked prayer requests as cards, each showing
  date, display name or "Anonymous," prayer text, and prayer count.
- **Submit prayer request** — text entry with a character counter, an anonymous
  toggle, and a clear confirmation.
- **Prayer detail** — full prayer text plus the "I prayed for this" action.
- **Verse of the day** — a verse card with book, chapter, verse, and text.
- **Settings / about** — display name placeholder, sign-out placeholder, and a short
  "about this app" section.

---

## 6. Mock Data Strategy

Build the UI and product experience against **mocked / local data first**, before
introducing Firebase. A small local module (for example, an array of prayer-request
objects matching the PRD data shape: `id`, `displayName`, `isAnonymous`, `body`,
`createdAt`, `prayerCount`) lets every screen and flow be built and demonstrated
without network or backend setup.

This keeps early iteration fast, makes the prototype runnable anywhere, and ensures
the screens are validated before backend complexity is added. The "I prayed for
this" interaction and the anonymous toggle can both be demonstrated against in-memory
state.

---

## 7. Firebase Integration Later

Firebase Authentication, Firestore, security rules, content reporting, and real
persistence should come **after** the prototype screens and flows are validated with
mock data. Introducing Firebase too early slows down UI iteration and couples screen
work to backend setup.

When Firebase is introduced, it should follow the patterns described in the audit and
PRD: modular Firebase SDK (v9+), Firestore (not Realtime Database), strict
authentication-based security rules from day one, and configuration handled through
safe environment/config patterns rather than hardcoded values. No secrets are
committed to the repository at any point.

---

## 8. Portfolio Deliverables

The prototype effort should produce a portfolio package, not just code:

- GitHub repo (this repository).
- Updated `README.md` with a clear project description and run instructions.
- Screenshots of the core screens.
- A demo video or screen recording of the core flow.
- A short case study write-up (problem, approach, outcome).
- A product decisions summary (anonymous posting, privacy, moderation, ad strategy).
- Architecture notes (Expo, navigation, mock-data-first, planned Firebase backend).
- A future roadmap (path from prototype to production).

---

## 9. Success Criteria for Prototype

The prototype is considered successful when:

- The app runs locally (simulator/emulator or Expo Go).
- The core screens are navigable.
- The prayer request flow works with mock data.
- The "I prayed for this" interaction works with mock data.
- Anonymous public posting behavior is demonstrated (the request shows as
  "Anonymous" in the feed while still being conceptually owned by the user).
- No secrets are committed to the repository.
- The `README.md` explains how to run the prototype.

---

## 10. Next Recommended Step

Create an **implementation plan** before generating the Expo app. The plan should
sequence the screens, define the mock data module, and outline navigation, so that
app generation follows a clear blueprint rather than starting ad hoc. Only after the
plan is agreed should the Expo project be created.

> The implementation plan (`implementation-plan.md`) now exists and the local
> prototype build phases (A–H) have been carried out. The phase map below picks up
> from there and sequences the remaining work from local polish through an internal
> Firebase-backed beta.

---

## 11. Upcoming Phases (H–K): From Local Polish to Internal Beta

These phases sequence the move from the local prototype to a Firebase-backed internal
beta. The local prototype phases (A–H in `implementation-plan.md`) build the experience
against mock data; the phases below close out local readiness and then introduce the
backend and distribution work.

### Phase H — Local polish / demo readiness
Final close-out of the **local prototype**: empty/loading/error states, accessibility
labels and tap-target sizing, optional local persistence, a **full visual QA pass**,
and demo/portfolio capture (screenshots + screen recording). Still **local/mock data —
no Firebase**. This is the last phase before any backend work begins.

**Phase H.1 — Visual QA polish pass (complete).** An owner-identified follow-up polish
pass within Phase H, addressing demo-readiness gaps before Firebase planning: a shared,
calm **confirmation feedback** pattern for successful actions (with gentle errors); a
**Your prayer activity** summary in Settings (Requests shared / Prayers lifted) with
**My prayer requests** and **Prayers I've prayed for** lists; and owner **Edit request /
Remove request** controls (a confirmed local **soft remove**, "Remove" not "Delete")
shown only on the user's own requests. Still local/mock only. See
`reviews/phase-h1-visual-qa-polish-review.md`.

**Phase H.2 — Mobile UX fix pass (complete).** Owner on-device iOS QA fixes: iOS keyboard
behavior (no accidental submit on return, drag to dismiss, next-field focus), returning to
the Feed after sharing a request (new request at top), a local **Edit profile** flow (name +
email, validated, email private), and slightly larger bottom-nav icons/labels. Still
local/mock only. See `reviews/phase-h2-mobile-ux-fix-review.md`.

**Phase H.3 — Accessibility & theme foundation pass (complete).** Family/friend feedback:
better **Dynamic Type / larger text** support (scaled line heights so text does not clip,
scrollable Welcome/Sign In, bounded chrome with uncapped content) and a clean, centralized
**theme-token foundation** so future color themes can be added without rework. No theme
switching or paid themes are built; future themes and the rule that **accessibility themes
are never paywalled** (and theme monetization never interrupts prayer moments) are
documented. Still local/mock only. See `reviews/phase-h3-accessibility-theme-foundation-review.md`.

### Phase I — Firebase MVP planning (Plan Mode)
**Plan only — no implementation.** Design the Firebase-backed MVP in **Plan Mode**: the
Firestore data model and indexes; security-rule intent (auth-gated reads, owner-only
writes, no `userId` spoofing, restricted `status` transitions); the typed service
contracts and error-handling shape (see `implementation-plan.md` Section 11); the data
migration/versioning approach; and the configuration/secret-handling plan (env
patterns, never hardcoded). **The Backend Engineer and Systems Admin / DevOps Engineer
participate from this phase onward.** No Firebase project, EAS project, secrets, or
config values are created here.

**Status — plan written; owner decisions captured.** The plan
(`firebase-mvp-plan.md`) and its review (`reviews/phase-i-firebase-mvp-plan-review.md`)
exist and reflect the owner's decisions: **sign-in required to read the feed; account
deletion required before the real-tester beta; manual Firebase console report review;
prevent duplicate reports; no admin dashboard for the first beta; both iOS and Android;
verses stay local/curated; AI verse matching is future-only with approved-source text (no
AI-generated Scripture); avatars out of scope; push notifications deferred to a documented
post-MVP phase; step-by-step Firebase setup instructions (J.1) before implementation; and
individual-vs-LLC account is a before-public-launch decision (not a Firebase blocker).** Two
**advisory** roles now participate before implementation: the **Legal / Compliance Advisor**
(`agents/legal-compliance-advisor.md` — *not legal advice*) in Firebase / beta / public-launch
planning, and the **Growth / Beta Research Advisor** (`agents/growth-beta-research-advisor.md`)
in beta-readiness and feedback planning. **Firebase implementation must not begin until this
plan is committed/reviewed and Phase J.1 produces the step-by-step setup instructions.**

### Phase J — Firebase MVP implementation
Implement the approved Phase I plan behind the existing `src/services/` seam: real
Firebase Auth (incl. **user-initiated account deletion — required before the real-tester
beta**), Firestore persistence, security rules, real reporting/moderation data (with
**duplicate-report prevention**), and durable prayer counts — **without changing the screens or
shared types**. **Phase J.1 first produces step-by-step, owner-followable Firebase setup
instructions (docs only) before any implementation begins.** Includes the automated service
tests and Firebase security-rule (emulator) tests required before any external sharing. Config
is handled through safe environment patterns; no secrets are committed. **Push notifications
and AI verse matching are NOT part of Phase J** — they are documented future post-MVP phases
(see below) unless explicitly reprioritized.

### Phase K — Internal beta distribution
Make the app installable by real testers **without the developer's machine**: Expo/EAS
build setup and an internal beta channel (TestFlight for iOS and/or Google Play
internal testing for Android, Android-first where it lowers cost/risk). Gated on a
passing secret scan and deployed security rules. The **Systems Admin / DevOps
Engineer** owns the build, distribution, deployment checklist, and cost monitoring; the
**Backend Engineer** confirms data, contracts, and rule tests are ready.

### Future features (not part of the immediate Firebase migration)
**Voice input**, **AI prayer assistance**, **push notifications**, and **AI verse matching**
are **future features**, not part of the immediate Firebase migration (Phases I–K) unless
deliberately reprioritized. They are noted here so they are not assumed into the backend beta
scope by default.

- **Push notifications** (e.g., "someone prayed for your request") are a **desired future
  post-MVP feature**, deferred because of their added complexity — OS permissions, device
  tokens, a Cloud Function + Blaze + FCM backend trigger, iOS/Android push credentials,
  per-user notification preferences, rate limiting/batching, and privacy-safe payloads (see
  `firebase-mvp-plan.md` §9.5). Plan them **after the core Firebase MVP is stable**, with the
  Growth / Beta Research Advisor assessing user value/risk and the Legal / Compliance Advisor
  reviewing notification privacy.
- **AI verse matching** may **later** help match a user's expressed need to a verse, but the
  **verse text must always come from an approved (licensed/public-domain) source — never
  AI-generated or hallucinated Scripture** (see `firebase-mvp-plan.md` §8). Any AI assistance
  also carries an appropriate disclaimer (Legal / Compliance Advisor review).
