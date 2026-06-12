# Reviews: Praying For You

This folder stores **review outputs** produced by the AI development team defined in
`../agents/`. Each review applies one or more of the role lenses (Product Owner,
React Native Engineer, Code Reviewer, Security Reviewer, Test Engineer, Release
Manager) to a piece of work and records a clear decision.

## How reviews are organized

- Reviews are organized **by build phase**, following the phases in
  `../implementation-plan.md` (Phase A through Phase H).
- Use a predictable file name per phase, for example:
  - `phase-a-readiness-review.md` (before scaffolding the app)
  - `phase-b-review.md`, `phase-c-review.md`, … (per phase as it completes)
- A phase may have a **readiness review** (before the work, a go/no-go to start) and a
  **completion review** (after the work, a go/no-go to commit). Name them clearly,
  e.g., `phase-b-readiness-review.md` and `phase-b-completion-review.md`.

## What every review should include

- **Findings** — what each role observed, organized by role lens.
- **Blockers** — anything that must be resolved before proceeding (or "none").
- **Follow-ups** — non-blocking items to track for later.
- **Go / No-Go decision** — one of: **Proceed**, **Proceed with changes**, or
  **Do not proceed**, with the reasoning and, for "Proceed with changes," the exact
  changes required first.

## How reviews are used

- **Meaningful code phases must pass a go/no-go review before commit.** The release is
  gated on the review's decision.
- Reviews are advisory documents, not code changes — they capture judgment so the
  build stays aligned, safe, and demonstrable.
- The **Release Manager** closes each phase by summarizing final readiness (expected
  changed files, run commands, validation performed, commit quality, push readiness).

## Index

- [Phase A Readiness Review](phase-a-readiness-review.md) — go/no-go to scaffold the
  Expo app.
- [Phase A Completion Review](phase-a-completion-review.md) — go/no-go to commit the
  scaffolded app and proceed to Phase B.
- [Phase B Completion Review](phase-b-completion-review.md) — go/no-go to commit local
  auth + profile simulation and proceed to Phase C.
- [Phase C Completion Review](phase-c-completion-review.md) — go/no-go to commit the mock
  prayer feed + detail read path and proceed to Phase D.
- [Phase C.5 Category Model Review](phase-c5-category-model-review.md) — go/no-go to commit
  prayer categories in the data model + UI.
- [Phase D Completion Review](phase-d-completion-review.md) — go/no-go to commit local
  prayer request submission (write path) and proceed to Phase E.
- [Phase E Completion Review](phase-e-completion-review.md) — go/no-go to commit the local
  "I prayed for this" interaction and proceed to Phase F.
- [Phase F Completion Review](phase-f-completion-review.md) — go/no-go to commit the local
  Verse of the Day and proceed to Phase G.
- [Phase G Completion Review](phase-g-completion-review.md) — go/no-go to commit the
  navigation QA fixes + Settings/About + local Reporting, and proceed to Phase H.
- [Phase H Completion Review](phase-h-completion-review.md) — go/no-go to commit the
  final prototype polish + local persistence + demo readiness, and proceed to Firebase
  MVP planning.
