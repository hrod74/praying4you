# AI Development Team: Praying For You

This folder defines a lightweight, project-specific **AI development team** — a set
of review roles ("agents") used to keep the Praying For You rebuild aligned, safe, and
high quality as it moves from planning into a functional local prototype.

These are **not** installed external agent skills and they do **not** copy any
third-party agent files. They are original, project-specific role definitions
inspired by senior engineering review workflows (product, design, engineering, code
review, security, testing, release management). Each role is a focused reviewer with a
clear remit, checklist, and output format.

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
| [UI/UX Designer](ui-ux-designer.md) | Mobile-first experience, screen hierarchy, navigation clarity, visual consistency, accessibility basics, forms, empty/error states, calm/respectful tone, trust & privacy cues, demo polish, anti-clutter & anti-dark-patterns | New screens/flows, layout & tone, before screenshots/demo capture |
| [React Native Engineer](react-native-engineer.md) | Expo architecture, TypeScript, navigation, folder structure, state, Firebase seam | App scaffolding, component/architecture choices |
| [Backend Engineer](backend-engineer.md) | Firebase Auth & Firestore data modeling, service boundaries, API/data contracts, ownership/permissions, validation, soft-remove behavior, cost-aware reads/writes, backend & security-rule testing | Firebase planning, data model, service contracts, local→backend migration |
| [Systems Admin / DevOps Engineer](systems-admin.md) | Firebase/Expo/EAS setup, config & secret safety, env vars, local vs. cloud builds, iOS/Android beta distribution, deployment/cost checklists, repeatable setup | Backend/beta setup, build & distribution, deployment readiness |
| [Code Reviewer](code-reviewer.md) | Correctness, readability, maintainability, simplicity, plan adherence | Any code change or PR/diff |
| [Security Reviewer](security-reviewer.md) | No secrets, safe auth assumptions, UGC & prayer-content privacy, moderation, future Firebase rules | Anything touching data, auth, config, or user content |
| [Test Engineer](test-engineer.md) | Test *strategy*: manual test plans, future automated tests, regression, local-run verification | Each build phase and feature flow |
| [QA Engineer](qa-engineer.md) | User-facing *quality*: acceptance criteria, end-to-end flow, mobile usability, edge cases, accessibility basics, visual/demo & portfolio readiness | Before a phase/feature is demo-ready or shown |
| [Release Manager](release-manager.md) | Git status, expected changed files, run commands, validation, commit quality, push readiness | Every commit / phase wrap-up |

> **Test Engineer vs. QA Engineer:** the Test Engineer decides *how* quality is
> verified (test plans, regression, automation); the QA Engineer decides *whether the
> result is good enough* for a real user and a portfolio (acceptance criteria,
> usability, polish). They are complementary and intentionally separate roles.

> **When to use the UI/UX Designer:** bring this role in **before** building a new
> screen or flow (to agree on layout, hierarchy, and tone) and **after** it is built
> (to check visual consistency, accessibility basics, and demo polish) — and before
> capturing screenshots/recordings for the portfolio. It sits between the Product Owner
> (what to build and why) and the React Native Engineer (how to build it): the Designer
> defines *how the agreed thing should look and feel*. It differs from the QA Engineer,
> who validates that the built result actually works and is bug-free for a demo — design
> sets the target, QA verifies the outcome. Design intent lives in
> [`../design-direction.md`](../design-direction.md).

> **When to use the Backend Engineer and the Systems Admin / DevOps Engineer:** these
> two roles join the panel as the project moves **beyond the local mock prototype**
> toward a Firebase-backed beta. They are **not** needed for local prototype phases
> (mock data, no backend), but they are **required reviewers** from **Firebase MVP
> planning onward** (roadmap Phase I and later). Bring in the **Backend Engineer** when
> planning Firebase Auth, the Firestore data model, service boundaries, API/data
> contracts, ownership/permission rules, soft-remove behavior, and the backend/security-
> rule test plan — i.e., the Firebase planning and implementation phases. Bring in the
> **Systems Admin / DevOps Engineer** when planning Firebase/Expo/EAS setup, config and
> secret safety, builds, and how a real beta build reaches testers — i.e., the Firebase
> setup and beta-distribution phases. Both should review **in Plan Mode first**, before
> any backend code or project/account is created.

## Which agents belong in which review

- **Local prototype phases (mock data, no backend):** the original eight roles —
  Product Owner, UI/UX Designer, React Native Engineer, Code Reviewer, Security
  Reviewer, Test Engineer, QA Engineer, Release Manager.
- **Firebase / backend / beta-distribution phases (roadmap Phase I onward):** the
  original eight **plus** the **Backend Engineer** (data model, contracts, validation,
  ownership, backend & security-rule testing) and the **Systems Admin / DevOps
  Engineer** (Firebase/Expo/EAS setup, config/secret safety, builds, beta
  distribution). The go/no-go review checklist for these phases **must** include both
  new roles. Firebase migration is planned in **Plan Mode** before implementation.

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
