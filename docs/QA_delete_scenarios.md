# QA Delete Scenarios

## Current Status

**Partially passed, with the core deletion flow verified.** Scenarios 1 through 6 were completed previously and are fully checked below. On 2026-08-16, the owner also deleted two Firebase test accounts and the prayer requests associated with that testing; both deletions completed successfully. This recent confirmation supports the core behavior but did not include a documented Firestore inspection of the soft-removed request fields, interaction cleanup, report cleanup, preserved aggregate counts, or other-user negative controls in Scenarios 7 through 11. Those narrower data-boundary checks remain open rather than being inferred.

A manual checklist for verifying account deletion in the Praying For You mobile app.
It is written for the owner (not a developer). Tap through each step on a phone running
Expo Go, and check the box when the result matches what is described.

## Purpose

This checklist verifies that account deletion works end to end before any Alpha testing with
real users. Account deletion must work before we invite testers, so a person can always remove
their sign-in, their private profile, and their prayer requests from the feed.

What this phase covers:

- Deleting the Firebase Authentication sign-in for the current user.
- Deleting that user's private profile document at `users/{uid}` in Firestore.
- **Soft-removing that user's active prayer requests** in Firestore so they leave the feed
  (Phase J.2f.2). The documents are kept with `status: removed`, `removedReason: accountDeleted`,
  and `removedAt` set; they are never hard-deleted.
- **Cleaning up the records that identify the user as an actor** (Phase J.2h): the user's own
  `prayerInteractions` docs and their own `reports` docs are deleted while they are still signed in.
  This cleanup is **best-effort**. If it cannot run (for example the new rules are not published yet),
  account deletion still completes; it never traps a user in an undeletable account.
- Returning the app to the signed-out / welcome state.

Important cleanup decisions (Phase J.2h):

- **Prayer counts are preserved.** Deleting a user's `prayerInteractions` does **not** decrement any
  request's `prayerCount`. There is no "who prayed" screen, so a count that is not decremented exposes
  nothing about anyone, and avoiding a count change keeps the change simple and safe for MVP.
- **Only the deleting user's own report docs are removed.** Reports filed by **other** users
  (including reports filed against the deleting user's requests) are kept for manual Console review.
- **Settings no longer has a "Reset prototype data" option.** The app is backed by real Firebase data,
  so a local "reset prototype data" action was removed to avoid implying real backend data can be reset.

## Before You Start

- [ ] Expo is running with `npx expo start -c`
- [ ] Firebase Console is open to Authentication → Users
- [ ] Firebase Console is open to Firestore Database → Data → users
- [ ] Firebase Console is open to Firestore Database → Data → prayerRequests
- [ ] Firebase Console is open to Firestore Database → Data → prayerInteractions
- [ ] Firebase Console is open to Firestore Database → Data → reports
- [ ] Testing uses fresh throwaway accounts only
- [ ] `.env.local` is saved locally and not committed
- [ ] **The updated Firestore rules are published** (Phase J.2h adds the interaction/report delete
  rules; without them the cleanup is skipped best-effort and the docs will linger)

> Tip: keep the Firebase Console tabs side by side so you can watch the user appear and disappear in
> Authentication and in Firestore (users, prayerRequests, prayerInteractions, and reports) as you test.

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

## Scenario 7: Delete Account With Active Prayer Requests

This is the Phase J.2f.2 scenario: a deleting user who has authored prayer requests. It confirms
their requests are soft-removed (kept in Firestore with a removed status), not hard-deleted, and
that they leave the feed.

- [ ] Create a throwaway account
- [ ] Create one named prayer request
- [ ] Create one anonymous prayer request
- [ ] Confirm both appear in the feed
- [ ] Confirm both exist in Firestore `prayerRequests`
- [ ] Delete the account
- [ ] Confirm Firebase Auth user is removed
- [ ] Confirm Firestore `users/{uid}` profile is removed
- [ ] Confirm the user's `prayerRequests` are soft-removed, not hard-deleted
- [ ] Confirm `status` is `removed`
- [ ] Confirm `removedReason` is `accountDeleted`
- [ ] Confirm `removedAt` is set
- [ ] Confirm removed requests no longer appear in feed
- [ ] Restart app
- [ ] Confirm deleted user is not restored

> The anonymous request stores the public name "Anonymous" only (the real name is never stored),
> and `authorUid` is an opaque UID that is never shown in the app. Both of the user's requests
> should be soft-removed regardless of whether they were posted named or anonymously.

## Scenario 8: Delete Account Cleans Up the User's Prayer Interactions (Phase J.2h)

This confirms the "I prayed for this" records that identify the deleting user are removed, while the
aggregate prayer counts on other people's requests are preserved.

- [ ] Sign in as throwaway user A
- [ ] As a different throwaway user B, create a prayer request
- [ ] As user A, pray for user B's request
- [ ] In Firestore `prayerInteractions`, confirm a doc `A_<requestId>` exists
- [ ] Note the request's current `prayerCount` (for example, 1)
- [ ] Delete user A's account
- [ ] Confirm user A's `prayerInteractions` docs are gone
- [ ] Confirm user B's request `prayerCount` is **unchanged** (still 1; counts are preserved by design)
- [ ] Confirm user B's request itself is unchanged and still in the feed

## Scenario 9: Delete Account Cleans Up the User's Reports (Phase J.2h)

This confirms reports the deleting user filed are removed, while reports filed by others are kept.

- [ ] Sign in as throwaway user A
- [ ] As user B, create a prayer request
- [ ] As user A, report user B's request
- [ ] In Firestore `reports`, confirm a doc `A_<requestId>` exists
- [ ] (Optional) As user C, also report user B's request, so a `C_<requestId>` report exists
- [ ] Delete user A's account
- [ ] Confirm user A's `reports` docs are gone
- [ ] Confirm user C's report (if created) is **still present** (other users' reports are kept)
- [ ] Confirm no `reports` doc anywhere stores an email, display name, or phone

## Scenario 10: Settings No Longer Offers "Reset Prototype Data" (Phase J.2h)

- [ ] Open Settings
- [ ] Confirm there is **no** "Prototype data" section and **no** "Reset prototype data" button
- [ ] Confirm there is no copy implying local/prototype data can be reset
- [ ] Confirm "Edit profile", "Change password" (Firebase mode), "Sign out", and "Delete account"
  are all still present and work

## Scenario 11: Data Boundary Check

- [ ] Confirm other users' `prayerRequests` are not changed
- [ ] Confirm only the deleting user's own `prayerInteractions` are removed (others' remain)
- [ ] Confirm only the deleting user's own `reports` are removed (others' remain)
- [ ] Confirm no email is stored in `prayerRequests`, `prayerInteractions`, or `reports`
- [ ] Confirm no hard delete happened for `prayerRequests` (the documents still exist, with status removed)
- [ ] Confirm a request the user only prayed for (authored by someone else) is not removed
- [ ] Confirm there is no "who prayed" or "who reported" surface anywhere in the app

## Pass / Fail Summary

- [x] Happy path passed: Scenario 1 is fully checked; reconfirmed through two successful Firebase test-account deletions on 2026-08-16.
- [x] Cancel flow passed: Scenario 2 is fully checked.
- [x] Deleted account cannot sign back in: Scenario 3 is fully checked.
- [x] Delete after fresh sign-in passed: Scenario 4 is fully checked.
- [x] Recent-login behavior handled or noted: Scenario 5 is fully checked.
- [x] Local / mock fallback passed or not tested: Scenario 6 is fully checked and passed.
- [ ] Delete with active prayer requests passed
- [ ] User's prayer requests are soft-removed (status removed, removedReason accountDeleted, removedAt set)
- [ ] Removed requests no longer appear in the feed
- [ ] No hard delete of prayer requests
- [ ] Other users' prayer requests unchanged
- [ ] Deleting user's own prayerInteractions are deleted; prayerCount preserved
- [ ] Deleting user's own reports are deleted; other users' reports kept
- [ ] Settings no longer shows "Reset prototype data"
- [ ] No email stored in Firestore (requests, interactions, or reports)
- [ ] No "who prayed" / "who reported" surface anywhere
- [ ] No technical errors shown to the user

## QA Notes

Write any observations here (date, device, what you saw):

```
- 2026-08-16: owner deleted two Firebase test accounts and the prayer requests associated with the
  prior testing. Both deletion flows completed successfully. This is recorded as current evidence
  for the core deletion behavior, not as proof of the still-unchecked Firestore data-boundary items
  in Scenarios 7 through 11.
```
