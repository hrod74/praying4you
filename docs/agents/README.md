# AI Development Team: Praying 4 You

This folder defines a lightweight, project-specific **AI development team** — a set
of review roles ("agents") used to keep the Praying 4 You rebuild aligned, safe, and
high quality as it moves from planning into a functional local prototype.

These are **not** installed external agent skills and they do **not** copy any
third-party agent files. They are original, project-specific role definitions
inspired by senior engineering review workflows (product, engineering, code review,
security, testing, release management). Each role is a focused reviewer with a clear
remit, checklist, and output format.

---

## How the AI development team should be used

- Each role is a **reviewer lens**, not an autonomous actor. When work is done (a doc
  change, a build phase, a feature), the relevant role(s) review it against their
  checklist and produce a markdown review.
- Reviews are advisory and structured. They surface **findings, blockers, follow-ups,
  and a go/no-go decision** — they do not silently change code.
- The same person (or assistant) can "wear" multiple role hats in sequence; the value
  is in applying each lens deliberately rather than reviewing everything in one blur.
- Reviews are written to `docs/reviews/`, organized by build phase (see that folder's
  README).

## Which agent reviews which type of work

| Role | Primary focus | Reviews work like… |
|---|---|---|
| [Product Owner](product-owner.md) | PRD alignment, MVP scope, user & portfolio value, scope creep | New features, scope decisions, milestone boundaries |
| [React Native Engineer](react-native-engineer.md) | Expo architecture, TypeScript, navigation, folder structure, state, Firebase seam | App scaffolding, component/architecture choices |
| [Code Reviewer](code-reviewer.md) | Correctness, readability, maintainability, simplicity, plan adherence | Any code change or PR/diff |
| [Security Reviewer](security-reviewer.md) | No secrets, safe auth assumptions, UGC & prayer-content privacy, moderation, future Firebase rules | Anything touching data, auth, config, or user content |
| [Test Engineer](test-engineer.md) | Manual test plans, future automated tests, regression, local-run verification | Each build phase and feature flow |
| [Release Manager](release-manager.md) | Git status, expected changed files, run commands, validation, commit quality, push readiness | Every commit / phase wrap-up |

## How reviews are produced

- Every review is a **markdown document** in `docs/reviews/`.
- Reviews follow a consistent shape: an executive summary, per-role findings, and a
  clear **go / no-go** decision with any required changes.
- A phase-level readiness review (for example, `phase-a-readiness-review.md`) gathers
  all relevant role lenses into one go/no-go document.

## Go / no-go before commit

- **Meaningful code phases must go through a go/no-go review before commit.** A
  "meaningful" phase is anything that scaffolds the app or adds/changes a feature
  flow (the build phases A–H in `../implementation-plan.md`).
- Trivial doc edits and typo fixes do not require a full panel review, but they still
  pass the security reviewer's secret check before commit.
- A phase is committed only when its readiness review records a **Proceed** (or
  **Proceed with changes**, with those changes made first).

## Release manager closes the loop

- After review and before push, the **Release Manager** summarizes final readiness:
  expected changed files, run commands, validation performed, commit message quality,
  and a clear push-readiness statement. This is the last gate before the change lands.

---

## Project guardrails (apply to every role)

These constraints come from the project rules and are non-negotiable for all roles:

- Do **not** reintroduce secrets or sensitive config (Firebase keys, API keys,
  database URLs, bucket names, tokens, credentials).
- Do **not** modify `legacy-web-app/` (legacy app is a preserved reference).
- Do **not** modify `.claude/`.
- Do **not** install external agent skills or copy third-party agent files verbatim.
- Respect the three milestones in order: **functional local prototype → Firebase-backed
  MVP → app-store-ready release.** Do not pull later-milestone work forward.
