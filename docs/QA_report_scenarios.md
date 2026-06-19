# QA Report Scenarios

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

- [ ] Expo is running with `npx expo start -c`
- [ ] Firebase Console is open to Firestore Database → Data
- [ ] Firebase Console is open to Authentication → Users
- [ ] Current Firestore rules are published (the updated `mobile-app/firestore.rules`, J.2g)
- [ ] Testing uses throwaway accounts
- [ ] At least one active prayer request exists, created by a different account than the reporter

> Important: the rules were updated for this phase. Publish the FULL `mobile-app/firestore.rules` in
> the Firebase Console (Firestore Database → Rules → Publish) before testing, or reporting will be
> denied.

> Tip: keep a Firestore tab on the `reports` collection so you can watch a report document appear.
> Confirm it contains only opaque UIDs, a reason, a status, a timestamp (and an optional note) — and
> no email, display name, or phone.

## Scenario 1: Report Another User's Active Request

- [ ] Sign in as Account B (not the request's author)
- [ ] Open a request created by Account A
- [ ] Tap "Report this request"
- [ ] Pick a reason (optionally add a note)
- [ ] Submit the report
- [ ] Confirm a calm thank-you / confirmation appears
- [ ] Confirm `reports/{uid}_{requestId}` exists in Firestore
- [ ] Confirm the report has `status: open` and a valid `reason`
- [ ] Confirm no list of who reported is shown anywhere in the app

## Scenario 2: Attempt Duplicate Report

- [ ] As the same account, open the same request again
- [ ] Try to report it again
- [ ] Confirm the app shows the calm "already reported" thank-you (no error)
- [ ] Confirm no second/duplicate report document is created in Firestore

## Scenario 3: Attempt To Report Own Request

- [ ] Sign in as the request's author (Account A)
- [ ] Open your own request
- [ ] Confirm there is no report entry point, or that reporting is blocked calmly
- [ ] Confirm no report document is created for your own request

## Scenario 4: Attempt To Report A Removed Request

- [ ] As the author, remove one of your requests
- [ ] Confirm it leaves the feed
- [ ] As another account, attempt to report that removed request (e.g. via a stale view)
- [ ] Confirm reporting is blocked calmly ("no longer available")
- [ ] Confirm no report document is created for the removed request

## Scenario 5: Firestore Report Document Check

- [ ] In Firestore, open a created report document
- [ ] Confirm `reporterUid`, `requestId`, `requestAuthorUid`, `reason`, `status`, `createdAt`,
      `schemaVersion` are present
- [ ] Confirm there is NO email field
- [ ] Confirm there is NO display name or phone field
- [ ] Confirm `status` is `open`

## Scenario 6: Privacy / Data Boundary Check

- [ ] Confirm the app never shows a list of reports
- [ ] Confirm the app never shows who reported a request
- [ ] Confirm raw user IDs are not shown anywhere in the UI
- [ ] Confirm no email is stored in `reports`, `prayerRequests`, or `prayerInteractions`
- [ ] Confirm who-prayed data is still not exposed

## Scenario 7: Calm Success / Error Copy

- [ ] Confirm the success message is gentle and reassuring
- [ ] If you can simulate a network drop, confirm a calm "could not connect" message (no raw error)
- [ ] Confirm no raw Firebase error text is ever shown

## Scenario 8: Local / Mock Fallback

This checks the app still works with no Firebase configured. Only do this if it is safe and you are
comfortable temporarily moving the config.

- [ ] If safe, test with Firebase config absent/disabled
- [ ] Confirm local/mock reporting still works (report flow completes calmly)
- [ ] Confirm the app does not crash
- [ ] Restore Firebase config afterward

> To test safely: rename `mobile-app/.env.local` (for example to `.env.local.bak`), run
> `npx expo start -c`, exercise the report flow on a seed request, then rename the file back.

## Pass / Fail Summary

- [ ] Report another user's active request passed
- [ ] Duplicate report blocked (calm)
- [ ] Report own request blocked
- [ ] Report removed request blocked
- [ ] Report document has the right fields and `status: open`
- [ ] No email / display name / phone stored
- [ ] No who-reported list or raw user IDs shown
- [ ] Calm success/error copy (no raw Firebase errors)
- [ ] Local/mock fallback passed or not tested

## QA Notes

Write any observations here (date, device, what you saw):

```
-
-
-
```
