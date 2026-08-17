# QA Prayer Interaction Scenarios

A manual checklist for verifying Firestore-backed prayer interactions ("I prayed for this") in the
Praying For You mobile app. It is written for the owner (not a developer). Tap through each step on a
phone running Expo Go, and check the box when the result matches what is described.

## Purpose

This checklist verifies Firestore-backed "I prayed for this" behavior before Alpha testing with real
users. It confirms a signed-in user can pray for a request once, that the aggregate prayer count
updates, that duplicate taps do not double-count, and that the app never reveals who prayed for a
request.

What is out of scope here (do not test these):

- Reports are Firestore-backed (not local/mock); they are simply out of scope for this checklist, since they're covered separately by `docs/QA_report_scenarios.md`. *(Corrected 2026-08-06: this line previously said reports were still local/mock, which was stale.)*
- No push notifications, AI verse matching, social/Google sign-in, or passwordless/anonymous auth.
- There is deliberately no "who prayed" list anywhere; confirming its absence is part of the test.

## Before You Start

- [ ] Expo is running with `npx expo start -c`
- [ ] Firebase Console is open to Firestore Database → Data
- [ ] Firebase Console is open to Authentication → Users
- [ ] Current Firestore rules are published (the updated `mobile-app/firestore.rules`, J.2f.3)
- [ ] Testing uses throwaway accounts
- [ ] At least one active prayer request exists

> Important: the rules were updated for this phase. Publish the FULL `mobile-app/firestore.rules` in
> the Firebase Console (Firestore Database → Rules → Publish) before testing, or praying will be
> denied (the interaction write and the count increment commit together, so a blocked count update
> rolls back the interaction too, and you will see no `prayerInteractions` document appear).

> Tip: keep a Firestore tab on the `prayerInteractions` and `prayerRequests` collections so you can
> watch an interaction doc appear and the `prayerCount` rise as you pray.

> Troubleshooting: if tapping 🙏 Pray creates no interaction document and the count does not move,
> first re-publish `mobile-app/firestore.rules` (above). Two prior bugs caused exactly this symptom
> and are now fixed, but BOTH fixes live in the rules and/or app, so you must publish the latest rules
> and run the latest build (`npx expo start -c`):
>
> 1. The count was written with a server-side `increment()` transform the rules could not validate,
>   which rolled back the whole write. Fixed: the count is written as a literal `+ 1`.
> 2. The interaction read rule denied the transaction's pre-create duplicate check for a not-yet-
>   existing doc (`permission-denied` on `BatchGetDocuments`). Fixed: a user may `get` their own
>    deterministic interaction doc by id prefix, even before it exists.

> **QA setup context (2026-08-10, pre-Scenario-1 cleanup): not a test result.** Before this QA pass
> began, the owner performed an intentional Firebase test-data cleanup via the Firebase Console:
>
> - Deleted the entire `prayerInteractions` collection.
> - Deleted the entire `prayerRequests` collection.
> - Deleted the entire `reports` collection.
> - Reduced Firebase Authentication from 13 accounts to 2 retained QA accounts.
> - Deleted the corresponding obsolete profile documents from the Firestore `users` collection.
> - Confirmed the two remaining Authentication accounts have matching `users` documents.
> - Confirmed sign-in succeeds with both retained accounts.
> - Confirmed no old prayer content remains in the app.
> - Did **not** modify or republish Firestore rules.
> - Did **not** modify indexes or other Firebase configuration.
>
> The empty `prayerInteractions`/`prayerRequests`/`reports` collections are expected; Firestore
> recreates a collection automatically the first time a document is written to it, so they reappear
> once QA data is generated below. This entry records the starting state for this QA session; it does
> not confirm or deny any scenario outcome. Firestore rules were not touched during this cleanup, so
> the "Current Firestore rules are published" item above is being treated as still valid based on
> prior confirmation, not independently re-verified today.

## Scenario 1: Pray From Feed Card

- [x] Sign in as Account A: confirmed by tester (2026-08-10): sign-in succeeded.
- [x] Create an active prayer request: confirmed by tester (2026-08-10): request created successfully; on-screen confirmation message shown; Settings "requests shared" count updated to 1.
- [x] Confirm the request appears in feed: confirmed by tester (2026-08-10): request visible in feed.
- [x] Tap the feed card 🙏 Pray CTA: confirmed by tester (2026-08-10): tapped as Account B on Account A's request.
- [x] Confirm prayer count increases by 1: confirmed by tester (2026-08-10): the request itself shows "1 person prayed."
- [x] Confirm UI shows already-prayed state: confirmed by tester (2026-08-10): app showed "You prayed for this" message.
- [x] Confirm `prayerInteractions/{uid}_{requestId}` exists in Firestore: confirmed by tester (2026-08-10): both the prayer request and the interaction document are visible in the Firebase Console.
- [x] Confirm no list of who prayed is shown in the UI: confirmed by tester (2026-08-10): as Account B, the detail screen only shows a self-referential "You prayed for this" status; no list, names, or avatars of who prayed anywhere. Tester noted this is as designed.

> Note: you cannot pray for your own request, so to test the feed CTA, pray as a different account
> than the one that created the request (or create the request with another account first).

## Scenario 2: Duplicate Prayer Prevention

- [x] Tap 🙏 Pray again on the same request: confirmed by tester (2026-08-10): tapped a second time as Account B.
- [x] Confirm prayer count does not increase again: confirmed by tester (2026-08-10): count still reads "1 person prayed" after the second tap.
- [x] Confirm no duplicate interaction document is created: confirmed by tester (2026-08-10): no change in Firestore; still one interaction document.
- [x] Confirm app shows calm already-prayed behavior or remains marked prayed: confirmed by tester (2026-08-10): tester reports the app correctly prevents praying for the same request twice; no error, no crash, no double action.

## Scenario 3: Pray From Detail Screen

- [x] Create or open a different active prayer request: confirmed by tester (2026-08-10): new, separate request created by Account C; appears in feed.
- [x] Open prayer detail: confirmed by tester (2026-08-10): signed in as Account A (different from creator, Account C); detail screen opened correctly.
- [x] Tap 🙏 I prayed for this: confirmed by tester (2026-08-10): tapped as Account A on Account C's request from the detail screen.
- [x] Confirm prayer count increases by 1: confirmed by tester (2026-08-10): count shows "1 person prayed" on the request.
- [x] Confirm already-prayed state appears: confirmed by tester (2026-08-10): "already-prayed" indicator shown on the detail screen, separate from the count.
- [x] Confirm Firestore interaction doc exists: confirmed by tester (2026-08-10): `prayerInteractions` document for Account A on this request visible in Firebase Console.
- [x] Confirm returning to feed shows updated count/state: confirmed by tester (2026-08-10): feed card reflects the same updated count and prayed-state seen on the detail screen.

## Scenario 4: Multi-user Count

> Note: this pass reused the same prayer request created in Scenario 1 (by Account A) rather than
> creating a fresh one, to avoid duplicate setup. Account B's prayer on it was confirmed in Scenarios
> 1-2. A third throwaway account (Account C) was created specifically for this scenario, since only 2
> QA accounts remained after the pre-session Firebase cleanup.

- [x] Account A creates a prayer request: reused from Scenario 1 (confirmed by tester, 2026-08-10).
- [x] Account B signs in: reused from Scenario 1 (confirmed by tester, 2026-08-10).
- [x] Account B prays for Account A's request: reused from Scenario 1 (confirmed by tester, 2026-08-10).
- [x] Confirm prayer count increases: reused from Scenario 1: count went to 1 (confirmed by tester, 2026-08-10).
- [x] Account C signs in, if available: confirmed by tester (2026-08-10): new throwaway Account C created and signed in successfully.
- [x] Account C prays for same request: confirmed by tester (2026-08-10): tapped Pray CTA as Account C on Account A's request; success message shown, CTA changed to "prayed" state.
- [x] Confirm prayer count increases again: confirmed by tester (2026-08-10): count went from 1 to 2. (Account C's own "prayers lifted" personal stat in Settings also updated to 1, consistent.)
- [x] Confirm no user list is visible anywhere: confirmed by tester (2026-08-10): as Account C, the count shows only as an anonymous number; no list of who prayed.

## Scenario 5: Removed Prayer Request

- [x] Create a prayer request: confirmed by tester (2026-08-10): new request created by Account A.
- [x] Remove the request as owner: confirmed by tester (2026-08-10): Account A removed its own request successfully.
- [x] Confirm removed request leaves feed: confirmed by tester (2026-08-10): removed request no longer visible in Account A's feed.
- [ ] Confirm another user cannot pray for the removed request: **not conclusively tested.** This check requires a second account to already have the request's detail screen open at the moment the owner removes it (a race-condition setup), which needs either two devices or two simultaneous sessions. The tester has only one physical device and single-session, sequential account switching, so this could not be set up. Tester's own assessment: likely a narrow edge case given Firebase's real-time update speed, but that is a hypothesis, not an observed result, and is not recorded as a pass.
- [ ] Confirm no interaction is created for the removed request: **not conclusively tested**, for the same reason above (depends on the same concurrent-session setup to attempt praying on a request mid-removal). Deferred alongside the item above.

> **Deferred to a future test environment (2026-08-10):** the two items above need a two-device or
> two-simultaneous-session setup (e.g., a second physical device, or one account on a phone and one
> in a web/emulator session) to properly test the race condition between "another user has the
> request open" and "the owner removes it." Not testable with a single device and sequential login.

> Expected: praying for a removed request fails calmly (no count change, no interaction doc). The
> message may read "This prayer request is no longer available." or, if the request was just removed,
> "We could not complete that request. Please try signing in again." Either is acceptable; the key is
> that no interaction is created and the count does not change.

## Scenario 6: Prayers I've Prayed For

- [x] Sign in as a user who prayed for one or more requests: confirmed by tester (2026-08-10): Account A, which prayed for Account C's request in Scenario 3.
- [x] Open Settings → Your prayer activity → Prayers I've prayed for: confirmed by tester (2026-08-10): list view opened correctly.
- [x] Confirm prayed-for requests appear: confirmed by tester (2026-08-10): the specific request Account A prayed for (Account C's, from Scenario 3) appears in the list.
- [x] Confirm requests not prayed for do not appear: confirmed by tester (2026-08-10): tester reports nothing odd seen; only the actually-prayed-for request is listed.
- [x] Confirm no other users' interaction data is shown: confirmed by tester (2026-08-10): no other users' activity or who-else-prayed data visible in this view.

## Scenario 7: Data Boundary Check

- [x] Confirm no `reports` collection is written: confirmed by tester (2026-08-10): no `reports` collection exists yet in Firestore (consistent with the pre-session cleanup and no report actions taken during this QA pass).
- [x] Confirm no email is stored in `prayerInteractions`: confirmed by tester (2026-08-10): no `email` field on either interaction document (Account B's or Account C's).
- [x] Confirm no email is stored in `prayerRequests`: confirmed by tester (2026-08-10): no `email` field on Account A's request document.
- [x] Confirm UI does not show raw user IDs: confirmed by tester (2026-08-10): everything shown as names/"Anonymous"/counts only; no raw UID strings visible anywhere in the UI.
- [x] Confirm UI does not show who prayed: already directly confirmed twice this session: Scenario 1 (Account B's view) and Scenario 4 (Account C's view), both showing only an anonymous count, no names/list. Carried forward as evidence for this item rather than re-tested a third time.
- [x] Confirm verses remain local: confirmed by tester (2026-08-16) in the corrected EAS Android preview APK on an Android Studio Pixel 2 emulator. The owner confirmed Verse of the Day online, enabled airplane mode, removed the app from recent apps, reopened it offline, and confirmed the verse remained visible. After airplane mode was disabled, the prayer feed returned. See `docs/QA_eas_android_standalone_scenarios.md`.

## Scenario 8: Local / Mock Fallback

This checks the app still works with no Firebase configured. Only do this if it is safe and you are
comfortable temporarily moving the config.

> **Deferred (2026-08-10): not run this session.** Like the "verses remain local" check in Scenario 7,
> this scenario is better tested with a standalone/production build than by manipulating config under
> Expo Go, where the dev server itself depends on the same environment being disturbed. Revisit this
> once an EAS/standalone build exists, rather than forcing it now.

- [ ] If safe, test Firebase config absent/disabled
- [ ] Confirm local/mock prayed behavior still works (pray, already-prayed, prayed-for list)
- [ ] Confirm the app does not crash
- [ ] Restore Firebase config afterward

> To test safely: rename `mobile-app/.env.local` (for example to `.env.local.bak`), run
> `npx expo start -c`, create a local profile, and pray for a seed request. Rename the file back when
> done so Firebase mode returns.

## Pass / Fail Summary

- [x] Pray from feed passed: Scenario 1 fully confirmed by tester on physical device (2026-08-10).
- [x] Duplicate prevention passed: Scenario 2 fully confirmed by tester on physical device (2026-08-10).
- [x] Pray from detail passed: Scenario 3 fully confirmed by tester on physical device (2026-08-10).
- [x] Multi-user count passed: Scenario 4 fully confirmed by tester on physical device (2026-08-10), using a newly created third account.
- [ ] Removed request protection passed: partially confirmed (2026-08-10). Removal itself and its disappearance from the feed are confirmed. The race-condition checks (another user praying on a request mid-removal) are deferred to a future two-device test environment; not marked passed.
- [x] Prayers I've prayed for passed or noted: Scenario 6 fully confirmed by tester on physical device (2026-08-10).
- [x] No who-prayed exposure: confirmed by tester (2026-08-10), Scenarios 1, 4, and 7.
- [x] No reports written: confirmed by tester (2026-08-10): no `reports` collection exists.
- [x] No emails stored: confirmed by tester (2026-08-10): no `email` field on prayer request or interaction documents.
- [x] No raw user IDs shown: confirmed by tester (2026-08-10).
- [ ] Fallback passed or not tested: not tested (2026-08-10). Deferred to a standalone/production build rather than forced under Expo Go; see Scenario 8 note.

## QA Notes

Write any observations here (date, device, what you saw):

```
- 2026-08-10, physical device (tester's own phone, Expo Go): completed Scenarios 1, 2, 4, and 7
  (the critical-path group for the core "I prayed for this" loop), guided step by step, all results
  directly observed and confirmed by the tester before being recorded.
- Pre-session cleanup: owner cleared prayerInteractions/prayerRequests/reports collections and reduced
  Auth from 13 to 2 accounts via the Firebase Console before testing began; recorded separately above
  as setup context, not a test result.
- A third throwaway account (Account C) was created mid-session specifically for Scenario 4, since
  only 2 accounts remained after cleanup.
- One item (Scenario 7, "verses remain local") could not be conclusively tested: Expo Go requires a
  live network connection to its dev-server bundler, so simple airplane mode doesn't produce a true
  offline test in this environment. Left unverified rather than guessed at.
- 2026-08-10 (continued, same session): completed Scenarios 3 and 6 in full. Scenario 5 was mostly
  completed; removal and its disappearance from the feed were confirmed, but the two checks that
  depend on a race condition (another user praying on a request the instant it's removed) could not
  be tested with a single device and sequential account switching. Deferred to a future two-device or
  two-simultaneous-session test environment; not marked as passed on the basis of the tester's
  reasoning alone.
- Scenario 8 ("Local / Mock Fallback") was not run. Deferred, like the "verses remain local" check, to
  a standalone/production build rather than forced under Expo Go's dev-server-dependent environment.
- No defects found in any scenario that was run.
- 2026-08-16, EAS Android preview APK on Android Studio Pixel 2 emulator: the previously deferred
  "verses remain local" item passed in a standalone build. The app opened in airplane mode, Verse of
  the Day remained visible, and the Firebase feed returned after reconnecting. See
  `docs/QA_eas_android_standalone_scenarios.md` for the build identifier and full smoke-test record.
```
