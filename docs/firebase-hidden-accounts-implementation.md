# Firebase Hidden Accounts Implementation ("Hide requests from this account")

**Status:** Implemented, published, and verified for the controlled Firebase-backed beta. The
updated Firestore rules were published and the owner completed physical-device QA through Expo Go
on 2026-08-16 with zero defects. Automated validation also passes: 18 of 18 hidden-account unit
tests and 74 of 74 Firestore rules tests. See
[`docs/QA_hidden_accounts_scenarios.md`](./QA_hidden_accounts_scenarios.md) for the execution record,
including the deferred local/mock-only scenario and standalone offline cold-start check.

**Revision note:** this document was corrected after an initial review identified four defects:
post-report navigation could land on a "Prayer not found" screen after a successful hide; local
storage reads degraded to an empty list on corruption instead of failing closed; local storage
writes could silently fail while the UI reported success; and local-mode account deletion did not
clear hidden-account storage. All four are fixed and described below in their corrected form.

---

## What this is

"Hide requests from this account" is the app's account-level, one-directional user-blocking
control for the controlled beta. When User A hides User B:

- User A no longer sees any active prayer request authored by User B, whether it was already
  loaded or is created after the hide, and whether User B posts with a display name or as
  Anonymous.
- User B is not notified, and nothing about the hide is ever visible to User B.
- User B can still see and pray for User A's requests (this is one-directional).
- Existing prayer interactions and aggregate prayer counts are unchanged; hiding does not
  decrement or alter any count anywhere.
- User A can reverse the decision from Settings ("Unhide") at any time.
- If the hide originated from an Anonymous request, the identity behind that request is never
  stored, revealed, or inferable from anything this feature adds.

The user-facing label is always **"Hide requests from this account"**, everywhere the action or
its result appears. "Block user" is never used as interface text. Internally, this document and
the code comments sometimes use "account blocking" for platform-policy clarity (see
[Platform-policy framing](#platform-policy-framing)), but that phrase never appears in the app.

## Platform-policy framing

- "Hide requests from this account" is the app's account-level user-blocking control. It is the
  feature Apple's App Review Guidelines §1.2 (User-Generated Content) refers to as "the ability to
  block abusive users from the service," and the feature Google Play's User Generated Content
  policy refers to as blocking "objectionable UGC and users."
- It hides all current and future UGC (prayer requests) from the hidden account, for the user who
  initiated it. It does not affect what the hidden account can see.
- The user-facing language ("Hide requests from this account") is intentionally aligned with the
  prayer-community experience described in the approved Store Listing Copy and the Age Rating and
  Target Audience Worksheet, rather than borrowing generic social-app terminology.
- Store-review acceptance cannot be guaranteed before an actual review. This implementation closes
  the specific gap identified in the Age Rating and Target Audience Worksheet's pre-external-beta
  implementation blockers (Section 10a); it is not a claim that App Review or Google Play review
  will pass.
- If comments, messaging, mentions, public profiles, or other direct user-to-user interaction
  features are introduced later, this blocking model must be reassessed: it currently only affects
  what prayer requests a hidden account's author can contribute to the hider's feed, not any other
  surface, because no other surface exists yet.

## Entry points

1. **Prayer feed card** (`src/components/PrayerCard.tsx`, wired in
   `app/(app)/feed/index.tsx`): a small overflow button in the card header, shown only on another
   user's request (never the viewer's own). Tapping it goes directly to the confirmation.
2. **Prayer detail** (`app/(app)/feed/[id].tsx`): a text link next to "Report this request,"
   shown only on another user's request. On success, per the required behavior, the screen shows
   the success message, then returns to the feed (`router.replace('/(app)/feed')`), since the
   detail screen would otherwise be showing content the user just chose to stop seeing.
3. **Post-report completion** (`app/(app)/feed/report.tsx`): an optional secondary action on the
   "Thank you for letting us know" confirmation screen, added without changing any of the
   verified report-submission logic (`reason`/`notes`/`saving`/`done`/`error` state and
   `handleSubmit` are untouched; the hide action has its own separate state:
   `hidingAccount`/`accountHidden`/`hideError`). The "Done" button's destination is conditional on
   `accountHidden`: if no account was hidden, it preserves the original, verified
   `router.back()` behavior; if a hide succeeded, it uses `router.replace('/(app)/feed')` instead,
   because `router.back()` would return to the now-hidden author's detail route, which the detail
   screen correctly (but unhelpfully) resolves to "Prayer not found." The user is never
   intentionally routed to that screen after successfully hiding an account.

The action is never shown on the signed-in user's own requests, in any of the three entry points.

## Interface copy

All required copy lives in one place, `src/utils/hideAccountCopy.ts`, so it is identical across
every entry point:

- Menu action / link / button label: **"Hide requests from this account"**
- Confirmation title: **"Hide requests from this account?"**
- Confirmation body: the required two-part message, including the one-directional disclosure
  ("This does not prevent them from seeing prayer requests you share with the community.")
- Buttons: **Cancel** / **Hide requests**
- Success message: **"Requests from this account are now hidden."**

`confirmHideAccount(onConfirm)` shows the confirmation `Alert`; each entry point supplies its own
`onConfirm` (the actual hide call) and its own success/error handling, matching how
`confirmDeleteAccount` and the detail screen's remove-request confirmation are already structured
in this app.

## Data model

Collection: `hiddenAccounts/{blockerUid}_{hiddenUid}` (Firestore) or a single on-device list under
`p4u.hiddenAccounts` (local/mock mode). One record per blocker+hidden-account pair; the
deterministic id makes a hide naturally idempotent.

| Field | Type | Notes |
|---|---|---|
| `id` | string | `{blockerUid}_{hiddenUid}`. |
| `blockerUid` | string | The hiding user's own UID. Must equal `request.auth.uid`. Never shown in the UI. |
| `hiddenUid` | string | The hidden account's UID. Opaque; never shown in the UI. |
| `fromAnonymous` | boolean | Whether the triggering request was shown as Anonymous. |
| `displayLabelSnapshot` | string, optional | A private snapshot of the already-public display name, present **only** when `fromAnonymous` is false. Used solely so the blocker can recognize the entry in Settings. |
| `createdAt` | server timestamp (Firestore) / ISO string (local) | Set on create. |
| `schemaVersion` | number | `1`. For future migrations. |

**Never stored:** email, prayer-request text, the real display name behind an Anonymous request,
device information, a reason for hiding, or any other sensitive prayer content. The Firestore
rules enforce this with `keys().hasOnly([...])` plus an explicit `!('email' in ...)`.

## Architecture: the mode-aware seam

`src/services/hiddenAccounts.ts` is the one place that decides where a hide record lives, mirroring
`src/services/reports.ts`:

- **Firebase mode** (`isFirebaseConfigured()` true): `firebaseHiddenAccountService`
  (`src/services/firebase/hiddenAccountService.ts`) reads/writes the `hiddenAccounts` collection.
- **Local mode**: an on-device list under `p4u.hiddenAccounts`, read/written directly by the seam
  (not routed through `prayerService.ts`, which is scoped to prayer requests/interactions/reports;
  hidden accounts are an account-level concern, kept in its own small module rather than added to
  an unrelated one).

`PrayerContext` (`src/context/PrayerContext.tsx`) is the only consumer. It loads the signed-in
user's own hidden-account list as part of the same `load()` batch as everything else (requests,
interactions, reports, prayed-for ids), and exposes:

- `hiddenAccounts`: the loaded list, for the Settings "Hidden accounts" section.
- `isAccountHidden(userId)`: used defensively by the detail screen's direct-link fallback.
- `hideAccountForRequest(requestId, userId)`: looks up the request's author, anonymity flag, and
  cached display name from the already-loaded request (mirroring how `reportPrayer` derives
  `requestAuthorUid`), so every entry point only ever passes ids. Idempotent; throws a
  `HiddenAccountError` (`ownAccount`, `unavailable`, or a mapped Firebase failure) with safe copy.
- `unhideAccount(hiddenUserId, userId)`: reverses a hide. Idempotent.

**Filtering (the enforcement mechanism):** `prayers`, the single list every screen reads from
(feed, detail via `getById`, "Prayers I've prayed for," "My prayer requests"), is derived from
`baseline` with hidden authors removed via a small pure helper,
`src/utils/hiddenAccountFilter.ts` (`filterHiddenAccounts`), unit-tested in isolation
(`src/utils/hiddenAccountFilter.test.ts`, `npm run test:hidden-accounts`). Because every screen
reads from `prayers`, the filter is enforced in exactly one place and automatically covers:

- The default feed, newest sort, most-prayed sort, category filters, and the unprayed filter (all
  operate on `prayers` via `src/feed/feedQuery.ts`, unchanged).
- Prayer detail access through normal navigation (`getById` reads from `prayers`).
- "Prayers I've prayed for" (`getPrayedRequests` reads from `prayers`).
- Feed refresh and any future pagination (the filter recomputes on every `load()`, over whatever
  requests were fetched).
- Newly created requests from a hidden account (they are excluded from `prayers` the moment they
  are loaded, since filtering happens after load, not at creation time).

**The one exception, closed separately:** the prayer detail screen's fallback path
(`getRequestById(id)` in `app/(app)/feed/[id].tsx`) exists for a direct/deep link to a request not
already in the loaded feed, and bypasses `prayers` by design. This path now explicitly rechecks
`isAccountHidden(p.userId)` and resolves to the same "not found" state as a removed request if the
author is hidden, so a stale or shared link cannot surface hidden content.

## Anonymous privacy safeguards

This is treated as a critical requirement throughout:

- The hide record stores only the internal `hiddenUid` (the Firebase UID / local user id), never
  rendered as text anywhere.
- `displayLabelSnapshot` is populated **only** when `fromAnonymous` is false. For a hide triggered
  from an Anonymous request, no name is captured, stored, or derivable from the record.
- The Settings "Hidden accounts" list shows the literal string "Account hidden from an Anonymous
  request" for any entry with no snapshot, never the real name.
- No confirmation dialog, success message, error message, accessibility label, or code comment
  anywhere in this feature interpolates or logs the real name behind an Anonymous request.
- Automated coverage: `firebase-tests/tests/hiddenAccounts.test.mjs` includes a hide-from-Anonymous
  test (no name stored) and a test proving no query can filter by `hiddenUid` (see
  [Firestore rules](#firestore-rules)); `src/utils/hiddenAccountFilter.test.ts` proves the filter
  removes an Anonymous account's requests the same way as a named account's.

## Feed and interaction behavior

- Hidden requests never flash before disappearing: the hidden-account list loads in the same
  `Promise.all` batch as the feed itself, before the first render of `prayers`, so the very first
  paint already reflects the filter.
- A hidden-account list load failure is **not** swallowed to an empty list (unlike the "prayed
  for" lookup, which degrades gracefully). It propagates into `PrayerContext`'s existing `error`
  state, reusing the feed's existing "Couldn't load the feed" error UI: a safe, existing error
  state, not new UI, and never a silent fall-through to unfiltered content.
- Hiding an account does not create or modify a report, and does not change any `reportCount`.
- Reporting does not automatically hide an account; hiding is always a separate, explicit action,
  available afterward as an optional next step.
- Existing prayer interactions and aggregate `prayerCount` values are never touched by a hide or
  unhide.
- Editing or removing a request does not affect any hide relationship (hides are keyed by author
  uid, not by request id).
- Unhiding restores eligible active requests immediately, without a refetch, because `baseline`
  (the unfiltered superset) already holds them; only the derived `prayers` list changes.

## Local/mock fallback

Local mode uses the same on-device pattern as the rest of the prototype (`AsyncStorage`, JSON
array) under its own key `p4u.hiddenAccounts`. Hide, unhide, and the Settings list all work
identically to Firebase mode from the UI's perspective; the seam function signatures are the same
either way. Unlike most other local prototype data in this app, hidden-account storage **fails
closed**, matching Firebase mode's guarantee, because a silent failure here has a direct privacy
consequence (a previously-hidden account's requests could reappear):

- **Reads.** `readLocalHidden` (`src/services/hiddenAccounts.ts`) throws a `HiddenAccountError` if
  the underlying `AsyncStorage.getItem` call itself fails. The raw result is then handed to
  `parseStoredHiddenAccounts` (`src/utils/hiddenAccountStorage.ts`, a pure, framework-free
  module), which returns `[]` **only** for the legitimate case of `null` (the key has never been
  written, meaning nothing has ever been hidden). Missing keys, malformed JSON, a non-array value,
  or an array containing an entry with a missing or wrongly-typed field are all treated as
  corruption and throw, never silently returning `[]`. `PrayerContext.load` lets this propagate
  into the feed's existing `error` state, the same safe state a Firebase load failure produces, so
  the UI never shows an unfiltered feed because local storage was corrupted.
- **Writes.** `writeLocalHidden` throws a `HiddenAccountError` if `AsyncStorage.setItem` fails.
  Because `hideAccount` and `unhideAccount` always `await` the write before the caller
  (`PrayerContext.hideAccountForRequest` / `unhideAccount`) updates its in-memory
  `hiddenAccounts` state, a failed write never reaches the success path: the UI shows the safe
  error copy from `HiddenAccountError`, not a false "Requests from this account are now hidden."
  Idempotency is preserved either way: a hide that never persisted leaves no trace to deduplicate
  against, so retrying it behaves exactly like the first attempt, and it can never produce a
  duplicate entry once a write does succeed.
- **Account-deletion cleanup.** `deleteMyHiddenAccountsForAccountDeletion` removes the entire
  `p4u.hiddenAccounts` key in local mode (there is only one simulated profile, so there is no
  other user's outgoing hides stored under that key to preserve). It throws on failure, same as
  the read/write functions; `AuthContext.deleteAccount`'s local branch wraps it in the same
  inline best-effort `try`/`catch` already used for the local soft-remove-own-requests step, so a
  cleanup failure is logged behaviorally as a no-op and never blocks deletion, consistent with
  every other best-effort cleanup step in this codebase.

**Unit-tested in isolation:** `src/utils/hiddenAccountStorage.ts`'s validation and parsing logic
has zero AsyncStorage or React Native dependency (only a type-only import), so it is covered
directly by `src/utils/hiddenAccountStorage.test.ts` (`npm run test:hidden-accounts`), mirroring
`src/utils/hiddenAccountFilter.ts`. The `AsyncStorage` read/write calls themselves stay inside
`src/services/hiddenAccounts.ts` and are not directly unit-tested (this app has no React Native
module-mocking test harness), but their `try`/`catch`-and-rethrow shape is a two-line wrapper
around a single call, verified by code review and by the passing TypeScript build.

## Firestore rules

`mobile-app/firestore.rules` (local file; **not published**) adds a `hiddenAccounts/{hideId}`
block:

- `get`: a user may read only their own deterministic hide doc, authorized from the id prefix
  `{blockerUid}_` (works even before the doc exists, for the idempotent pre-check).
- `list`: owner-self-scoped (`resource.data.blockerUid == request.auth.uid`). This is what powers
  the Settings list and account-deletion cleanup. **No rule permits filtering or listing by
  `hiddenUid`**, so there is no way for a user to discover who has hidden them, including during
  their own account deletion; see [Account-deletion cleanup](#account-deletion-cleanup).
- `create`: signed-in; id must equal `{auth.uid}_{hiddenUid}`; `blockerUid` must be the caller;
  `hiddenUid` must not equal the caller (no self-hide); `fromAnonymous` must be a bool;
  `keys().hasOnly([...])` (no email, prayer text, reason, or device info).
- `update`: denied. A hide is immutable; a repeat hide is handled client-side as a no-op via the
  pre-check `get`, never as a write to an existing doc.
- `delete`: owner-only (`blockerUid == request.auth.uid`). Powers both "Unhide" and
  account-deletion cleanup of the user's own outgoing hides.

Unchanged and still enforced: every existing rule (users, prayerRequests, prayerInteractions,
reports) is untouched by this phase.

**Automated rules tests:** `firebase-tests/tests/hiddenAccounts.test.mjs` covers owner-only
create/get/list/delete, cross-user denial, self-hide denial, duplicate-write denial (the
idempotent no-op is handled client-side, not by the rules themselves), prohibited fields (email,
prayer text, a reason, device info), the `fromAnonymous` type check, update denial, and the
critical "no query can reveal who hid a given account" assumption. Run with
`cd mobile-app && npm run test:rules` (Java 11+, though the emulator warns that Java < 21 support
will be dropped in a future `firebase-tools` release); the full suite passes **74/74**, including
every pre-existing test.

**This must be republished before it takes effect in production.** As with every prior
rules-touching phase in this repository, the owner must publish the full contents of
`mobile-app/firestore.rules` in the Firebase Console (Firestore Database → Rules → Publish), or
via the Firebase CLI, before hiding/unhiding will work against the real Firebase project. This
implementation task did not do so, and did not modify Firebase Console data manually.

## Account-deletion cleanup

On account deletion (`src/context/AuthContext.tsx`, `deleteAccount`), a best-effort step deletes
the user's own **outgoing** hides (`deleteMyHiddenAccountsForAccountDeletion`,
`src/services/hiddenAccounts.ts`), in both modes:

- **Firebase branch:** placed alongside the existing `prayerInteractions` and `reports` cleanup
  steps, using the same `cleanupBestEffort` wrapper: awaited, but a failure is logged in dev and
  never blocks deletion (the critical steps, profile-doc delete and Auth delete, still run).
- **Local branch:** placed alongside the existing local soft-remove-own-requests step, using the
  same inline `try`/`catch` pattern already established there. It removes the entire
  `p4u.hiddenAccounts` key; a failure is swallowed (non-fatal, matching the existing local
  best-effort convention) and never blocks the rest of local deletion.

**Incoming hides (records where the deleted user is `hiddenUid`, i.e. other users' hides of this
account) are intentionally NOT touched, in either mode.** In Firebase mode this cannot be safely
enumerated: doing so would require a Firestore query filtered by
`hiddenUid == <the deleting user's own uid>`, which in turn would require a security rule
permitting a user to list documents by `hiddenUid`. Granting that, even only for the deleting
user's own account-deletion flow, would let any technically inclined user inspect the exact same
query outside the deletion flow and discover the UIDs of every account that has hidden them, which
is the "who hid me" reveal this feature explicitly must never allow. These records are preserved
as private safety records rather than silently claimed as deleted. In local mode this concern does
not arise the same way: there is only ever one simulated profile, so there is no other local
profile's "incoming hide" data that could exist under a different key; removing the single
`p4u.hiddenAccounts` key on local deletion is the complete, correct cleanup for that mode.

**Retention consequence, flagged for the later privacy-policy update:** after a user's account is
deleted, other users' `hiddenAccounts` records that reference the deleted account's former UID as
`hiddenUid` remain in Firestore indefinitely. This is low-risk in practice: the referenced account
no longer exists, has no active requests (account deletion already soft-removes them), and the
record itself contains no personal data: an opaque UID, a boolean, a timestamp, and at most a
display-name snapshot that was already public. Even so, the live Privacy Policy
(`https://productsparkstudio.com/privacy/`) does not yet describe this retention, and should be
updated to do so. This implementation does not make that edit; per the approved Age Rating and
Target Audience Worksheet, updates to the live Privacy Policy and Terms of Use are scheduled as
part of the separate UGC Compliance Blocker task.

## Files changed or created

Recomputed directly from `git status` and `git diff`, separating files this feature actually
created or edited from pre-existing files that happened to already be modified or untracked for
unrelated reasons at the start of this work.

**Created by this feature (11):**
1. `src/services/firebase/hiddenAccountErrors.ts`: `HIDDEN_ACCOUNT_ERROR_COPY`,
   `HiddenAccountError`, `hiddenAccountError`.
2. `src/services/firebase/hiddenAccountService.ts`: `firebaseHiddenAccountService`
   (`hide`/`listMine`/`unhide`/`deleteAllMine`).
3. `src/services/hiddenAccounts.ts`: mode-aware seam (`hideAccount`, `listMyHiddenAccounts`,
   `unhideAccount`, `deleteMyHiddenAccountsForAccountDeletion`, `hiddenAccountsUseFirebase`).
4. `src/utils/hideAccountCopy.ts`: shared interface copy and `confirmHideAccount`.
5. `src/utils/hiddenAccountFilter.ts`: pure `filterHiddenAccounts`, unit-tested.
6. `src/utils/hiddenAccountFilter.test.ts`: unit tests.
7. `src/utils/hiddenAccountStorage.ts`: pure local-storage parsing/validation
   (`parseStoredHiddenAccounts`, `isValidStoredHiddenAccount`), unit-tested.
8. `src/utils/hiddenAccountStorage.test.ts`: unit tests (both test files run via
   `npm run test:hidden-accounts`).
9. `firebase-tests/tests/hiddenAccounts.test.mjs`: Firestore rules tests.
10. `docs/firebase-hidden-accounts-implementation.md`: this document.
11. `docs/QA_hidden_accounts_scenarios.md`: manual QA checklist and completed 2026-08-16 execution
    record.

**Existing files edited by this feature (13):**
1. `src/models/types.ts`: added the `HiddenAccount` type.
2. `src/services/firebase/contracts.ts`: added `StoredHiddenAccount`, `HiddenAccountService`.
3. `src/context/PrayerContext.tsx`: loads hidden accounts, filters `prayers`, exposes
   `hiddenAccounts`/`isAccountHidden`/`hideAccountForRequest`/`unhideAccount`.
4. `src/context/AuthContext.tsx`: added the account-deletion cleanup step in both the Firebase and
   local branches, and updated the `cleanupBestEffort` docblock; no other line in this file's
   substantial in-progress Terms-acceptance work was touched.
5. `src/components/PrayerCard.tsx`: added the optional `onHide` prop and overflow button.
6. `app/(app)/feed/index.tsx`: wired `handleHide`, passed to `PrayerCard`.
7. `app/(app)/feed/[id].tsx`: added the hide link, the post-hide navigation to feed, and the
   hidden-account-safe direct-link fallback.
8. `app/(app)/feed/report.tsx`: added the optional post-report hide action, fully isolated from
   the verified report-submission state and logic, including the corrected conditional "Done"
   navigation.
9. `app/(app)/settings.tsx`: added the "Hidden accounts" section (list, Unhide, empty/loading/error
   states).
10. `mobile-app/firestore.rules`: added the `hiddenAccounts` block and updated the header comment.
    The complete updated rules were published before the 2026-08-16 manual QA session.
11. `firebase-tests/tests/helpers.mjs`: added `hiddenAccountDoc()` (append-only; the file's
    pre-existing in-progress `termsAcceptedVersion` additions were not touched).
12. `mobile-app/package.json`: added the `test:hidden-accounts` script (now covering two test
    files).
13. `docs/reviews/Beta_Readiness_Assessment.md`: two dated annotations noting user-blocking is now
    implemented; the original historical text was preserved, not rewritten.

**Pre-existing, unrelated to this feature, and not attributed to it:** `app/(app)/submit.tsx`,
`app/(auth)/create-profile.tsx`, `src/components/PrayerForm.tsx`, `src/components/PolicyLinks.tsx`,
`src/services/firebase/userService.ts`, `firebase-tests/tests/users.test.mjs`,
`mobile-app/README.md`, `mobile-app/app.json`, `mobile-app/eas.json`, several `docs/QA_*.md` and
other docs files, and `docs/reviews/Pre_Developer_Account_Readiness_Plan.md`. All of these were
already modified or untracked, by other in-progress work, before this feature began, and none of
them were touched by it. `mobile-app/firebase-tests/package-lock.json` is a benign side effect of
running `npm install` to execute the rules tests, not a deliberate change; it is called out
separately because it is neither "created" nor "edited" content, just a regenerated lockfile.

## Known limitations

- No in-app age gate, Terms-acceptance-before-posting, or pre-publication content filter was added
  or changed; those are separately scoped in the UGC Compliance Blocker task per the approved
  worksheet, and were explicitly out of scope for this task.
- Reporting is still request-scoped; there is no separate "report this account" action distinct
  from hiding. This was already a known, tracked gap before this task and is not introduced by it.
- Hiding is one-directional and account-scoped only; it says nothing about comments, messaging, or
  any other interaction surface, because none of those exist in the app today. See
  [Platform-policy framing](#platform-policy-framing).
- The `AsyncStorage.getItem`/`setItem`/`removeItem` calls inside `src/services/hiddenAccounts.ts`
  are not directly unit-tested (this app has no React Native module-mocking test harness); the
  fail-closed parsing/validation logic they depend on is fully unit-tested in isolation
  (`src/utils/hiddenAccountStorage.test.ts`), and the read/write/delete wrappers around the
  storage calls themselves are small enough to verify by code review.
