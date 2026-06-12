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
