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

Requirements: **Java 11+** (the Firestore emulator is a Java process) and network access on first run
(the emulator jar is downloaded once). If the emulator cannot run in your environment, the tests
cannot run; see the doc for the manual backend QA gate that must be used instead.
