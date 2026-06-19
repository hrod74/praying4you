# Project Workflows: Praying For You

These are reusable, repeatable workflows for the Praying For You project. They exist
so that documentation, prototyping, and version control stay consistent and safe
across sessions — whether the work is done by a person or with AI assistance.

They are intentionally lightweight and checklist-driven. Follow the relevant
workflow when the matching kind of work comes up; do not over-engineer.

---

## 1. Documentation Update Workflow

**Purpose:** Keep project markdown files accurate and organized.

**Steps:**

- Inspect the current repo state (`git status`, list `docs/`, confirm which files
  already exist).
- Review `README.md` and the relevant docs before changing anything, so updates
  build on what is already there instead of duplicating it.
- Update **only** the requested markdown files. Do not touch unrelated docs.
- Avoid modifying app code (including anything in `legacy-web-app/`) unless the
  change is explicitly requested.
- Run secret / sensitive-value checks across the docs (see the Documentation QA
  Workflow) before considering the work done.
- Summarize which files changed and what changed in each.
- Commit and push only after validation passes (see the Git Commit Workflow).

---

## 2. Documentation QA Workflow

**Purpose:** Review docs for accuracy, consistency, and safety before they are
shared or committed.

**Checklist:**

- [ ] No Firebase keys, API keys, database URLs, bucket names, project secrets, or
      other sensitive configuration values appear in any doc.
- [ ] No outdated claims about the current repo state (for example, do not state
      that live keys are present when they have been replaced with placeholders).
- [ ] Docs agree with each other — the audit, PRD, cost doc, workflows, and
      prototype roadmap describe the same data model, scope, and decisions.
- [ ] MVP scope is clear and distinguishable from out-of-scope features.
- [ ] The prototype / portfolio goal is kept separate from the production
      app-store goal — they are different milestones with different bars.
- [ ] Ads / monetization are treated as a post-core-experience concern and are
      carefully phased, never placed at emotionally sensitive moments.
- [ ] Trust, safety, privacy, and moderation are clearly addressed wherever
      user-generated content is discussed.

A quick way to run the secret check across docs:

```bash
grep -rniE "apikey|api key|firebaseio\.com|appspot\.com|AIza|databaseURL|storageBucket|secret|-default-rtdb" docs/
```

Expected result: no matches other than intentional, generic references (for
example, the word "secret" used while explaining that no secrets are stored).

---

## 3. Prototype Build Workflow

**Purpose:** Build a portfolio-ready working prototype before any production launch.

**Steps:**

- Confirm the PRD scope (`docs/product-requirements.md`) so the prototype targets
  the agreed MVP core, not feature creep.
- Create an implementation plan before generating any app code.
- Start with React Native / Expo using the managed workflow.
- Use mocked / local data first if that speeds up prototype progress. The goal is
  to validate screens and flows quickly.
- Build core screens before introducing Firebase complexity (auth, Firestore,
  security rules).
- Validate that the app runs locally on a simulator/emulator or via Expo Go.
- Capture screenshots and demo notes for the portfolio as the screens come together.
- Only then move toward Firebase, authentication, and production features.

---

## 4. Release Notes Workflow

**Purpose:** Keep a readable history of major project updates.

**Steps:**

- Summarize what changed at a high level (the "why" and the "what").
- List the files that changed.
- List the validation that was performed (secret checks, doc QA, local run, etc.).
- Note any known issues or follow-up work that remains.
- Include local run commands once app code exists (for example, how to start the
  Expo app), so anyone reading the notes can reproduce the result.

---

## 5. Git Commit Workflow

**Purpose:** Let AI (or any contributor) safely handle commits without hiding what
changed.

**Steps:**

- Run `git status` to see the full set of changes.
- Summarize the changed files before committing.
- Run secret checks before committing (see the Documentation QA Workflow).
- Commit with a clear, descriptive message that explains the change.
- Push to `origin`.
- Report the final branch status (branch name and whether it is in sync with the
  remote).

---

## 6. Firebase Planning Workflow (Plan Mode)

**Purpose:** Design the Firebase-backed MVP safely **before** any backend code is
written (roadmap Phase I). Planning only — no implementation, no project/account
creation, no secrets.

**Steps:**

- Confirm the local prototype is closed out (Phase H: polish, full visual QA, demo
  readiness) before opening backend planning.
- Enter **Plan Mode**. Include the **Backend Engineer** and **Systems Admin / DevOps
  Engineer** roles on the panel from this point onward, plus the two **advisory** roles —
  **Legal / Compliance Advisor** (`agents/legal-compliance-advisor.md` — *not legal advice*)
  for privacy/terms, account deletion, app-store/UGC compliance, Bible-licensing, AI-content
  disclaimers, monetization compliance, and individual-vs-LLC account, and **Growth / Beta
  Research Advisor** (`agents/growth-beta-research-advisor.md`) for tester selection, feedback
  goals, and monetization hypotheses.
- Plan, do not build: the Firestore data model and indexes; security-rule intent
  (auth-gated reads, owner-only writes, no `userId` spoofing, restricted `status`
  transitions); the typed service contracts and predictable error shape; the data
  migration/versioning approach; and the config/secret-handling plan (env patterns,
  never hardcoded).
- Decide how each prototype service maps onto Firebase through the existing
  `src/services/` seam, with no screen changes.
- Output a plan that a go/no-go review (including both new roles) can approve before any
  implementation begins. No Firebase project, EAS project, secrets, or config values are
  created in this workflow.
- **Gate before implementation:** Firebase implementation must not begin until the Phase I
  plan is **committed and reviewed**, and **Phase J.1 produces step-by-step, owner-followable
  Firebase setup instructions (docs only)**. Beta distribution plans for **both iOS and
  Android**; **account deletion is required before beta with real testers**; and **push
  notifications are a documented future post-MVP phase** unless explicitly reprioritized.
- The owner-followable setup steps and go/no-go gates live in
  `firebase-setup-checklist.md` (pre-setup decisions, project/auth/Firestore/rules/testing
  task lists, secrets handling, and the before-implementation and before-beta gates). It
  creates nothing and holds no secrets.
- **Account & project decision (confirmed):** the rebuilt mobile MVP uses the owner's
  **existing Firebase/Google account** but a **new Firebase project** ("Praying For You"), not
  the legacy `praying4you` project (which stays untouched), so the MVP starts on a clean
  backend (`firebase-mvp-plan.md` §18.1 #13, `firebase-setup-checklist.md` §2–§3).
- **Concrete owner instructions (J.1, docs only):** `firebase-setup-instructions.md` is the
  step-by-step, non-developer-friendly guide the owner follows to create the new project later
  (console steps, safety rules, stop points, owner and developer-handoff checklists). It creates
  nothing and holds no secrets; implementation (J.2+) begins only after its go/no-go gate.

---

## 7. Backend Implementation Review Workflow

**Purpose:** Review Firebase-backed implementation work (roadmap Phase J) before it is
committed.

**Steps:**

- Confirm the work follows the **approved Phase I plan** and stays behind the
  `src/services/` seam (screens and shared types unchanged).
- **Backend Engineer** reviews: typed service contracts, ownership/permission checks,
  validation-before-writes, soft-remove behavior ("Remove request," not "Delete"),
  interaction dedupe / no count inflation, report rules (others-only, no self-report),
  email privacy in backend data, cost-aware reads/writes, and error handling.
- Confirm the required **automated tests** pass: service-level tests **and** Firebase
  security-rule emulator tests (see `implementation-plan.md` Section 11 and
  `product-requirements.md` Section 19).
- **Security Reviewer** confirms no secrets and that rules avoid the legacy open-rules
  mistake; **Systems Admin / DevOps Engineer** confirms config comes from env patterns.
- Record a go/no-go decision in `docs/reviews/`.

---

## 8. Beta Distribution Readiness Workflow

**Purpose:** Verify an internal beta build is safe and installable before sharing
(roadmap Phase K).

**Steps:**

- **Systems Admin / DevOps Engineer** owns this workflow: confirm the build path
  (local vs. EAS cloud), SDK/version, and that testers can install **without the
  developer's machine** (TestFlight / Play internal-test link).
- Run a controlled **alpha first**: set up **3 to 4 known test accounts** and validate the
  core scenarios (requester/owner, another signed-in user praying, reporting, anonymous and
  named requests, edit/remove own request, blocked edit/remove on others', duplicate prayed
  interaction blocked, duplicate report blocked, **aggregate-only prayer counts — never "who
  prayed"**, and **no raw user IDs / owner identifiers leaking** in feed/detail) before any
  external testers; then start with people the owner knows (`beta-feedback-plan.md` §1.5).
- Run the **pre-beta checklist**: secret scan passes; Firebase security rules are
  deployed; config is injected from env (not hardcoded); monitoring/logging basics are
  in place; cost/free-tier headroom is checked; **user-initiated account deletion works
  (required before real testers)**; duplicate-report prevention verified.
- **Backend Engineer** confirms data, contracts, and rule tests are ready for real
  testers.
- Confirm Apple/Google developer accounts are in place only where actually required for
  the chosen distribution path — the beta plans for **both iOS and Android** (owner
  decision; Android-first sequencing is fine for cost).
- **Advisory checks:** the **Legal / Compliance Advisor** confirms pre-beta items (privacy
  policy, account deletion, report handling, public-domain/licensed Bible text) are addressed
  (*not legal advice — recommends an attorney where appropriate*); the **Growth / Beta Research
  Advisor** confirms tester selection and feedback goals are set.
- Share the build only after the checklist passes; record readiness (and a go/no-go) per
  the Release Notes and Git Commit workflows above.

---

## 9. Backend QA Gate (Firestore rules)

**Purpose:** Catch Firestore rules / transaction / permission regressions **before** manual device
QA, not during it (added in Phase J.2f.4 after a pray-flow permission bug was found only on-device).
See `docs/firebase-rules-test-harness.md`.

**Gate (run before a Firestore-touching phase is considered complete):**

- **TypeScript must pass:** `cd mobile-app && npx tsc --noEmit`.
- **Firebase rules tests must pass when rules change:** `cd mobile-app/firebase-tests && npm test`
  (equivalently `cd mobile-app && npm run test:rules`). This boots the Firestore emulator and runs
  the rules tests for `users`, `prayerRequests`, and `prayerInteractions`.
  - The emulator requires **Java 11+**. If the tests cannot run locally (e.g. only Java 8 present),
    the phase summary must state, verbatim: *"Rules were not fully validated by automation. Manual
    Firebase QA is required before this phase is considered complete."* and the fix is to install
    Java 11+ and rerun.
- **Expo must start:** `cd mobile-app && npx expo start -c`.
- **Manual device QA still happens** (the per-feature `docs/QA_*` checklists), but it should not be
  the first place a rules failure is discovered.

**Project rule:** any future change to `mobile-app/firestore.rules` must include or update the
corresponding emulator rules tests in `mobile-app/firebase-tests/`, **or** the change description must
explicitly state why the tests could not be run and what manual QA was done instead.
