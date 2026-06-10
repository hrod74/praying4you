# Prototype Roadmap: Praying 4 You

This roadmap defines the path from the current planning documents to a working,
portfolio-ready prototype. It sits between the high-level product requirements
(`product-requirements.md`) and the eventual production app, and it deliberately
favors speed of demonstration over completeness.

---

## 1. Prototype Goal

The prototype is a **working React Native / Expo mobile app** that demonstrates the
core prayer request experience and can be shown in a portfolio — even before any
App Store or Google Play submission.

The prototype is not the finished product. Its job is to prove the concept, show
thoughtful product thinking, and serve as a credible pathway toward a real app. It
should run locally, look and feel like a mobile app, and let a viewer walk through
the core flow end to end.

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
