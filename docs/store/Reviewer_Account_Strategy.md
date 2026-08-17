# Store Reviewer Account Strategy

## Status

**OWNER APPROVED v0.1, 2026-08-17**

This document approves the access strategy for Apple App Review and Google Play review. It does not contain or authorize committing reviewer credentials. The actual account will be created and verified close to store submission.

## Approved Strategy

- Create one dedicated Firebase email-and-password account for store reviewers.
- Use a company-controlled email alias such as `appreview@productsparkstudio.com`, routed to `admin@productsparkstudio.com`.
- Do not use the owner's personal account or the Product Spark Studio administrator credentials.
- Use a strong, unique password stored only in the owner's password manager and the stores' protected reviewer-access fields.
- Use `App Reviewer` as the display name unless a store-specific reason requires different neutral copy.
- Complete the current Terms acceptance and 18-and-older beta eligibility flow for the reviewer account.
- Keep the account active and unchanged throughout both review processes.
- Seed safe, representative content from separate test accounts so the reviewer can observe the shared feed and exercise core flows.
- Rotate or delete the reviewer credentials only after both review processes and any follow-up review are complete.

## Reviewer Access Instructions

The protected App Store Connect and Google Play reviewer-access fields should include concise instructions to:

1. Open Praying For You.
2. Sign in with the supplied reviewer email and password.
3. View the shared prayer feed and Verse of the Day.
4. Create a named or Anonymous prayer request.
5. Pray for a request created by another account.
6. Report a request and hide requests from an account if review requires those trust-and-safety controls.
7. Open Settings to review Privacy Policy, Terms of Use, Support, profile controls, and account deletion.

## Credential Handling Boundary

- Do not commit the reviewer email password to Git, documentation, source code, environment files, screenshots, or store asset packages.
- Do not place reviewer credentials in public store-listing copy.
- Enter credentials only in the protected reviewer-access areas of App Store Connect and Google Play Console.
- Confirm the account works in each signed store build immediately before submission.

## Creation Timing

The strategy is decided before developer-account fees. The email alias and Firebase reviewer account will be created close to store configuration so the credentials remain current. Product Spark Studio will verify the complete sign-in and core-flow path in the signed iOS and Android builds before submission.

## Owner Approval

- Approved by: Heriberto Rodriguez Jr.
- Date approved: August 17, 2026
- Version approved: v0.1
- Decision: approved as written; assistance will be provided when configuring the Google Workspace alias and Firebase reviewer account.
