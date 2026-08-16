# QA Password Management Scenarios

A manual checklist for verifying password management in the Praying For You mobile app.
It is written for the owner (not a developer). Tap through each step on a phone running
Expo Go, and check the box when the result matches what is described.

## Purpose

This checklist verifies that **password reset** (forgot password) and **signed-in password change**
work end to end before Alpha testing with real users. Testers need a calm, safe way to recover a
forgotten password and to update their password while signed in.

What this phase covers:

- Sending a password reset email from the sign-in screen.
- Changing the password while signed in, from Settings.
- Safe, friendly error copy with no raw Firebase errors and no account-enumeration leaks.

What is still out of scope (so do not test these here):

- Prayer requests, prayer interactions ("prayed for" counts), and reports are unchanged.
- No push notifications, AI features, social/Google sign-in, or passwordless/email-link sign-in.

## Manual QA Evidence (2026-08-06)

The owner manually tested the two flows below on a **physical device** (not Expo Go on a simulator).
Both passed. This is a real, dated verification, distinct from, and stronger than, the unchecked
scenario boxes below, which remain the record of what has *not* yet been individually walked through.

- [x] **Authentication (sign-in)**: signed in with an existing account on a physical device.
  Result: **Passed**. Tested: 2026-08-06.
- [x] **Password reset** (the flow described in Scenario 1, "Forgot Password From Sign-In," below):
  requested a password reset from the sign-in screen on a physical device and confirmed it worked as
  designed. Result: **Passed**. Tested: 2026-08-06.

**Not covered by this evidence**, still unverified: Scenario 2 (unknown-email non-enumeration copy),
Scenario 3 (change password while signed in), Scenario 4 (password mismatch), Scenario 5 (wrong current
password), Scenario 6 (weak password), Scenario 7 (recent-login requirement), and Scenario 8
(local/mock fallback). The individual checkboxes in those scenarios below have not been marked and
should not be read as passed until each is actually run.

## Before You Start

- [ ] Expo is running with `npx expo start -c`
- [ ] Firebase Console is open to Authentication → Users
- [ ] Testing uses throwaway accounts only
- [ ] Email/Password auth is enabled
- [ ] Email Link/passwordless is off
- [ ] Google Sign-In is off
- [ ] `.env.local` is saved locally and not committed

> Tip: keep an inbox open for the throwaway account so you can see reset emails arrive.

## Scenario 1: Forgot Password From Sign-In

- [ ] Open sign-in screen
- [ ] Tap Forgot password
- [ ] Enter throwaway account email
- [ ] Submit reset request
- [ ] Confirm friendly confirmation message appears
- [ ] Confirm no raw Firebase error is shown
- [ ] Confirm no app crash

> The confirmation reads: "If an account exists for that email, password reset instructions will be
> sent." A reset email should arrive for the real throwaway account.

## Scenario 2: Forgot Password With Unknown Email

- [ ] Open forgot password flow
- [ ] Enter an email not used by a test account
- [ ] Submit reset request
- [ ] Confirm app shows safe non-enumerating copy
- [ ] Confirm app does not reveal whether the account exists
- [ ] Confirm no raw Firebase error is shown

> The message must be identical to Scenario 1 ("If an account exists for that email, ...") so an
> unknown email looks exactly like a known one. No email arrives, and that is expected.

## Scenario 3: Change Password While Signed In

- [ ] Sign in with a throwaway account
- [ ] Open Settings
- [ ] Open Change password
- [ ] Enter current password
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Submit
- [ ] Confirm success message appears
- [ ] Sign out
- [ ] Sign in with new password
- [ ] Confirm old password no longer works

> The success message reads: "Your password has been updated."

## Scenario 4: Password Mismatch

- [ ] Open Change password
- [ ] Enter two different new passwords
- [ ] Submit
- [ ] Confirm friendly mismatch message appears
- [ ] Confirm password is not changed

> The message reads: "The new passwords do not match." Nothing is sent to Firebase.

## Scenario 5: Wrong Current Password

- [ ] Open Change password
- [ ] Enter wrong current password
- [ ] Enter matching new passwords
- [ ] Submit
- [ ] Confirm friendly wrong-password message appears
- [ ] Confirm password is not changed

> The message reads: "That password does not look right. Please try again."

## Scenario 6: Weak Password

- [ ] Open Change password
- [ ] Enter a weak new password
- [ ] Submit
- [ ] Confirm friendly weak-password message appears
- [ ] Confirm password is not changed

> A new password under 6 characters is rejected with "Please choose a stronger password. Use at
> least 6 characters." before anything is sent.

## Scenario 7: Recent Login Requirement

Firebase sometimes requires a recent sign-in before it will change a password. This scenario
confirms that case is handled calmly.

- [ ] Attempt password change after app restart or later session
- [ ] If Firebase requires recent sign-in, confirm friendly recent-login message appears
- [ ] Confirm app does not crash
- [ ] Confirm password is not changed until user signs in again

> The friendly copy reads: "For your security, please sign in again before changing your password."
> Tapping "Sign in again" signs you out so you can sign in fresh and retry.

## Scenario 8: Local / Mock Fallback

This checks the app still works with no Firebase configured. Only do this if it is safe and you are
comfortable temporarily moving the config.

- [ ] If safe, test Firebase config absent/disabled
- [ ] Confirm forgot password does not crash
- [ ] Confirm change password does not crash
- [ ] Restore Firebase config afterward

> To test this safely: rename `mobile-app/.env.local` (for example to `.env.local.bak`), run
> `npx expo start -c`, and create a local profile. In local mode the "Forgot password?" link and the
> Settings "Password" section are not shown (local profiles have no password), so neither flow can
> crash. Rename the file back when done so Firebase mode returns.

## Pass / Fail Summary

- [ ] Forgot password passed
- [ ] Unknown email copy is safe
- [ ] Change password passed
- [ ] Old password fails after change
- [ ] Password mismatch passed
- [ ] Wrong current password passed
- [ ] Weak password passed
- [ ] Recent-login behavior handled or noted
- [ ] Local/mock fallback passed or not tested
- [ ] No raw Firebase errors shown
- [ ] No password stored or logged

## QA Notes

Write any observations here (date, device, what you saw):

```
-
-
-
```
