# Firestore rules test harness

Self-contained security-rules tests for `mobile-app/firestore.rules`, run against the Firebase Local
Emulator Suite. This package is **isolated** from the Expo app: it has its own dependencies, is never
imported by the app, and is never bundled by Metro. It uses **no production data, no service account,
and no real Firebase config** (the emulator runs under a fake `demo-*` project id).

See the full guide, including the local-environment blockers and the backend QA gate, in
[`docs/firebase-rules-test-harness.md`](../../docs/firebase-rules-test-harness.md).

## Quick start

```sh
cd mobile-app/firebase-tests
npm install          # installs @firebase/rules-unit-testing, firebase, firebase-tools (local)
npm test             # firebase emulators:exec --only firestore ... node --test
```

Requirements: **Java 11+** (the Firestore emulator is a Java process; Java 17 recommended) and network
access on first run (the emulator jar is downloaded once). The suite currently passes 33/33 on Java 17.

Notes: `npm test` first runs `sync-rules` (copies the real `../firestore.rules` into this folder so the
emulator loads it from `firebase.json` — no allow-all warning; the copy is git-ignored). Tests run
serially (`--test-concurrency=1`) because the files share one emulator database. A future
"Java < 21" deprecation warning from `firebase-tools` is harmless.
