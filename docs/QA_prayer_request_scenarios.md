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

- [ ] Expo is running with `npx expo start -c`
- [ ] Firebase Console is open to Firestore Database → Data
- [ ] Firebase Console is open to Authentication → Users
- [ ] Current Firestore rules are published (the updated `mobile-app/firestore.rules`, including `prayerRequests`)
- [ ] Testing uses fresh throwaway accounts only

> Tip: keep the Firestore Data tab on the `prayerRequests` collection so you can watch documents
> appear and change as you test. Confirm there is no `email` field on any prayer request document.

## Scenario 1: Create Prayer Request

- [ ] Sign in
- [ ] Create a new prayer request
- [ ] Confirm the request appears in the app feed
- [ ] Confirm the request appears in Firestore `prayerRequests`
- [ ] Confirm no email is stored on the document
- [ ] Confirm `status` is `active`
- [ ] Confirm `prayerCount` is `0`
- [ ] Confirm `authorUid` exists in Firestore but is not shown anywhere in the UI

## Scenario 2: Anonymous Prayer Request

- [ ] Create a request as Anonymous
- [ ] Confirm the feed shows "Anonymous"
- [ ] Confirm the detail shows "Anonymous"
- [ ] Confirm Firestore stores ownership safely (`authorUid` set; `displayName` is "Anonymous"; real name not stored)
- [ ] Confirm email is not stored
- [ ] Confirm the owner can still edit / remove it

## Scenario 3: Named Prayer Request

- [ ] Create a request with your display name
- [ ] Confirm the feed shows the display name
- [ ] Confirm the detail shows the display name
- [ ] Confirm email is not shown anywhere

## Scenario 4: Edit Own Request

- [ ] Edit your own request
- [ ] Confirm the app updates
- [ ] Confirm Firestore updates the allowed fields (body / category / isAnonymous / displayName)
- [ ] Confirm `updatedAt` changes
- [ ] Confirm protected fields do not change (`authorUid`, `createdAt`, `prayerCount`)

## Scenario 5: Remove Own Request

- [ ] Remove your own request
- [ ] Confirm the user-facing language says "Remove request"
- [ ] Confirm the request disappears from the feed
- [ ] Confirm the Firestore `status` becomes `removed`
- [ ] Confirm `removedAt` is set
- [ ] Confirm the document is NOT hard-deleted (it still exists in Firestore, just `removed`)

## Scenario 6: Non-owner Restrictions

- [ ] Create Account A and a request
- [ ] Sign out
- [ ] Sign in as Account B
- [ ] Confirm Account B can view Account A's active request
- [ ] Confirm Account B does NOT see edit / remove controls on it
- [ ] Confirm Account B cannot edit or remove Account A's request (no controls; rules would also block it)

## Scenario 7: My Prayer Requests

- [ ] Sign in as the owner
- [ ] Confirm your own requests appear under "My prayer requests"
- [ ] Confirm other users' requests do NOT appear there
- [ ] Confirm removed requests follow the decided behavior (removed requests are hidden)

## Scenario 8: Fallback Mode

This checks the app still works with no Firebase configured. Only do this if it is safe and you are
comfortable temporarily moving the config.

- [ ] If safe, test with the Firebase config absent or disabled
- [ ] Confirm local / mock prayer request behavior still works (create / edit / remove on-device)
- [ ] Confirm the app does not crash
- [ ] Restore the Firebase config afterward

> To test this safely: rename `mobile-app/.env.local` (for example to `.env.local.bak`), run
> `npx expo start -c`, exercise the local feed, then rename the file back when done.

## Scenario 9: Data Boundary Check

- [ ] Confirm no `prayerInteractions` collection is written in Firestore
- [ ] Confirm no `reports` collection is written in Firestore
- [ ] Confirm verses remain local (no verse data in Firestore)
- [ ] Confirm no emails appear in `prayerRequests`
- [ ] Confirm no "who prayed" data is shown anywhere

## Pass / Fail Summary

- [ ] Create passed
- [ ] Anonymous passed
- [ ] Named passed
- [ ] Edit own passed
- [ ] Remove own passed
- [ ] Non-owner restrictions passed
- [ ] My Prayer Requests passed
- [ ] Fallback passed or not tested
- [ ] No interaction / report data touched
- [ ] No email stored

## QA Notes

Write any observations here (date, device, what you saw):

```
-
-
-
```
