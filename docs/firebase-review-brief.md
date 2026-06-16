# Firebase Review Brief: Praying For You

**For:** developer friends and CTO-level reviewers
**Status:** planning only. No Firebase project, EAS project, code, dependencies, or secrets exist yet.
**Ask:** read this brief, then answer the reviewer questions in section 11. The full detail lives in `docs/firebase-mvp-plan.md` and its review `docs/reviews/phase-i-firebase-mvp-plan-review.md`; this page is the short version so you can give focused feedback fast.

---

## 1. App overview

Praying For You is *"a calm prayer app where you can share requests, post anonymously, pray for others, and receive encouragement."* People post a prayer request, others can read the **shared** feed and tap "I prayed for this," and anyone can report content that does not belong. It is intentionally not a social network: no comments, no DMs, no follower counts.

**Privacy framing (CTO feedback incorporated):** this is **not** a fully private, single-user prayer journal — the feed is **shared** and prayer requests are visible to other signed-in users. We avoid any "private prayer-journal app" wording that could mislead. What stays private is the user's **email** and the **identity behind an anonymous post**.

The current prototype is local only. Everything (profile, feed, interactions, reports) lives on one device in AsyncStorage behind a service seam. There are no real accounts and no shared data. To put it in front of real testers it needs real authentication, durable shared storage, and enforced security rules. This brief covers that move to a Firebase backend.

## 2. Current prototype status

Built with Expo / React Native (Phases A through H.3). Working today, local/mock only:

- Local profile simulation (single profile, fixed `local-user` id, no password)
- Local prayer feed (seed data plus on-device submitted requests)
- Create prayer request
- Edit and remove your own request
- "I prayed for this" interaction
- Reports
- Verse of the Day (bundled KJV, deterministic by calendar day)
- Settings and activity views

All of the above is local/mock today. No network, no accounts, no backend.

## 3. Firebase MVP goal

- Real accounts (sign up, sign in, sign out)
- A shared prayer feed across users
- Real create, edit, and remove behavior
- Real "I prayed for this" interactions
- Real report storage
- Keep the existing privacy and ownership rules (email private, owner-only edits, anonymous display)
- Prepare for iOS and Android beta testing

## 4. Proposed Firebase architecture

- **Account and project (confirmed):** use the owner's existing Firebase/Google account, but create a **new Firebase project** ("Praying For You") for this rebuilt mobile MVP. The old legacy `praying4you` project is left untouched, so the MVP starts on a clean backend without inheriting old rules, data, config, or security assumptions.
- **Firebase Authentication** (email/password) replaces the simulated profile. We use Firebase Auth **by the book** — no custom auth logic — because it already covers credential storage, sessions, email uniqueness, reset, and verification. **Anonymous Firebase auth** is noted as a **future option only**; the MVP path stays email/password.
- **Cloud Firestore** holds the shared data.
- **Firebase Security Rules** are the core safety layer: auth-gated reads, owner-only writes, no userId spoofing, email privacy, interaction dedupe. Validated with the **Firebase Emulator Suite** (rules unit tests).
- **Crashlytics / Analytics**: deferred to the beta-build phase, optional. They add native modules and are not needed for the backend MVP.
- **No Cloud Functions** for the MVP. Start rules-only on the free Spark tier; revisit only if counter or moderation logic forces server code.
- **No push notifications** in the first Firebase MVP. It is a desired future feature, deliberately deferred because of added complexity (OS permissions, device tokens, a Cloud Function plus Blaze plus FCM, push credentials, per-user preferences, rate limiting). It returns only if explicitly reprioritized.

## 5. Proposed Firestore collections

- **`users/{uid}`** - account profile and private email. Key fields: `displayName` (public), `email` (private), `createdAt`. Entirely private: no other user may read a users doc. The public display name is cached onto each request so the feed never reads users.
- **`prayerRequests/{requestId}`** - the feed unit. Key fields: `userId` (real uid, kept for ownership/moderation, **never shown and not sent to other users**), `displayName` ("Anonymous" when anonymous), `body` (10 to 500 chars), `category`, `status` (active/flagged/removed), `prayerCount`, `reportCount`, `createdAt`. Readable by signed-in users. No email field. **Public data minimization:** feed/detail responses return only what the UX needs and **avoid exposing raw user IDs or unnecessary owner identifiers**, so other users cannot link different prayers to the same user; ownership checks compare against the caller's own uid without leaking the owner's id.
- **`prayerInteractions/{uid}_{requestId}`** - source of truth that a user prayed for a request, and the dedupe key. Fields: `userId`, `requestId`, `prayedAt`. Owner-private; not publicly listable. **Other users see the aggregate `prayerCount` only — never who prayed.** Individual interaction records are never exposed to other users.
- **`reports/{uid}_{requestId}`** - a report filed against a request. Fields: `requestId`, `reportedBy`, `reason`, optional `notes`, `status`, `createdAt`. Private: regular users can create but cannot read reports; only the console (admin) reads them.
- **`verses`** - not created for MVP. Verses stay local, curated, and bundled (public-domain KJV). Could move to Firestore later if content needs frequent updates.
- **`auditLogs`** - optional. For the rules-only MVP, prefer Firebase built-in usage logs over a client-writable audit collection (a client-writable log is low-trust). A server-written audit log can come later with Cloud Functions.

## 6. Key backend rules

- Sign-in is required to read the feed. No public/anonymous read.
- Email is private and never written to any public/shared doc, never displayed.
- Duplicate email conflicts are handled by Firebase Auth (`auth/email-already-in-use`); Auth is the authoritative uniqueness layer, not a Firestore query.
- Owner-only edit of a request.
- Owner-only remove of a request.
- User-facing language is "Remove request," never "Delete."
- Soft remove (`status: "removed"`) is preferred over hard delete, to preserve moderation integrity. (Account deletion is the one place "Delete" applies, and is required before the real-tester beta.)
- Anonymous posts display "Anonymous"; the real `userId` is still stored, the real name is never written to the request.
- Users cannot spoof another userId: identity is always derived from `request.auth.uid`.
- Users cannot directly inflate prayer counts (see section 7).
- Users cannot pray for the same request twice.
- Users cannot report their own request.
- Duplicate reports by the same user on the same request are prevented.

## 7. Prayer count / dedupe strategy

- `prayerInteractions` uses a deterministic id `{uid}_{requestId}`. Rules allow create only when that doc does not already exist and the prefix matches the caller's uid, so a second tap cannot create a second interaction.
- The client cannot freely write `prayerCount`. The recommended MVP approach is a batched write that creates the interaction doc and increments the counter by exactly +1, with security rules validating (via `getAfter()`/`exists()`) that the counter changes only by +1 and only in the same write that creates the matching interaction.
- This is a low-cost, free-tier approach with no Cloud Functions. Emulator tests are required to prove the rule holds.
- Fallbacks if the rule proves too fiddly: a `count()` aggregation query on read (zero inflation risk, more read cost), or a Cloud Function later (needs Blaze) if abuse appears.

## 8. Reporting / moderation strategy

- Reports are stored in Firestore.
- Early beta uses manual Firebase console review: a human reads reports and updates a request's `status` to flagged or removed.
- No admin dashboard in the first beta. The data model supports a future admin UI without changes.
- Reports never expose private email and are admin-read only.
- Duplicate reports are controlled with a deterministic id `reports/{uid}_{requestId}` so one user can report a given request only once.

## 9. Security and privacy risks to review

Highest-risk areas, roughly in priority order:

- Firestore security rules (the legacy app's fatal flaw was open rules)
- Owner-only edits and removes
- Prayer count inflation
- Duplicate interactions
- Email privacy (no email in any public/shared doc, no cross-user reads of users)
- Report abuse handling
- Account deletion implemented and verified before beta
- Privacy-safe logging
- Never logging full prayer text, emails, secrets, tokens, or sensitive content

## 10. Testing expectations

All against the Emulator Suite, no secrets, CI-friendly:

- Service-layer unit tests (happy path plus mapped errors)
- Firebase emulator security-rule tests (allow and deny per case)
- Auth tests (sign-up, email-in-use, email-change conflict)
- Owner-only edit and remove tests
- Interaction dedupe tests (no double interaction, no inflation, no self-pray)
- Report tests (self-report blocked, duplicate-report blocked, admin-only read)
- Signed-out user restrictions across all collections
- Public/private data separation tests (email never in public data)

## 11. Open decisions / reviewer questions

Please answer what you can:

- Do you see any security or privacy red flags?
- Does the Firestore model look sane for a small MVP?
- Is the prayer count / dedupe strategy reasonable?
- Would you reach for Cloud Functions earlier, or avoid them at MVP like we plan to?
- Are we missing any security-rule tests?
- Is the implementation sequence safe (auth, then requests, then interactions, then reports, then rules hardening, then beta build)?
- Is manual Firebase console review acceptable for early beta reports?
- What would you change before real beta testers use this?
- Any concerns with iOS and Android beta distribution planning?

## 12. Out of scope for the first Firebase MVP

- Push notifications
- AI prayer assistance
- AI verse matching
- Paid themes
- Ads
- In-app purchases
- Admin dashboard
- Avatars / profile photos
- Public launch

---

*Reference: full plan in `docs/firebase-mvp-plan.md`; Phase I review in `docs/reviews/phase-i-firebase-mvp-plan-review.md`.*
