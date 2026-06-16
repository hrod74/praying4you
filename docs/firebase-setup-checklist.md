# Firebase Setup Checklist: Praying For You

**Status:** planning only. This checklist does **not** create Firebase, an EAS project, app
code, config, or secrets. It is a step-by-step guide the owner follows **later**, when ready to
move from the local/mock prototype to a Firebase-backed MVP.
**Lenses:** Backend Engineer, Systems Admin / DevOps, Security Reviewer, Test Engineer, with
Legal / Compliance and Growth / Beta Research advisory input.
**Related:** `firebase-mvp-plan.md` (the full plan), `firebase-review-brief.md` (reviewer
summary), `reviews/phase-i-firebase-mvp-plan-review.md`, `cost-and-publishing-considerations.md`.

---

## 1. Purpose and scope

- This checklist prepares the Firebase setup for Praying For You so the owner knows exactly what
  has to happen, in order, before and during implementation.
- **This document does not create Firebase yet.** Nothing here stands up a project, writes code,
  or adds config.
- **Firebase implementation should not begin until the setup decisions below are approved** (the
  Phase I plan is committed and reviewed, and these decisions are confirmed).
- **No secrets or real config values are ever committed to this repo.** Project IDs, API keys,
  database URLs, bucket names, tokens, service account keys, and the contents of
  `google-services.json` / `GoogleService-Info.plist` stay out of git. This checklist names
  those things but never holds their values.

How to read this: each numbered item is a future task or a decision. Checkboxes mark work to do
later. Plain-English notes are included so a non-developer can follow along, with enough
technical detail to be useful during implementation.

---

## 2. Pre-setup decisions (confirm before creating anything)

Confirm each of these before any project is created. Most are now **confirmed by the owner**
(marked CONFIRMED below); the remaining open items are noted.

**Firebase account and project (CONFIRMED).** The owner reviewed the Firebase console and already
has an existing Firebase/Google account that owns the original app, including a legacy
`praying4you` project.

- [x] **Firebase account — CONFIRMED: use the existing Firebase/Google account** that already
      owns the original app. No new account is needed.
- [x] **Firebase project — CONFIRMED: create a NEW Firebase project** for the rebuilt Praying
      For You mobile MVP. **Do not reuse the old `praying4you` legacy project** unless there is a
      deliberate future migration/archive decision.
- [x] **Firebase project display name — CONFIRMED: "Praying For You".**
- [ ] **Firebase project ID** chosen at setup time. **TBD**, but should be clean and
      mobile/MVP-oriented if available (for example `praying-for-you-mobile` or similar). Record
      the final ID privately, never in this repo.
- [x] **Owning Google account — CONFIRMED:** an account the owner controls long-term (the
      existing account above).
- [x] **Individual vs. business/company ownership — CONFIRMED for now: individual is okay** for
      planning and early setup. **Revisit LLC/company ownership before public launch** (affects
      liability, store identity, payments/tax, project ownership). Flag for Legal / Compliance
      review.

**Why a new project instead of reusing the legacy one (CONFIRMED rationale):** reusing the old
`praying4you` Firebase project carries real risk — old security rules, old data, old config, old
security assumptions, and the chance of accidentally breaking the legacy app. A new project gives
the mobile MVP a **clean backend foundation** with rules, data, and config built fresh for this
app. The old project is **left untouched for now**; any reuse, migration, or archive of it would
be a separate, deliberate decision.

**Other confirmed product/scope decisions:**

- [x] **Both iOS and Android beta builds — CONFIRMED: yes** (both platforms). Android first is
      acceptable for cost sequencing.
- [x] **Account deletion before inviting beta testers — CONFIRMED: yes, required.**
- [ ] **Email verification — CONFIRMED recommended;** decide later whether it **blocks beta
      access** or is only required before wider/public launch (open sub-decision).
- [x] **Feed access — CONFIRMED: sign-in required to read the prayer feed** (no public/anonymous
      read).
- [x] **Push notifications — CONFIRMED: out of scope for the first Firebase MVP** (future phase).
- [x] **Verses — CONFIRMED: keep local for the Firebase MVP** (bundled, public-domain KJV,
      deterministic by day).
- [x] **Reports — CONFIRMED: manual Firebase console review for early beta.**
- [x] **Duplicate reports — CONFIRMED: prevent** duplicate reports by the same user on the same
      request.
- [x] **Admin dashboard — CONFIRMED: do not build for the first beta.**

---

## 3. Firebase project creation checklist (future tasks)

- [ ] **Sign in with the existing Firebase/Google account** (confirmed). Do not create a new
      account.
- [ ] Create a **new Firebase project** for the rebuilt MVP (confirmed). **Do not open or modify
      the legacy `praying4you` project**; leave it untouched.
- [ ] Set the **display name to "Praying For You"** (confirmed) and choose a clean,
      mobile/MVP-oriented **project ID** (for example `praying-for-you-mobile` if available).
- [ ] Choose the project name (from section 2).
- [ ] **Disable Google Analytics initially**, or decide intentionally if Analytics is needed.
      Analytics is not required for the backend MVP and can be added at the beta-build phase.
- [ ] Confirm the **billing plan decision: Spark (free) vs. Blaze (pay-as-you-go).** Start on
      **Spark** for the rules-only MVP; Blaze is only needed if Cloud Functions are added later.
- [ ] If Blaze is ever enabled, **add budget and cost monitoring / budget alerts** before relying
      on it.
- [ ] **Record project ownership and admin access** (who owns it, who has admin) in a private
      place, **not** in this repo.
- [ ] **Do not copy project secrets, IDs, or config values into docs** or anywhere in git.

---

## 4. Firebase Authentication setup checklist

- [ ] Use Firebase Auth **"by the book"** — rely on the Auth SDK flows, **do not custom-build
      auth logic** (Auth already covers credential storage, sessions, email uniqueness, reset,
      and verification).
- [ ] Enable Firebase Authentication.
- [ ] Choose **email/password** auth for the MVP (unless changed). Apple/Google sign-in can be
      added later.
- [ ] Configure the email/password sign-in method.
- [ ] Note **anonymous Firebase auth as a future option only** — do **not** enable it for the
      MVP. (Distinct from the app's "post as Anonymous" display feature, which still requires an
      email/password account.)
- [ ] Plan **email verification behavior** (send on sign up; encourage but do not gate sign-in
      for beta).
- [ ] Define **sign-up error handling** with calm, non-leaky messages.
- [ ] Define **email-in-use handling** (see required rule below).
- [ ] Define **edit-email behavior** (the same in-use rule applies; rely on Auth, not a Firestore
      query, for uniqueness).
- [ ] Define **account deletion behavior** (see section 12).
- [ ] Confirm **safe user-facing error copy** (do not disclose which field was wrong; never expose
      stack traces or raw codes).
- [ ] Confirm **email stays private and is never public** (never written to requests,
      interactions, or reports; never displayed).

**Required rule:** a user **must not** be able to create an account with, or change to, an email
address already attached to another profile/account. Firebase Auth owns email uniqueness and
returns `auth/email-already-in-use`; surface the calm message and route to sign-in. Do not rely
on a Firestore query for uniqueness (racy and would expose emails).

---

## 5. Firestore setup checklist

- [ ] Enable Cloud Firestore.
- [ ] **Choose the region carefully** (it cannot be changed later; pick one close to expected
      users).
- [ ] Create the initial **collection plan**, but **do not manually seed sensitive production
      data**.
- [ ] Plan these collections:
  - [ ] `users` (private profile + private email; ownership anchor)
  - [ ] `prayerRequests` (the feed unit; public-ish fields, no email)
  - [ ] `prayerInteractions` (deterministic id `{uid}_{requestId}`; owner-private)
  - [ ] `reports` (deterministic id `{uid}_{requestId}`; admin-read only)
  - [ ] `auditLogs` (optional; prefer Firebase built-in logs for MVP)
  - [ ] `appConfig` / `themes` (later if needed; not for MVP)
- [ ] Confirm **public vs. private fields** per collection (email private; `userId` stored but not
      shown; no email in any shared doc).
- [ ] Confirm **public data minimization**: feed/detail responses return **only what the UX needs**
      and **avoid exposing raw user IDs or unnecessary owner identifiers** to other users (so
      different prayers cannot be linked back to the same user); ownership checks compare against
      the caller's own uid without leaking the owner's id.
- [ ] Confirm **prayer interactions are aggregate-only to other users**: others see the
      `prayerCount` only — **never who prayed**; individual `prayerInteractions` records are never
      exposed to other users.
- [ ] Confirm the **timestamp strategy** (Firestore server timestamps for `createdAt` /
      `updatedAt`).
- [ ] Confirm **status fields for soft remove** (`status: active | flagged | removed`,
      `removedByOwner`).
- [ ] Confirm **indexing needs** (composite `status + createdAt desc` for the feed; optional
      `userId + createdAt`, `category + createdAt`).
- [ ] Confirm the **pagination strategy for the feed** (`startAfter`, page size about 20; avoid
      full-collection scans).

---

## 6. Security rules checklist

- [ ] **Draft rules before connecting app code** (rules are the enforcement layer; the legacy
      app's fatal flaw was open rules).
- [ ] Require **signed-in read/write** on every collection (`request.auth != null`).
- [ ] Enforce **owner-only edit/remove** (`resource.data.userId == request.auth.uid`).
- [ ] Enforce **email privacy** (closed schemas; no email field in shared docs; no cross-user
      reads of `users`).
- [ ] **Block spoofed `userId` writes** (identity always from `request.auth.uid`).
- [ ] **Prevent duplicate prayed interactions** (deterministic `{uid}_{requestId}`; create only
      if it does not already exist).
- [ ] **Prevent prayer count inflation** (a counter may change only by +1 and only in the same
      write that creates the matching interaction/report, validated via `getAfter()`/`exists()`).
- [ ] **Block reports on own requests** (target request's `userId` must differ from caller).
- [ ] **Prevent duplicate reports** by the same user on the same request (deterministic
      `reports/{uid}_{requestId}`).
- [ ] **Prevent direct client writes to protected fields** (counters, `userId`, `createdAt`,
      moderation `status`) outside the allowed paths.
- [ ] **Test all rules with the emulator before beta** (every allow and deny case).

---

## 7. Emulator and automated testing checklist

- [ ] Install/configure the **Firebase Emulator Suite** later, when implementation starts (Auth +
      Firestore + Rules emulators; no secrets, CI-friendly).
- [ ] Write **service-layer tests** (each service method, happy path + mapped errors like
      email-in-use, permission-denied, not-found).
- [ ] Write **Firestore security-rule tests** (allow + deny per case).
- [ ] Test **auth flows** (sign up, sign in, sign out, email change conflict).
- [ ] Test **owner-only edit/remove** (owner allowed; others denied; client hard delete denied).
- [ ] Test **duplicate interaction prevention** (second `{uid}_{requestId}` denied; no inflation;
      no self-pray).
- [ ] Test **duplicate report prevention** (second report on same request denied; self-report
      denied; reports admin-read only).
- [ ] Test **signed-out restrictions** across all collections.
- [ ] Test that **email never appears in public data** (writes including email are denied).
- [ ] Make passing tests a **go/no-go gate before any external beta**.

---

## 8. App configuration and secrets checklist

- [ ] Decide **how Firebase config is stored** for Expo / React Native (environment variables or
      an approved Expo config strategy).
- [ ] **Do not commit secrets or private keys**, ever.
- [ ] Use **environment variables or the approved Expo config approach**; keep values out of git.
- [ ] Create a **`.env.example` with placeholder values only** if helpful later (names, never
      real values).
- [ ] Confirm **`.gitignore` protects local env files** (`.env*`, `google-services.json`,
      `GoogleService-Info.plist`, `serviceAccountKey.json`). Names only here, no values.
- [ ] Confirm **Firebase service account keys are never committed**.
- [ ] **Run a secret scan before every commit that touches config.**

---

## 9. React Native / Expo integration checklist

- [ ] Decide whether the MVP can use the **Firebase Web SDK in Expo** or requires **native
      modules** (e.g., for Crashlytics/Analytics or native messaging later).
- [ ] Identify whether an **EAS build is required** for an installable beta (Expo Go does not
      carry native Firebase modules).
- [ ] Confirm **Expo SDK compatibility** with the chosen Firebase approach.
- [ ] Confirm **iOS and Android app identifiers / package names** (bundle id and package name).
- [ ] Confirm whether **Expo Go remains usable** or a **custom development build** is needed.
- [ ] **Document the build/distribution impact before promising any beta timing.**

---

## 10. Data migration checklist

- [ ] **Map local/mock data to Firebase-backed services** (keep the typed contracts in
      `src/models/types.ts`).
- [ ] **Keep the current service seam** (`src/services/`) if possible; screens should not import
      Firestore/Auth directly.
- [ ] Replace **local auth simulation** (`AuthContext`, `local-user`) with **Firebase Auth** +
      a `users/{uid}` doc.
- [ ] Replace **local prayer request storage** with **Firestore** (drop `p4u.overrides` /
      `p4u.removed`).
- [ ] Replace **local prayed interactions** with **Firestore** (`prayerInteractions`).
- [ ] Replace **local reports** with **Firestore** (`reports`).
- [ ] **Keep verses local** for the MVP (no Firestore reads, no cost, no licensing risk).
- [ ] Decide whether the **local prototype data is reset or migrated**. Recommended: start fresh
      (the simulated profile and mock data were never real accounts), clearing old `p4u.*` keys.
- [ ] **Preserve UI behavior** where possible (same method signatures; mostly async wiring +
      auth/loading/error states + feed pagination change).

---

## 11. Error handling and logging checklist

- [ ] Define a **structured error shape** (a single discriminated type, e.g.
      `{ code, userMessage }`).
- [ ] Define **safe user-facing messages** (calm, non-leaky; never expose stack traces, raw
      codes, or which credential failed).
- [ ] Define **what errors should be logged** (error code/type, operation name, acting uid,
      target `requestId`, timestamp, outcome).
- [ ] Define **what must never be logged** (hard rule):
  - [ ] full prayer text
  - [ ] private emails
  - [ ] tokens
  - [ ] secrets
  - [ ] any sensitive user content
- [ ] Define **audit-style logging** (type + uid + requestId + outcome only) for:
  - [ ] auth failures
  - [ ] email-change attempts
  - [ ] edit request
  - [ ] remove request
  - [ ] report request
  - [ ] denied permission attempts
- [ ] Decide that **Crashlytics / Analytics are deferred** until the beta-build phase (they add
      native modules and are not needed for the backend MVP).

---

## 12. Account deletion checklist

- [ ] **Required before real beta testers are invited.**
- [ ] Define the **user-facing deletion flow** ("Delete my account"; this is the one place
      "Delete" is the correct word, distinct from "Remove request").
- [ ] Define what happens to each of:
  - [ ] **user profile** (`users/{uid}` doc)
  - [ ] **email** (removed from Auth and the user doc)
  - [ ] **prayer requests** (authored requests)
  - [ ] **removed requests** (already soft-removed)
  - [ ] **prayer interactions**
  - [ ] **reports** the user filed
  - [ ] **audit logs** (if used)
- [ ] Decide whether authored requests are **removed, anonymized, or retained under policy**.
      Recommended: **anonymize** authored requests (keep content, detach identity, set
      `displayName: "Anonymous"`) so prayer counts and others' interactions stay coherent.
      Confirm during implementation.
- [ ] **Flag for Legal / Compliance Advisor review** (deletion claims are commitments under store
      policy and privacy expectations).

---

## 13. Report handling checklist

- [ ] **Store reports safely** in Firestore (admin-read only; never readable by regular users).
- [ ] Use **manual Firebase console review** for the early beta (a human sets a request's
      `status` to flagged/removed).
- [ ] **No admin dashboard** for the first beta (the data model supports one later).
- [ ] **Prevent duplicate reports** by the same user on the same request (deterministic
      `reports/{uid}_{requestId}`).
- [ ] **Block reports on the user's own request.**
- [ ] **Do not expose the reporter's email** (or any email) publicly.
- [ ] Define **report reasons** (the controlled set: spam, inappropriate, harmful, other) +
      optional note (<= 300 chars).
- [ ] Define an **abuse escalation process for beta**, even if manual (who reviews, how fast,
      what action: flag, remove, or contact). Keep reports and any quoted notes private.

---

## 14. iOS and Android beta distribution checklist

- [ ] Decide the **iOS and Android beta path** (both platforms are planned).
- [ ] iOS likely requires the **Apple Developer Program (about $99/year)** and **TestFlight**.
- [ ] Android likely requires the **Google Play Console ($25 one-time)** internal testing, or
      another approved path.
- [ ] An **Expo / EAS build may be needed** for an installable beta (Expo Go will not carry
      native Firebase).
- [ ] Document **tester install instructions** (how to join TestFlight / Play internal testing
      without the developer's machine).
- [ ] Document **versioning and build numbers** (a clear scheme for beta builds).
- [ ] **Do not promise a beta date until the build/distribution path is confirmed.**

---

## 15. Cost and monitoring checklist

- [ ] Start with **low-cost assumptions** (Spark free tier is sufficient for development and a
      small beta; realistically $0 at beta scale).
- [ ] Monitor **Firestore reads/writes** (paginated feed, denormalized counters keep this cheap).
- [ ] Monitor **auth usage**.
- [ ] Monitor **storage** if it is ever added (not in MVP; no avatars/images).
- [ ] Monitor **logs/crashes** if/when Crashlytics or analytics are enabled.
- [ ] Add **budget alerts** if billing (Blaze) is ever enabled.
- [ ] **Track cost risks before scaling beyond a close beta** (review usage before each phase).

---

## 16. Go/no-go checklist before implementation

- [ ] Firebase plan approved (`firebase-mvp-plan.md`).
- [ ] This setup checklist reviewed.
- [ ] Owner decisions confirmed (section 2).
- [ ] Security model reviewed.
- [ ] Backend Engineer review complete.
- [ ] Systems Admin / DevOps review complete.
- [ ] Security Reviewer review complete.
- [ ] Test Engineer review complete.
- [ ] Legal / Compliance review complete for beta-impacting items.
- [ ] No secrets in the repo (secret scan clean).
- [ ] Implementation phase scoped (which Phase J step is next).

---

## 17. Go/no-go checklist before external beta

**Alpha testing first (CTO feedback incorporated).** Before inviting external beta testers, run
a controlled **alpha** with **3 to 4 known test accounts** the owner controls, then begin with
people the owner knows.

- [ ] Create **3 to 4 controlled test accounts**.
- [ ] Validate **owner / requester** scenario (post, see own request).
- [ ] Validate **another signed-in user prays** for a request (count increments; aggregate-only,
      no "who prayed" shown to others).
- [ ] Validate a **user reporting** a request (report stored; appears in console).
- [ ] Validate an **anonymous request** (display name hidden from others; still owned in backend).
- [ ] Validate a **named request**.
- [ ] Validate **edit/remove own request** works.
- [ ] Validate **edit/remove on others' requests is blocked**.
- [ ] Validate **duplicate prayed interaction is blocked**.
- [ ] Validate **duplicate report is blocked**.
- [ ] Confirm **no raw user IDs / owner identifiers leak** in feed/detail to other users.

- [ ] Auth works (sign up/in/out, edit name/email, email-in-use handling).
- [ ] Account deletion works (verified).
- [ ] Firestore security rules pass emulator tests (all allow/deny cases).
- [ ] Service tests pass.
- [ ] Manual QA pass complete.
- [ ] Privacy/safety copy ready (`privacy-safety-copy.md`).
- [ ] Report handling ready (manual console review path confirmed).
- [ ] iOS/Android distribution ready (accounts, builds, install instructions).
- [ ] Rollback plan documented (local/mock build still runnable; Firebase work branched/flagged).
- [ ] Beta feedback plan ready (`beta-feedback-plan.md`).

---

## 18. Step-by-step owner checklist (plain English)

A short version for the owner, in everyday language.

**What account do I need?**
- You already have it. Use your **existing Firebase/Google account** (the one that owns the
  original app). No new account is needed.
- Inside that account, create a **brand-new Firebase project** named **"Praying For You"** for
  the rebuilt mobile MVP. **Leave your old `praying4you` project alone** for now.
- Later, for the beta: an Apple Developer account (about $99/year) for iOS TestFlight and a
  Google Play Console account ($25 one-time) for Android internal testing. Pay each only when you
  actually distribute on that platform.

**What decisions do I need to make?**
- Most are already made (see below). The remaining small one is the **project ID** at creation
  time (something clean like `praying-for-you-mobile` if it is available) and whether **email
  verification blocks beta access** or is only required before wider/public launch.
- Confirmed direction: existing account, new project (not the legacy one), display name "Praying
  For You", individual ownership for now (revisit company/LLC before public launch), both iOS and
  Android, sign-in required to read the feed, account deletion before beta, email verification
  recommended, push notifications out of scope for now, verses stay local, reports reviewed
  manually in the console, duplicate reports prevented, no admin dashboard for the first beta.
- **Why a new project, not the old one:** the legacy project has old rules, old data, old config,
  and old security assumptions, and reusing it risks accidentally breaking the original app. A
  new project gives the rebuilt MVP a clean, safe starting point.

**What should I not copy into ChatGPT or GitHub?**
- Never paste or commit: API keys, the Firebase config block, database URLs, bucket names,
  project secrets, tokens, service account key files, `google-services.json`, or
  `GoogleService-Info.plist`. These are private. Names are fine; values are not.

**What should I screenshot or record for documentation?**
- Where the project lives and who has access (kept in a private place, not in this repo).
- The setup choices you make (region, auth method, billing plan) so they are repeatable.
- Keep any screenshots that contain keys or config out of git; store them privately.

**What should I ask a developer friend to review?**
- The Firebase review brief (`firebase-review-brief.md`) and the security rules approach
  (counter/dedupe rules, owner-only edits, email privacy), and the build/distribution plan.

**What should I ask a legal/compliance reviewer to review?**
- The privacy and safety copy, the account-deletion behavior, the report/abuse path, any Bible
  text beyond public-domain, and eventually the full privacy policy and terms (these need a
  qualified attorney before public launch; the advisory lens identifies issues but is not legal
  advice).

---

*Reference: full plan in `firebase-mvp-plan.md`; reviewer summary in `firebase-review-brief.md`;
beta and privacy prep in `beta-feedback-plan.md` and `privacy-safety-copy.md`. This checklist is
planning only and creates nothing.*
