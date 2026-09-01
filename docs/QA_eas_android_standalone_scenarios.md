# QA EAS Android Standalone Build Scenarios

## Mandatory release gate (added 2026-08-28)

Every EAS `preview` or `production` build now runs `npm run validate:release-env` automatically
before dependencies are installed. The build must fail if any required `EXPO_PUBLIC_FIREBASE_*`
setting is missing, empty, or still a placeholder. Run `npm run test:release-env` to verify the
gate's pass/fail behavior without using real Firebase values.

Automation prevents another release artifact from silently selecting local/mock mode, but it does
not prove that Firebase Auth, Firestore, Google Play delivery, or cross-device refresh work. Before
approving an Android store release, install the exact Play-generated artifact on a clean device and
record all of the following against that exact version code:

- [ ] The EAS build log names all six Firebase variables as loaded from the intended environment.
- [ ] Account creation requests a password and the new user appears in Firebase Authentication.
- [ ] The corresponding private `users/{uid}` document appears in Firestore.
- [ ] A newly posted prayer appears in Firestore `prayerRequests`.
- [ ] The prayer appears on a second device/account after refresh.
- [ ] No bundled mock prayer is labeled as the signed-in user's own request.

Any unchecked item is a release blocker. Preview-APK QA or Expo Go QA cannot substitute for this
exact-artifact gate.

## Status

PASSED on 2026-08-16. The owner completed the checks below in an Android Studio Pixel 2 emulator using the corrected EAS preview APK. No defects were found in the tested scenarios.

## Build Under Test

- Platform: Android
- Distribution: EAS preview APK
- EAS build ID: `05a3a8ed-5a31-4cfe-9a36-9ef5655cf694`
- Source commit: `75a53db506a8e85740ff5d2f925e9b4e0b0a8e04`
- Application ID: `com.productsparkstudio.prayingforyou`
- Expo owner and project: `@product-spark-studio/praying4you`
- Test device: Android Studio Pixel 2 emulator
- Backend mode: Firebase

## Results

### Installation and Firebase startup

- [x] APK installed and opened successfully.
- [x] Existing Firebase account signed in successfully.
- [x] Prayer feed loaded.
- [x] Verse of the Day appeared.

### Prayer interaction smoke test

- [x] A temporary prayer request was created.
- [x] The request appeared in the feed.
- [x] The Pray action succeeded once.
- [x] A duplicate Pray action did not increase the count again.

### Pre-publication content-filter smoke test

- [x] `DM me for sexting` was blocked before publication.
- [x] The shared rejection message appeared.
- [x] The entered draft remained available for revision.
- [x] No blocked request was written.
- [x] A revised, allowed prayer request published successfully.

### Offline verse and reconnection

- [x] Verse of the Day was visible while online.
- [x] Airplane mode was enabled.
- [x] The app was removed from recent apps and reopened without a network connection.
- [x] The app opened offline.
- [x] Verse of the Day remained visible offline.
- [x] Airplane mode was disabled.
- [x] The prayer feed returned after network connectivity was restored.

### Cleanup

- [x] Temporary prayers and test data created during this standalone QA session were removed.

## Result Boundary

This record confirms the scenarios listed above in the corrected Android standalone build. It does not represent a complete Android regression pass, an iOS build result, store submission, or production release approval.

An earlier preview APK built without the Firebase environment variables successfully opened in local/mock mode and showed the local-profile path. That is evidence that the app did not crash when Firebase configuration was absent, but it does not complete the full local/mock prayer-interaction checklist in `docs/QA_prayer_interaction_scenarios.md` Scenario 8.

## Outcome

The corrected EAS Android preview build passed its installation, Firebase startup, prayer-interaction, content-filter, offline-verse, reconnection, and cleanup checks. The previously deferred standalone verification that verses remain available offline is closed.
