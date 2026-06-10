# Phase A Readiness Review: Project Foundation

**Review type:** Readiness (go/no-go to begin Phase A — scaffold the Expo app)
**Reviewed against:** `../implementation-plan.md`, `../prototype-roadmap.md`,
`../product-requirements.md`, `../legacy-app-audit.md`,
`../cost-and-publishing-considerations.md`, `../workflows.md`
**Roles applied:** Product Owner, React Native Engineer, Code Reviewer, Security
Reviewer, Test Engineer, QA Engineer, Release Manager (see `../agents/`)

---

## 1. Executive Summary

The project is **ready to scaffold the Expo app (Phase A).** The planning docs are
complete, internally consistent, and clear about scope: a functional local prototype
built mock-data-first, with Firebase, AdMob, and app-store work explicitly deferred.
The implementation plan defines a concrete folder structure, screen set, typed data
model, build phases, and a clean services seam for future Firebase integration. No
secrets are present in the repository, and the guardrails (no `legacy-web-app/`
changes, no `.claude/` changes, no external skills) are well understood.

Phase A itself is low-risk: it creates the Expo project, TypeScript config, Expo
Router skeleton, the initial folder structure, and at most minimal placeholder
screens to confirm navigation — no feature logic and no backend.

## 2. Recommendation

**Proceed.**

Rationale: every prerequisite for a clean foundation is in place. Phase A is narrowly
scoped, reversible, and adds no secret or backend risk. There are no blockers. A small
number of **non-blocking follow-ups** are noted per role (e.g., pin the Expo SDK
version and document exact run commands in `mobile-app/README.md`), but none need to
be resolved before starting Phase A.

---

## 3. Product Owner Review

- **PRD alignment:** Phase A serves every MVP user story indirectly by establishing
  the app shell the prototype needs; it pulls in no out-of-scope features.
- **Prototype scope clarity:** The three-milestone framing (functional local prototype
  → Firebase-backed MVP → app-store-ready release) is explicit and respected. Phase A
  is unambiguously milestone-1 foundation work.
- **Portfolio value:** A runnable, navigable Expo shell is the first showable artifact
  and a credible base for the demo flow; it advances portfolio value.
- **Scope creep risks:** Low. The main risk is "while we're scaffolding, let's add a
  real sign-in / a Firebase config / a nicer feature." That must be resisted — Phase A
  is structure only.
- **Required changes:** None. Follow-up (non-blocking): keep Phase A placeholder
  screens truly minimal so they are not mistaken for finished features in the demo.
- **Verdict:** Proceed.

## 4. React Native Engineer Review

- **Expo/TypeScript approach:** Managed workflow + TypeScript is correct and matches
  the plan; runnable in Expo Go with no paid accounts (consistent with the cost doc).
- **Expo Router recommendation:** Endorsed. File-based routing with an auth group vs.
  app group and a tab layout is the right structure and matches the audit's
  recommendation.
- **Proposed folder structure:** Sound. `app/` for routes; `src/{context,services,
  data,models,components,theme,utils}` cleanly separates concerns. Approve as the
  Phase A skeleton (folders can be created with placeholders even before they are
  filled).
- **Mock/local data approach:** Correct to defer all real data; Phase A needs no data
  layer beyond empty/placeholder modules.
- **Future Firebase seam:** The `src/services/` boundary is the key decision and is
  well specified — screens must never import raw data. Phase A should create the
  services folder so the seam exists from the first commit.
- **Required changes:** None blocking. Follow-ups (non-blocking): pin a specific Expo
  SDK version for reproducibility; confirm `app.json` contains no Firebase/config keys.
- **Verdict:** Proceed.

## 5. Code Reviewer Review

- **Implementation-plan clarity:** High. The plan is specific enough to scaffold
  against without guesswork (structure, naming, phase order).
- **Maintainability concerns:** None at this stage; the layered structure supports
  maintainability. Watch that Phase A does not put logic in screens.
- **Phase size concerns:** Phase A is appropriately small (foundation only). Keeping it
  scoped to project init + routing skeleton + folders keeps the first diff reviewable.
- **Simplicity concerns:** Good — Context + hooks over heavier state libraries is the
  simplest workable choice. Avoid introducing any abstraction in Phase A that has no
  consumer yet.
- **Required changes:** None. Follow-up (non-blocking): ensure placeholder screens are
  trivial and clearly marked as placeholders so they are easy to replace in Phase B–C.
- **Verdict:** Proceed.

## 6. Security Reviewer Review

- **Secrets risk:** None. Repo-wide secret scan returns only documentation examples and
  the documented grep commands — no real keys, URLs, buckets, tokens, or credentials.
- **Firebase config risk:** None in Phase A — no Firebase is added. `.gitignore`
  already excludes `.env*`, `serviceAccountKey.json`, and `firebase-adminsdk*.json`,
  so the future config path is safe.
- **Public anonymity vs. private account ownership:** Not exercised in Phase A (no data
  yet), but the model is correctly specified for later phases: "Anonymous" is a display
  choice while the owning user is always retained privately for moderation.
- **UGC/privacy risk:** None in Phase A (no user content). The plan correctly treats
  prayer text as sensitive, untrusted input for later phases, and keeps email private.
- **Required changes:** None. Follow-up (non-blocking): confirm the generated `app.json`
  and any Expo config carry no identifiers that resemble project config before commit.
- **Verdict:** Proceed.

## 7. Test Engineer Review

- **Manual validation needed for Phase A:** (1) `npm install` succeeds; (2)
  `npx expo start` launches; (3) the app boots in Expo Go and/or a simulator without
  errors; (4) if placeholder screens are included, navigation between them works.
- **Local run validation:** Documented run commands must reproduce a booting app from a
  clean clone. This is the core Phase A acceptance check.
- **Navigation validation:** If placeholder routes exist (e.g., welcome → a tab shell),
  confirm each is reachable and back/tab navigation behaves.
- **Regression risks:** None — there is no prior app code to regress.
- **Required changes:** None. Follow-up (non-blocking): capture the exact run commands
  and expected "it boots" result in `mobile-app/README.md` as part of Phase A.
- **Verdict:** Proceed.

## 8. QA Engineer Review

- **Acceptance criteria:** Not yet exercisable (no app exists), but the in-scope user
  stories have observable criteria defined in the PRD and implementation plan, giving
  QA a clear basis to assess against once Phase A produces a running shell.
- **End-to-end flow:** Phase A delivers only a navigable shell, not the full loop. QA's
  acceptance bar for Phase A is narrow: the app launches and any placeholder routes are
  reachable without dead ends. The full core-loop acceptance check belongs to later
  phases (B–H).
- **Mobile usability:** Confirm the shell respects safe areas/insets and that any
  placeholder screens render cleanly on a phone — no clipped content, comfortable tap
  targets even for placeholder navigation.
- **Edge cases (user-facing):** Minimal at this stage; ensure a placeholder screen is
  obviously a placeholder and not mistaken for a finished, broken feature.
- **Accessibility basics:** No real content yet, but establish good habits from the
  start — any placeholder interactive elements should carry accessible labels and
  readable contrast so later screens inherit the pattern.
- **Visual & demo/portfolio readiness:** Phase A is **not** itself a portfolio demo;
  it is scaffolding. QA's note: keep placeholders unobtrusive so early screenshots are
  not mistaken for the finished prototype. Visual/demo readiness is assessed from
  Phase C onward.
- **Required changes:** None blocking. Follow-up (non-blocking): keep placeholder
  screens minimal and clearly labeled; defer all polish judgments to feature phases.
- **Verdict:** Proceed.

## 9. Release Manager Review

- **Expected Phase A changed files:** a new `mobile-app/` directory (Expo project:
  `app/`, `package.json`, `tsconfig.json`, `app.json`, initial `src/` folders, and
  `mobile-app/README.md`). Possibly a small root docs or index update. **No** changes
  to `legacy-web-app/`, `.claude/`, or unrelated files.
- **Required run commands:** `cd mobile-app && npm install`, then `npx expo start`
  (with notes for iOS simulator / Android emulator / Expo Go).
- **Required validation checks:** app installs; app runs locally; navigation works if
  placeholders are included; secret scan passes; only expected files changed;
  `.claude/` not staged.
- **Commit readiness criteria:** all seven role verdicts are Proceed; secret check passes;
  run commands documented; git status matches expectations.
- **Required release notes content:** what was scaffolded (Expo + TS + Expo Router +
  folder skeleton), files changed, validation performed (install + local run), run
  commands, and known follow-ups (pin SDK version, fill folders in later phases).
- **Verdict:** Proceed.

---

## 10. Final Phase A Scope

Phase A includes **only** the following:

- Scaffold `mobile-app/` as a new project (do not place it anywhere else).
- React Native via **Expo (managed workflow)**.
- **TypeScript** configured from the start.
- **Expo Router** for file-based navigation (aligned with the implementation plan).
- **Initial folder structure** per the plan: `app/` routes plus `src/{context,
  services,data,models,components,theme,utils}` (folders may be created with
  placeholder/empty modules).
- **Minimal placeholder screens only if needed** to confirm navigation works (e.g., a
  welcome screen and a tab shell) — no feature logic.
- **`mobile-app/README.md`** (or a docs update) documenting the local run commands.

## 11. Phase A Must-Not-Do List

- Do **not** add Firebase (Auth, Firestore, config, SDK).
- Do **not** add AdMob or any ad/analytics/tracking SDK.
- Do **not** add app-store configuration (bundle IDs for submission, store assets,
  EAS submit config).
- Do **not** implement production authentication (local/simulated only, and only if a
  placeholder is needed — full local auth is Phase B).
- Do **not** modify `legacy-web-app/`.
- Do **not** introduce secrets or config values of any kind.
- Do **not** build Phases B–H (profile, feed, submit, prayer interaction, verse,
  reporting, settings, polish) in this phase.

## 12. Required Validation Before Phase A Commit

- [ ] App installs successfully (`npm install`).
- [ ] App runs locally (`npx expo start`) and boots in Expo Go / a simulator.
- [ ] Navigation works if placeholder screens are included.
- [ ] No secrets introduced (secret scan returns only docs examples / grep commands).
- [ ] Only expected files changed (new `mobile-app/`; no `legacy-web-app/`, no
      `.claude/`, no stray files).
- [ ] Run command documented (in `mobile-app/README.md`).
- [ ] Git status reviewed and matches expectations.
- [ ] Release summary created (per the Release Manager output format).

## 13. Go/No-Go Decision

**Decision: GO — Proceed to Phase A.**

All seven role lenses return **Proceed**, with no blockers and only non-blocking
follow-ups (pin the Expo SDK version; document exact run commands; keep placeholders
minimal; confirm `app.json` has no config identifiers).

**Specific next instruction for Phase A:**

> Scaffold the functional local prototype foundation in a new `mobile-app/` directory
> using Expo (managed workflow) with TypeScript and Expo Router. Create the initial
> folder structure from `../implementation-plan.md` (`app/` routes plus
> `src/{context,services,data,models,components,theme,utils}`), add at most minimal
> placeholder screens to confirm navigation, and write `mobile-app/README.md` with the
> local run commands. Do not add Firebase, AdMob, app-store config, production auth, or
> Phases B–H. Do not modify `legacy-web-app/` or `.claude/`. Introduce no secrets. Then
> run the Phase A validation checklist (Section 12) and have the Release Manager produce
> the readiness summary before commit.
