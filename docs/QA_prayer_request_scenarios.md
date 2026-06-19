# QA Prayer Request Scenarios

A manual checklist for verifying Firestore-backed prayer requests in the Praying For You mobile app.
It is written for the owner (not a developer). Tap through each step on a phone running Expo Go, and
check the box when the result matches what is described.

## Purpose

This checklist verifies that prayer requests create, read, edit, and remove correctly against
Firestore, that anonymous posts stay anonymous, that only the owner can edit or remove a request,
and that no email or "who prayed" data is ever exposed. It also confirms the local/mock fallback
still works.

What this phase covers: the `prayerRequests` collection only. Prayer interactions ("I prayed for
this") and reports are still local and are out of scope here.

## Before You Start

- [x] Expo is running with `npx expo start -c`
- [x] Firebase Console is open to Firestore Database → Data
- [x] Firebase Console is open to Authentication → Users
- [x] Current Firestore rules are published (the updated `mobile-app/firestore.rules`, including `prayerRequests`)
- [x] Testing uses fresh throwaway accounts only

> Tip: keep the Firestore Data tab on the `prayerRequests` collection so you can watch documents
> appear and change as you test. Confirm there is no `email` field on any prayer request document.

## Scenario 1: Create Prayer Request

- [x] Sign in
- [x] Create a new prayer request
- [x] Confirm the request appears in the app feed
- [x] Confirm the request appears in Firestore `prayerRequests`
- [x] Confirm no email is stored on the document
- [x] Confirm `status` is `active`
- [x] Confirm `prayerCount` is `0`
- [x] Confirm `authorUid` exists in Firestore but is not shown anywhere in the UI

## Scenario 2: Anonymous Prayer Request

- [x] Create a request as Anonymous
- [x] Confirm the feed shows "Anonymous"
- [x] Confirm the detail shows "Anonymous"
- [x] Confirm Firestore stores ownership safely (`authorUid` set; `displayName` is "Anonymous"; real name not stored)
- [x] Confirm email is not stored
- [x] Confirm the owner can still edit / remove it

## Scenario 3: Named Prayer Request

- [x] Create a request with your display name
- [x] Confirm the feed shows the display name
- [x] Confirm the detail shows the display name
- [x] Confirm email is not shown anywhere

## Scenario 4: Edit Own Request

- [x] Edit your own request
- [x] Confirm the app updates
- [x] Confirm Firestore updates the allowed fields (body / category / isAnonymous / displayName)
- [x] Confirm `updatedAt` changes
- [x] Confirm protected fields do not change (`authorUid`, `createdAt`, `prayerCount`)

## Scenario 5: Remove Own Request

- [x] Remove your own request
- [x] Confirm the user-facing language says "Remove request"
- [x] Confirm the request disappears from the feed
- [x] Confirm the Firestore `status` becomes `removed`
- [x] Confirm `removedAt` is set
- [x] Confirm the document is NOT hard-deleted (it still exists in Firestore, just `removed`)

## Scenario 6: Non-owner Restrictions

- [x] Create Account A and a request
- [x] Sign out
- [x] Sign in as Account B
- [x] Confirm Account B can view Account A's active request
- [x] Confirm Account B does NOT see edit / remove controls on it
- [x] Confirm Account B cannot edit or remove Account A's request (no controls; rules would also block it)

## Scenario 7: My Prayer Requests

- [x] Sign in as the owner
- [x] Confirm your own requests appear under "My prayer requests"
- [x] Confirm other users' requests do NOT appear there
- [x] Confirm removed requests follow the decided behavior (removed requests are hidden)

## Scenario 8: Fallback Mode

This checks the app still works with no Firebase configured. Only do this if it is safe and you are
comfortable temporarily moving the config.

- [x] If safe, test with the Firebase config absent or disabled
- [x] Confirm local / mock prayer request behavior still works (create / edit / remove on-device)
- [x] Confirm the app does not crash
- [x] Restore the Firebase config afterward

> To test this safely: rename `mobile-app/.env.local` (for example to `.env.local.bak`), run
> `npx expo start -c`, exercise the local feed, then rename the file back when done.

## Scenario 9: Data Boundary Check

- [x] Confirm no `prayerInteractions` collection is written in Firestore
- [x] Confirm no `reports` collection is written in Firestore
- [x] Confirm verses remain local (no verse data in Firestore)
- [x] Confirm no emails appear in `prayerRequests`
- [x] Confirm no "who prayed" data is shown anywhere

## Pass / Fail Summary

- [x] Create passed
- [x] Anonymous passed
- [x] Named passed
- [x] Edit own passed
- [x] Remove own passed
- [x] Non-owner restrictions passed
- [x] My Prayer Requests passed
- [x] Fallback passed or not tested
- [x] No interaction / report data touched
- [x] No email stored

## QA Notes

Write any observations here (date, device, what you saw):

```
-One thing I just realized as I was doing QA we do not have a way to update password or reset password.  We need to add this. 
-
-
```

