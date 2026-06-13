# Firebase MVP Plan: Praying For You (Phase I — Planning Only)

**Status:** Planning document (Phase I). **No code, Firebase project, EAS project, secrets,
dependencies, or backend setup are created by this document.** It defines *how* the local
prototype would move to a Firebase-backed MVP so the plan can be reviewed and approved before
any implementation (Phase J) begins.

**Owned by (review panel):** Backend Engineer and Systems Admin / DevOps Engineer lead;
Product Owner, UI/UX Designer, React Native Engineer, Security Reviewer, Test Engineer, QA
Engineer, and Release Manager review (see `agents/`). **Two advisory roles also participate in
Firebase / beta / public-launch planning** (added at owner request, before implementation):
**Legal / Compliance Advisor** (`agents/legal-compliance-advisor.md` — not legal advice) and
**Growth / Beta Research Advisor** (`agents/growth-beta-research-advisor.md`).

**Related docs:** `product-requirements.md` (esp. §11 data model, §14 security, §19 future
backend requirements), `implementation-plan.md` (§11 future Firebase section + service
boundaries), `cost-and-publishing-considerations.md`, `design-direction.md`, `workflows.md`,
`agents/backend-engineer.md`, `agents/systems-admin.md`, and the Phase H.1–H.3 reviews.

**Guardrails (unchanged from prior phases):** no secrets/keys/URLs/buckets/tokens in the
repo, ever; config via environment patterns excluded by `.gitignore`; `legacy-web-app/` and
`.claude/` untouched; user-facing language stays **"Remove request,"** never "Delete";
anonymity is a display choice with private ownership retained; email is never public;
accessibility themes are never paywalled; monetization never interrupts prayer moments.

---

## 1. Executive Summary

**Problem this phase solves.** The prototype is a polished, accessible, local/mock Expo app
(Phases A–H.3). Everything lives on one device: a simulated profile and prayer data in
AsyncStorage, no real accounts, no shared data, no moderation backend. To share with real
testers, the app needs real authentication, durable shared storage, and enforced security.
This plan defines that move without changing the product's calm, private, prayer-journal
character.

**What is local today (to be replaced):**
- Simulated auth: a single local profile (`AuthContext`, keys `p4u.profile` / `p4u.signedIn`,
  fixed id `local-user`); no password, no real identity.
- Local data behind the service seam (`prayerService`): seed `mockPrayers` plus on-device
  submitted requests, interactions, reports, owner edits (`p4u.overrides`), and soft removals
  (`p4u.removed`); counts derived in `PrayerContext`.
- Local verse of the day (`verseService`, bundled KJV `mockVerses`, deterministic by day).

**What will move to Firebase (MVP):**
- **Firebase Authentication** (email/password) replacing the simulated profile.
- **Cloud Firestore** for `users`, `prayerRequests`, `prayerInteractions`, `reports`.
- **Firebase Security Rules** enforcing auth-gated reads, owner-only writes, no `userId`
  spoofing, email privacy, interaction dedupe, and report rules — tested with the **Emulator
  Suite**.

**What is NOT in the first Firebase MVP:**
- **No admin / moderation dashboard** (owner decision): the first beta does **not** build an
  admin UI; moderation is **manual via the Firebase console** (owner decision).
- No Cloud Functions unless a specific need forces it (see §6); start rules-only on the free
  tier.
- No verses in Firestore yet — **verses stay local/curated/bundled for MVP** (owner decision;
  see §8).
- No theme switching, paid themes, in-app purchases, subscriptions (see §9).
- No AdMob, groups, comments, DMs, image uploads, avatars/profile photos (avatars are out of
  scope by owner decision).
- **No push notifications in the first MVP** (owner decision). Push ("someone prayed for your
  request") is a **desired future feature** that is deliberately deferred to a later,
  post-MVP phase because of its added complexity — see §9.5 and the future phase in §17.
- **No AI-generated Scripture / AI verse matching** in MVP. AI verse matching may be a future
  feature, but verse text must always come from approved (properly licensed or public-domain)
  sources — never AI-generated or hallucinated Scripture (owner decision; see §8).
- No analytics/Crashlytics required for the backend MVP (recommended only when an installable
  beta is built — see §2).

**Owner decisions captured in this revision (see §18 for the full list):** require sign-in to
read the prayer feed; account deletion required **before** the beta is shared with real
testers; manual Firebase console review for reports during early beta; prevent duplicate
reports by the same user on the same request; no admin dashboard for the first beta; beta
supports **both iOS and Android**; keep verses local/curated for MVP; AI verse matching is a
possible future feature but verse **text** must come from approved sources (no AI-generated
Scripture); avatars/profile photos out of scope; push notifications deferred to a documented
later phase; **step-by-step Firebase setup instructions must be produced (J.1) before any
implementation**; and individual-developer vs. LLC/company account is a decision **before
public launch**, not a blocker for Firebase planning (see §15 and the cost doc).

**What must still happen before external beta distribution (after this plan + Phase J):**
- Security rules written and **passing emulator tests** before any external user.
- Safe config handling (env patterns, no secrets committed).
- **Step-by-step Firebase setup instructions** authored in **J.1** before any implementation
  begins (owner decision — the owner will follow these to create the project/apps/config).
- A build/distribution decision (EAS + TestFlight / Play internal testing) for **both iOS and
  Android** and the relevant developer accounts (see `cost-and-publishing-considerations.md`
  §8 and §16 below).
- **User-initiated account deletion implemented and verified** before real testers join (owner
  decision; see §5 and §16).
- Privacy copy reviewed (see also the Legal / Compliance considerations in §16.5 and
  `agents/legal-compliance-advisor.md`); manual-console report handling confirmed.

---

## 2. Recommended Firebase Services

| Service | MVP recommendation | Notes |
|---|---|---|
| **Firebase Authentication** | **Yes — email/password** | Simplest, no third-party setup; matches PRD. Verification recommended (see §3). |
| **Cloud Firestore** | **Yes** | Per-document rules, good querying/offline; PRD already targets Firestore (not RTDB). |
| **Firebase Security Rules** | **Yes — required** | The core safety layer. No external user before rules pass emulator tests. |
| **Firebase Emulator Suite** | **Yes — for development/testing** | Auth + Firestore + Rules emulators. Enables rule tests and offline dev with no cost/secrets. |
| **Crashlytics / Analytics** | **Defer to beta-build phase (J.7), optional** | Useful once an installable EAS build exists; adds native modules (not Expo Go friendly). Keep MVP logic-first. |
| **Cloud Functions** | **Not yet** | Requires Blaze. Start rules-only (free Spark). Revisit only if counts/moderation need server logic (§6, §8). |
| **Firebase Storage** | **No** | No image uploads/avatars in MVP. |
| **Firebase Hosting / RTDB / Remote Config / Messaging** | **No** | Not needed for MVP. |

**Explicitly not used yet:** Cloud Functions, Storage, Hosting, Realtime Database, Cloud
Messaging (push), Remote Config, App Check (consider later for abuse hardening), AdMob.

---

## 3. Authentication Plan

**Method (MVP):** **Email/password** via Firebase Authentication. Rationale: lowest setup,
no third-party provider configuration, aligns with the existing name+email profile and PRD.
(Apple/Google sign-in can be added later; not required for MVP.)

**Mapping the current local flow:**
- `AuthContext.createProfile` → **sign up** (create Auth user) + create the `users/{uid}`
  document (display name; email stored on the user doc privately and in Auth).
- `AuthContext.signIn` → **sign in** with email/password (real session persistence via the
  Auth SDK).
- `AuthContext.signOut` → **sign out** (clear the Auth session).
- `AuthContext.updateProfile` → **edit display name** (write `users/{uid}.displayName`) and
  **edit email** (through Auth, see below). The `AuthContext` public API stays the same so
  screens do not change; only the implementation behind it changes.
- The fixed `local-user` id is replaced by the Firebase Auth **uid** everywhere ownership is
  checked.

**Display name handling:** stored on `users/{uid}.displayName` (public). Cached onto each
prayer request at post time (`displayName`), so renaming does not rewrite history (matches
PRD §"User Profile"). Editable from Settings.

**Private email handling:** email lives only in Firebase Auth and on `users/{uid}.email`
(private). It is **never** written to `prayerRequests`, `prayerInteractions`, `reports`, or
any public surface, and never displayed. Security rules forbid other users from reading a
`users` doc (see §11).

**Email-in-use handling (required):**
- On **sign up**, if the email already has an account, Firebase Auth returns
  `auth/email-already-in-use`. Do **not** create a duplicate; show the calm message and route
  to sign in: **"That email is already connected to another profile. Please use a different
  email or sign in."**
- On **edit email**, the same rule applies: a user must not change to an email already
  attached to another account. Firebase Auth's `updateEmail` / `verifyBeforeUpdateEmail`
  returns `auth/email-already-in-use` for a conflict; surface the same message. Because Auth
  owns the global email→account uniqueness, conflict detection is authoritative at the Auth
  layer (the client cannot bypass it). The plan does **not** rely on a Firestore query for
  uniqueness (that would be racy and would expose emails); Auth is the source of truth.

**Safe user-facing error messages (examples; never leak internals):**
- email-already-in-use → the message above.
- wrong-password / user-not-found → "We could not sign you in. Check your email and password
  and try again." (do not disclose which field was wrong).
- weak-password → "Please choose a longer password."
- network → "We could not reach the server. Please check your connection and try again."
- unknown → "Something went wrong. Please try again." (log the real error privately, §14).

**Email verification:** **Recommended** (send on sign up; optionally `verifyBeforeUpdateEmail`
on email change). For MVP, verification can be **encouraged but not gating** sign-in (to keep
beta friction low); revisit gating before public launch. Decision flagged in §18.

**Sign up / sign in / sign out:** standard Auth SDK flows; session persists across restarts
via the Auth SDK (replacing the `p4u.signedIn` flag). Password reset via email is recommended
(low effort) but can be a fast-follow.

**Account ownership protection:** every authenticated request carries `request.auth.uid`;
all ownership checks (edit/remove/own-doc writes) use it. No client-supplied `userId` is
trusted (see §11). A user can only modify their own `users` doc and their own content.

**What happens to the current local profile flow:** the screens (`create-profile`,
`sign-in`, Settings edit-profile) keep their UI and validation; `AuthContext` swaps its
internals from AsyncStorage to Auth + the `users` doc. Existing AsyncStorage profile keys are
ignored/cleared on first real sign-in (a one-time local cleanup; no migration of the
simulated profile is needed since it was never a real account).

---

## 4. Firestore Data Model

Shapes intentionally match `src/models/types.ts` and PRD §11 so the typed contracts carry
forward. Timestamps are Firestore server timestamps (`createdAt`, `updatedAt`). IDs are
Firestore auto-IDs except `prayerInteractions` (deterministic composite id).

### `users/{uid}`
- **Purpose:** the account's profile + private email; ownership anchor.
- **Example shape:**
  ```
  { uid: string, displayName: string, email: string, emailVerified: boolean,
    createdAt: Timestamp, updatedAt: Timestamp, isActive: boolean }
  ```
- **Required:** `uid` (== doc id == auth uid), `displayName`, `email`, `createdAt`.
- **Optional:** `emailVerified`, `isActive` (soft-ban flag, default true), `updatedAt`.
- **Owner field:** the doc id is the uid; only that user may read/write it.
- **Public vs private:** **entirely private.** No other user may read a `users` doc. (Public
  display name is carried on each prayer request instead, so the feed never reads `users`.)
- **Indexes:** none beyond default (looked up by id).
- **Privacy:** email and emailVerified are private; never surfaced publicly.

### `prayerRequests/{requestId}`
- **Purpose:** a posted prayer request (the feed unit).
- **Example shape:**
  ```
  { id: string, userId: string, isAnonymous: boolean, displayName: string,
    body: string, category: string, status: "active"|"flagged"|"removed",
    prayerCount: number, reportCount: number,
    createdAt: Timestamp, updatedAt: Timestamp,
    removedByOwner?: boolean }
  ```
- **Required:** `userId`, `isAnonymous`, `displayName` ("Anonymous" when anonymous), `body`
  (10–500), `category` (controlled set), `status`, `prayerCount` (init 0), `reportCount`
  (init 0), `createdAt`.
- **Optional:** `updatedAt`, `removedByOwner` (set on owner soft remove).
- **Owner field:** `userId` (always the real uid, even when anonymous).
- **Public vs private:** body, category, createdAt, prayerCount, status, and the **display
  name or "Anonymous"** are visible to authenticated users. `userId` is present for
  moderation/ownership but is not shown in the UI. **No email field exists here.**
- **Indexes:** composite index on `status (==) + createdAt (desc)` for the feed; optional
  `userId + createdAt` for "My prayer requests"; optional `category + createdAt` for future
  filtering.
- **Privacy:** sensitive prayer content; readable only to signed-in users; removed requests
  excluded from the feed query.

### `prayerInteractions/{uid}_{requestId}`
- **Purpose:** the source of truth that a given user prayed for a given request (dedupe key).
- **Example shape:** `{ userId: string, requestId: string, prayedAt: Timestamp }`
- **Required:** all three; doc id MUST equal `{userId}_{requestId}`.
- **Owner field:** `userId` (== `request.auth.uid`).
- **Public vs private:** an interaction doc is private to its owner (a user may read/write
  only their own). Aggregate effect is the denormalized `prayerCount` on the request.
- **Indexes:** none required for MVP (looked up by deterministic id; "Prayers I've prayed
  for" can query `userId ==` with `prayedAt desc`, which needs a simple index).
- **Privacy:** reveals who prayed for what; kept owner-private (not publicly listable).

### `reports/{reportId}`
- **Purpose:** a report filed against a request; manual moderation input.
- **Example shape:**
  ```
  { id: string, requestId: string, reportedBy: string,
    reason: "spam"|"inappropriate"|"harmful"|"other", notes?: string,
    createdAt: Timestamp, status: "pending"|"reviewed"|"dismissed"|"actioned" }
  ```
- **Required:** `requestId`, `reportedBy` (uid), `reason`, `createdAt`, `status` (init
  "pending").
- **Optional:** `notes` (≤ 300 chars).
- **Owner field:** `reportedBy`.
- **Public vs private:** **private** — a regular user may create a report but may not read
  any reports; only admins (console) read them.
- **Indexes:** optional `requestId + createdAt`; admin reads only.
- **Privacy:** may quote a note; never exposed to other users; never logged with full prayer
  text (§14).

### `verses` (deferred) and `appConfig`/`themes` (future)
- **`verses`:** **not created for MVP** — verses stay local/bundled (§8). If moved later:
  `verses/{id} = { book, chapter, verse, text, translation, tags[] }` plus
  `appConfig/verseOfTheDay = { ref, date }` for a single daily read.
- **`appConfig`:** optional future single-doc store for app-wide settings (e.g., a
  feature flag), public-read/admin-write. Not needed for MVP.
- **`themes`:** **not a collection.** Themes are client-side palette presets (see §9); no
  Firestore needed. If user theme *preference* is ever synced, store it on `users/{uid}`,
  not a public collection.

### `auditLogs` (optional)
- **Purpose:** privacy-safe audit trail of sensitive actions (§14). **Optional for MVP**; if
  included: `auditLogs/{id} = { type, uid, requestId?, createdAt, outcome }` — **never** body
  text, email, tokens. Admin-read only; ideally written server-side later (Cloud Function) to
  prevent tampering. For the rules-only MVP, prefer relying on Firebase's built-in usage logs
  + manual review rather than a client-writable audit collection (a client-writable audit log
  is low-trust). Decision flagged in §18.

---

## 5. Prayer Request Behavior

- **Create:** authenticated user writes a `prayerRequests` doc with `userId ==
  request.auth.uid`, server `createdAt`, `status: "active"`, counts 0, and `displayName` =
  the user's name or `"Anonymous"`. Validated client-side (existing `validatePrayerBody`) and
  server-side by rules (§11/§12). Mirrors `prayerService.createPrayer`.
- **Read feed:** query `status == "active"` ordered by `createdAt desc`, paginated
  (`startAfter`, page size ~20) — replaces `listActivePrayers`. Auth-gated read.
- **Read detail:** `prayerRequests/{id}` — replaces `getPrayerById`. Returns null/“not found”
  if removed.
- **Edit (owner only):** update `body`, `category`, `isAnonymous`, and the cached
  `displayName`; set `updatedAt`. Only the owner may edit (rules enforce `resource.data.userId
  == request.auth.uid`). Mirrors `editPrayer`; the local `p4u.overrides` mechanism disappears
  (the document itself is edited).
- **Remove (owner only):** **soft remove** — set `status: "removed"` and `removedByOwner:
  true` (not a hard delete), so it leaves the feed but the record is preserved for moderation
  integrity. Mirrors `removePrayer`; the local `p4u.removed` set disappears.
- **Soft remove vs hard delete:** an individual prayer request uses **soft remove** only
  (`status:"removed"`), preserving moderation integrity. This is distinct from **account
  deletion** (below).
- **Account deletion (required before real-tester beta — owner decision):** the app must offer
  a **user-initiated "Delete my account"** path **before** the beta is shared with real
  testers. This is the one place the user-facing word **"Delete"** is appropriate (it is
  account/data erasure, not the "Remove request" content control). MVP approach: delete the
  Firebase Auth user and the user's `users/{uid}` doc, and decide the fate of their authored
  content (recommended: anonymize authored requests — keep the content but detach identity by
  setting `displayName:"Anonymous"` and clearing the link — rather than mass-deleting feed
  history, so prayer counts and others' interactions stay coherent; alternatively soft-remove
  the user's own requests). The exact content-handling rule is the remaining sub-decision
  flagged in §18; that user-initiated account deletion **is required for the real-tester beta**
  is decided. App-store policy will also require this for public launch (see
  `agents/legal-compliance-advisor.md`).
- **"Remove request" language:** the user-facing control stays **"Remove request,"** never
  "Delete." Soft remove matches that mental model (it leaves your feed) and preserves
  moderation/audit ability. The same word is used in copy and confirmation dialogs.
- **Category handling:** the existing controlled set (`PrayerCategory`) stored as a stable
  key; validated by rules to be one of the allowed values.
- **Anonymous vs display-name:** `isAnonymous` controls **display only**; `userId` is always
  stored. When anonymous, `displayName` is `"Anonymous"` and the real name is never written to
  the request. The UI derives the shown name from `isAnonymous` (already the case).
- **Email never public:** no email field exists on `prayerRequests`; rules also reject any
  write that includes unexpected fields (closed schema, §11/§12).
- **Owner-only edit/remove rules:** enforced in both the service layer and security rules
  (defense in depth) — no client may edit/remove another user's request.

---

## 6. Prayer Interaction Behavior

- **"I prayed for this":** create `prayerInteractions/{uid}_{requestId}` and increment the
  request's `prayerCount`. Mirrors `recordPrayerInteraction` + the count handling in
  `PrayerContext`.
- **Prevent duplicates:** the deterministic id `{uid}_{requestId}` makes the interaction
  idempotent; rules allow **create only when the doc does not already exist** and the id
  matches the caller's uid. A second tap cannot create a second interaction.
- **Count updates / avoiding client inflation:** the recommended MVP approach is a **batched
  write** that (a) creates the interaction doc and (b) increments `prayerCount` by exactly 1,
  with **security rules** validating that `prayerCount` may change **only by +1** and **only
  in the same write that creates the matching interaction** (using `getAfter()`/`exists()` so
  a client cannot bump the counter without a real, first-time interaction). This prevents
  inflation without a Cloud Function.
- **Approach options (and recommendation):**
  - **Recommended MVP:** batched write + rules validation (above). Free tier; inflation-safe;
    no Functions.
  - **Simplest fallback:** drop the stored counter and compute counts with an **aggregation
    `count()` query** on read — zero inflation risk, but costs reads per card (acceptable only
    at tiny scale; weaker for a 20-card feed). Use only if rules prove too fiddly.
  - **Hardened (later):** a **Cloud Function** (callable or Firestore trigger) does the
    dedupe+increment server-side. Requires Blaze; defer unless abuse appears or rules can't
    express the invariant cleanly.
- **How MVP should start:** batched-write + rules (recommended). Keep `prayerCount`
  denormalized on the request for cheap feed reads.
- **Own-request behavior:** a user **cannot** pray for their own request — enforced in the UI
  (already) and in rules (the interaction's `requestId` owner must differ from
  `request.auth.uid`, validated via `get()` of the request). Decision to keep this block is
  flagged in §18 (recommended: keep).

---

## 7. Report Request Behavior

- **Report another user's request:** authenticated user creates a `reports` doc with
  `reportedBy == request.auth.uid`; increments the request's `reportCount` (same batched-write
  + rules pattern as interactions, validating +1 and a matching new report). Mirrors
  `recordReport`.
- **Block report on own request:** rules reject a report where the target request's `userId
  == request.auth.uid` (validated via `get()`); the UI already hides the entry point on own
  posts.
- **Duplicate report behavior (DECIDED — prevent duplicates):** by owner decision, a user may
  **not** file more than one report against the **same request**. Enforce this with a
  deterministic report id `reports/{uid}_{requestId}` (mirroring interactions): rules allow
  **create only when that doc does not already exist** and the prefix matches the caller's uid.
  A second report attempt on the same request by the same user is a no-op/denied, which bounds
  abuse and keeps `reportCount` meaningful for manual review.
- **Reasons + optional note:** the existing controlled `ReportReason` set + optional `notes`
  (≤ 300 chars), validated by rules.
- **Privacy-safe storage:** reports are **admin-read only**; no regular user can read reports.
  Notes may contain sensitive text, so reports are never exposed publicly and never logged
  with full prayer/email content (§14).
- **No moderation dashboard yet (owner decision):** the first beta does **not** build an admin
  dashboard. MVP moderation is **manual via the Firebase console** (an admin sets a request's
  `status` to "removed"/"flagged"). The data model supports a future admin UI without change.
- **MVP report handling before admin tooling:** a report flags the content (`reportCount`,
  optional `status: "flagged"`); a human reviews in the console and updates `status`.
  Auto-hiding on N reports is a future option (Cloud Function), not MVP.

---

## 8. Verse of the Day Behavior

- **MVP (owner decision — keep verses local):** **keep Bible verses local, curated, and
  bundled** (the current `verseService` + `mockVerses`, KJV public domain, deterministic by
  calendar day). No Firestore, no API, no cost, no licensing risk. This is the lowest-risk
  path and already works offline.
- **Later (optional):** move to a curated `verses` collection + a single `appConfig/
  verseOfTheDay` daily read (one document read per day per client) so verses can be updated
  without an app release. Only worthwhile once content needs to change frequently.
- **Licensing/source (must be reviewed before any non-KJV text):** **many modern Bible
  translations are copyrighted**, so any future verse sourcing must be **legally reviewed**
  before use (license terms, attribution, rate limits, commercial/ads compatibility) — see
  `agents/legal-compliance-advisor.md`. For MVP, stay on **public-domain (KJV)** or other
  **properly licensed / public-domain** translations. Third-party Bible APIs are out of scope
  for MVP (see PRD §16 open question).
- **AI verse matching (possible future feature — text must come from approved sources):** AI
  may **later** assist by **matching a user's expressed need to an appropriate verse**, but the
  **verse text itself must always come from an approved source** (properly licensed or
  public-domain translation). **AI must never fabricate, paraphrase, or "hallucinate" Bible
  text.** Any AI-assisted matching selects from a vetted, approved verse set; the displayed
  Scripture is verbatim from that approved source. AI-assisted features would also carry an
  appropriate disclaimer (see `agents/legal-compliance-advisor.md`). **Not part of the first
  Firebase MVP.**
- **Daily deterministic behavior:** unchanged — same day yields the same verse; computed
  client-side from the date.
- **Do not build yet:** a verses backend, a verse-management/admin tool, a scheduled Cloud
  Function to rotate verses, any external Bible API integration, or any AI verse matching.

---

## 9. Theme Support and Monetization Considerations

- **Current foundation (Phase H.3):** all colors are centralized tokens in
  `mobile-app/src/theme/theme.ts`; components read tokens; no hardcoded hex in screens. A
  future theme is a **palette swap** (e.g. a `ThemeProvider`) with no component changes.
- **Future theme packs:** documented possibilities (Classic Prayer Journal, Soft Morning
  Light, Night Prayer, High Contrast, Large Text Friendly) — see `design-direction.md` §16.
- **Accessibility themes must not be paywalled:** **High Contrast** and **Large Text
  Friendly** are accessibility features and must always be free.
- **Cosmetic-only rule:** any future paid theme changes **color only**, never feature
  availability; never required for usability.
- **No IAP in Firebase MVP:** no in-app purchases, subscriptions, marketplace, or theme
  switching are part of this MVP. Firebase scope is auth + data + rules only.
- **No monetization interrupting prayer moments:** any future theme upsell follows the same
  guardrail as ads — never on submission, detail, the "I prayed for this" action, or any
  emotional moment (`design-direction.md` §10/§16). If a theme preference is ever synced,
  store it on `users/{uid}` (private), not a public collection.

### 9.5 Push Notifications (desired future feature — deferred to a later, post-MVP phase)

**Owner decision:** a push notification when **someone prays for your request** is a
**desired future feature**, but it is **NOT part of the first Firebase MVP**. Per the owner's
instruction, the plan must clearly identify the added complexity and recommend a later phase
— which it does here.

**Why push is deferred (added complexity):** push notifications are not a small add-on. They
introduce, at minimum:
- **OS permission flows** — requesting and respecting notification permission on iOS and
  Android, plus a graceful path when the user declines.
- **Device tokens** — obtaining, storing (privately, e.g. on `users/{uid}`), and refreshing
  per-device push tokens, and cleaning up stale/invalid tokens.
- **Backend trigger logic** — something server-side must fire when a `prayerInteractions` doc
  is created and send the notification. On Firebase this means a **Cloud Function + the Blaze
  plan + Firebase Cloud Messaging (FCM)** — i.e., leaving the rules-only, free-tier MVP.
- **iOS/Android push credentials** — APNs keys/certificates (Apple) and FCM setup (Android),
  which require the relevant developer accounts and an installable (EAS) build, not Expo Go.
- **User notification preferences** — per-user opt in/out and granularity (this app must let
  users turn it off), stored privately.
- **Rate limiting / batching** — a popular request could trigger many notifications; they must
  be batched/throttled so the experience stays calm and never spammy (consistent with "never
  interrupt prayer moments").
- **Privacy care** — a notification must **never** leak private content or email; payloads stay
  minimal (e.g., "Someone prayed for your request"), and notification events follow the same
  privacy-safe logging rule (§14).

**Recommendation:** plan push notifications **after the core Firebase MVP is stable** (auth,
data, rules, and an installable beta proven). It is documented as a **future post-MVP phase**
(see §17, *Future phase — Push notifications*) and should not be pulled forward unless the
owner explicitly reprioritizes it with the above complexity acknowledged. The
**Growth / Beta Research Advisor** should weigh its user value/risk, and the
**Legal / Compliance Advisor** should review notification privacy before it is built.

---

## 10. Service Migration Plan

The migration replaces the **internals** of the existing service seam while keeping the
**typed contracts** and the React Native screens unchanged.

| Local service (today) | Firebase-backed (MVP) | Keep / Replace |
|---|---|---|
| `AuthContext` (AsyncStorage profile, `local-user`) | Firebase Auth + `users/{uid}` doc | Keep the context's public API (`createProfile`/`updateProfile`/`signIn`/`signOut`); replace internals |
| `prayerService.listActivePrayers` / `getPrayerById` | Firestore feed query + doc get | Keep method signatures + return types; replace bodies |
| `prayerService.createPrayer` / `editPrayer`(ctx) / `removePrayer`(ctx) | Firestore create/update (soft remove) | Keep typed inputs/outputs; replace persistence; drop `p4u.overrides` / `p4u.removed` |
| `prayerService.recordPrayerInteraction` + count derive | Batched write (interaction + counter) | Keep contract; replace with transaction/batch + rules |
| `prayerService.recordReport` + count derive | Batched write (report + counter) | Keep contract; replace |
| `verseService.getVerseOfTheDay` | **Unchanged** (local bundled) | Keep as-is for MVP |
| Error/logging (ad hoc) | **Error/logging strategy** (structured errors + safe messages + privacy-safe logging) | New, thin, shared (see §14) |

**Code patterns to keep:**
- The `src/services/` seam as the *only* place that knows about the backend (screens never
  import Firestore/Auth directly).
- Shared TypeScript models (`src/models/types.ts`) as the contract; the same shapes are read/
  written.
- `PrayerContext` / `AuthContext` / `FeedbackContext` as the screens' interface; method names
  and feedback copy stay the same.
- Derived selectors (`getMyRequests`, `getPrayedRequests`, `hasPrayed`, `hasReported`) — these
  become Firestore queries or in-memory derivations over loaded data.

**What to replace:** the AsyncStorage persistence of shared data (submitted requests,
interactions, reports, overrides, removals) and the simulated auth; the derived-count layering
becomes a server-maintained denormalized counter.

**Keep React Native UI mostly unchanged:** because contracts/types are preserved, screens
change minimally — mostly swapping synchronous-feeling local calls for the same async service
calls they already `await`. The biggest UI-visible changes are real auth states (loading/
errors) and pagination wiring on the feed.

**Avoid duplicating business logic:** ownership, dedupe, validation, and the anonymity/email
rules live in **one place per concern** — the service layer + Firestore rules mirroring each
other — not re-implemented per screen.

**Local persistence after Firebase:** rely on **Firestore's built-in offline persistence**
(cache) for reads/queued writes instead of the custom `p4u.*` stores. Keep only the auth
session (handled by the Auth SDK) and, optionally, a tiny local cache of the user's own
display name. Remove the bespoke AsyncStorage data stores to avoid two sources of truth. A
"you are offline" indicator should make cached state clear.

---

## 11. Security Rules Plan

Rules are the enforcement layer (the legacy app's fatal flaw was open rules — never repeat).
Expected behavior:

- **Signed-out:** no reads or writes to any collection (`request.auth != null` required
  everywhere). No public/anonymous access.
- **Feed reads (DECIDED — sign-in required):** by owner decision, **sign-in is required to
  read the prayer feed**. Rules require `request.auth != null` for any `prayerRequests` read;
  there is **no public/anonymous read** of the feed in the MVP. (A public read-only feed is not
  planned; revisiting it would be a separate future decision.)
- **`users/{uid}`:** read/write **only** by that uid (`request.auth.uid == uid`). No other
  user may read a `users` doc (protects email). Closed schema (only allowed fields).
- **`prayerRequests` create:** allowed only if `request.resource.data.userId ==
  request.auth.uid`, required fields present and valid (body length, category in set, status
  == "active", counts == 0, server timestamp), **no email field**, and no unexpected fields.
- **`prayerRequests` update (edit):** allowed only by the owner (`resource.data.userId ==
  request.auth.uid`); may change only the editable fields (body/category/isAnonymous/
  displayName/updatedAt) — **not** `userId`, `createdAt`, or counters via this path.
- **`prayerRequests` remove (soft):** owner-only update setting `status: "removed"` /
  `removedByOwner: true`; never a hard `delete` from the client.
- **`status` (moderation):** changing `status` to "flagged"/"removed" for moderation is
  restricted to admins (custom claim) or the console — not regular users (except the owner's
  own soft-remove).
- **Counter writes (`prayerCount` / `reportCount`):** clients may **not** freely write
  counters. A counter may change **only by +1** and **only in the same write** that creates
  the matching `prayerInteractions` / `reports` doc (validated via `getAfter()`/`exists()`),
  preventing inflation. No arbitrary counter writes.
- **`prayerInteractions`:** create only `{uid}_{requestId}` where the prefix == the caller's
  uid, the request exists and is active, and the request's owner != caller (no self-pray);
  immutable after create; a user reads only their own interactions.
- **`reports`:** create only with `reportedBy == request.auth.uid`, target request exists and
  is **not** owned by the caller (no self-report), valid reason/notes; **no read** for
  regular users (admin-only read).
- **Block spoofed `userId`:** every create/owner check derives identity from
  `request.auth.uid`; any document whose `userId`/`reportedBy` != the caller is rejected.
- **Email privacy:** rules forbid writing email into `prayerRequests`/`prayerInteractions`/
  `reports` (closed schemas) and forbid cross-user reads of `users`.
- **Testing rules (emulator):** write **Rules unit tests** with the Firebase Emulator Suite
  (`@firebase/rules-unit-testing`) covering each allow/deny case in §13. Rules must pass these
  tests **before any external user** receives a build. Tests run in CI/locally with no secrets.

---

## 12. API / Data Contract Standards

- **Typed service methods:** every service method reuses `src/models/types.ts` for inputs and
  outputs (no untyped blobs). Example contracts (illustrative):
  - `auth.signUp(email, password, displayName) -> UserProfile | AuthError`
  - `auth.updateEmail(newEmail) -> void | AuthError` (maps `email-already-in-use`)
  - `prayers.listActive(cursor?) -> { items: PrayerRequest[]; nextCursor? }`
  - `prayers.create(input: NewPrayerInput) -> PrayerRequest`
  - `prayers.edit(id, EditPrayerInput) -> PrayerRequest`
  - `prayers.remove(id) -> void` (soft remove)
  - `interactions.pray(requestId) -> void` (idempotent)
  - `reports.create(NewReportInput) -> void`
- **Inputs/outputs:** server is the source of truth for `userId` (from `auth.uid`),
  timestamps, and counters — never trusted from the client payload.
- **Error shape:** a single discriminated error type (e.g. `{ code: ErrorCode; userMessage:
  string }`) with a finite `ErrorCode` set the UI maps to calm messages (§3/§14); raw Firebase
  exceptions never reach screens.
- **Validation rules:** required fields, body 10–500, category ∈ set, reason ∈ set, notes ≤
  300 — enforced **server-side (rules)** and mirrored client-side for UX.
- **Ownership validation:** edit/remove/own-doc operations check `auth.uid`; reports/
  interactions check target ownership.
- **Public/private separation:** public request fields vs private `users`/`reports`/
  `interactions`; no email in any public/shared doc.
- **Versioning/migration:** documents carry enough shape to evolve safely; add fields
  additively; consider a `schemaVersion` on new collections if a breaking change is foreseen.
  Because MVP starts a fresh database (no legacy migration — see PRD §16 / cost doc), there is
  no v0 data to migrate.

---

## 13. Automated Testing Plan

**Firebase security-rule emulator tests (required, allow + deny per case):**
- Signed-out reads/writes are denied on every collection.
- Auth sign-up creates `users/{uid}`; a second sign-up with the same email is rejected
  (email-in-use).
- Edit display name: owner allowed; non-owner denied.
- Edit email conflict: changing to an in-use email is rejected (Auth-level; covered by an
  Auth emulator test).
- Create prayer request: owner-stamped allowed; spoofed `userId` denied; missing/invalid
  fields denied; email field denied.
- Edit only own request: owner allowed; other user denied.
- Remove only own request: owner soft-remove allowed; other user denied; client hard `delete`
  denied.
- Anonymous display: anonymous request stores `displayName == "Anonymous"` and a real
  `userId`; the real name is never written.
- Email never in public data: writes including email to request/interaction/report denied.
- Prevent duplicate prayed interaction: second `{uid}_{requestId}` create denied/no-op.
- Prevent count inflation: a counter write without the matching interaction/report create is
  denied; +N (N>1) denied; self-pray denied.
- Report someone else's request allowed; report on own request denied; duplicate report
  handling per chosen rule.
- Signed-out user restrictions across all of the above.

**Service-layer unit tests:** each service method against the emulator (happy path + the
mapped error cases, esp. email-in-use, permission-denied, not-found).

**UI smoke tests (where appropriate):** lightweight render/flow tests for the auth screens,
feed, submit, detail, edit, and settings — verifying the same behavior the manual QA checklist
covers (no email shown publicly; owner controls only on own posts).

**Tooling:** Jest + `@firebase/rules-unit-testing` for rules; Jest + React Native Testing
Library for service/UI (added in Phase J, not now). Tests run against the **emulator**, no
secrets, suitable for CI.

---

## 14. Error Handling, Logging, and Observability

- **Structured errors:** the single error type from §12; services translate Firebase errors
  into known codes.
- **Safe user-facing messages:** calm, non-leaky copy (§3); never expose stack traces, raw
  codes, or which credential failed.
- **What to log (privately):** error codes/types, operation name, the acting uid, the target
  `requestId`, timestamps, and outcome (allowed/denied). Enough to debug and to audit
  sensitive actions.
- **What must NEVER be logged:** **full prayer text, private emails, passwords, tokens,
  secrets, security-rule internals, or any sensitive user content.** (Hard rule.) Use ids and
  categories, not bodies; use uid, not email.
- **Privacy-safe logging rules:** redact by default; log identifiers not content; keep logs
  out of the repo and off any public surface; no PII in analytics event params.
- **Audit-style logging for sensitive actions** (type + uid + requestId + outcome only):
  auth failures, email-change attempts, edit request, remove request, report request, and
  **denied permission attempts**. For the rules-only MVP, prefer Firebase's built-in audit/
  usage logging + manual review over a client-writable `auditLogs` collection (which is
  low-trust); a server-written audit log can come with Cloud Functions later (§4/§18).
- **Crash/error reporting for beta:** add **Crashlytics** (or Sentry) **when the installable
  EAS beta build is created** (Phase J.7), not for the Expo-Go MVP — it needs native modules.
- **Usage/cost monitoring:** watch the Firebase console (Firestore reads/writes, Auth volume)
  and set **budget alerts**; know where Spark limits sit and where Blaze charges begin (§15).

---

## 15. Cost and Scaling Considerations

- **Free/low-cost MVP assumptions:** Spark free tier is sufficient for development and a small
  beta — Auth (≤ 10k/month), Firestore (50k reads / 20k writes per day). Realistically **$0**
  at beta scale. No Cloud Functions (would require Blaze).
- **Firestore reads/writes to watch:**
  - **Feed query:** paginated (`startAfter`, ~20/page) — avoid full-collection scans; one
    read per card per page. Use offline cache and pull-to-refresh, not constant re-reads.
  - **Counter updates:** one extra write per pray/report (batched with the interaction/report
    create) — cheap; the denormalized counter avoids per-card aggregation reads.
  - **Report storage:** low volume; admin reads only.
  - **`users` doc:** one read on sign-in; not read by the feed (display name is cached on
    requests), which keeps feed reads cheap and private.
- **Logging/monitoring cost:** built-in console metrics are free; Crashlytics free; analytics
  free at this scale. A self-hosted log/audit collection adds writes — keep minimal.
- **Cost guardrails for a small beta:** enable **budget alerts**; cap page size; lean on
  offline cache; defer Cloud Functions; keep verses local (no reads); review usage before each
  phase per the cost doc.
- **Both-platform beta cost (owner decision — iOS + Android):** plan for **Google Play Console
  ($25 one-time)** and **Apple Developer (~$99/yr)** since the beta targets both platforms; pay
  each only when that platform's installable beta is actually shared (cost doc §8). Android-
  first sequencing remains the cheaper starting point.
- **Business entity — individual vs. LLC/company account (decide before public launch, NOT a
  Firebase-planning blocker — owner decision):** whether the developer/store/Firebase accounts
  are registered under an **individual developer** identity or an **LLC/company** affects
  liability, store listing identity, payments/tax, and ownership of the project. This is a
  **before-public-launch** decision; it does **not** block Firebase MVP planning or the
  internal beta. Flagged for the **Legal / Compliance Advisor** (and a real attorney/accountant
  where appropriate) — see §16.5 and the cost doc.

---

## 16. Beta Readiness Checklist (before testers can use it)

- [ ] **Step-by-step Firebase setup instructions authored (J.1)** — owner-followable
      instructions to create the project, register apps, enable Auth, and wire safe config
      **before any implementation begins** (owner decision; see §17 J.1).
- [ ] **Firebase project created** (owner action, following the J.1 instructions; not in this
      plan) with **both iOS and Android** apps registered (owner decision — beta supports both
      platforms).
- [ ] **Auth configured** (email/password enabled; verification email template set).
- [ ] **Sign-in required to read the feed** (owner decision) — verified by rules/emulator
      tests (no anonymous feed read).
- [ ] **Firestore rules written** for all collections (§11), closed schemas, owner checks.
- [ ] **Emulator tests passing** for every allow/deny case (§13) — gate before any external
      user.
- [ ] **Account deletion implemented and verified** — a user-initiated "Delete my account"
      path works **before** real testers join (owner decision; §5). Content-handling rule
      (anonymize vs. soft-remove authored requests) decided and tested.
- [ ] **Duplicate-report prevention verified** — a user cannot report the same request twice
      (deterministic `reports/{uid}_{requestId}`; owner decision; §7).
- [ ] **Secrets/config handled safely:** config via env patterns excluded by `.gitignore`
      (`.env*`, `google-services.json`, `GoogleService-Info.plist`, `serviceAccountKey.json`);
      **nothing committed**. (Names only here; no values.)
- [ ] **EAS/build path decided** (Expo Go won't carry native Firebase/analytics; an EAS dev/
      preview build is likely needed for an installable beta — Systems Admin owns this).
- [ ] **Apple/Google accounts for both platforms:** Google Play Console ($25 one-time) for
      Android internal testing **and** Apple Developer (~$99/yr) for TestFlight — beta supports
      **both iOS and Android** (owner decision). Pay each only when that platform's installable
      beta is actually shared (cost doc §8); Android-first sequencing is fine for cost, but both
      are planned.
- [ ] **Installable distribution path:** TestFlight (iOS) and Play internal testing (Android)
      links so testers install without the developer's machine.
- [ ] **Push notifications confirmed OUT of the first MVP** (owner decision) and documented as
      a future post-MVP phase (§9.5, §17) — not built for this beta unless explicitly
      reprioritized.
- [ ] **Privacy copy reviewed:** what data is stored, that email is private, how to remove a
      request, **and how to delete your account**; a basic privacy policy link before external
      testing (see §16.5 and `agents/legal-compliance-advisor.md`).
- [ ] **Report handling confirmed (DECIDED):** **manual Firebase console review** is the beta
      moderation path (owner decision); document who reviews reports.
- [ ] **Manual QA checklist** (auth, feed/detail, submit, edit, remove, pray, report, verse,
      settings, **account deletion**; email never public; owner controls only on own posts;
      larger-text pass).
- [ ] **Rollback plan:** keep the local/mock build runnable; feature-flag or branch the
      Firebase work so a broken backend can be reverted; rules changes are versioned and
      re-deployable.

### 16.5 Legal / Compliance Considerations (advisory — not legal advice)

These items are flagged for review by the **Legal / Compliance Advisor**
(`agents/legal-compliance-advisor.md`), which **identifies issues and recommends professional
review** — it does **not** provide legal advice. A qualified attorney should review user-facing
policies before public launch.

- **Before beta (real testers):** a basic **privacy policy** (what is stored, that email is
  private, data retention, how to request deletion), **account deletion** available (decided —
  required), a working **report/abuse** path (decided — manual console), and confirmation that
  Bible text in use is **public-domain/properly licensed** (KJV for MVP).
- **Before public launch:** finalized **privacy policy** and **terms of use**; app-store
  compliance for **user-generated content** (moderation + reporting + account deletion are
  store requirements); **data retention/deletion** expectations documented; review of
  **monetization** (themes/ads) compliance; and a decision on **individual-developer vs.
  LLC/company account** (see §15 and the cost doc) — a *before-public-launch* decision, **not a
  blocker for Firebase planning**.
- **If AI assistance is added later:** an **AI-generated-content disclaimer** and the rule that
  **AI never fabricates Scripture** (approved-source verse text only — §8).
- **What needs a real attorney:** the privacy policy, terms of use, any monetization terms, the
  business-entity (LLC) question, and Bible-translation licensing for any non-public-domain
  text.

---

## 17. Recommended Implementation Phases (Phase J)

Each phase is small, runnable, and gated by a go/no-go review (Backend Engineer + Systems
Admin required from here on). No external testers until J.6 passes.

**J.1 — Step-by-step Firebase setup instructions & config planning (docs only)**
- Goal (owner decision): produce **clear, step-by-step, owner-followable Firebase setup
  instructions** that the owner uses to stand up the project **before any implementation** —
  create the Firebase project; register **both an iOS and an Android app** (owner decision —
  both platforms); enable **email/password Auth** and set the verification email template;
  locate config files; and the safe config/env approach (env patterns, **names not values**).
  Also: dependencies plan and confirm `.gitignore` coverage.
- Files likely changed: **docs only** (the setup-instructions doc + planned `.gitignore`
  review). **No project created in the repo; no secrets/values written.**
- Risks: accidental secret commit. Validation: secret scan; `.gitignore` review.
- Go/no-go: step-by-step setup instructions written and reviewed; config approach approved; no
  secrets anywhere. **Implementation (J.2+) does not begin until these instructions exist.**

**J.2 — Firebase Auth implementation (incl. account deletion)**
- Goal: real email/password auth behind `AuthContext`; sign up/in/out, edit name/email,
  email-in-use handling, verification (non-gating), and a **user-initiated account-deletion
  path** ("Delete my account" — Auth user + `users/{uid}` doc, with the decided content rule
  from §5). Account deletion is an **owner decision** and **required before the real-tester
  beta** (gate at J.7).
- Files: `AuthContext`, auth/settings screens (minimal), new `services/authService`, deps.
- Risks: email-change conflicts; session edge cases; account-deletion content handling.
  Validation: Auth emulator tests; manual (incl. delete-account flow).
- Go/no-go: auth flows + email-in-use message + account deletion verified; no email leakage.

**J.3 — Firestore prayer requests read/write**
- Goal: feed (paginated) + detail + create + owner edit + owner soft remove via Firestore.
- Files: `prayerService`, `PrayerContext`, feed/detail/submit/edit screens (minimal).
- Risks: pagination, offline. Validation: rules + service tests; manual feed/detail.
- Go/no-go: CRUD works; soft remove correct; "Remove request" wording intact.

**J.4 — Prayer interactions and counts**
- Goal: idempotent pray + inflation-safe counter (batched write + rules).
- Files: `prayerService`/interactions service, `PrayerContext`, detail screen.
- Risks: counter rule correctness. Validation: dedupe/inflation rule tests.
- Go/no-go: no double-count; no inflation; no self-pray.

**J.5 — Reports**
- Goal: report others (not self), report storage, reportCount, manual moderation path.
- Files: report service, report screen, rules. Risks: self-report bypass; duplicate reports.
- Validation: report rule tests. Go/no-go: self-report blocked; reports admin-only read.

**J.6 — Security rules hardening + emulator test suite**
- Goal: complete, reviewed rules + full passing emulator suite (§13) across all collections.
- Files: `firestore.rules`, rules tests. Risks: a missed deny path. Validation: full suite +
  Security Reviewer sign-off.
- Go/no-go: **all** allow/deny cases pass; Security Reviewer Proceed. (Gate before any beta.)

**J.7 — Beta build readiness (both iOS and Android)**
- Goal: EAS build path, Crashlytics/analytics (optional), distribution to **both iOS
  (TestFlight) and Android (Play internal)** per the owner decision, privacy copy (incl.
  account-deletion and data handling), legal/compliance pre-beta items (§16.5), QA + rollback.
- Files: build config (no secrets in repo), docs. Risks: signing/accounts/config. Validation:
  install on a tester device without the dev machine; **account deletion verified**; secret
  scan.
- Go/no-go: installable build(s), rules deployed, account deletion working, secret scan clean,
  QA pass, **Legal / Compliance Advisor** pre-beta items reviewed.

**Future phase — Push notifications (post-MVP; do not start unless reprioritized).** Per the
owner decision, push ("someone prayed for your request") is a **desired future feature** that
is **deferred to after the core Firebase MVP is stable** because of its added complexity (OS
permissions, device tokens, a Cloud Function + Blaze + FCM backend trigger, iOS/Android push
credentials, per-user notification preferences, rate limiting/batching, and privacy-safe
payloads — see §9.5). When undertaken, it gets its own planning + go/no-go, with the
**Growth / Beta Research Advisor** assessing user value/risk and the **Legal / Compliance
Advisor** reviewing notification privacy.

**Future phase — AI verse matching (post-MVP; approved-source text only).** AI may later help
match a user's need to a verse, but verse **text** must always come from an approved
(licensed/public-domain) source — **never AI-generated Scripture** (§8). Its own planning +
go/no-go, with a Legal / Compliance review of licensing and AI-content disclaimers.

---

## 18. Owner Decisions and Remaining Questions

### 18.1 Decisions made by the owner (this revision)

These were open questions; the owner has now decided them. They are reflected throughout the
plan (sections noted).

1. **Feed read gating — DECIDED: require sign-in to read the prayer feed.** No public/anonymous
   feed read (§1, §11).
2. **Account deletion — DECIDED: required before the beta is shared with real testers.**
   User-initiated "Delete my account" (§1, §5, §16; implemented in J.2, gated at J.7).
3. **Reports before beta — DECIDED: manual Firebase console review** for the early beta (no
   admin tooling first) (§7, §16).
4. **Duplicate reports — DECIDED: prevent duplicate reports** by the same user on the same
   request (deterministic `reports/{uid}_{requestId}`) (§7, §11, §16).
5. **Admin dashboard — DECIDED: do NOT build an admin dashboard for the first beta** (§1, §7).
6. **Beta platform — DECIDED: support BOTH iOS and Android** (§1, §16, §17; Android-first
   sequencing is acceptable for cost, but both are planned).
7. **Verses — DECIDED: keep verses local and curated for the Firebase MVP** (§8).
8. **AI verse matching — DECIDED as a possible FUTURE feature only, with a hard rule:** verse
   **text** must come from **approved sources** (properly licensed or public-domain
   translations); **AI must never generate/hallucinate Scripture** (§8, §17 future phase).
9. **Avatars / profile photos — DECIDED: out of scope** for the MVP (no Storage) (§1, §2).
10. **Push notifications — DECIDED: NOT in the first MVP**; a desired **future post-MVP phase**
    whose added complexity is documented and which recommends a later phase (§1, §9.5, §17).
11. **Firebase setup instructions — DECIDED: step-by-step, owner-followable setup instructions
    must be produced (J.1) BEFORE any implementation** (§16, §17 J.1).
12. **Business entity — DECIDED framing: individual-developer vs. LLC/company account is a
    decision to make BEFORE public launch, NOT a blocker for Firebase planning** (§15, §16.5,
    cost doc).

### 18.2 Remaining questions (recommended defaults; resolve during Phase J)

- **Auth method:** email/password for MVP (recommended); Apple/Google sign-in can be added
  later.
- **Account-deletion content rule:** anonymize the user's authored requests (recommended) vs.
  soft-remove them on deletion (§5) — confirm during J.2.
- **Own-request praying:** keep the block on praying for your own request (recommended).
- **Email verification gating:** encourage-only for beta (recommended) vs. require a verified
  email to post.
- **Audit logging:** rely on Firebase built-in logs for MVP (recommended) vs. a server-written
  `auditLogs` collection (needs Cloud Functions / Blaze).
- **Crashlytics/analytics:** add at J.7 with the EAS build (recommended) vs. skip for beta.

### 18.3 New advisory roles (owner request)

Before Firebase implementation, two **advisory** roles join the planning views (they advise;
they do not implement):
- **Legal / Compliance Advisor** (`agents/legal-compliance-advisor.md`) — privacy/terms,
  account deletion, app-store/UGC compliance, Bible-licensing, AI-content disclaimers,
  monetization compliance, and the individual-vs-LLC question. **Not a lawyer / not legal
  advice;** recommends professional review. Participates in Firebase / beta / public-launch
  planning.
- **Growth / Beta Research Advisor** (`agents/growth-beta-research-advisor.md`) — tester
  selection, feedback goals, survey/interview questions, feature prioritization, onboarding
  clarity, positioning, and monetization **hypotheses** (e.g., theme personalization) without
  pushing premature growth/monetization. Participates in beta-readiness and feedback planning.

---

## 19. Validation of This Planning Phase

- **Docs-only:** this phase adds only `docs/firebase-mvp-plan.md` and
  `docs/reviews/phase-i-firebase-mvp-plan-review.md`. No app code, no Firebase project, no EAS
  project, no dependencies, no config, no secrets.
- **No secrets:** no keys, URLs, buckets, tokens, or credentials are written (config items are
  named, never valued). A secret scan should return only documentation references.
- **Untouched:** `legacy-web-app/` and `.claude/` are not modified.
- **Next step:** owner reviews this plan + the role review; on approval, commit the docs and
  begin **Phase J.1** (still Plan/setup-doc level) — implementation does not start until the
  per-phase go/no-go gates above are met.
