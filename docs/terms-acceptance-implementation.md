# Terms Acceptance Implementation

**Status:** Implemented and manually verified for the controlled beta. Owner-run physical-device QA
passed on 2026-08-16 with zero defects. See `docs/QA_terms_acceptance_scenarios.md`.

## Behavior

Praying For You records explicit acceptance of a versioned Terms of Use in both supported modes.
The current version is defined by `CURRENT_TERMS_VERSION` in
`mobile-app/src/context/AuthContext.tsx`.

### Account creation

`mobile-app/app/(auth)/create-profile.tsx` requires the Terms checkbox before the Create profile
button can submit. `AuthContext.createProfile` also rejects a call when `acceptedTerms` is false,
so the requirement does not rely only on the button state.

In Firebase mode, successful sign-up writes `termsAcceptedVersion` and `termsAcceptedAt` to the
private `users/{uid}` profile through `firebaseUserService.ensureProfileForSignUp`. If the profile
write is temporarily unavailable after Firebase Authentication succeeds, the app deliberately
leaves the accepted version unset. The posting gate then requires the account to save acceptance
before its first prayer request.

In local/mock mode, the accepted version is stored in AsyncStorage with the local profile and
session state.

### Prayer submission and legacy accounts

`AuthContext` loads the private profile's accepted version for the signed-in Firebase account.
`hasAcceptedCurrentTerms` is true only when the stored version exactly matches
`CURRENT_TERMS_VERSION`.

`mobile-app/app/(app)/submit.tsx` passes that state and `acceptCurrentTerms` into the shared
`PrayerForm`. When the current version is absent, including for a legacy account, the form displays
an acceptance control and keeps submission disabled. Acceptance is written before the form becomes
eligible to submit.

Changing `CURRENT_TERMS_VERSION` causes accounts with an older recorded version to use the same
one-time catch-up flow before posting again.

### Policy access and beta notice

Account creation displays the controlled-beta 18-or-older notice and links to the Privacy Policy,
Terms of Use, and Support pages. The posting catch-up control links directly to the Terms and
community rules. Settings also exposes the policy links through `PolicyLinks`.

## Stored fields

The private `users/{uid}` profile contains:

- `termsAcceptedVersion`: the version string explicitly accepted by the account.
- `termsAcceptedAt`: a server timestamp for the acceptance write.

These fields are private profile data. They are not added to public prayer requests.

## Enforcement boundary

The normal app cannot create an account or submit a prayer request without the required acceptance
flow. Firestore rules do not independently inspect `termsAcceptedVersion` when a prayer request is
written directly by a modified client. Server-side enforcement is optional future hardening, not a
claimed part of the controlled-beta implementation.

## Verification

Owner-confirmed physical-device QA on 2026-08-16 proved:

- Account creation is blocked without acceptance and succeeds after acceptance.
- Prayer posting is blocked without the current version and succeeds after acceptance.
- Legacy or pre-versioned accounts receive the catch-up requirement.
- Acceptance persists after sign-out and sign-in.
- No defects were found.
