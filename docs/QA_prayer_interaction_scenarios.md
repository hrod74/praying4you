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

- Reports are still local/mock and are not in Firestore.
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

## Scenario 1: Pray From Feed Card

- [ ] Sign in as Account A
- [ ] Create an active prayer request
- [ ] Confirm the request appears in feed
- [ ] Tap the feed card 🙏 Pray CTA
- [ ] Confirm prayer count increases by 1
- [ ] Confirm UI shows already-prayed state
- [ ] Confirm `prayerInteractions/{uid}_{requestId}` exists in Firestore
- [ ] Confirm no list of who prayed is shown in the UI

> Note: you cannot pray for your own request, so to test the feed CTA, pray as a different account
> than the one that created the request (or create the request with another account first).

## Scenario 2: Duplicate Prayer Prevention

- [ ] Tap 🙏 Pray again on the same request
- [ ] Confirm prayer count does not increase again
- [ ] Confirm no duplicate interaction document is created
- [ ] Confirm app shows calm already-prayed behavior or remains marked prayed

## Scenario 3: Pray From Detail Screen

- [ ] Create or open a different active prayer request
- [ ] Open prayer detail
- [ ] Tap 🙏 I prayed for this
- [ ] Confirm prayer count increases by 1
- [ ] Confirm already-prayed state appears
- [ ] Confirm Firestore interaction doc exists
- [ ] Confirm returning to feed shows updated count/state

## Scenario 4: Multi-user Count

- [ ] Account A creates a prayer request
- [ ] Account B signs in
- [ ] Account B prays for Account A's request
- [ ] Confirm prayer count increases
- [ ] Account C signs in, if available
- [ ] Account C prays for same request
- [ ] Confirm prayer count increases again
- [ ] Confirm no user list is visible anywhere

## Scenario 5: Removed Prayer Request

- [ ] Create a prayer request
- [ ] Remove the request as owner
- [ ] Confirm removed request leaves feed
- [ ] Confirm another user cannot pray for the removed request
- [ ] Confirm no interaction is created for the removed request

> Expected: praying for a removed request fails calmly (no count change, no interaction doc). The
> message may read "This prayer request is no longer available." or, if the request was just removed,
> "We could not complete that request. Please try signing in again." Either is acceptable; the key is
> that no interaction is created and the count does not change.

## Scenario 6: Prayers I've Prayed For

- [ ] Sign in as a user who prayed for one or more requests
- [ ] Open Settings → Your prayer activity → Prayers I've prayed for
- [ ] Confirm prayed-for requests appear
- [ ] Confirm requests not prayed for do not appear
- [ ] Confirm no other users' interaction data is shown

## Scenario 7: Data Boundary Check

- [ ] Confirm no `reports` collection is written
- [ ] Confirm no email is stored in `prayerInteractions`
- [ ] Confirm no email is stored in `prayerRequests`
- [ ] Confirm UI does not show raw user IDs
- [ ] Confirm UI does not show who prayed
- [ ] Confirm verses remain local

## Scenario 8: Local / Mock Fallback

This checks the app still works with no Firebase configured. Only do this if it is safe and you are
comfortable temporarily moving the config.

- [ ] If safe, test Firebase config absent/disabled
- [ ] Confirm local/mock prayed behavior still works (pray, already-prayed, prayed-for list)
- [ ] Confirm the app does not crash
- [ ] Restore Firebase config afterward

> To test safely: rename `mobile-app/.env.local` (for example to `.env.local.bak`), run
> `npx expo start -c`, create a local profile, and pray for a seed request. Rename the file back when
> done so Firebase mode returns.

## Pass / Fail Summary

- [ ] Pray from feed passed
- [ ] Duplicate prevention passed
- [ ] Pray from detail passed
- [ ] Multi-user count passed
- [ ] Removed request protection passed
- [ ] Prayers I've prayed for passed or noted
- [ ] No who-prayed exposure
- [ ] No reports written
- [ ] No emails stored
- [ ] No raw user IDs shown
- [ ] Fallback passed or not tested

## QA Notes

Write any observations here (date, device, what you saw):

```
-
-
-
```

