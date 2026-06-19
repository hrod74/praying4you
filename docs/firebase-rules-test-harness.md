# Firebase Rules Test Harness and Backend QA Gate (Phase J.2f.4)

A lightweight, isolated test harness that validates `mobile-app/firestore.rules` against the Firebase
Local Emulator Suite, plus a backend QA gate so Firestore rules/transaction regressions are caught
**before** manual device QA, not during it.

## Why this harness was added

During the Firestore prayer-interaction work (Phase J.2f.3), a real permission/transaction bug was
discovered only during manual device testing:

- The pray flow runs in a Firestore **transaction** that creates `prayerInteractions/{uid}_{requestId}`
  and increments the request's `prayerCount`.
- Two separate rules problems each broke it, and each surfaced only on a real device:
  1. The count was written with a server-side `increment()` transform, which the "exactly +1" rule
     could not validate, so the update was rejected and (being atomic) rolled back the whole pray.
  2. The interaction read rule denied the transaction's pre-create duplicate check for a not-yet-
     existing doc (`permission-denied` on `BatchGetDocuments`).

Both were fixable, but they should have been caught by an automated rules test long before QA. This
harness exists so that **any future change to `firestore.rules` (or to a service that depends on it)
can be validated automatically**.

## What the harness tests

The tests load the **real** `mobile-app/firestore.rules` and exercise them with the Firebase rules
unit-testing library against the emulator. Coverage:

- **`users/{uid}`** (`tests/users.test.mjs`): owner can create/read/update their own profile; cannot
  read/create another user's; unauthenticated cannot read/write; a profile is valid without an email
  (email is never required or stored in Firestore).
- **`prayerRequests/{id}`** (`tests/prayerRequests.test.mjs`): signed-in read of active requests; no
  unauthenticated read; owner-only create with safe shape and no email; owner-only edit/soft-remove;
  non-owners blocked; no client hard delete; protected fields (`authorUid`, `createdAt`,
  `prayerCount`) cannot change via an edit; a removed request is not readable by non-owners.
- **`prayerInteractions/{uid}_{requestId}`** (`tests/prayerInteractions.test.mjs`): a user can `get`
  their own deterministic interaction doc **even before it exists** (the duplicate-prevention read);
  cannot read another user's doc; cannot list/enumerate who prayed; a valid first-time pray (one
  batch: interaction create + literal `prayerCount` +1) succeeds and raises the count by exactly 1;
  duplicates and same-user repeats are blocked; another user adds a separate interaction and raises
  the count again; no interaction may contain an email, be created for another user, or target a
  removed request; `prayerCount` cannot be changed arbitrarily; interactions are immutable from the
  client.
- **`reports/{uid}_{requestId}`** (`tests/reports.test.mjs`, Phase J.2g): a reporter can report another
  user's active request and `get` only their own report doc (even before it exists); cannot report
  their own or a removed request; cannot report twice; cannot file for another `reporterUid`; no email;
  reason must be allowed; status must be `open`; `requestAuthorUid` must match the real author; cannot
  update a report's status, delete a report, list reports, or read another user's report.

> The two J.2f.3 bugs above are now directly covered: the "exactly +1" increment test (uses a literal
> value in a batch) and the "get own interaction doc before it exists" test.

## Isolation and privacy

- The harness lives in `mobile-app/firebase-tests/` with **its own `package.json`/dependencies**. It
  is never imported by the app and never bundled by Metro, so it cannot affect the Expo Go build.
- It uses **no production data, no service account, and no real Firebase config**. The emulator runs
  under a fake `demo-praying4you` project id (the `demo-` prefix forces offline/no-credentials mode).
- The owner's real `.env.local` is never read by the tests.

## How to install

```sh
cd mobile-app/firebase-tests
npm install
```

This installs `@firebase/rules-unit-testing`, `firebase`, and a **local** `firebase-tools` (kept in
the harness, not global). `mobile-app/firebase-tests/package-lock.json` is committed for reproducible
installs. `node_modules/` and emulator debug logs are git-ignored.

## How to run

```sh
cd mobile-app/firebase-tests && npm test
```

(equivalently, from `mobile-app/`: `npm run test:rules`)

This runs `firebase emulators:exec --only firestore --project demo-praying4you "node --test"`: it
boots the Firestore emulator, runs the Node test files **serially**, and shuts the emulator down.

**The real rules are loaded two ways, both pointing at `mobile-app/firestore.rules`:**

- `npm run sync-rules` (run automatically as `pretest`) copies `../firestore.rules` into the harness
  as `firestore.rules`, which `firebase.json` references. This is what the emulator loads at boot, so
  there is **no "no rules file / default allow-all" warning**. The copy is git-ignored (single source
  of truth stays `mobile-app/firestore.rules`); a stale copy can never drift because it is re-synced
  before every run.
- The tests also pass the same real rules to `initializeTestEnvironment`, so the validation is
  explicit and self-contained.

**Serial execution (`--test-concurrency=1`) is required.** The three test files share one emulator
database (`demo-praying4you`) and each clears it in `beforeEach`. If the files ran in parallel (the
`node --test` default), one file's `clearFirestore()` would wipe another file's freshly-seeded data
mid-test, causing flaky `Null value error` / `NOT_FOUND` / `undefined.prayerCount` failures. Running
serially gives each file a clean, uncontended database.

## Java requirement

**The Firestore emulator requires Java 11+** (it is a Java process; Java 17 is recommended). With an
older JDK the emulator exits immediately and the tests cannot run. `firebase-tools@15` will require
Java 21+, so a future "Java < 21" deprecation warning is expected and harmless.

## Status of the test run (current)

**The suite runs and passes: 47/47 tests, exit 0**, on Java 17, with no missing-rules warning (33
from J.2f.4 plus 14 `reports` tests added in J.2g). The earlier Java 1.8 blocker is **resolved** (Java
17 is now installed). The automation gap is closed.

```sh
cd mobile-app && npm run test:rules
# ... ℹ tests 47 / ℹ pass 47 / ℹ fail 0 ✔ Script exited successfully (code 0)
```

> The only remaining emulator notice is the benign future warning that `firebase-tools@15` will drop
> Java < 21; it is not a failure.

## Manual Firebase QA still required (in addition to automation)

The rules tests validate the rules logic, but they do **not** replace on-device QA of the app itself.
Manual device QA via the per-feature checklists remains part of the process:

- `docs/QA_prayer_interaction_scenarios.md` (pray flow, count, duplicate prevention, removed-request
  block, no who-prayed, no email).
- `docs/QA_prayer_request_scenarios.md` (create/edit/soft-remove/ownership/no email).
- `docs/QA_report_scenarios.md` (report active request, duplicate/self/removed blocked, no email, no
  who-reported).
- `docs/QA_delete_scenarios.md` (account deletion soft-removes the user's requests).

## Backend QA gate (project rule)

Before a Firestore-touching phase is considered complete:

1. **TypeScript must pass** (`cd mobile-app && npx tsc --noEmit`).
2. **Firebase rules tests must pass when rules change** (`cd mobile-app/firebase-tests && npm test`).
   If they cannot run locally (e.g. no Java 11+), the phase summary must state, verbatim:
   *"Rules were not fully validated by automation. Manual Firebase QA is required before this phase is
   considered complete."*
3. **Expo must start** (`cd mobile-app && npx expo start -c`).
4. **Manual device QA still happens**, but it should not be the first place rules failures are
   discovered.

### Project rule for future rules changes

**Any future change to `mobile-app/firestore.rules` must include or update the corresponding emulator
rules tests in `mobile-app/firebase-tests/`, or the change description must explicitly state why the
tests could not be run** (and what manual QA was done instead).
