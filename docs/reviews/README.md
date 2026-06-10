# Reviews: Praying 4 You

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
