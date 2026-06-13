# Phase I Review: Firebase MVP Plan (Planning Only)

**Review type:** Plan review (go/no-go to approve the Firebase MVP plan and begin Phase J
planning/implementation under per-phase gates)
**Reviewed:** `../firebase-mvp-plan.md`
**Reviewed against:** `../product-requirements.md` (esp. §11, §14, §19),
`../implementation-plan.md` (§11), `../prototype-roadmap.md`,
`../cost-and-publishing-considerations.md`, `../design-direction.md`, `../workflows.md`,
`../agents/` (esp. `backend-engineer.md`, `systems-admin.md`), and the Phase H.1–H.3 reviews.
**Roles applied:** Product Owner, UI/UX Designer, React Native Engineer, Backend Engineer,
Systems Admin / DevOps Engineer, Security Reviewer, Test Engineer, QA Engineer, Release
Manager. **Advisory (added at owner request, before Firebase implementation):** Legal /
Compliance Advisor (`../agents/legal-compliance-advisor.md` — *not legal advice*) and
Growth / Beta Research Advisor (`../agents/growth-beta-research-advisor.md`).

**Revision note:** this review was updated after the **owner resolved the open decisions** and
requested the two advisory roles. The decisions are now captured in plan §18.1 and reflected
throughout the plan; this review reflects them in §4 and §5 below.

---

## 1. Executive Summary

The Firebase MVP plan is **clear, scoped, and consistent** with the existing data model
(PRD §11), the future-backend requirements (PRD §19), the service boundaries
(implementation-plan §11), and the project guardrails (no secrets, "Remove request" not
"Delete," email-never-public, anonymity-with-private-ownership, accessibility themes never
paywalled). It correctly keeps the React Native UI and typed contracts stable while replacing
only the service internals, and it gates external testing behind passing security-rule
emulator tests.

**Recommended verdict: Proceed to Phase J planning** (starting J.1, which is still
setup-docs level). The owner has now **resolved the previously open decisions** (plan §18.1):
sign-in required to read the feed; **account deletion required before the real-tester beta**;
**manual Firebase console** report review; **prevent duplicate reports** (one per
reporter+request); **no admin dashboard** for the first beta; **both iOS and Android**;
**verses stay local/curated**; **AI verse matching is future-only and must use approved-source
verse text (no AI-generated Scripture)**; **avatars out of scope**; **push notifications
deferred** to a documented post-MVP phase; **step-by-step Firebase setup instructions must be
produced in J.1 before implementation**; and **individual-vs-LLC account is a before-public-
launch decision, not a Firebase-planning blocker**. This review records that **no code,
Firebase project, EAS project, secrets, dependencies, or backend setup were created** — it is
documentation only.

**J.1 is the next step: produce the step-by-step Firebase setup instructions (docs only)
before any implementation.** Firebase implementation must not begin until this Phase I plan is
committed/reviewed and J.1's setup instructions exist.

The plan's strongest choices: email/password auth with Auth as the authoritative
email-uniqueness layer; a denormalized `prayerCount` updated by a **batched write validated by
security rules** (inflation-safe, no Cloud Functions, free tier); soft remove via
`status:"removed"`/`removedByOwner`; verses kept local for MVP; and a rules-first, no-Cloud-
Functions, no-Storage MVP. The main risks are concentrated in the **counter/dedupe security
rules** and in **build/distribution** (native Firebase vs. Expo Go), both of which the plan
sequences into dedicated phases (J.4/J.6 and J.7).

---

## 2. Role-by-Role Assessment

**Product Owner — Proceed.** Scope matches the mission and the milestone: real accounts +
shared, private, moderated prayer data, without ads, groups, comments, or paid themes. The
"Remove request" language, email privacy, and anonymity model are preserved. Out-of-scope
items (admin UI, verses backend, IAP, avatars) are explicitly deferred. Wants §18 decisions
(esp. account deletion for beta, report handling) answered before J.5/J.7.

**UI/UX Designer — Proceed.** The plan keeps screens and copy stable; real auth adds loading/
error states only. Calm, non-leaky error messages are specified. Accessibility (Dynamic Type)
and the theme-token foundation are respected; accessibility themes remain free. No new
social-media patterns. Suggests confirming the offline/"you are offline" indicator copy in J.3.

**React Native Engineer — Proceed.** The migration respects the `src/services/` seam and the
shared `src/models/types.ts` contracts; method signatures are preserved so screens change
minimally. Replacing the bespoke `p4u.*` AsyncStorage stores with Firestore offline
persistence is the right call (avoids two sources of truth). Pagination wiring on the feed is
the main new UI concern. Keep `AuthContext`/`PrayerContext`/`FeedbackContext` as the screen
interface.

**Backend Engineer — Proceed.** Collections/fields match PRD §11 and the prototype types.
Server-as-source-of-truth for `userId`/timestamps/counters is correct; closed schemas and
owner checks are specified. The batched-write + rules counter approach is the right free-tier
choice; the `count()`-aggregation fallback and the Cloud Function hardening path are noted.
One thing to prove early (J.4/J.6): that the `getAfter()`/`exists()` rule invariant for
"+1 only with a matching new interaction" is expressible and tested. Deterministic ids for
interactions (and optionally reports) are good dedupe.

**Systems Admin / DevOps Engineer — Proceed with attention to J.7.** Config-via-env (named,
never valued), `.gitignore` coverage (`google-services.json`, `GoogleService-Info.plist`,
`serviceAccountKey.json`, `.env*`), and budget alerts are correctly called out. The key risk:
**native Firebase modules and Crashlytics are not Expo Go-friendly**, so an installable beta
likely needs an **EAS dev/preview build** — sequenced into J.7. Android-first (Play, $25) over
iOS (TestFlight, ~$99/yr) is the cost-sensible beta path. Pay accounts only when actually
distributing.

**Security Reviewer — Proceed (gate at J.6).** Strong: auth-gated everything, no `userId`
spoofing, email never in public/shared docs, `users` docs cross-user-unreadable, reports
admin-read-only, counters not freely writable, soft-remove-not-delete, no return to legacy
open rules. The privacy-safe logging rule (never log full prayer text/email/tokens) is
explicit and must be honored. **Hard gate:** the full emulator allow/deny suite must pass
before any external tester (J.6). Recommends considering App Check later for abuse hardening.

**Test Engineer — Proceed.** The testing plan covers the required allow/deny matrix (auth,
email-in-use, owner-only edit/remove, anonymous display, email-never-public, dedupe,
inflation, self-pray/self-report blocks, signed-out restrictions) plus service unit tests and
UI smoke tests, all against the emulator with no secrets. Tests should be authored alongside
each phase (not only at J.6) so each phase's gate is real.

**QA Engineer — Proceed.** Manual QA checklist mirrors the H-phase flows and adds auth and
larger-text passes. Wants explicit verification that no email appears on any new surface and
that owner controls remain owner-only after the backend swap.

**Release Manager — Proceed (commit on owner approval).** This is a planning artifact; per the
Plan Mode instruction it is **committed once the owner approves** — which the owner has now
done, alongside resolving the open decisions and adding the two advisory roles. Commit the plan
+ this review **plus the two new advisory agent docs and the doc updates that reference them**;
confirm git status shows **docs-only** and the secret scan is clean. Each Phase J phase ends
with a go/no-go and the Git Commit workflow.

**Legal / Compliance Advisor (advisory — not legal advice) — Proceed with flagged items.** The
plan now captures the items this role exists to flag: a privacy policy and **account deletion
before the real-tester beta** (decided), a working report/abuse path (manual console, decided),
**public-domain/licensed Bible text only** (KJV for MVP) with future translations requiring
licensing review, an **AI-content disclaimer + no AI-fabricated Scripture** rule for any future
AI assistance, **UGC/app-store compliance** (moderation + reporting + deletion), **data
retention/deletion** expectations, and the **individual-vs-LLC** decision before public launch.
**This role does not provide legal advice and recommends a qualified attorney** review the
privacy policy, terms, monetization terms, the LLC question, and any non-public-domain Bible
licensing before public launch. Plan §16.5 records these.

**Growth / Beta Research Advisor — Proceed.** The plan keeps growth/monetization appropriately
restrained: no premature monetization, accessibility themes never paywalled, and nothing
interrupting prayer moments. This role will help define **who tests first, what we want to
learn, the survey/interview questions, must-have vs. wait features, onboarding clarity, and
positioning**, and will frame **theme personalization** and **push notifications** as
**hypotheses to evaluate from a user-value/risk perspective** (push is correctly deferred —
§9.5). It should participate in **beta-readiness and feedback-planning** reviews.

---

## 3. Key Risks

1. **Counter/dedupe security rules (J.4/J.6)** — the inflation-safe "+1 only with a matching
   new interaction/report" invariant is the trickiest rule logic; must be proven with emulator
   tests early. Fallback: `count()` aggregation; hardening: Cloud Function (Blaze).
2. **Build/distribution reality (J.7)** — native Firebase/Crashlytics may push the beta off
   Expo Go onto EAS builds; this affects SDK pinning, accounts, and tester install. Plan for
   it before promising a beta date.
3. **Email-change conflicts** — must surface the exact approved message and rely on Auth (not
   a Firestore query) for uniqueness; verify `verifyBeforeUpdateEmail` behavior.
4. **Privacy-safe logging** — easy to accidentally log bodies/emails; enforce the redaction
   rule in the shared error/logging layer and in review.
5. **Cost surprises** — feed pagination and the denormalized counter keep reads cheap; budget
   alerts and keeping verses local protect the free tier. Watch report/interaction write
   volume.
6. **Scope creep** — admin UI, verses backend, avatars, IAP/themes, push must stay out of the
   first MVP.

## 4. Owner Decisions (now resolved)

The previously open §18 list has been **resolved by the owner** (plan §18.1):
- **Feed read gating — require sign-in to read the feed** (no public feed read).
- **Account deletion — required before the real-tester beta** (implemented J.2, gated J.7).
- **Report handling — manual Firebase console review** for the early beta; **prevent duplicate
  reports** (one per reporter+request, deterministic id).
- **No admin dashboard** for the first beta.
- **Beta platform — both iOS and Android** (Android-first sequencing acceptable for cost).
- **Verses stay local/curated**; **AI verse matching is future-only** and must use
  **approved-source** verse text (**no AI-generated Scripture**).
- **Avatars/profile photos out of scope.**
- **Push notifications deferred** to a documented post-MVP phase (complexity identified — plan
  §9.5).
- **Step-by-step Firebase setup instructions** must be produced in **J.1 before
  implementation**.
- **Individual-vs-LLC account** is a **before-public-launch** decision, **not** a
  Firebase-planning blocker.

**Remaining (recommended defaults, resolve during Phase J — plan §18.2):** auth method
(email/password), account-deletion content rule (anonymize vs. soft-remove), own-request
praying block, email-verification gating, audit logging, and Crashlytics/analytics timing.

## 5. Recommended Firebase MVP Scope (consensus)

**In:** Firebase Auth (email/password, verification non-gating) **+ user-initiated account
deletion (required before real-tester beta)**, Firestore (`users`, `prayerRequests`,
`prayerInteractions`, `reports`), security rules + emulator tests, **sign-in-required feed
reads**, soft remove, anonymous display with private ownership, owner-only edit/remove,
inflation-safe counters via batched write + rules, **manual console moderation with
duplicate-report prevention**, **both iOS and Android** beta distribution. **Out:** Cloud
Functions, Storage/avatars, verses backend (stay local/curated), admin dashboard, IAP/paid
themes/theme switching, AdMob, **push notifications (deferred to a documented post-MVP phase,
plan §9.5)**, **AI verse matching (future; approved-source text only)**, analytics/Crashlytics
until J.7, groups/comments/DMs.

## 6. Recommended Implementation Sequence

Follow plan §17: **J.1 step-by-step Firebase setup instructions (docs only) — produced before
any implementation** → **J.2** Auth **+ account deletion** → **J.3** requests CRUD + soft
remove → **J.4** interactions/counts → **J.5** reports (duplicate-report prevention) → **J.6**
rules hardening + full emulator suite (hard security gate) → **J.7** beta build readiness for
**both iOS and Android** (EAS, distribution, privacy copy incl. account deletion, legal/
compliance pre-beta items, QA, rollback). Author tests per phase; no external testers before
J.6 passes and account deletion is verified. **Push notifications and AI verse matching are
post-MVP future phases** (plan §9.5/§17), not part of this sequence unless reprioritized.

## 7. Go / No-Go

**Decision: Proceed to Phase J planning (start J.1).** The plan is sound, consistent with all
prior docs and guardrails, and correctly defers risk behind gates. The owner has **resolved the
§18 decisions** (now §18.1) and **added the two advisory roles**. **Firebase implementation
must not begin until this Phase I plan is committed/reviewed and J.1 produces the step-by-step
Firebase setup instructions (docs only).** Begin implementation only under the per-phase
go/no-go reviews, with the Backend Engineer and Systems Admin / DevOps Engineer on the panel
(and the Legal / Compliance and Growth / Beta Research advisors participating in beta/launch
planning), and only after security rules pass the emulator suite (J.6) — and account deletion
is verified — before any external tester.

## 8. Statement of No Implementation

This phase produced **documentation only**. **No application code was written or changed; no
Firebase project or EAS project was created; no Firebase config was added; no dependencies were
added; no secrets, API keys, Firebase URLs, bucket names, tokens, credentials, or private
config were introduced; no push notifications or AI verse matching were implemented; and
`legacy-web-app/` and `.claude/` were not modified.** This revision adds/updates only
documentation: the plan (`docs/firebase-mvp-plan.md`) and this review
(`docs/reviews/phase-i-firebase-mvp-plan-review.md`); two new advisory agent docs
(`docs/agents/legal-compliance-advisor.md`, `docs/agents/growth-beta-research-advisor.md`); and
references to them in `docs/agents/README.md`, `docs/reviews/README.md`,
`docs/project-handoff-summary.md`, `docs/prototype-roadmap.md`,
`docs/cost-and-publishing-considerations.md`, and `docs/workflows.md`.
