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
boots the Firestore emulator, runs the Node test files, and shuts the emulator down. The real rules
are loaded into the emulator by the tests themselves (via `initializeTestEnvironment`), so
`firebase.json` deliberately does **not** reference the rules file (which lives one level up, outside
the harness directory).

## Java requirement

**The Firestore emulator requires Java 11+** (it is a Java process). With an older JDK the emulator
exits immediately and the tests cannot run.

## Status of the test run in this environment (honest result)

The harness was authored and its dependencies installed successfully, and the emulator jar downloaded,
but the emulator **could not start** because the local JDK is **Java 1.8**. The exact failure:

```
Unsupported java version, make sure java --version reports 1.8 or higher.
Firestore Emulator has exited with code: 1
java.lang.UnsupportedClassVersionError: .../firestore/CloudFirestore has been compiled by a more
recent version of the Java Runtime (class file version 55.0), this version of the Java Runtime only
recognizes class file versions up to 52.0
```

(Class file version 55.0 = Java 11; 52.0 = Java 8.)

> **Rules were not fully validated by automation. Manual Firebase QA is required before this phase is
> considered complete.**

### How to actually run the tests (the fix)

Install a modern JDK, then rerun:

```sh
# install Java 11+ (Java 17 recommended), e.g. on macOS:
#   brew install temurin@17    # then ensure `java -version` reports 17
cd mobile-app/firebase-tests && npm test
```

No code or rules changes are needed once a compatible JDK is present.

## What manual Firebase QA still remains required

Until the emulator tests have actually been run green on a Java 11+ machine, the manual backend QA
checklists remain the source of truth and must be completed:

- `docs/QA_prayer_interaction_scenarios.md` (pray flow, count, duplicate prevention, removed-request
  block, no who-prayed, no email).
- `docs/QA_prayer_request_scenarios.md` (create/edit/soft-remove/ownership/no email).
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
