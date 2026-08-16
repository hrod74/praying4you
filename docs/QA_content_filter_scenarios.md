# QA Content Filter Scenarios

A manual checklist for verifying pre-publication content filtering in the Praying For You mobile
app. It is written for the owner (not a developer), to be run one scenario at a time using Expo Go
on a physical phone. The detailed scenario checkboxes below are preserved as the reusable test
procedure. The dated QA Execution Record is the authoritative result for the completed 2026-08-16
session.

**Status: MANUAL QA PASSED, 2026-08-16.** The owner completed the physical-device walkthrough
through Expo Go, in both Firebase mode and local/mock mode. All 21 scenarios passed with 0
defects. See the QA Execution Record below for the full result and one exploratory observation
recorded as an expected result, not a defect.

## QA Execution Record

| Item | Result | Evidence or disposition |
| --- | --- | --- |
| Environment | Passed | Physical phone through Expo Go, 2026-08-16 |
| Firebase mode | Passed | Scenarios 1 through 20 run against a Firebase-mode test account and a disposable account for the account-creation scenarios |
| Local/mock mode | Passed | Scenario 21 confirmed the same blocked-draft and blocked-display-name behavior with no `.env.local` present |
| Scenarios 1 through 21 | Passed, 21/21 | Every scenario in this document passed as written, including the display-name-propagation correction noted under Scenario 15 |
| Prayer creation filtering | Passed | Scenarios 1 through 7 |
| Prayer editing filtering | Passed | Scenarios 8 through 10 |
| Account-creation display-name filtering | Passed | Scenarios 11 through 13 |
| Settings display-name filtering | Passed | Scenarios 14 through 15 |
| Evasion variants (capitalization, punctuation, spacing, substitution, repeated characters) | Passed | Scenario 16; all variants tested were blocked |
| Legitimate sensitive-topic prayers | Passed | Scenario 17; every listed topic published normally |
| Niger and ordinary double-letter regression cases | Passed | Scenario 18 |
| Existing prayer, report, hidden-account, Terms-acceptance, and Settings behavior | Passed | Scenario 19; no regression found |
| Temporary offline filtering | Passed | Scenario 20; blocking held with no network connection, confirming the filter is fully on-device |
| Cleanup | Completed | Temporary QA requests and the disposable account created for these scenarios were removed afterward; `.env.local` was restored and Firebase mode was reconfirmed working |
| Defects found | 0 | No implementation defect was observed during this QA session |

**Exploratory observation (not a defect):** during manual QA, the standalone phrase "I want sex"
was submitted and was allowed to publish. This is an expected result of the narrow,
high-confidence filter, not a defect: the filter intentionally does not block every sexual
reference, since legitimate prayer contexts can include sexual temptation, recovery, marriage, or
abuse. Reporting and human moderation remain the safeguards for this kind of ambiguous content, by
design; see `docs/content-filter-implementation.md`'s "Known limitations" section, where this
finding is also recorded.

**Disposition:** Pre-publication content filtering is implemented, automated tests pass, and
physical-device manual QA has passed with 0 defects in both Firebase and local/mock mode. This is
one of three items evaluated for the UGC Compliance Blocker; see
`docs/reviews/Beta_Readiness_Assessment.md` for the dated annotation and the overall blocker
status, which is not closed by this result alone.

## Purpose

This checklist verifies that the approved content filter (`docs/content-filter-implementation.md`)
correctly protects, on a real device, in the real app: creating a prayer request, editing a prayer
request, creating an account (display name), and editing a display name in Settings. It also
verifies that an allowed submission still flows through exactly as it did before this feature
existed, that a blocked submission never reaches persistence, that the draft is preserved, and
that the exact shared message appears.

What is out of scope here (do not test these as part of this checklist):

- "Hide requests from this account": covered by `docs/QA_hidden_accounts_scenarios.md`, not this
  document.
- Whether the underlying report-review process is timely: covered by `docs/QA_report_scenarios.md`.
- Terms-acceptance flow correctness itself, beyond confirming it still works: this feature does
  not change Terms acceptance.
- Age-gate behavior: this feature does not add or change one.

## Important warnings before you start

- **Do not weaken, replace, or temporarily reconfigure the production Firestore rules to test
  this feature.** This filter is entirely client-side (see
  `docs/content-filter-implementation.md`, "No Firestore rules change required"). None of the
  scenarios below require any change to `mobile-app/firestore.rules` or to what is published in
  the Firebase Console. If any scenario seems to ask you to loosen a rule to observe something,
  stop and re-read the scenario; that is not what it is asking for.
- **Do not inspect production logs to simulate or verify a failure.** This filter never logs the
  rejected text anywhere, on-device or in Firebase. There is nothing to find in a production log
  for this feature, and looking for one is not part of this checklist.
- **Use controlled test phrases that can be removed after QA.** A few scenarios below ask you to
  type language that would normally be blocked, specifically to confirm it is blocked. Use short,
  clearly-a-test phrasing (for example "I will kill you" for the threat category, or the country
  name "Niger" for the false-positive regression), not gratuitous or extended text, and remove any
  test account, request, or display name created during this checklist once QA is complete. None
  of the identity-slur scenarios in this checklist ask you to type a configured slur; see the
  "Automated-only checks" section for why.
- Prefer disposable test accounts over your own real account for any scenario that creates data.

## Before You Start

- [ ] Expo is running with `npx expo start -c`
- [ ] You have access to at least one Firebase-mode test account already signed in (for the
      prayer-body scenarios), and are able to create a new account (for the account-creation
      scenarios)
- [ ] Firebase Console is open to Authentication → Users, so you can confirm whether an account
      was or was not created
- [ ] Firebase Console is open to Firestore Database → Data → `prayerRequests`, so you can confirm
      whether a request was or was not written or changed
- [ ] `.env.local` is present and correct for Firebase mode (see the "Local/mock mode" scenario
      near the end for the separate local/mock pass)
- [ ] You will not need to publish or change any Firestore rule for this checklist

## Scenario 1: Allowed Sensitive Prayer Publishes Normally

- [ ] Sign in with a test account
- [ ] Go to "Share a prayer request"
- [ ] Write a sincere prayer that mentions a genuinely sensitive topic, for example: "Please pray
      for my brother, he has been struggling with suicidal thoughts and we are asking for hope and
      healing."
- [ ] Submit
- [ ] Confirm it publishes exactly as it always has: no extra screen, no delay, no warning, and it
      appears in the feed with the text intact

## Scenario 2: Blocked Prayer Does Not Publish

- [ ] Go to "Share a prayer request"
- [ ] Write a short, clearly-a-test threat phrase, for example: "I will kill you"
- [ ] Submit
- [ ] Confirm the request is **not** published: it does not appear in the feed
- [ ] In the Firebase Console, confirm no new document was written to `prayerRequests` for this
      attempt

## Scenario 3: Blocked Draft Remains Visible

- [ ] Immediately after Scenario 2's blocked submit attempt, without navigating away, confirm the
      full text you typed is still in the text field, unchanged and unmutated
- [ ] Confirm the category and named/anonymous choice you had selected are also unchanged

## Scenario 4: Filtering Message Is Exact and Calm

- [ ] With the blocked draft from Scenario 2 still on screen, confirm the field shows exactly this
      message, word for word: "This contains language that cannot be shared with the community.
      Please revise it and try again."
- [ ] Confirm no other message, code, or category name appears anywhere on screen
- [ ] Confirm the submit button is still enabled (not stuck disabled)

## Scenario 5: Editing the Draft Clears the Stale Message

- [ ] With the blocked-message state from Scenario 4 still showing, start typing or delete a
      character in the text field
- [ ] Confirm the content-filter message disappears as soon as you make any edit, without needing
      to tap submit again

## Scenario 6: Revised Allowed Prayer Publishes

- [ ] Continuing from Scenario 5, revise the text into a genuine, allowed prayer request
- [ ] Submit
- [ ] Confirm it publishes normally, the same as Scenario 1

## Scenario 7: Anonymous Posting Cannot Bypass Filtering

- [ ] Go to "Share a prayer request"
- [ ] Choose "Post as Anonymous"
- [ ] Write the same short test threat phrase from Scenario 2
- [ ] Submit
- [ ] Confirm it is blocked exactly the same way as Scenario 2 to 4 (not published, draft
      preserved, exact message shown)
- [ ] Revise it into an allowed prayer, keep Anonymous selected, submit, and confirm it publishes
      as Anonymous normally

## Scenario 8: Editing an Existing Request Cannot Bypass Filtering

- [ ] Open one of your own existing prayer requests
- [ ] Tap Edit
- [ ] Replace the body with the same short test threat phrase from Scenario 2
- [ ] Tap Save
- [ ] Confirm the save is blocked: you remain on the edit form, the edited text is preserved, and
      the exact shared message from Scenario 4 appears

## Scenario 9: A Blocked Edit Leaves the Stored Request Unchanged

- [ ] Immediately after Scenario 8's blocked save attempt, check the Firebase Console
      `prayerRequests` document for that request
- [ ] Confirm its `body` field still shows the original text, not the blocked attempted edit
- [ ] Also confirm the request still displays its original, unchanged text in the app (feed and
      detail screen)

## Scenario 10: Allowed Edit Succeeds

- [ ] Continuing from Scenario 8, revise the body into a genuine, allowed edit
- [ ] Tap Save
- [ ] Confirm it saves normally: you return to the previous screen, the confirmation message
      appears, and the new text is reflected everywhere the request is shown

## Scenario 11: Blocked Display Name Prevents Account Creation

- [ ] Go to "Create your profile" (do not use an existing account for this scenario)
- [ ] Enter a short, clearly-a-test blocked display name, for example one that would match the
      threat pattern, such as "I will kill you" (do not use an identity slur; see "Automated-only
      checks" below)
- [ ] Fill in a valid email (and password, if Firebase mode requires one) and accept the Terms
- [ ] Tap "Create profile"
- [ ] Confirm the account is **not** created: you remain on the create-profile screen
- [ ] Confirm the display name field still shows the exact text you typed
- [ ] Confirm the exact shared message from Scenario 4 appears under the display name field

## Scenario 12: Firebase Authentication Confirms No Account Was Created After the Blocked-Name Attempt

- [ ] Immediately after Scenario 11, check Firebase Console → Authentication → Users
- [ ] Confirm no new user was created with the email you entered in Scenario 11
- [ ] This confirms the block happened before Firebase Authentication account creation, not after
      it with a rollback

## Scenario 13: Revised Allowed Display Name Creates the Account

- [ ] Continuing from Scenario 11 on the same screen, change only the display name to an allowed
      name (for example your own real test name, "Jordan," or similar)
- [ ] Tap "Create profile" again
- [ ] Confirm the account is created normally: you land in the app, and the new user appears in
      Firebase Console → Authentication → Users

## Scenario 14: Blocked Settings Display-Name Update Does Not Persist

- [ ] Sign in with a test account
- [ ] Go to Settings → Edit profile
- [ ] Change the display name to the same short test blocked phrase from Scenario 11
- [ ] Tap "Save profile"
- [ ] Confirm the save is blocked: you remain on the edit form, the typed name is preserved, and
      the exact shared message appears
- [ ] Confirm the account's actual display name (shown elsewhere in the app, and in Firebase
      Console → Authentication → Users) is still the original name, not the blocked attempted one

## Scenario 15: Revised Allowed Settings Display Name Saves

- [ ] Continuing from Scenario 14, change the display name to a different, allowed name
- [ ] Tap "Save profile"
- [ ] Confirm it saves normally: the confirmation message appears, and the new name is reflected
      in Settings and on every one of that account's active, non-Anonymous prayer requests, not
      only on requests created after this point

*(Update 2026-08-16)*: display-name propagation is now implemented and has passed manual QA; see
`docs/QA_display_name_rename_scenarios.md`. Before that feature, an allowed Settings rename only
changed the profile and future posts, and an existing request kept whatever name was cached on it
at post time. That is no longer accurate: a successful rename now rewrites every currently active,
named request the account owns, in the same operation, so this scenario's last check above must
be read as covering existing requests, not just new ones going forward. Anonymous requests are
still unaffected either way. This correction is scoped to this one line; the rest of this
document's content-filter behavior is unrelated to that feature and unchanged.

## Scenario 16: Capitalization, Punctuation, Substitution, Spacing, and Repeated-Character Checks

Pick any one blocked category (the threat phrase is the simplest to type safely) and confirm each
evasion variant below is still blocked in the prayer-body field:

- [ ] All capitals, for example "I WILL KILL YOU"
- [ ] Extra spacing, for example "I    will    kill    you"
- [ ] Trailing punctuation, for example "I will kill you!!!"
- [ ] A simple character substitution, for example "I w1ll k1ll you"
- [ ] Stretched repeated characters, for example "I willllll killllll you"

This is a spot check, not exhaustive; the full evasion matrix across every category is already
covered by the automated tests (see "Automated-only checks" below).

## Scenario 17: Legitimate Sensitive References Remain Allowed

Submit a short, sincere-sounding prayer for each of the following topics and confirm each
publishes normally, with no block:

- [ ] Suicide or self-harm recovery
- [ ] Abuse or protection from violence
- [ ] Addiction or substance recovery
- [ ] Cancer or serious illness
- [ ] Grief or death
- [ ] Depression or anxiety
- [ ] A teenager being pressured into sexting (describing it, not soliciting it), for example:
      "Please pray for a teenager being pressured into sexting."

## Scenario 18: Niger and Ordinary Double-Letter Regression Examples Remain Allowed

- [ ] Submit a prayer that mentions the country name, for example: "Please pray for families in
      Niger."
- [ ] Confirm it publishes normally, not blocked
- [ ] Submit a prayer using ordinary words with normal double letters, for example: "Please pray
      for my classroom and my ongoing illness this week."
- [ ] Confirm it publishes normally, not blocked

## Scenario 19: Existing Behavior Does Not Regress

- [ ] Submit a new prayer request with ordinary, unremarkable text; confirm it works exactly as it
      did before this feature
- [ ] Edit one of your own requests with ordinary text; confirm it saves normally
- [ ] Report a request (any reason); confirm the reporting flow is unaffected
- [ ] Hide an account (see `docs/QA_hidden_accounts_scenarios.md` if you need the full procedure);
      confirm hiding is unaffected
- [ ] Confirm the Terms-of-Use acceptance flow (if presented) behaves exactly as before
- [ ] Confirm Settings profile viewing (without editing) is unaffected

## Scenario 20: Filtering Works While Temporarily Offline

- [ ] With the Expo Go app already loaded and the bundle already running, turn on Airplane Mode
- [ ] Attempt to submit a blocked prayer body (short test threat phrase)
- [ ] Confirm it is still blocked, with the exact same message, even with no network connection
- [ ] This is expected because the filter is entirely on-device and makes no network call; it does
      not depend on Firebase being reachable
- [ ] Restore the network connection before continuing to other scenarios

## Scenario 21: Local/Mock Mode Disposition

Run with no `.env.local` present, so the app runs in local/mock mode (no Firebase).

- [ ] Confirm the same blocked-draft and blocked-display-name behavior from Scenarios 2 to 5 and
      11 also holds in local/mock mode, since the filter and both gate functions do not depend on
      which persistence mode is active
- [ ] This is a lower-priority pass than the Firebase-mode scenarios above, since external beta
      uses Firebase mode, but should still be spot-checked, not skipped entirely

## Automated-only checks (do not type configured slurs during manual QA)

The following are already proven by automated tests and are intentionally **not** part of the
manual walkthrough above. Do not type a configured identity slur into the app during manual QA;
it is unnecessary and this checklist deliberately avoids asking for it.

- [ ] Confirm `npm run test:content-filter` (49 tests), `npm run test:submission-gate` (10 tests),
      and `npm run test:display-name-gate` (9 tests) all pass. These cover every blocked category,
      including the identity-slur category, with capitalization, spacing, punctuation,
      substitution, and repeated-character evasion variants for each, in a pure Node environment
      with no UI involved.
- [ ] Confirm by code review, not manual typing, that the identity-slur list is short and
      intentionally non-exhaustive, as described in `docs/content-filter-implementation.md`.
- [ ] Confirm the fail-closed behavior (an unexpected internal failure blocks rather than allows)
      is covered by the automated tests in each of the three test files above; this is not
      practical to trigger by hand through the UI, since it requires a runtime type violation, not
      a value normally reachable through any form.
- [ ] Confirm determinism (the same input always produces the same result) is covered by the
      automated tests; this is also not practical to verify meaningfully by hand.

## Notes for Future Runs

The 2026-08-16 session above is recorded in the QA Execution Record, the same way
`docs/QA_hidden_accounts_scenarios.md` records its own dated result. If this checklist is run
again (a re-verification, or after a future change to this feature), update the dated status line
at the top, add or update the QA Execution Record table, and note any defects found. The detailed
scenario procedure above is written to be reusable, not a one-time artifact.
