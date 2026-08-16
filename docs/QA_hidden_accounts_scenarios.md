# QA Hidden Accounts Scenarios

A manual checklist for verifying "Hide requests from this account" in the Praying For You mobile
app. It is written for the owner (not a developer). The detailed scenario checkboxes below are
preserved as the reusable test procedure. The dated QA Execution Record is the authoritative result
for the completed 2026-08-16 session.

**Status: FIREBASE-MODE MANUAL QA PASSED, 2026-08-16.** The owner completed the physical-device
walkthrough through Expo Go after publishing the updated Firestore rules. Scenarios 1 through 11
and 13 through 19 passed with zero defects. Scenario 12 was not manually reachable because a
successful hide immediately removes every entry point to that account; its deterministic document
behavior passed automated rules testing. Scenario 20, which applies only to local/mock mode, is
deferred because external beta uses Firebase. Scenarios 14 and 21 passed through automated tests.

## QA Execution Record

| Item | Result | Evidence or disposition |
| --- | --- | --- |
| Environment | Passed | Physical phone through Expo Go, Firebase mode, 2026-08-16 |
| Published rules | Passed | Owner confirmed the complete updated Firestore rules were published before manual QA |
| Scenarios 1 through 9 | Passed | Named and Anonymous hiding, detail and post-report entry points, current and future requests, filters, prayed-for list, and unhide all behaved as specified |
| Scenario 10 | Passed | Named and Anonymous privacy labels were verified sequentially; no name, email, or raw UID was exposed from an Anonymous hide |
| Scenario 11 | Passed | Self-hide controls were absent while normal owner controls remained available |
| Scenario 12 | Automated pass | No manual entry point remained after hiding, by design. The client uses one deterministic `{blockerUid}_{hiddenUid}` document and the rules test confirms a repeat write cannot create a duplicate |
| Scenario 13 | Passed | Hide persisted across a full Expo Go restart and sign-out/sign-in |
| Scenario 14 | Automated pass | `npm run test:rules` passed 74 of 74 tests on 2026-08-16, including permission-denial and private-query coverage |
| Scenario 15 | Passed with standalone cold start deferred | With the app already loaded, a safe device-level network interruption never exposed Account B. Normal filtered loading resumed after reconnect. A true offline cold start remains assigned to a standalone build because Expo Go depends on its development server |
| Scenarios 16 through 19 | Passed | Account-deletion cleanup, prayer-count preservation, reporting regression, and request CRUD regression all behaved as specified |
| Scenario 20 | Deferred | Local/mock mode only. External beta uses Firebase, so this does not block the user-hiding beta gate |
| Scenario 21 | Automated pass | `npm run test:hidden-accounts` passed 18 of 18 tests on 2026-08-16, including malformed-storage fail-closed behavior |
| Defects found | 0 | No implementation defect was observed during this QA session |

**Disposition:** The user-hiding portion of the UGC Compliance Blocker is closed for the controlled
Firebase-backed beta. This does not close the separate pre-publication content-filtering work or
any other unfinished UGC compliance item.

**Automated coverage versus manual QA.** Some behavior in this feature, in particular how the app
responds to a denied or failed Firestore write/read, is proven by automated tests against the
Firebase Local Emulator or plain Node, not by hand on a device. This document never instructs the
owner to weaken, replace, or temporarily reconfigure the **production** Firestore rules in order
to manually observe a permission-denial. Doing so risks leaving production insecure if the rules
are not correctly restored afterward, and is unnecessary: the same denial paths are already
covered by `mobile-app/firebase-tests/tests/hiddenAccounts.test.mjs`, run against the emulator via
`npm run test:rules`, which never touches the production project. Scenarios 14 and 15 below
describe what that automated coverage already proves, and separately describe the one **safe**,
device-level failure this document does ask the owner to test by hand: a network interruption,
which requires no change to any security configuration.

## Purpose

This checklist verifies that hiding an account removes all of that account's current and future
prayer requests from the hider's feed, detail screen, and "Prayers I've prayed for," across every
sort and filter; that the identity behind an Anonymous request is never revealed anywhere in the
flow; that hiding is one-directional, reversible, and does not affect prayer counts, interactions,
or reports; and that account deletion cleans up the deleting user's own outgoing hides.

What is out of scope here (do not test these):

- Pre-publication content filtering, Terms-acceptance changes, or age-gate changes: not part of
  this feature.
- Mutual/two-way blocking, admin dashboards, notifications, comments, direct messages, public
  profiles, or follow systems: not built.
- Whether the underlying report-review process is timely: covered by
  `docs/QA_report_scenarios.md`, not this document.

## Before You Start

- [ ] Expo is running with `npx expo start -c`
- [ ] Firebase Console is open to Firestore Database → Data → `hiddenAccounts`
- [ ] Firebase Console is open to Firestore Database → Data → `prayerRequests`
- [ ] Firebase Console is open to Authentication → Users
- [ ] Testing uses at least three throwaway accounts (Account A the tester, Account B to be
      hidden, Account C an uninvolved account for the one-directional check)
- [ ] `.env.local` is saved locally and not committed
- [ ] **The updated Firestore rules are published.** This phase adds the `hiddenAccounts` block to
      `mobile-app/firestore.rules`. Publish the FULL file in the Firebase Console (Firestore
      Database → Rules → Publish) before testing, or every hide/unhide attempt will be denied.
- [ ] Account B has at least one named (not Anonymous) active prayer request
- [ ] Account B has at least one Anonymous active prayer request
- [ ] Account B's requests span more than one category, so category-filter coverage can be checked

> Tip: keep a Firestore tab on the `hiddenAccounts` collection so you can watch a document appear
> and disappear. Confirm it contains only opaque UIDs, a boolean, a timestamp, and at most a
> `displayLabelSnapshot` string, and never an email, `body`, `reason`, or device field.

## Scenario 1: Hide From a Named Feed Card

- [ ] Sign in as Account A
- [ ] In the feed, find Account B's named request
- [ ] Tap the overflow control on the card
- [ ] Confirm the confirmation dialog title reads "Hide requests from this account?"
- [ ] Confirm the body includes both required sentences, including "This does not prevent them
      from seeing prayer requests you share with the community."
- [ ] Tap "Hide requests"
- [ ] Confirm the success message reads "Requests from this account are now hidden."
- [ ] Confirm the card disappears from the feed without a visible flash
- [ ] Confirm `hiddenAccounts/{A's uid}_{B's uid}` exists in Firestore with a
      `displayLabelSnapshot` matching Account B's display name, and `fromAnonymous: false`

## Scenario 2: Hide From an Anonymous Feed Card

- [ ] As Account A, unhide Account B first if still hidden from Scenario 1 (Settings → Hidden
      accounts → Unhide), so this scenario starts clean
- [ ] Find Account B's Anonymous request in the feed
- [ ] Tap the overflow control, confirm, and hide it
- [ ] Confirm the success message and disappearance, same as Scenario 1
- [ ] Confirm `hiddenAccounts/{A's uid}_{B's uid}` exists with `fromAnonymous: true` and **no**
      `displayLabelSnapshot` field at all

## Scenario 3: Hide From the Detail Screen

- [ ] Unhide Account B (Settings)
- [ ] Open one of Account B's requests from the feed
- [ ] Tap "Hide requests from this account" near "Report this request"
- [ ] Confirm and complete the hide
- [ ] Confirm the success message appears
- [ ] Confirm the app returns to the feed automatically (no manual back navigation needed)
- [ ] Confirm Account B no longer appears anywhere in the feed

## Scenario 4: Optional Hide After Reporting

- [ ] Unhide Account B
- [ ] Report one of Account B's requests (any reason)
- [ ] On the "Thank you for letting us know" screen, confirm a "Hide requests from this account"
      option is offered
- [ ] Tap it, confirm, and complete the hide
- [ ] Confirm the screen shows "Requests from this account are now hidden."
- [ ] Confirm `reports/{A's uid}_{requestId}` still exists, unchanged by the hide
- [ ] Tap "Done" and confirm the app returns to the feed, not to the (now-hidden) request's detail
      screen and not to a "Prayer not found" screen

## Scenario 5: All Existing Requests From the Account Disappear

- [ ] With Account B hidden (from any scenario above), confirm **every** active request authored
      by Account B is gone from the feed, not just the one used to trigger the hide
- [ ] Open "My prayer requests" and "Prayers I've prayed for" (if Account A has prayed for any of
      Account B's requests) and confirm none of Account B's requests appear there either

## Scenario 6: Future Requests From the Account Remain Hidden

- [ ] With Account B still hidden, sign in as Account B on a second device or session
- [ ] Submit a brand-new prayer request as Account B
- [ ] Sign back in as Account A and pull-to-refresh the feed
- [ ] Confirm the new request from Account B does **not** appear

## Scenario 7: Feed Sorts and Filters Respect Hidden Accounts

With Account B hidden and at least one other active request visible:

- [ ] Newest sort: confirm no Account B request appears
- [ ] Most-prayed sort: confirm no Account B request appears, even if it would otherwise rank high
- [ ] Filter by one of Account B's categories: confirm the filtered results contain no Account B
      request (other accounts' requests in that category still appear if any exist)
- [ ] "To pray for" / unprayed filter: confirm no Account B request appears
- [ ] Reset filters: confirm the feed still excludes Account B entirely

## Scenario 8: Prayers I've Prayed For Respects Hidden Accounts

- [ ] Before hiding Account B, as Account A, pray for one of Account B's requests
- [ ] Confirm it appears under "Prayers I've prayed for"
- [ ] Hide Account B
- [ ] Confirm that request no longer appears under "Prayers I've prayed for"

## Scenario 9: Unhide Restores Eligible Active Requests

- [ ] With Account B hidden, go to Settings → Hidden accounts
- [ ] Confirm Account B's entry appears, labeled correctly (see Scenario 10)
- [ ] Tap "Unhide"
- [ ] Confirm a confirmation dialog appears before anything changes
- [ ] Confirm the action
- [ ] Return to the feed and confirm Account B's active requests reappear, in the correct sort
      order, without needing to force-quit the app

## Scenario 10: Hidden Identity Is Not Revealed

Run these checks sequentially because one Account A to Account B relationship uses one
deterministic Firestore document. A named and Anonymous hide for the same account cannot exist as
two simultaneous entries.

- [ ] After hiding from a named request, confirm the Settings entry shows Account B's display name
- [ ] Unhide Account B, then hide it from an Anonymous request
- [ ] Confirm the new entry shows the exact text "Account hidden from an Anonymous request," never
      a real name
- [ ] Confirm no raw Firebase UID is visible in either sequential check
- [ ] Confirm neither entry's date, label, or any visible text reveals anything about the
      Anonymous request's real author beyond what Account A already knew by choosing to hide it

## Scenario 11: Self-Hide Is Unavailable

- [ ] As Account A, open one of Account A's own requests in the feed and in detail
- [ ] Confirm no "Hide requests from this account" control appears in either place, on the card or
      on the detail screen

## Scenario 12: Duplicate Hide Is a No-Op

- [ ] With Account B already hidden, attempt to trigger a hide on Account B again if any entry
      point is still reachable (for example, a cached detail link)
- [ ] Confirm this does not produce an error and does not create a second document in
      `hiddenAccounts` (still exactly one `{A}_{B}` document)

## Scenario 13: Persistence Across Restart and Sign-In

- [ ] With Account B hidden, fully close and reopen Expo Go
- [ ] Sign in as Account A again
- [ ] Confirm Account B is still hidden (absent from the feed, present in Settings → Hidden
      accounts)
- [ ] Sign out and sign back in as Account A without restarting the app
- [ ] Confirm the same result

## Scenario 14: Firebase Permission Failures Use Safe Copy (Automated, Not Manual)

This is validated by the automated Firestore rules tests, not by hand on a device, and this
document does not ask the owner to test it manually. Manually reproducing a permission denial
against the real project would require temporarily replacing or weakening the production
Firestore rules, which risks leaving production insecure if they are not correctly restored
afterward; that is never an acceptable way to test this app.

- [ ] Confirm `npm run test:rules` (run from `mobile-app/`) passes, including
      `firebase-tests/tests/hiddenAccounts.test.mjs`. This runs entirely against the Firebase
      Local Emulator Suite, never the production project, and proves that a denied hide/unhide
      write is rejected by the rules exactly as designed (self-hide, cross-user writes, prohibited
      fields, and unauthenticated attempts all covered)
- [ ] Confirm by code review, not device observation, that `src/services/firebase/hiddenAccountErrors.ts`
      maps a Firestore `permission-denied` result to calm, non-technical copy (never a raw Firebase
      error code or stack trace); this is a code-level guarantee shared with every other Firebase
      write in the app, not something specific to test live

## Scenario 15: Hidden-List Loading Failures Do Not Expose Content

The "no query can reveal content past a denied read" guarantee is proven by the automated rules
tests (Scenario 14's checklist). This scenario adds one **safe**, device-level test for a genuine
network failure, which requires no change to any security configuration.

- [ ] Confirm `firebase-tests/tests/hiddenAccounts.test.mjs` includes tests for denied `list`
      attempts (unfiltered enumeration, another user's `blockerUid`, and a query filtered by
      `hiddenUid`); confirm all pass under `npm run test:rules`
- [ ] With Account B hidden, turn on Airplane Mode (or otherwise fully disconnect the device from
      the network), then fully close and reopen Expo Go so nothing is cached, and sign in again if
      prompted
- [ ] Attempt to open the feed while still offline
- [ ] Confirm the app shows its existing "Couldn't load the feed" error state, not an unfiltered
      feed that includes Account B's requests
- [ ] Restore the network connection and confirm the feed loads correctly, with Account B still
      hidden

## Scenario 16: Account Deletion Cleans Up Outgoing Records

- [ ] As Account A, with Account B hidden, delete Account A's account from Settings
- [ ] Confirm deletion completes normally (matches the existing behavior in
      `docs/QA_delete_scenarios.md`)
- [ ] In Firestore, confirm `hiddenAccounts/{A's uid}_{B's uid}` no longer exists
- [ ] Separately, as a different account (Account C), hide Account A's account (before deleting
      it, or using a fresh Account A if already deleted) to create an INCOMING hide record
      referencing Account A, then delete Account A
- [ ] Confirm that Account C's hide record referencing Account A's now-deleted uid is **not**
      removed (this is intentional; see the implementation doc's Account-deletion cleanup section)

## Scenario 17: Existing Prayer Counts and Interactions Do Not Change

- [ ] Note the prayer count on one of Account B's requests before hiding
- [ ] Hide Account B
- [ ] Unhide Account B
- [ ] Confirm the prayer count on that request is unchanged
- [ ] If Account A had prayed for that request before hiding, confirm it still shows as "prayed"
      after unhiding

## Scenario 18: Existing Reporting Behavior Does Not Regress

- [ ] Report a request from an account that is not hidden
- [ ] Confirm the reporting flow behaves exactly as documented in `docs/QA_report_scenarios.md`
      (reason picker, optional note, calm confirmation, duplicate handling)
- [ ] Confirm hiding an account never happens automatically as a side effect of reporting
- [ ] On the "Thank you for letting us know" screen, do **not** tap "Hide requests from this
      account," then tap "Done"; confirm this preserves the original, verified behavior (the app
      returns to the previous screen, exactly as it did before this feature existed)

## Scenario 19: Existing Request Creation, Editing, Removal, and Deletion Do Not Regress

- [ ] As any account, submit a new prayer request and confirm it appears normally
- [ ] Edit one of your own requests and confirm the edit is reflected
- [ ] Remove one of your own requests and confirm it leaves the feed
- [ ] Confirm none of the above is affected by any hidden-account state

## Scenario 20: Local/Mock Behavior (No Firebase Configured)

Run with no `.env.local` present, so the app runs in local/mock mode.

- [ ] Hide one of the seeded mock accounts that posts anonymously (for example the account behind
      request `prayer-003`, seeded as `user-secret-1`, anonymous)
- [ ] Confirm its request disappears from the feed
- [ ] Confirm the Settings "Hidden accounts" entry shows "Account hidden from an Anonymous
      request," not a name
- [ ] Hide a seeded mock account that posts with a name and confirm the entry shows that name
- [ ] Fully close and reopen Expo Go (still no `.env.local`) and confirm both hides persisted
      on-device
- [ ] Unhide one of them and confirm its requests reappear
- [ ] Delete the local account from Settings, matching the existing local account-deletion flow
- [ ] Confirm deletion completes normally, with no crash or stuck state
- [ ] Fully close and reopen Expo Go, create a new local profile, and confirm no previously-hidden
      account is still hidden (the on-device `p4u.hiddenAccounts` storage was cleared by deletion,
      not left behind for the next local profile)

## Scenario 21: Local Storage Corruption Fails Closed (Automated, Not Manual)

Deliberately corrupting on-device storage to observe the failure is not practical to do by hand
through the Expo Go UI, and is not required: the fail-closed parsing logic is pure and fully
covered by automated unit tests, isolated from AsyncStorage and React Native.

- [ ] Confirm `npm run test:hidden-accounts` (run from `mobile-app/`) passes, including
      `src/utils/hiddenAccountStorage.test.ts`, which proves that missing storage correctly
      returns "nothing hidden," while malformed JSON, a non-array value, or an entry with a
      missing or wrongly-typed field all throw rather than silently returning an empty list
- [ ] Confirm by code review that `src/services/hiddenAccounts.ts`'s `readLocalHidden` and
      `writeLocalHidden` throw on an `AsyncStorage` failure rather than swallowing it, and that
      `PrayerContext.load` lets a hidden-account load failure propagate into the feed's existing
      error state rather than falling back to an unfiltered feed
