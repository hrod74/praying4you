# Display Name Propagation Implementation

**Status: IMPLEMENTATION COMPLETE. FIRESTORE RULES PUBLISHED. AUTOMATED TESTS PASSING.
PHYSICAL-DEVICE MANUAL QA PASSED, 2026-08-16, 56 of 56 checks, 0 defects.** See
`docs/QA_display_name_rename_scenarios.md` for the manual QA record.

## Purpose

A display name represents the account's current public identity. Before this feature, the app
cached a display name onto each prayer request at post time; changing the profile name never
rewrote existing requests, so one account could appear publicly under several historical names at
once. This feature makes a display-name change propagate to every active, non-Anonymous prayer
request the account owns, so an account's public identity is always shown consistently.

Explicitly unchanged: Anonymous requests always show the literal "Anonymous", never the real
name. Removed requests are never rewritten, since they are not publicly visible. A hidden-account
`displayLabelSnapshot` (owned by the user who did the hiding, not the renamed account) is never
touched, so a renamed user can never learn who hid them or that a snapshot exists. Prayer bodies,
categories, ownership, creation timestamps, prayer counts, report counts, interactions, reports,
and status are never touched by a rename.

## Firebase behavior

`mobile-app/src/services/firebase/displayNameRenameService.ts` exports
`renamePublicDisplayName(uid, displayName)`. It queries the caller's own `prayerRequests` by
`authorUid`, filters to active, non-Anonymous documents with the shared pure predicate in
`mobile-app/src/utils/displayNameRenamePlan.ts`, then commits ONE atomic Firestore write batch:
the private `users/{uid}` profile doc's `displayName`/`updatedAt`, plus `displayName`/`updatedAt`
on every matching request. No other field on any request is touched.

Firestore caps a single write batch at 500 operations. One write is always the profile doc,
leaving at most 499 matching requests in the same batch. The matching-request count is checked
BEFORE any write is attempted (`planDisplayNameRenameBatch`); if it would exceed 499, the whole
operation is refused with a calm error and no write happens at all, never a partially-successful
multi-batch rename.

Cross-service honesty: Firebase Authentication (the display name on the Auth user record) and
this Firestore batch are two separate products and cannot be committed as one atomic operation
across both. `AuthContext.updateProfile` updates Auth first, then calls this batch, and only
reports success or updates in-memory profile state once the batch has ALSO succeeded. If Auth
succeeds but the batch fails, the thrown error propagates to the caller with calm, safe copy
("We could not update your name everywhere it appears right now. Please try again."), never
silently treated as best-effort. Every write in the batch sets an absolute value, not a delta, so
retrying with the same desired name is always safe and idempotent.

## Firestore rule invariant

`mobile-app/firestore.rules` adds `isLegitimatePublicName(data)`: an Anonymous request's
`displayName` must be the literal `"Anonymous"`; a named request's `displayName` must equal
`getAfter(users/{uid}).data.displayName`, not an arbitrary client-supplied value. `getAfter()`
(not `get()`) is what lets the same rule validate both an ordinary single-request edit (the
profile is untouched in that operation, so `getAfter()` reads the same already-committed value
`get()` would) and the atomic rename batch (the profile doc is rewritten in the same batch, so
`getAfter()` sees the pending new name). Applied unconditionally on create; on the edit/soft-remove
update rule it only fires when the write actually touches `displayName` or `isAnonymous`, so a
status-only change (soft-remove, account-deletion cleanup) is never blocked by this invariant even
for a hypothetical pre-existing name mismatch predating this rule.

This was validated in the Firestore emulator at production scale: batches of 25, 100, and 499
matching requests plus the profile doc all committed successfully, with the rename verified
durable on the first and last request in each batch and confirmed to leave an Anonymous request
and another user's request untouched (`mobile-app/firebase-tests/tests/prayerRequests.test.mjs`).
This is strong implementation evidence, not an unlimited platform guarantee: Firebase's own
documentation notes that repeated identical document-access calls within one atomic operation may
be cached but does not contractually promise that caching behavior.

## Local/mock behavior

`renameLocalPrayers` (added to `mobile-app/src/services/prayerService.ts`) mirrors the Firebase
behavior for local/mock mode (no `.env.local`). It reuses the exact same
`selectRequestsForDisplayNameRename` predicate against the current merged (override-applied,
removed-filtered) view, so both modes select the same requests using the same rules. A
locally-submitted request's `displayName` is updated directly; a seed request never has its
bundled data mutated, instead a `displayName` override is written or merged, the same way an
owner edit already works. These writes are not best-effort: a genuine storage failure propagates
to the caller rather than being silently swallowed, matching the Firebase side's honesty.

## UI behavior

The Settings edit-profile form is unchanged in shape; `AuthContext.updateProfile` is the only
thing that changed underneath it. On success, Settings shows the new name, and
`PrayerContext` reacts to `profile.displayName` changing (only ever set once persistence has
already succeeded) by updating the in-memory list of active, non-Anonymous requests owned by that
account, so the feed and detail screens reflect the new name immediately without a full reload.
On failure, the existing catch block in Settings shows the thrown error's calm message; the edit
form stays open with the entered name intact, exactly as before this feature.

## Test coverage

All commands run from `mobile-app/`.

| Command | File(s) | Test count |
|---|---|---|
| `npm run test:display-name-rename-plan` | `src/utils/displayNameRenamePlan.test.ts` | 12 |
| `npm run test:rules` | `firebase-tests/tests/*.test.mjs` | 85 (includes the display-name invariant and the 25/100/499-request large-batch propagation tests) |

`npm run test:content-filter` (49), `npm run test:submission-gate` (10),
`npm run test:display-name-gate` (9), and `npm run test:hidden-accounts` (18) all remain passing
and are unaffected by this feature; they are run alongside it as a standard regression check.

## Known limitations

- The rename batch has a hard cap of 499 matching active named requests. An account that
  legitimately exceeds this (not expected at this beta's scale) would see the rename refused with
  a calm error rather than a partial rename; there is no chunked multi-batch fallback by design,
  since a fallback would reintroduce the partial-rename risk this feature exists to prevent.
- A hyphen or other punctuation cannot substitute for the `displayName` field itself changing; the
  rename is scoped to `displayName` and `updatedAt` only, by design.
- This feature does not touch reporting, hidden-account snapshots, prayer interactions, prayer
  counts, Terms acceptance, or age gating.

## Files created or edited by this feature

**Created (3):**
1. `mobile-app/src/utils/displayNameRenamePlan.ts`: pure selection and batch-planning logic
   (`selectRequestsForDisplayNameRename`, `planDisplayNameRenameBatch`,
   `MAX_NAMED_REQUESTS_FOR_ATOMIC_RENAME`, `RENAME_PROPAGATION_ERROR_MESSAGE`).
2. `mobile-app/src/utils/displayNameRenamePlan.test.ts`: 12 unit tests.
3. `mobile-app/src/services/firebase/displayNameRenameService.ts`: the atomic Firestore batch
   operation (`renamePublicDisplayName`).

**Edited (8):**
1. `mobile-app/firestore.rules`: added the `isLegitimatePublicName` invariant to prayer-request
   create and edit rules.
2. `mobile-app/src/services/prayerService.ts`: added `renameLocalPrayers`.
3. `mobile-app/src/context/AuthContext.tsx`: rewrote `updateProfile` to sequence Auth then the
   Firestore/local batch honestly, in both modes.
4. `mobile-app/src/context/PrayerContext.tsx`: added the baseline-sync effect that reflects a
   completed rename in the in-memory feed immediately.
5. `mobile-app/src/services/firebase/userService.ts` and `contracts.ts`: removed the superseded
   standalone `updateDisplayName` method (renaming now only happens through the atomic batch).
6. `mobile-app/firebase-tests/tests/prayerRequests.test.mjs`: added the rule-invariant tests and
   the 25/100/499-request large-batch propagation tests.
7. `mobile-app/package.json`: added the `test:display-name-rename-plan` script.

**Documentation (this feature, dated 2026-08-16):**
1. `docs/display-name-propagation-implementation.md`: this document.
2. `docs/QA_display_name_rename_scenarios.md`: the manual QA procedure and passed execution
   record.
3. `docs/reviews/Beta_Readiness_Assessment.md`: one dated annotation recording that display-name
   filtering and propagation are implemented, rules are published, and both automated tests and
   physical-device QA have passed for this portion of work.
