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

- [ ] Expo is running with `npx expo start -c`
- [ ] Firebase Console is open to Authentication → Users
- [ ] Firebase Console is open to Firestore Database → Data → users
- [ ] Testing uses fresh throwaway accounts only
- [ ] `.env.local` is saved locally and not committed
- [ ] Current Firestore rules are published

> Tip: keep the two Firebase Console tabs side by side so you can watch the user appear and
> disappear in Authentication and in Firestore as you test.

## Scenario 1: Happy Path Account Deletion

- [ ] Create a new throwaway account in the app
- [ ] Confirm the account appears in Firebase Authentication
- [ ] Confirm `users/{uid}` appears in Firestore
- [ ] Confirm the Firestore profile does not contain email
- [ ] Go to Settings
- [ ] Tap Delete account
- [ ] Read the confirmation message
- [ ] Confirm deletion
- [ ] Confirm the app returns to the signed-out / welcome state
- [ ] Confirm the Firebase Auth user is removed
- [ ] Confirm the Firestore `users/{uid}` profile is removed
- [ ] Fully close and reopen Expo Go
- [ ] Confirm the deleted user is not restored

## Scenario 2: Cancel Account Deletion

- [ ] Create or sign into a throwaway account
- [ ] Open the Delete account flow
- [ ] Cancel / back out of the confirmation
- [ ] Confirm the user remains signed in
- [ ] Confirm the Firebase Auth user still exists
- [ ] Confirm the Firestore `users/{uid}` still exists

## Scenario 3: Deleted Account Cannot Sign Back In

- [ ] Delete a throwaway account
- [ ] Try signing in again with the deleted email / password
- [ ] Confirm sign-in fails
- [ ] Confirm the error message is friendly and non-technical
- [ ] Confirm no Firestore profile is recreated

## Scenario 4: Delete After Fresh Sign-In

- [ ] Create a new throwaway account
- [ ] Sign out
- [ ] Sign back in
- [ ] Confirm `lastSignedInAt` updates in the Firestore profile
- [ ] Delete account
- [ ] Confirm the Auth user is removed
- [ ] Confirm the Firestore profile is removed
- [ ] Restart the app
- [ ] Confirm the signed-out state remains

## Scenario 5: Recent Login Requirement

Firebase sometimes requires a recent sign-in before it will delete a user. This scenario
confirms that case is handled calmly.

- [ ] Try deleting after a normal session
- [ ] If Firebase asks for a recent login, confirm friendly copy appears
- [ ] Confirm the app does not crash
- [ ] Confirm the Auth user remains if deletion is blocked
- [ ] Confirm the Firestore profile remains if deletion is blocked
- [ ] Sign in again and retry deletion if needed

> The friendly copy reads: "For your security, please sign in again before deleting your
> account." Tapping "Sign in again" returns you to the welcome screen so you can sign in fresh
> and retry.

## Scenario 6: Local / Mock Fallback

This checks the app still works with no Firebase configured. Only do this if it is safe and you
are comfortable temporarily moving the config.

- [ ] Temporarily test with Firebase config absent or disabled, only if safe and documented
- [ ] Confirm local / mock account deletion clears the local profile / session
- [ ] Confirm the app does not crash
- [ ] Restore the Firebase config afterward

> To test this safely: rename `mobile-app/.env.local` (for example to `.env.local.bak`),
> run `npx expo start -c`, create a local profile, then delete it. Rename the file back when
> done so Firebase mode returns.

## Scenario 7: Data Boundary Check

- [ ] Confirm no `prayerRequests` are written to Firestore
- [ ] Confirm no `prayerInteractions` are written to Firestore
- [ ] Confirm no `reports` are written to Firestore
- [ ] Confirm only the Auth user and the `users/{uid}` profile are affected
- [ ] Confirm no email is stored in Firestore

## Pass / Fail Summary

- [ ] Happy path passed
- [ ] Cancel flow passed
- [ ] Deleted account cannot sign back in
- [ ] Delete after fresh sign-in passed
- [ ] Recent-login behavior handled or noted
- [ ] Local / mock fallback passed or not tested
- [ ] No prayer data touched
- [ ] No technical errors shown to the user

## QA Notes

Write any observations here (date, device, what you saw):

```
-
-
-
```
