# QA Delete Scenarios

A manual checklist for verifying account deletion in the Praying For You mobile app.
It is written for the owner (not a developer). Tap through each step on a phone running
Expo Go, and check the box when the result matches what is described.

## Purpose

This checklist verifies that account deletion works end to end before any Alpha testing with
real users. Account deletion must work before we invite testers, so a person can always remove
their sign-in and private profile.

What this phase covers:

- Deleting the Firebase Authentication sign-in for the current user.
- Deleting that user's private profile document at `users/{uid}` in Firestore.
- Returning the app to the signed-out / welcome state.

What is still out of scope (so do not test these here):

- Prayer requests, prayer interactions (the "prayed for" counts), and reports are still local
to the device and are not in Firestore yet. Deletion does not touch them.

## Before You Start

- [x] Expo is running with `npx expo start -c`
- [x] Firebase Console is open to Authentication → Users
- [x] Firebase Console is open to Firestore Database → Data → users
- [x] Testing uses fresh throwaway accounts only
- [x] `.env.local` is saved locally and not committed
- [x] Current Firestore rules are published

> Tip: keep the two Firebase Console tabs side by side so you can watch the user appear and
> disappear in Authentication and in Firestore as you test.

## Scenario 1: Happy Path Account Deletion

- [x] Create a new throwaway account in the app
- [x] Confirm the account appears in Firebase Authentication
- [x] Confirm `users/{uid}` appears in Firestore
- [x] Confirm the Firestore profile does not contain email
- [x] Go to Settings
- [x] Tap Delete account
- [x] Read the confirmation message
- [x] Confirm deletion
- [x] Confirm the app returns to the signed-out / welcome state
- [x] Confirm the Firebase Auth user is removed
- [x] Confirm the Firestore `users/{uid}` profile is removed
- [x] Fully close and reopen Expo Go
- [x] Confirm the deleted user is not restored

## Scenario 2: Cancel Account Deletion

- [x] Create or sign into a throwaway account
- [x] Open the Delete account flow
- [x] Cancel / back out of the confirmation
- [x] Confirm the user remains signed in
- [x] Confirm the Firebase Auth user still exists
- [x] Confirm the Firestore `users/{uid}` still exists

## Scenario 3: Deleted Account Cannot Sign Back In

- [x] Delete a throwaway account
- [x] Try signing in again with the deleted email / password
- [x] Confirm sign-in fails
- [x] Confirm the error message is friendly and non-technical
- [x] Confirm no Firestore profile is recreated

## Scenario 4: Delete After Fresh Sign-In

- [x] Create a new throwaway account
- [x] Sign out
- [x] Sign back in
- [x] Confirm `lastSignedInAt` updates in the Firestore profile
- [x] Delete account
- [x] Confirm the Auth user is removed
- [x] Confirm the Firestore profile is removed
- [x] Restart the app
- [x] Confirm the signed-out state remains

## Scenario 5: Recent Login Requirement

Firebase sometimes requires a recent sign-in before it will delete a user. This scenario
confirms that case is handled calmly.

- [x] Try deleting after a normal session
- [x] If Firebase asks for a recent login, confirm friendly copy appears
- [x] Confirm the app does not crash
- [x] Confirm the Auth user remains if deletion is blocked
- [x] Confirm the Firestore profile remains if deletion is blocked
- [x] Sign in again and retry deletion if needed

> The friendly copy reads: "For your security, please sign in again before deleting your
> account." Tapping "Sign in again" returns you to the welcome screen so you can sign in fresh
> and retry.

## Scenario 6: Local / Mock Fallback

This checks the app still works with no Firebase configured. Only do this if it is safe and you
are comfortable temporarily moving the config.

- [x] Temporarily test with Firebase config absent or disabled, only if safe and documented
- [x] Confirm local / mock account deletion clears the local profile / session
- [x] Confirm the app does not crash
- [x] Restore the Firebase config afterward

> To test this safely: rename `mobile-app/.env.local` (for example to `.env.local.bak`),
> run `npx expo start -c`, create a local profile, then delete it. Rename the file back when
> done so Firebase mode returns.

## Scenario 7: Data Boundary Check

- [x] Confirm no `prayerRequests` are written to Firestore
- [x] Confirm no `prayerInteractions` are written to Firestore
- [x] Confirm no `reports` are written to Firestore
- [x] Confirm only the Auth user and the `users/{uid}` profile are affected
- [x] Confirm no email is stored in Firestore

## Pass / Fail Summary

- [x] Happy path passed
- [x] Cancel flow passed
- [x] Deleted account cannot sign back in
- [x] Delete after fresh sign-in passed
- [x] Recent-login behavior handled or noted
- [x] Local / mock fallback passed or not tested
- [x] No prayer data touched
- [x] No technical errors shown to the user

## QA Notes

Write any observations here (date, device, what you saw):

```
-
-
-
```

