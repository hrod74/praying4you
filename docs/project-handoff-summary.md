# Project Handoff Summary — Praying For You

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
`src/` = `context/` (AuthContext, PrayerContext, FeedbackContext), `services/`
(prayerService — the Firebase-swap seam), `data/` (mockPrayers), `models/` (types),
`components/` (Button, TextField, Screen, PrayerCard, PrayerForm, CategorySelect,
CategoryTag, EmptyState), `theme/`, `utils/` (validation, format). Feed stack also holds
`edit`, `my-requests`, and `prayed-for` routes (Phase H.1).

## App status: runs in public iOS Expo Go; local mock data only. Phase H.1 + H.2 + H.3 (accessibility/theme foundation) complete.

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
  (FontAwesome5: dove/praying-hands/bible/user) and a persistent **Create Prayer** tab (always
  reachable); a fuller **Settings/Profile** (profile + privacy language + About); and a
  local **Report request** flow on detail (reason + optional note → calm confirmation;
  increments `reportCount`, flags locally; hidden on own posts). All local/mock.
- **Phase H — Polish + local persistence + demo readiness:** small, safe polish (Welcome
  footnote, Settings footer); **local persistence** via AsyncStorage in the `prayerService`
  seam — submitted requests, "I prayed for this" interactions, and reports survive app
  restarts, layered on the bundled seed. Counts are **derived** from the interaction/report
  lists (no double-counting on refresh/restart). **Reset prototype data** in Settings clears
  local activity but keeps the profile. Email is never stored in prayer/interaction/report
  data. Added `docs/demo-readiness-checklist.md`. Still local/mock — no Firebase.
- **Phase H.1 — Visual QA polish pass:** owner-identified follow-up polish to make the
  prototype feel more complete and trustworthy before Firebase planning. (1) A shared,
  calm **confirmation feedback** pattern (`src/context/FeedbackContext.tsx`, a quiet
  top banner) confirms profile created, signed in/out, request shared, prayed, report
  received, and data reset, and shows gentle errors instead of failing silently.
  (2) A **Your prayer activity** summary in Settings ("Requests shared" / "Prayers
  lifted," calm not scoreboard) links to two new lists — **My prayer requests** and
  **Prayers I've prayed for** (`feed/my-requests`, `feed/prayed-for`). (3) **Owner
  controls** on a request's detail: **Edit request** (reuses the shared `PrayerForm` in
  an `feed/edit` screen) and **Remove request** (a confirmed local **soft remove**;
  user-facing word is "Remove," never "Delete"), both shown only on the owner's own
  requests. Soft remove + edit are persisted as `p4u.removed` / `p4u.overrides` behind
  the `prayerService` seam (future Firebase recommendation: a `removedByOwner` status).
  Still local/mock — no Firebase.
- **Phase H.2 — Mobile UX fix pass:** owner on-device iOS QA fixes before Firebase
  planning. (1) **Keyboard behavior:** `Screen` dismisses the keyboard on drag and
  `TextField` forwards a ref for next-field focus; **Create Profile no longer submits on
  the keyboard return/done key** (it only dismisses) — the profile is created only by an
  intentional CTA tap; same for the new Edit Profile; multiline prayer/report inputs keep
  return as a newline. (2) **Submit navigation:** after sharing a request the user returns
  to the **Feed** (new request at top) with a confirmation, instead of the request's
  detail/owner screen; editing an existing request still returns to its detail.
  (3) **Local profile editing:** `AuthContext.updateProfile` + an inline Edit Profile
  section in Settings (display name + email, validated, confirmation feedback); email
  stays on-device and private (duplicate-email/verification deferred to the future Auth
  layer, documented in PRD §19). (4) **Bottom nav:** slightly larger tab icons/labels;
  the four tabs stay balanced. Still local/mock — no Firebase.
- **Phase H.3 — Accessibility & theme foundation pass:** family/friend feedback.
  (1) **Dynamic Type / larger text:** text scales with the OS font size and explicit line
  heights scale with it (`scaleLineHeight` in `theme.ts`) so text never clips; **Welcome
  and Sign In now scroll** when content grows; tight chrome (bottom-nav labels, category
  chip, decorative verse quote mark, confirmation banner) caps its scaling
  (`maxFontSizeMultiplier`) and stays on one line, while readable content (prayer text,
  body, headings, inputs) is uncapped. No fixed heights around text.
  (2) **Theme foundation:** colors stay centralized as tokens in `theme.ts` (added a
  `shadow` token; removed the last hardcoded hex from screens), so a future theme is a
  palette swap with no component changes. **No theme switching or paid themes were built**
  — future themes (Classic Prayer Journal, Soft Morning Light, Night Prayer, High Contrast,
  Large Text Friendly) and the rules that **accessibility themes are never paywalled** and
  **theme monetization never interrupts prayer moments** are documented
  (`design-direction.md` §16). Still local/mock — no Firebase.

## Design direction

Old-school **Bible / prayer journal made modern**: warm **parchment/cream** background,
deep warm **ink** text, **muted gold/bronze, burgundy, deep navy, muted purple** accents
used sparingly. Calm, reverent, trustworthy — **not** social-media-like or a bright
startup; journal-style cards; encouraging (not gamified) prayer counts; understated
identity and category tags. See `design-direction.md`.

## AI development team (review roles in `docs/agents/`)

Product Owner · UI/UX Designer · React Native Engineer · Code Reviewer · Security
Reviewer · Test Engineer · QA Engineer · Release Manager. Each local-prototype phase
ends with an eight-role go/no-go completion review in `docs/reviews/`.

**Expanded team for backend/beta work:** two roles were added to support the move from
local prototype to a Firebase-backed beta — **Backend Engineer**
(`agents/backend-engineer.md`: Firebase Auth & Firestore data modeling, service
boundaries, API/data contracts, ownership/permissions, validation, soft-remove
behavior, backend & security-rule testing) and **Systems Admin / DevOps Engineer**
(`agents/systems-admin.md`: Firebase/Expo/EAS setup, config & secret safety, builds,
beta distribution, repeatable setup & cost checklists). Both are **required reviewers
from Firebase MVP planning (roadmap Phase I) onward**, joining in Plan Mode before any
backend code is written.

**Two advisory roles (added at owner request, before Firebase implementation):** **Legal /
Compliance Advisor** (`agents/legal-compliance-advisor.md` — privacy policy/terms needs,
account deletion, app-store/UGC compliance, sensitive-content & report risk, Bible-translation
licensing & verse sourcing, AI-content disclaimers, monetization compliance, individual-vs-LLC
account, data retention/deletion; **not a lawyer / not legal advice — recommends a qualified
attorney**) and **Growth / Beta Research Advisor** (`agents/growth-beta-research-advisor.md` —
tester selection, feedback goals, survey/interview questions, feature prioritization,
onboarding clarity, positioning, and monetization *hypotheses* without pushing premature
growth/monetization). The **Legal / Compliance Advisor participates in Firebase / beta /
public-launch planning**; the **Growth / Beta Research Advisor participates in beta-readiness
and feedback-planning** reviews. They advise rather than gate code.

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
· **Report request works locally** on others' posts (hidden on own) · **submitted requests,
prayed marks, and reports persist across app restarts** (AsyncStorage; counts derived, no
double-count) · **email is never shown publicly** · **calm confirmation feedback** on key
actions (and gentle errors) ·
**Your prayer activity** in Settings (Requests shared / Prayers lifted) with **My prayer
requests** and **Prayers I've prayed for** lists · **owner Edit request / Remove request**
(soft remove, confirmed) shown only on your own posts · **local Edit profile** (display
name + email, validated, private email) · **sharing a request returns to the Feed** (new
request at top) · **iOS keyboard behavior** (no accidental submit on return; drag to
dismiss; next-field focus) · **larger bottom-nav icons/labels** · **Dynamic Type / larger
text support** (scaled line heights, scrollable Welcome/Sign In, bounded chrome) ·
**centralized theme tokens** ready for future themes.

## Next phase

**Immediate next work: full visual QA + Phase H local polish/demo readiness.** Before
any backend work, close out the local prototype: a **full visual QA pass** and final
Phase H polish/demo readiness (empty/loading/error states, accessibility labels and
tap-target sizing, demo/portfolio capture). Still local/mock data — no Firebase. See
`docs/demo-readiness-checklist.md` for the demo flow and portfolio screenshot list.
(Note: a Phase H completion review already exists in `docs/reviews/`; the remaining gate
is the full visual QA pass before backend planning.)

**Then: Firebase MVP planning in Plan Mode (roadmap Phase I).** Only **after** Phase H
is closed out, plan the Firebase-backed MVP **in Plan Mode**, with the **Backend
Engineer** and **Systems Admin / DevOps Engineer** included on the review panel: the
Firestore data model + security rules (auth-gated reads, owner-only writes, no `userId`
spoofing), real authentication, the reporting/moderation approach, owner-only edit/
remove (soft remove — "Remove request," never "Delete"), interaction dedupe, the typed
service contracts and error shape, and how the `prayerService` seam maps onto Firestore.
Handle config with safe environment patterns (never hardcoded secrets). No Firebase
project, EAS project, or secrets are created until that plan is approved. See
`prototype-roadmap.md` Phases H–K and `implementation-plan.md` Section 11.

**Status update — Phase I plan exists and owner decisions are captured.** The Firebase MVP
plan (`docs/firebase-mvp-plan.md`) and its review
(`docs/reviews/phase-i-firebase-mvp-plan-review.md`) are written and reflect the owner's
decisions: **sign-in required to read the feed; account deletion required before the
real-tester beta; manual Firebase console report review; prevent duplicate reports; no admin
dashboard for the first beta; both iOS and Android; verses stay local/curated; AI verse
matching is future-only with approved-source text (no AI-generated Scripture); avatars out of
scope; push notifications deferred to a documented post-MVP phase; step-by-step Firebase setup
instructions (J.1) before implementation; and individual-vs-LLC account is a before-public-
launch decision (not a Firebase blocker; individual ownership confirmed fine for early setup).**
**Firebase account & project (confirmed):** use the owner's **existing Firebase/Google account**
(which already owns the original app and a legacy `praying4you` project) and create a **new
Firebase project** (display name "Praying For You", clean mobile/MVP-oriented project ID at
setup) for the rebuilt mobile MVP. The legacy `praying4you` project is **left untouched**;
reusing it is avoided because of old rules/data/config/security assumptions and accidental-
breakage risk, while a new project gives a clean backend foundation (`firebase-mvp-plan.md`
§18.1 #13, `firebase-setup-checklist.md` §2–§3). Two advisory roles (Legal / Compliance, Growth /
Beta Research) now participate in planning. **Firebase implementation must not begin until this
Phase I plan is committed/reviewed and Phase J.1 produces the step-by-step Firebase setup
instructions (docs only).** Still no Firebase project, EAS project, config, or secrets created.

**Supporting planning docs (Phase I.1, docs only).** Four reviewer-, beta-, and setup-facing
docs now support the Firebase plan: `docs/firebase-review-brief.md` (a concise brief for
developer friends and CTO-level reviewers), `docs/beta-feedback-plan.md` (how to collect useful
feedback once a real-tester beta exists, Growth / Beta Research lens), `docs/privacy-safety-copy.md`
(plain-language privacy and safety product copy with an appended Legal / Compliance Advisor
review — product copy only, not a legal policy; full public-launch policies need attorney
review), and `docs/firebase-setup-checklist.md` (a step-by-step, owner-followable Firebase setup
checklist with pre-setup decisions, per-area task lists, go/no-go gates, and a plain-English
owner section — creates nothing and holds no secrets). No code, Firebase project, EAS project,
config, or secrets were added.

**Phase J.1 (docs only) — concrete setup instructions.** `docs/firebase-setup-instructions.md`
gives the owner concrete, step-by-step, non-developer-friendly instructions to create the **new**
Firebase project later (use the existing account, new project "Praying For You", not the legacy
project), with safety rules, per-area console steps (project creation, Auth, Firestore, rules,
emulator, platform registration, config/secrets handling, account deletion, reports, beta path,
cost), explicit **stop points**, an owner checklist, and a developer-handoff checklist. It
creates nothing, adds no config, and holds no secrets. **Firebase implementation (J.2+) still has
not begun.**

**Phase I.1d (docs only) — CTO Firebase feedback incorporated.** Backend/Firebase feedback from a
CTO friend was folded into the planning docs (no implementation): **use Firebase Auth "by the
book"** (no custom auth logic), keep **email/password for MVP**, and document **anonymous Firebase
auth as a future option** (distinct from the "post as Anonymous" display feature); keep the
**fresh Firebase project**; keep reporting **lightweight** (store reports for **manual console
review**, **prevent duplicate reports**, **no admin dashboard**, optional alerting later); make
prayer interactions **aggregate-only to other users** (**prayer counts only, never who prayed**,
individual interaction records not exposed to others); add **public data minimization** (feed/
detail must not expose raw user IDs or unnecessary owner identifiers); **revise the misleading
"private prayer-journal app" positioning** — the feed is **shared** with signed-in users, while
email and the identity behind an anonymous post stay private, positioned as *"a calm prayer app
where you can share requests, post anonymously, pray for others, and receive encouragement"*; and
add an **alpha-testing step with 3–4 controlled accounts** (validate owner, non-owner praying,
reporter, and prayed-interaction scenarios) before broader beta with people the owner knows.
Updated `firebase-mvp-plan.md`, `firebase-review-brief.md`, `firebase-setup-checklist.md`,
`firebase-setup-instructions.md`, `privacy-safety-copy.md`, `beta-feedback-plan.md`,
`product-requirements.md`, `implementation-plan.md`, `prototype-roadmap.md`, `workflows.md`,
`reviews/phase-i-firebase-mvp-plan-review.md`, and this summary. No code, Firebase project, EAS
project, config, or secrets were added.

**Phase J.2b–J.2d — Firebase Auth, private user profile, and account deletion (implemented).**
Firebase was wired behind the existing auth seam, one concern at a time, with the local/mock
fallback preserved throughout (no `.env.local` → the app runs fully local and never crashes):

- **J.2b — Firebase Auth (by the book).** Email/password sign-up, sign-in, sign-out, and password
  reset via the Firebase JS SDK (Expo Go compatible, no native modules), with the session persisted
  across restarts (AsyncStorage). Errors map to calm, safe copy (no raw Firebase detail). Email is
  private (owned by Firebase Auth); display name is the only public identity.
- **J.2c — private Firestore user profile.** The owner-only `users/{uid}` document is created on
  sign-up and read/backfilled on sign-in (best-effort, never blocks auth). **Email is not stored in
  Firestore.** It is the only Firestore collection wired; prayer requests, interactions, and reports
  remain local/mock. Rules are owner-only and must be published by the owner.
- **J.2d — account deletion (this phase).** From **Settings → Delete account**, a confirmed flow
  deletes the `users/{uid}` profile doc first (while authenticated), then deletes the Firebase Auth
  user, then returns to the signed-out / welcome state with calm confirmation copy. Deletes only the
  signed-in user (no admin/service-account behavior). Requires-recent-login and network/permission
  failures map to safe copy, with a "sign in again" path; a blocked deletion leaves both the Auth
  user and profile intact. Local/mock fallback clears on-device profile/session. **No rules change
  needed** (owner-only delete on `users/{uid}` already shipped in J.2c). Prayer data was untouched and
  out of scope at the time (revisited in J.2f.2 below). See
  `docs/firebase-account-deletion-implementation.md` and the owner checklist
  `docs/QA_delete_scenarios.md`.

**Phase J.2e — Firestore prayer requests (implemented).** Prayer requests moved from local/mock to
the Firestore `prayerRequests` collection behind a new mode-aware seam
(`src/services/prayerRequests.ts`): create / feed / detail / edit / soft-remove / my-requests read
and write Firestore when Firebase is configured, and fall back to the original local/mock path
otherwise. Prayer interactions ("I prayed for this") and reports are **unchanged** — still
local/mock in both modes, layered on top of whichever request baseline loads, so the feed UI,
prayed-for CTA, and derived counts behave exactly as before. Privacy: **no email** is stored on a
request; anonymous posts store only the public string "Anonymous" (the real name is never written,
so the identity behind an anonymous post stays private); `authorUid` is retained for owner-only
rules but is opaque and never shown in the UI; there is no "who prayed" data. Removal is a **soft
remove** (`status: 'removed'` + `removedAt`); clients **cannot hard-delete**. `mobile-app/firestore.rules`
was **updated** with `prayerRequests` rules (signed-in read of active; owner-only create/edit/
soft-remove; protected `authorUid`/`createdAt`/`prayerCount`; no `email`; no client delete) and
**the owner must republish the full rules file** in the Firebase Console. No composite index is
needed (single equality filter, client-side sort). Old local prayer data is **not** auto-migrated;
Firebase mode starts with new requests. Safe Firestore error copy added (load/create/update/remove/
permission/network). See `docs/firebase-prayer-requests-implementation.md` and the owner checklist
`docs/QA_prayer_request_scenarios.md`. **Next: J.2f — Firestore prayer interactions (aggregate-only,
never who prayed).**

**Phase J.2f.1 — password management (implemented).** Added two Firebase Auth account-management
flows, by the book via the Firebase JS SDK, with no Firestore changes. (1) **Forgot password /
reset** from the sign-in screen: a "Forgot password?" link calls `sendPasswordResetEmail`. It is
**account-non-enumerating** — the same confirmation ("If an account exists for that email, password
reset instructions will be sent.") shows whether or not the email is registered, and the service
swallows `auth/user-not-found` so existence is never revealed. (2) **Change password** from
**Settings → Password** (Firebase mode only): an inline form takes current + new + confirm, validates
match and the 6-char minimum locally, then `reauthenticateWithCredential` + `updatePassword`; success
shows "Your password has been updated." `auth/requires-recent-login` surfaces calm copy with a "Sign
in again" path. All errors map to safe copy in `authErrors.ts` (`PASSWORD_RESET_COPY` /
`passwordResetErrorMessage`, `CHANGE_PASSWORD_COPY` / `PasswordChangeError` / `passwordChangeError`);
no raw Firebase codes shown. **No passwords are stored or logged**; secure text entry throughout;
fields cleared on close/success. **Local/mock fallback:** both surfaces are hidden when Firebase is
not configured (local profiles have no password), and the context methods are safe no-ops / calm
errors so nothing crashes. No prayer requests, interactions, reports, push, AI, social/passwordless,
or anonymous auth were touched. See `docs/firebase-password-management-implementation.md` and the
owner checklist `docs/QA_password_management_scenarios.md`. **Next: J.2f — Firestore prayer
interactions (aggregate-only, never who prayed).**

**Phase J.2f.2 — revisit account deletion for Firestore prayer requests (implemented).** Account
deletion was first built (J.2d) before prayer requests moved to Firestore, so it only removed the Auth
user + `users/{uid}` profile. Now that `prayerRequests` live in Firestore, deletion also cleans up the
deleting user's authored requests, by **soft-remove, not hard delete** (owner decision for Alpha).
New order (all while still authenticated): (1) **soft-remove the user's active prayer requests** —
each owned active request gets `status: 'removed'`, `removedReason: 'accountDeleted'`, `removedAt`,
`updatedAt`, via a batched `softRemoveAllByOwner(uid)` on `firebasePrayerRequestService` reached
through the seam `removeOwnRequestsForAccountDeletion`; (2) delete `users/{uid}`; (3) delete the Auth
user; (4) clear local state; (5) return to welcome. Each step maps failures to the existing safe
deletion copy (requires-recent-login / network / permission / generic); a blocked step leaves the
account intact and is retryable (idempotent — already-removed requests are skipped). Removed requests
leave the feed and My Prayer Requests (both filter to `active`). **Only the user's own** requests are
touched; others' requests and requests they merely prayed for are never changed; no email is written;
`authorUid` stays opaque/never shown. **Why soft delete:** feels gone to users, keeps a minimal removed
record for safety/moderation/audit, avoids dangling references once interactions/reports move to
Firestore, and leaves a future retention policy (purge or anonymize) open. **No firestore.rules change
and no republish needed** — the existing owner-only `prayerRequests` update rule already permits the
soft-remove (status -> removed, protected fields unchanged, no email; extra removedReason/removedAt are
allowed). Local/mock fallback soft-removes the user's own submitted requests on-device (best-effort) so
nothing crashes. Updated delete-account confirmation copy ("...remove your active prayer requests from
the feed...", no backend detail, no em dashes). **No** prayerInteractions/reports/push/AI added; "who
prayed" still never exposed. See `docs/firebase-account-deletion-implementation.md`,
`docs/firebase-prayer-requests-implementation.md`, and `docs/QA_delete_scenarios.md` (new "Delete
Account With Active Prayer Requests" scenario + data boundary checks). **Next: J.2f — Firestore prayer
interactions (aggregate-only, never who prayed); revisit deletion again there.**

**Phase J.2f.3 — Firestore prayer interactions (implemented).** "I prayed for this" moved from
local/mock to the Firestore `prayerInteractions` collection behind a new mode-aware seam
(`src/services/prayerInteractions.ts`). A one-per-user doc at `prayerInteractions/{uid}_{requestId}`
(deterministic id = no duplicates) stores only `userUid`, `requestId`, `createdAt`, `schemaVersion`
(+ a redundant `id`) — **no email, no display name**. `prayForRequest` runs a **Firestore
transaction**: confirm the request exists and is active, check the interaction doc, and if new, create
it AND `increment(prayerCount)` atomically (idempotent — a repeat is a no-op). `PrayerContext` is now
mode-aware: in Firebase mode the displayed `prayerCount` comes straight from Firestore (no local
delta; optimistic +1 on a new pray), and the user's already-prayed state + "Prayers I've prayed for"
are hydrated from their **own** interaction docs (`listMinePrayedFor` returns request ids only).
Feed card + detail CTAs and the prayed-for screen work unchanged in both modes; safe interaction error
copy (`interactionErrors.ts`: could-not-pray / already / unavailable / network / permission) is
surfaced, never raw Firebase detail. **AGGREGATE-ONLY**: other users see only the count; there is no
API/query/screen/rule that lists who prayed, and no raw UIDs in the UI. **Reports stay local/mock**;
verses stay local. **firestore.rules updated (owner MUST republish the full file before QA):** new
`prayerInteractions` block (own-read only via `userUid == auth.uid`; create only own doc with id
`{uid}_{requestId}`, no email, target request must exist + be active; no client update/delete) plus a
second `prayerRequests` `allow update` permitting a **+1-only** `prayerCount` change tied to creating
the user's brand-new interaction in the same commit (`!exists` before + `existsAfter`), so the count
can't be inflated directly or repeatedly. Local/mock fallback unchanged (on-device list + derived
counts); app does not crash without `.env.local`. **No** reports/push/AI/social/passwordless/anonymous
auth added. See `docs/firebase-prayer-interactions-implementation.md` and the owner checklist
`docs/QA_prayer_interaction_scenarios.md`. **Next: J.2g — Firestore reports (admin-read,
duplicate-prevented, no public listing); then revisit account deletion to also clean up the user's
interactions/reports.**

**Phase J.2f.3 bug fix — prayer count / interaction not being written.** QA found that tapping 🙏 Pray
created no `prayerInteractions` doc and did not raise `prayerCount`. Root cause: the pray transaction
incremented the count with a server-side `FieldValue.increment(1)` transform, but the "pray"
`prayerRequests` update rule validates the exact value (`prayerCount == resource.data.prayerCount + 1`);
a transform is not a concrete number during rule evaluation, so the update was rejected, and because
the interaction `set` and the count update commit atomically in the transaction, **both** were rolled
back (no interaction doc, no count change). Fix: write a **literal** `currentCount + 1` (read inside
the same transaction, so still race-safe) instead of `increment()`; removed the `increment` import;
added `__DEV__`-only logging of the Firestore error **code** (e.g. `permission-denied`) with a
republish hint (no uid/email/config/private values logged). `firestore.rules` logic is unchanged
(only a clarifying comment added that the client must write a literal, not a transform); the owner
should still **republish the full rules file** if the J.2f.3 rules were never published (a second
possible cause of the same symptom). Behavior now: first pray creates the interaction + count +1;
duplicate is a no-op; another user adds a separate interaction + count +1; removed requests cannot be
prayed for. See `docs/firebase-prayer-interactions-implementation.md`. Commit: `fix: create Firestore
prayer interactions`.

**Phase J.2f.3 bug fix #2 — permission-denied on the interaction duplicate check (rules-only).** After
the literal-count fix, QA hit `permission-denied` on `BatchGetDocuments`. Root cause: the pray
transaction reads `prayerInteractions/{uid}_{requestId}` **before** creating it (to prevent a
double-count), but the interaction read rule was `resource.data.userUid == request.auth.uid`; for a
not-yet-existing doc `resource` is `null`, so that check errored and the get was denied — and inside
the transaction that failed the whole pray (so no interaction doc, no count change). Fix (rules only,
no app code change): split the interaction `read` into `allow get` authorized by the **document id
prefix** (`interactionId[0:(uid.size()+1)] == uid + '_'`, which works even when the doc does not
exist) and `allow list` keyed on `resource.data.userUid == uid` (for the `listMinePrayedFor` query).
Privacy is unchanged: a user can still read only their own deterministic doc, there is no who-prayed
listing, create is still own-only with the deterministic id + active request + no email, update/delete
stay denied, reports stay denied, and prayerRequests stay protected from hard delete and arbitrary
count changes. **Owner MUST republish the full `mobile-app/firestore.rules`** before retesting. Commit:
`fix: allow own prayer interaction check`.

**Phase J.2f.4 — Firebase rules test harness + backend QA gate (testing infra; no app/rules behavior
change).** Added an isolated Firestore security-rules test harness so rules/transaction regressions
are caught before manual device QA (the J.2f.3 pray bugs were found only on-device). Lives in
`mobile-app/firebase-tests/` with its **own** `package.json`/`package-lock.json`/deps
(`@firebase/rules-unit-testing` v5, `firebase` v12, a **local** `firebase-tools` v14 — avoids the
broken global one under Node 24); never imported by the app, never bundled by Metro. Tests load the
**real** `mobile-app/firestore.rules` and cover `users` (owner-only, no email required), `prayerRequests`
(active read, owner-only create/edit/soft-remove, no email, no hard delete, protected fields, removed
not readable by others), and `prayerInteractions` (get own doc even before it exists, no who-prayed
list, valid first-time pray = interaction + literal +1, duplicate/same-user blocked, multi-user count,
no email, no cross-user create, no praying for removed, no arbitrary count change). Uses **no
production data, no service account, no real config** (fake `demo-praying4you` project id). Run with
`cd mobile-app/firebase-tests && npm test` (or `cd mobile-app && npm run test:rules`); added
`typecheck`/`test:rules`/`test:rules:install` scripts to `mobile-app/package.json` (existing scripts
untouched). **Tests could NOT be executed in this environment:** harness installs and the emulator jar
downloads, but the Firestore emulator needs **Java 11+** and local Java is **1.8**
(`UnsupportedClassVersionError`, class file 55.0 vs 52.0). Fix: install Java 11+/17 and rerun. **Rules
were not fully validated by automation. Manual Firebase QA is required before this phase is considered
complete.** New backend QA gate documented (workflows §9): TypeScript passes, rules tests pass when
rules change (or state the Java blocker), Expo starts, manual QA still happens; **project rule: any
future `firestore.rules` change must ship rules tests or state why they could not run.** See
`docs/firebase-rules-test-harness.md`. Commit: `test: add Firebase rules harness`.

**Phase J.2f.4 follow-up — rules harness now runs green (Java resolved).** Java 17 is installed, so
the emulator runs and the suite **passes 33/33** (`cd mobile-app && npm run test:rules`); the Java 1.8
blocker is resolved and the automation gap is closed. Three initial failures were a **test-harness
race, not an app/rules defect**: `node --test` ran the three files in parallel against one shared
emulator DB while each cleared it in `beforeEach`, so one file's `clearFirestore()` wiped another's
seeded data mid-test (surfacing as `Null value error` / `NOT_FOUND` / `undefined.prayerCount`). Fixes
(harness only): serialize with `--test-concurrency=1`; harden `readCount` to throw clearly if the
request is missing; strengthen the valid-first-time test (assert the interaction doc exists AND count
== 1) and the duplicate/same-user tests (assert count does not move). Also fixed the "no Cloud
Firestore rules file" warning: a `pretest` `sync-rules` step copies the real `mobile-app/firestore.rules`
into the harness for `firebase.json` to load at boot (copy is git-ignored; single source of truth
unchanged). **No `firestore.rules` change and no app behavior change.** The only remaining emulator
notice is the benign `firebase-tools@15` "Java < 21" future warning. Commit: `test: fix Firebase rules
harness`.

**Phase J.2g — Firestore reports for manual review (implemented).** "Report this request" moved from
local/mock to the Firestore `reports` collection behind a new mode-aware seam (`src/services/reports.ts`).
A private moderation record at `reports/{uid}_{requestId}` (deterministic id = no duplicates) stores
only `id`, `reporterUid`, `requestId`, `requestAuthorUid`, `reason` (existing set: spam/inappropriate/
harmful/other), `status: 'open'`, `createdAt`, `schemaVersion`, and an optional `notes` — **no email,
display name, or phone**. `firebaseReportService.report` pre-checks the reporter's own doc (calm
duplicate handling) then creates it; `PrayerContext.reportPrayer`/`hasReported` are mode-aware (an
in-session `reportedIds` set drives the "you reported" state, since reports have **no client list**).
The report screen surfaces calm error/duplicate copy (`reportErrors.ts`); `already` shows the gentle
thank-you. Lightweight by design: **no admin UI, notifications, AI moderation, email, or
auto-removal**; manual review happens in the Firebase Console. **firestore.rules updated (owner MUST
republish before QA):** new `reports` block — reporter-only `create` (id `{uid}_{requestId}`,
`reporterUid==auth.uid`, status `open`, allowed reason, `keys().hasOnly([...])` so no email/name/phone,
target request must exist + be active, real author != reporter); `get` own report only (by id prefix,
even before it exists); `list`/`update`/`delete` denied. **Rules tests:** added
`firebase-tests/tests/reports.test.mjs` (14 cases) — full suite **passes 47/47** on Java 17. Local/mock
fallback unchanged; app does not crash without `.env.local`. **No** account-deletion change (cleanup of
interactions/reports is the next phase); no prayerRequests/interactions behavior change; no email
anywhere; no who-reported/who-prayed surface; no raw UIDs in UI. See
`docs/firebase-reports-implementation.md` and `docs/QA_report_scenarios.md`. **Next: J.2h — revisit
account deletion to also clean up the user's interactions + reports (with rules tests).** Commit:
`feat: add Firestore reports`.

**Phase J.2h — account-deletion cleanup + remove prototype reset (implemented).** Account deletion was
last revisited (J.2f.2) before `prayerInteractions` and `reports` moved to Firestore, so it cleaned up
only the Auth user, `users/{uid}`, and the user's `prayerRequests`. Now `AuthContext.deleteAccount`
also removes the records that identify the deleting user as an actor: their own `prayerInteractions`
(`firebasePrayerInteractionService.deleteAllMine`) and their own `reports`
(`firebaseReportService.deleteAllMine`), via new Firebase-only seam functions
(`deleteMyInteractionsForAccountDeletion`, `deleteMyReportsForAccountDeletion`). Both run **best-effort**
while the user is still authenticated, after the requests are soft-removed and before the profile/Auth
delete — a failure (e.g. rules not yet republished) is dev-logged and never blocks deletion. **Prayer
counts are intentionally preserved:** deleting interactions does **not** decrement `prayerCount` (no
who-prayed UI exists, so a non-decremented count exposes nothing, and we avoid an unproven transactional
decrement for MVP). **Only the deleting user's own reports are removed**; reports filed by others (incl.
against the deleting user's requests) are kept for manual review. **firestore.rules updated (owner MUST
republish before QA):** `prayerInteractions` now allows owner-self-scoped `delete`
(`userUid==auth.uid`; `update` still denied; the delete never touches `prayerCount`); `reports` now
allows owner-self-scoped `list` + `delete` (`reporterUid==auth.uid`) so cleanup can enumerate and remove
the user's own reports — still **no cross-user "who reported" surface** (a caller only ever sees/deletes
their own). **Settings cleanup:** removed the "Reset prototype data" section, its confirmation modal, and
prototype/local-only copy (privacy bullet, About line, footer); Edit profile, Change password, Sign out,
and Delete account are unchanged. `resetLocalData` remains in `PrayerContext` as a dev-only internal but
is no longer exposed in the UI. **Rules tests:** +8 cases (4 interaction delete/count-preserved, 4 report
delete/list, each with denials) — full suite **passes 55/55** on Java 17. TypeScript clean; Expo (Metro)
starts cleanly with cache clear; local/mock fallback unchanged and still exposes no prototype reset; no
email anywhere; no raw UIDs in UI. See `docs/QA_delete_scenarios.md`,
`docs/firebase-prayer-interactions-implementation.md`, and `docs/firebase-reports-implementation.md`.
**Next:** consider a minimal owner-facing manual-moderation workflow doc. Commit:
`fix: clean up account deletion data`.
