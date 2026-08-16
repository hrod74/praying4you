# QA Display Name Rename Scenarios

A manual checklist for verifying display-name propagation in the Praying For You mobile app. It
is written for the owner (not a developer). The detailed scenario checkboxes below are preserved
as the reusable test procedure. The dated QA Execution Record is the authoritative result for the
completed 2026-08-16 session.

**Status: FIREBASE-MODE MANUAL QA PASSED, 2026-08-16.** The owner completed the physical-device
walkthrough through Expo Go after publishing the updated Firestore rules
(`mobile-app/firestore.rules`, the `isLegitimatePublicName` invariant). All 6 scenarios passed
with zero defects.

## QA Execution Record

| Item | Result | Evidence or disposition |
| --- | --- | --- |
| Environment | Passed | Physical phone through Expo Go, Firebase mode, 2026-08-16 |
| Published rules | Passed | Owner confirmed the updated Firestore rules were published before manual QA |
| Scenario 1: Initial rename propagation | Passed, 10/10 | Every active named request updated to the new display name; the Anonymous request stayed "Anonymous"; the rename survived a pull-to-refresh and a full sign-out/sign-in |
| Scenario 2: Visibility from another account | Passed, 8/8 | A second account saw the updated name on the renamed account's requests in the feed and on detail screens; the second account's own data was unaffected |
| Scenario 3: New request and edit behavior | Passed, 8/8 | A newly created named request used the current display name; an existing request edited (without touching the name) kept the current name; toggling a request between named and Anonymous behaved correctly with no stale name ever surfacing |
| Scenario 4: Repeated rename across multiple requests | Passed, 10/10 | Multiple renames in sequence each propagated to every active named request; Anonymous and removed requests stayed unaffected; prayer counts, report counts, and ownership were unchanged across all renames |
| Scenario 5: Hidden-account snapshot privacy | Passed, 10/10 | An existing `displayLabelSnapshot` recorded by another account before the rename stayed on the OLD name after the rename; the renamed account was never shown that it had been hidden or by whom |
| Scenario 6: Stored Firestore data verification | Passed, 10/10 | The `users/{uid}` profile doc and representative `prayerRequests` documents (including the first and a later request) showed the newest name in the Firebase Console; body, category, authorUid, createdAt, prayerCount, and status were all confirmed unchanged |
| Total | 56/56 | |
| Defects found | 0 | No implementation defect was observed during this QA session |

**Disposition:** The display-name propagation portion of the UGC Compliance Blocker's related
work is implemented, rules are published, and physical-device QA has passed. This does not close
the separate pre-publication content-filtering manual QA, which remains pending; see
`docs/QA_content_filter_scenarios.md`.

## Purpose

This checklist verifies that changing an account's display name in Settings propagates to every
active, non-Anonymous prayer request that account owns, everywhere that name is shown, while
leaving Anonymous requests, removed requests, other accounts' data, and hidden-account privacy
records completely unaffected.

What is out of scope here (do not test these as part of this checklist):

- Whether a given display name itself is blocked by the content filter: covered by
  `docs/QA_content_filter_scenarios.md`, not this document.
- "Hide requests from this account" mechanics beyond the snapshot-privacy check in Scenario 5:
  covered by `docs/QA_hidden_accounts_scenarios.md`.
- Reporting, prayer interactions, Terms acceptance, and age gating: unaffected by this feature.

## Before You Start

- [ ] Expo is running with `npx expo start -c`
- [ ] **The updated Firestore rules are published.** This feature adds the `isLegitimatePublicName`
      invariant to `mobile-app/firestore.rules`. Publish the FULL file in the Firebase Console
      (Firestore Database -> Rules -> Publish) before testing, or a rename attempt will be denied.
- [ ] At least two Firebase-mode test accounts (Account A, the account being renamed; Account B,
      an uninvolved account for the visibility check)
- [ ] Account A has at least 2 active named prayer requests and at least 1 active Anonymous
      request
- [ ] Firebase Console is open to Firestore Database -> Data -> `users` and `prayerRequests`
- [ ] Account B (or a third account) has hidden Account A from a named request before the rename,
      so Scenario 5 has an existing snapshot to check

## Scenario 1: Initial Rename Propagation

- [ ] Sign in as Account A
- [ ] Note the current display name and the name shown on Account A's existing named requests
- [ ] Go to Settings, edit the display name to a new value, and save
- [ ] Confirm the "Profile updated." confirmation appears
- [ ] Confirm Settings now shows the new name
- [ ] Confirm every one of Account A's active named requests in the feed shows the new name
- [ ] Confirm Account A's active Anonymous request still shows "Anonymous"
- [ ] Pull-to-refresh the feed and confirm the new name still shows
- [ ] Sign out and sign back in as Account A; confirm the new name persists everywhere it appeared
      before
- [ ] Confirm the request bodies, categories, and prayer counts are unchanged

## Scenario 2: Visibility From Another Account

- [ ] Sign in as Account B
- [ ] Open the feed and confirm Account A's named requests show the renamed name
- [ ] Open one of Account A's request detail screens and confirm the same
- [ ] Confirm Account A's Anonymous request still shows "Anonymous" to Account B
- [ ] Confirm Account B's own requests are unaffected
- [ ] Confirm any other account's requests are unaffected
- [ ] Pull-to-refresh as Account B and confirm the renamed name still shows
- [ ] Sign out and sign back in as Account B; confirm the renamed name still shows

## Scenario 3: New Request and Edit Behavior

- [ ] As the renamed Account A, create a new named prayer request
- [ ] Confirm it uses the current (new) display name, not any earlier cached name
- [ ] Edit an existing request's body or category without touching the name; save
- [ ] Confirm the edited request still shows the current display name
- [ ] Edit a request to switch it to Anonymous; confirm it now shows "Anonymous"
- [ ] Edit that same request back to named; confirm it shows the current display name, not an
      older one
- [ ] Confirm the prayer-request form never offers a free-text field for the display name itself
- [ ] Confirm there is no way in the UI to submit a named request under a different name than the
      current profile

## Scenario 4: Repeated Rename Across Multiple Requests

- [ ] With Account A having several (5 or more) active named requests, rename the display name
      again to a third value
- [ ] Confirm every active named request updates to the third name
- [ ] Confirm the Anonymous request still shows "Anonymous"
- [ ] Confirm any removed/soft-deleted request is unaffected (not resurrected, not changed)
- [ ] Rename a fourth time and confirm propagation happens again across all active named requests
- [ ] Confirm no request is left behind on an earlier name
- [ ] Confirm the rename completes promptly with no visible partial or inconsistent state
- [ ] Retry saving the same desired name again (a no-op rename); confirm it completes without
      error and everything stays consistent
- [ ] Confirm prayer counts and report counts are unchanged across all the renames in this
      scenario
- [ ] Confirm ownership is unchanged (the requests still belong to Account A) across all renames

## Scenario 5: Hidden-Account Snapshot Privacy

- [ ] Confirm the pre-existing hide from "Before You Start" is present: as the hiding account, go
      to Settings -> Hidden accounts and note the snapshot name shown for Account A
- [ ] With Account A already renamed (from the scenarios above), check Settings -> Hidden accounts
      again as the hiding account
- [ ] Confirm the snapshot still shows the OLD name captured at the time of hiding, not the new
      name
- [ ] Confirm Account A's requests remain hidden from the hiding account's feed after the rename
- [ ] Confirm Account A has no way to see that they were hidden or by whom
- [ ] Separately, hide Account A from an Anonymous request (if not already covered elsewhere) and
      confirm the entry reads "Account hidden from an Anonymous request," unaffected by any rename
- [ ] Confirm "Unhide" still works normally after the rename
- [ ] In the Firebase Console, confirm no `hiddenAccounts` document was created, modified, or
      deleted by the rename operation
- [ ] Confirm the hidden-account list is scoped to the hiding account only (Account A cannot see
      it)
- [ ] Confirm the rest of Account A's account behaves normally despite being hidden by another
      account

## Scenario 6: Stored Firestore Data Verification

- [ ] In the Firebase Console, open `users/{Account A's uid}`
- [ ] Confirm `displayName` equals the newest name
- [ ] Confirm `updatedAt` is recent
- [ ] Open the FIRST active named request created by Account A in `prayerRequests`
- [ ] Confirm its `displayName` equals the newest name and `updatedAt` is recent
- [ ] Open a LATER active named request (ideally the most recently created one) owned by Account A
- [ ] Confirm its `displayName` equals the newest name and `updatedAt` is recent
- [ ] Confirm `body`, `category`, `authorUid`, `createdAt`, `prayerCount`, and `status` are
      unchanged on both requests from before the rename
- [ ] Confirm the Anonymous request's `displayName` field still literally reads `"Anonymous"`
- [ ] Confirm no other account's `prayerRequests` document, and no `hiddenAccounts` document, was
      modified

## Notes for Future Runs

If this checklist is run again (a re-verification, or after a future change to this feature),
record the result the same way this document already does: update the dated status line at the
top, add or update the QA Execution Record table, and note any defects found. This detailed
scenario procedure below the record is written to be reusable, not a one-time artifact.
