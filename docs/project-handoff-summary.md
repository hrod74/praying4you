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
double-count) · **Reset prototype data** in Settings (keeps profile) · **email is never
shown publicly** · **calm confirmation feedback** on key actions (and gentle errors) ·
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
