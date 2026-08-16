# QA Terms Acceptance Scenarios

A reusable manual checklist for verifying versioned Terms-of-Use acceptance in Praying For You.

**Status: PHYSICAL-DEVICE MANUAL QA PASSED, 2026-08-16.** The owner confirmed that every scenario
below was completed while testing the Terms implementation. All scenarios passed and no defects
were found.

## QA Execution Record

| Scenario | Result | Evidence |
| --- | --- | --- |
| Account creation without acceptance | Passed | Account creation remained blocked while the Terms checkbox was not selected |
| Account creation after acceptance | Passed | Selecting the checkbox allowed the account to be created normally |
| Posting without current acceptance | Passed | A signed-in account without the current accepted version could not submit a prayer request |
| Acceptance during posting | Passed | Accepting the current Terms from the posting flow saved acceptance and allowed submission |
| Legacy or pre-versioned account | Passed | An older account without the current recorded version was required to accept before posting |
| Persistence | Passed | Current acceptance remained recognized after sign-out and sign-in |
| Defects found | 0 | No defect was observed during the owner-run physical-device session |

**Disposition:** The Terms-acceptance functional requirement in the UGC Compliance Blocker is
implemented and manually verified for the controlled beta. Firestore does not independently enforce
Terms acceptance on a direct write from a modified client. That is optional future hardening and was
not part of the owner-approved beta requirement.

## Purpose

This checklist verifies that a person cannot create an account without explicitly accepting the
current Terms, that an existing account without the current accepted version cannot publish a prayer
request, and that acceptance is versioned and persists across authentication sessions.

## Before You Start

- [ ] Run the app on a physical device in Firebase mode.
- [ ] Have Firebase Authentication and the private `users` collection available for verification.
- [ ] Use a disposable email for the account-creation scenarios.
- [ ] Have access to an older or seeded test account whose profile does not contain the current
      `termsAcceptedVersion`.

## Scenario 1: Account Creation Requires Acceptance

- [ ] Open Create your profile.
- [ ] Enter a valid display name, unused email, and valid password.
- [ ] Leave the Terms checkbox unselected.
- [ ] Confirm the Create profile button cannot complete account creation.
- [ ] Confirm no Authentication user or private profile document is created.

## Scenario 2: Accepted Terms Allow Account Creation

- [ ] Select the Terms checkbox on the same form.
- [ ] Create the profile.
- [ ] Confirm account creation succeeds and the app opens normally.
- [ ] Confirm the private profile records the current `termsAcceptedVersion` and an acceptance
      timestamp.

## Scenario 3: Posting Requires the Current Version

- [ ] Sign in with an account whose private profile has no current `termsAcceptedVersion`.
- [ ] Open Share a prayer request.
- [ ] Confirm the Terms acceptance control is shown.
- [ ] Confirm a prayer request cannot be submitted before acceptance.
- [ ] Confirm no prayer-request document is created from the blocked attempt.

## Scenario 4: Acceptance During Posting Allows Submission

- [ ] Accept the Terms from the prayer form.
- [ ] Confirm acceptance is saved successfully.
- [ ] Submit an otherwise valid prayer request.
- [ ] Confirm it publishes normally.
- [ ] Confirm the private profile records the current accepted version.

## Scenario 5: Legacy Account Catch-Up

- [ ] Sign in with an account created before versioned acceptance existed, or an equivalent test
      account without the current version.
- [ ] Confirm the account can sign in but must accept the current Terms before posting.
- [ ] Accept and confirm posting becomes available.

## Scenario 6: Acceptance Persists

- [ ] Sign out after accepting the current Terms.
- [ ] Sign back in.
- [ ] Open Share a prayer request.
- [ ] Confirm the Terms control is no longer presented for the already accepted current version.
- [ ] Confirm a normal prayer request can be submitted.

## Cleanup

- [ ] Remove temporary prayer requests.
- [ ] Delete the disposable account if it is no longer needed.
- [ ] Confirm permanent test accounts remain intact.
