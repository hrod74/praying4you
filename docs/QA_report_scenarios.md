# QA Report Scenarios

## Current Status

**PASSED WITH EXPLICIT DEFERRALS, 2026-08-17.** Scenarios 1 through 6 passed in Firebase mode. The stale pass/fail summary has been reconciled with those completed checks and the published rules evidence. A reporting-specific forced network failure and the local/mock fallback were not manually run; both are explicitly deferred for the controlled external beta, which uses Firebase. The existing error mapper prevents raw Firebase errors, and the mode-aware local reporting seam remains implemented. No known reporting defect remains.

A manual checklist for verifying Firestore-backed reporting ("Report this request") in the Praying For
You mobile app. It is written for the owner (not a developer). Tap through each step on a phone running
Expo Go, and check the box when the result matches what is described.

## Purpose

This checklist verifies that reporting an active prayer request stores a **private** report in
Firestore for **manual Console review**, that duplicates and self-reports are blocked, and that the app
never exposes who reported anything. It is lightweight by design: there is no admin dashboard, no
notifications, and no automatic removal in this phase.

What is out of scope here (do not test these):

- No admin UI, push notifications, AI moderation, email, or auto-removal/blocking.
- Account-deletion cleanup of reports/interactions is a later phase.
- There is deliberately no "who reported" list anywhere; confirming its absence is part of the test.

## Before You Start

- [x] Expo is running with `npx expo start -c`
- [x] Firebase Console is open to Firestore Database → Data
- [x] Firebase Console is open to Authentication → Users
- [x] Current Firestore rules are published (the updated `mobile-app/firestore.rules`, J.2g)
- [x] Testing uses throwaway accounts
- [x] At least one active prayer request exists, created by a different account than the reporter

> Important: the rules were updated for this phase. Publish the FULL `mobile-app/firestore.rules` in
> the Firebase Console (Firestore Database → Rules → Publish) before testing, or reporting will be
> denied.

> Tip: keep a Firestore tab on the `reports` collection so you can watch a report document appear.
> Confirm it contains only opaque UIDs, a reason, a status, a timestamp (and an optional note), and
> no email, display name, or phone.

## Scenario 1: Report Another User's Active Request

- [x] Sign in as Account B (not the request's author)
- [x] Open a request created by Account A
- [x] Tap "Report this request"
- [x] Pick a reason (optionally add a note)
- [x] Submit the report
- [x] Confirm a calm thank-you / confirmation appears
- [x] Confirm `reports/{uid}_{requestId}` exists in Firestore
- [x] Confirm the report has `status: open` and a valid `reason`
- [x] Confirm no list of who reported is shown anywhere in the app

## Scenario 2: Attempt Duplicate Report

- [x] As the same account, open the same request again
- [x] Try to report it again
- [x] Confirm the app shows the calm "already reported" thank-you (no error)
- [x] Confirm no second/duplicate report document is created in Firestore

## Scenario 3: Attempt To Report Own Request

- [x] Sign in as the request's author (Account A)
- [x] Open your own request
- [x] Confirm there is no report entry point, or that reporting is blocked calmly
- [x] Confirm no report document is created for your own request

## Scenario 4: Attempt To Report A Removed Request

- [x] As the author, remove one of your requests
- [x] Confirm it leaves the feed
- [x] As another account, attempt to report that removed request (e.g. via a stale view)
- [x] Confirm reporting is blocked calmly ("no longer available")
- [x] Confirm no report document is created for the removed request

## Scenario 5: Firestore Report Document Check

- [x] In Firestore, open a created report document
- [x] Confirm `reporterUid`, `requestId`, `requestAuthorUid`, `reason`, `status`, `createdAt`,
      `schemaVersion` are present
- [x] Confirm there is NO email field
- [x] Confirm there is NO display name or phone field
- [x] Confirm `status` is `open`

## Scenario 6: Privacy / Data Boundary Check

- [x] Confirm the app never shows a list of reports
- [x] Confirm the app never shows who reported a request
- [x] Confirm raw user IDs are not shown anywhere in the UI
- [x] Confirm no email is stored in `reports`, `prayerRequests`, or `prayerInteractions`
- [x] Confirm who-prayed data is still not exposed

## Scenario 7: Calm Success / Error Copy

- [x] Confirm the success message is gentle and reassuring: directly confirmed in Scenario 1.
- [ ] If you can simulate a network drop, confirm a calm "could not connect" message (no raw error)
- [x] Confirm no raw Firebase error text is ever shown: no raw error appeared in the completed Firebase scenarios; the current report error mapper returns only controlled user-facing copy.

> **Explicit deferral, 2026-08-17:** a reporting-specific forced network failure was not manually
> reproduced. The app's current error mapper has dedicated calm network copy and does not expose raw
> Firebase errors. This narrow failure-injection check does not block the controlled beta.

## Scenario 8: Local / Mock Fallback

This checks the app still works with no Firebase configured. Only do this if it is safe and you are
comfortable temporarily moving the config.

- [ ] If safe, test with Firebase config absent/disabled
- [ ] Confirm local/mock reporting still works (report flow completes calmly)
- [ ] Confirm the app does not crash
- [ ] Restore Firebase config afterward

> To test safely: rename `mobile-app/.env.local` (for example to `.env.local.bak`), run
> `npx expo start -c`, exercise the report flow on a seed request, then rename the file back.

> **Explicit deferral, 2026-08-17:** local/mock reporting was not manually rerun. The external beta
> uses Firebase, and the mode-aware local reporting seam remains implemented. This fallback check is
> deferred and is not recorded as a manual pass.

## Pass / Fail Summary

- [x] Report another user's active request passed
- [x] Duplicate report blocked (calm)
- [x] Report own request blocked
- [x] Report removed request blocked
- [x] Report document has the right fields and `status: open`
- [x] No email / display name / phone stored: Scenario 5 passed and the rules allow only the documented report fields.
- [x] No who-reported list or raw user IDs shown: Scenario 6 passed and cross-user report reads/lists are denied by rules.
- [x] Calm success/error copy (no raw Firebase errors): success copy passed; reporting-specific network failure injection is explicitly deferred above.
- [x] Local/mock fallback passed or not tested: not manually tested; explicitly deferred above because external beta uses Firebase.

## QA Notes

Write any observations here (date, device, what you saw):

```
- 2026-08-17: reconciled the stale summary against the already-completed Firebase scenarios and
  published rules evidence. Stored-field privacy and identity-boundary checks were already passed.
  Reporting-specific network failure injection and local/mock reporting remain explicit,
  non-blocking deferrals for the controlled Firebase beta.
```
