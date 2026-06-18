# Firebase Account Deletion Implementation (Phase J.2d, revisited in J.2f.2)

**Status:** user-initiated **account deletion** is implemented from Settings. A signed-in user can,
in one calm, confirmed flow: have their **active prayer requests soft-removed** from the feed, then
their private Firestore profile document (`users/{uid}`) deleted, then their **Firebase Auth** user
deleted, after which the app returns to the signed-out / welcome state. No real Firebase values are
committed, and the app still runs in a **local/mock fallback** when Firebase is not configured.

**J.2f.2 update:** account deletion was first built (J.2d) before prayer requests moved to Firestore,
so it only handled the Auth user + profile. Now that `prayerRequests` live in Firestore (J.2e), a
deleting user can have authored requests, so deletion now also cleans those up — by **soft-remove**,
not hard delete (see [why](#why-prayerrequests-are-soft-removed-not-hard-deleted)).

The manual end-to-end checklist is [`docs/QA_delete_scenarios.md`](./QA_delete_scenarios.md).

---

## What deletion does now

From **Settings → Delete account**, after an explicit confirmation, in this order while the user is
still authenticated:

1. **Soft-removes the user's active prayer requests** in Firestore (status -> `removed`,
   `removedReason: 'accountDeleted'`, `removedAt` + `updatedAt` set). Never a hard delete.
2. Deletes the user's private Firestore profile document at `users/{uid}`.
3. Deletes the **Firebase Auth user** (by the book, via the Firebase JS SDK `deleteUser`).
4. Clears local session state and returns the app to the **signed-out / welcome** state, showing a
   calm confirmation: "Your account has been deleted."

It affects **only the signed-in user's own** data. There is no admin / service-account behavior, no
other user's requests are touched, and a request the user only *prayed for* (someone else's request)
is never removed.

## What happens to Firebase Auth

- The current user is removed with `deleteUser(auth.currentUser)` in
  `src/services/firebase/authService.ts` (`deleteAccount`).
- Firebase may require a recent sign-in. When it returns `auth/requires-recent-login`, the flow
  surfaces calm copy ("For your security, please sign in again before deleting your account.") and
  offers a "Sign in again" action that signs the user out so they can sign in fresh and retry. The
  account is **not** deleted until a deletion actually succeeds, so a blocked attempt leaves both the
  Auth user and the profile intact.
- Once deleted, the Auth state listener (`onAuthStateChanged`) clears the in-app profile/session, so
  the (app) layout redirects to the welcome screen. A deleted user is **not** restored on app
  restart, and they cannot sign back in with the old credentials.
- Raw Firebase error codes/messages are never shown. All deletion errors map to safe copy in
  `src/services/firebase/authErrors.ts` (`DELETE_ERROR_COPY`, `accountDeletionError`).

## What happens to `users/{uid}`

- The profile document is deleted with `deleteDoc(doc(db, 'users', uid))` in
  `src/services/firebase/userService.ts` (`deleteOwnProfile`). `deleteDoc` is a no-op if the doc is
  already gone.
- This is **owner-only**: the security rules already allow a signed-in user to delete only their own
  `users/{uid}` (added in J.2c for exactly this phase). No broad delete permission was introduced.
- Only the `users/{uid}` document is touched. No other user's data is read, written, or deleted.

## What happens to the user's active `prayerRequests`

- Each of the user's currently **active** requests is **soft-removed** (not hard-deleted) via
  `firebasePrayerRequestService.softRemoveAllByOwner(uid)` in
  `src/services/firebase/prayerRequestService.ts`, reached through the mode-aware seam
  `removeOwnRequestsForAccountDeletion` in `src/services/prayerRequests.ts`.
- For each owned active request the write sets:
  - `status: 'removed'`
  - `removedReason: 'accountDeleted'`
  - `removedAt: serverTimestamp()`
  - `updatedAt: serverTimestamp()`
- The protected fields `authorUid`, `createdAt`, and `prayerCount` are **left unchanged**, and no
  `email` is ever written.
- Writes are **batched** (`writeBatch`, chunked at 450 to stay under Firestore's 500-op limit) and
  the step is **idempotent**: only requests whose status is not already `removed` are touched, so a
  retry after a partial failure simply finishes the rest.
- After soft-remove, the requests **no longer appear** in the feed (`listActive` filters
  `status == 'active'`) or in **My Prayer Requests** (`listMine` filters to active). They are not
  hard-deleted, so any future report or interaction that references a request can never dangle.
- **Only the user's own requests** are affected (`where('authorUid', '==', uid)`). Requests authored
  by other users, and requests this user merely *prayed for*, are never changed.
- Raw UIDs are never shown in the UI; `authorUid` stays opaque and internal.

## Deletion order (and why)

The order is **prayer requests soft-removed → `users/{uid}` profile → Firebase Auth → local state**,
all while the user is still authenticated:

1. **Soft-remove the user's active `prayerRequests` first**, while still authenticated. The owner-only
   update rule requires `request.auth.uid == authorUid`, so this must happen before the Auth user is
   gone. If it fails (e.g. `permission-denied` or a network drop), the flow **stops** and surfaces
   calm copy; the account is left intact so the user can retry, and we never delete the account while
   their requests are still visible in the feed.
2. **Delete `users/{uid}` next**, still authenticated (owner-only rules). On failure the flow stops;
   the Auth user is left intact so nothing is orphaned.
3. **Delete the Firebase Auth user.**
4. **Clear local session state** and return to the signed-out / welcome state.

Doing Auth first would risk **orphaned** Firestore data: once the Auth user is gone there is no
authenticated session to satisfy the owner-only rules, so neither the profile doc nor the requests
could be touched by the client. Doing all Firestore work first avoids that. (Edge case: if Auth
deletion is blocked by requires-recent-login *after* the profile doc was deleted, the next sign-in
backfills a fresh profile doc via the existing J.2c sign-in path, and the retry deletes it again;
the already-soft-removed requests stay removed. No orphan, no data leak.)

## Why `prayerRequests` are soft-removed, not hard-deleted

This is the owner's decision for Alpha, and it is deliberate:

- **User-facing behavior should feel like the requests are gone** — and it does: they leave the feed,
  the detail screen, and My Prayer Requests immediately.
- **The backend keeps a minimal removed record** for safety, future moderation, auditability, and
  data consistency.
- **Future reports and prayer interactions may reference a request.** Hard-deleting requests could
  create broken references once those move to Firestore. Soft-remove keeps references intact.
- **A future retention policy** can decide whether removed, account-deleted requests are permanently
  deleted or anonymized after a defined period. Soft-remove leaves that door open; a hard delete
  would not.

## Fallback behavior (no Firebase config)

- With no `.env.local`, `isFirebaseConfigured()` is false → the app runs in **local mode**. Account
  deletion first **soft-removes the user's own submitted requests** on-device (best-effort: their ids
  are added to the local soft-removed set, mirroring the Firebase behavior so they leave the feed and
  My Prayer Requests), then clears the on-device profile/session (`AsyncStorage` keys `p4u.profile`,
  `p4u.signedIn`) and returns to the signed-out / welcome state.
- No Firestore or Auth calls are made in local mode, the local soft-remove never blocks deletion, and
  the app **does not crash** without `.env.local`.

## Error handling

All copy is calm and non-technical, with no em dashes, and no raw Firebase detail
(`src/services/firebase/authErrors.ts`):

| Situation                | Code(s)                                          | Copy shown |
|--------------------------|--------------------------------------------------|------------|
| Recent login required    | `auth/requires-recent-login`                     | "For your security, please sign in again before deleting your account." |
| Network issue            | `auth/network-request-failed`, `unavailable`, `deadline-exceeded` | "We could not connect right now. Please check your connection and try again." |
| Permission / stale session | `permission-denied`, `unauthenticated`         | "We could not complete that request. Please try signing in again." |
| Anything else            | (fallback)                                        | "We could not delete your account right now. Please try again." |

Every step (soft-removing requests, deleting the profile, deleting the Auth user) is mapped through
the same `accountDeletionError`, so a failure to remove prayer requests, to delete the profile, or to
delete the account all surface as the matching calm copy above — the user is never shown which step
failed or any raw Firebase detail. The `softRemoveAllByOwner` step lets its raw Firebase error
propagate precisely so the deletion caller can map it here (a `permission-denied` or `unavailable`
during soft-remove therefore shows the permission/network copy).

The recent-login case is special: it sets `requiresRecentLogin` on the `AccountDeletionError`, and the
Settings screen offers a "Sign in again" path. A blocked deletion (at any step) leaves the account,
the profile doc, and any not-yet-removed requests intact, and the user can retry.

## Files changed

J.2d (original deletion of Auth + profile):

- `src/services/firebase/authService.ts` — `deleteAccount` (`deleteUser`), mapping failures to safe
  copy.
- `src/services/firebase/userService.ts` — `deleteOwnProfile(uid)` (`deleteDoc` of own doc).
- `src/services/firebase/authErrors.ts` — `DELETE_ERROR_COPY`, `AccountDeletionError`,
  `accountDeletionError`.

J.2f.2 (this revisit — prayer request cleanup):

- `src/services/firebase/prayerRequestService.ts` — added `softRemoveAllByOwner(uid)`: queries the
  owner's requests, batch-updates active ones to `status: 'removed'`, `removedReason: 'accountDeleted'`,
  `removedAt`/`updatedAt`. Never hard-deletes; protected fields untouched; no email.
- `src/services/firebase/contracts.ts` — added `softRemoveAllByOwner` to `PrayerRequestService`.
- `src/services/prayerRequests.ts` — added the mode-aware seam `removeOwnRequestsForAccountDeletion(uid)`
  (Firebase: batch soft-remove; local: add the user's own submitted-request ids to the soft-removed
  set).
- `src/context/AuthContext.tsx` — `deleteAccount` now soft-removes the user's requests **first** (both
  modes), before the profile/Auth deletes.
- `app/(app)/settings.tsx` — updated the Delete account confirmation + danger-card copy to say active
  prayer requests are removed from the feed (no backend detail, no em dashes).
- `firestore.rules` — **unchanged** (the existing owner-only update rule already permits this; see
  below).

## Rules changes / republish

**No rules change is required for this phase, and nothing needs republishing.** The owner-only
*update* rule on `prayerRequests` (added in J.2e) already permits the soft-remove account-deletion
writes:

```
allow update: if isSignedIn()
  && resource.data.authorUid == request.auth.uid           // owner only
  && request.resource.data.authorUid == resource.data.authorUid   // authorUid unchanged
  && request.resource.data.createdAt == resource.data.createdAt   // createdAt unchanged
  && request.resource.data.prayerCount == resource.data.prayerCount // prayerCount unchanged
  && request.resource.data.status in ['active', 'removed']  // status -> removed allowed
  && !('email' in request.resource.data);                  // no email
```

Setting `status: 'removed'` plus the extra `removedReason` / `removedAt` / `updatedAt` fields all pass
this rule (it does not restrict adding non-protected fields), so the soft-remove works under the
already-published rules. The rules still **block**: unauthenticated access, hard deletes
(`allow delete: if false`), editing another user's request, changing `authorUid` / `createdAt` /
`prayerCount`, reading other users' `users/{uid}` profiles, and any `prayerInteractions` / `reports` /
other collection (catch-all `allow read, write: if false`).

> If the owner has already published the current `mobile-app/firestore.rules`, there is nothing to do.

## What is still out of scope

- **Prayer interactions** ("I prayed for this") and **reports** are still local/mock and are **not**
  in Firestore. Deletion does not (and cannot) touch them there yet, and this phase does not add them.
- There is still no "who prayed" data anywhere, and aggregate-only interaction assumptions are
  unchanged.

## Why deletion must be revisited again once interactions/reports move to Firestore

When prayer interactions and reports move into Firestore, "delete my account" will need to decide what
happens to **those** records too — for example removing the user's own interactions and detaching or
anonymizing their reports — and the security rules and this checklist must be expanded accordingly.
The current soft-remove of requests is deliberately chosen so that future interaction/report records
that reference a request never dangle. The deletion routine should be **revisited** in each of those
phases before external testers rely on a complete erasure.

## Testing steps

See [`docs/QA_delete_scenarios.md`](./QA_delete_scenarios.md) for the full owner checklist (including
the new **Delete Account With Active Prayer Requests** scenario). Quick summary:

1. With `.env.local` present and rules published, create a throwaway account; create one named and one
   anonymous prayer request; confirm both appear in the feed and in `prayerRequests` in Firestore.
2. Settings → Delete account → confirm. Confirm the app returns to the welcome screen, the Auth user
   is gone, and the profile doc is gone.
3. In Firestore, confirm the user's requests are **soft-removed, not hard-deleted**: each still exists
   with `status: removed`, `removedReason: accountDeleted`, and `removedAt` set. Confirm they no
   longer appear in the feed.
4. Confirm other users' requests are unchanged, and that no `prayerInteractions` / `reports`
   collections were written and no email is stored on any request.
5. Restart Expo Go; confirm the deleted user is not restored and cannot sign back in.
6. Optionally test the local/mock fallback (rename `.env.local`, confirm deletion clears local state,
   removes the user's own local requests from the feed, and the app does not crash) and the
   requires-recent-login copy.

## Validation performed

- TypeScript type-check passes (`npx tsc --noEmit`).
- Secret scan: no real Firebase config, project IDs, keys, tokens, or service-account keys committed;
  `.env.local` remains gitignored.
- `legacy-web-app/` and `.claude/` untouched; Expo SDK unchanged; no native modules added.

## Next recommended phase: J.2f — Firestore prayer interactions

Move **prayer interactions** ("I prayed for this") into Firestore as **aggregate-only** data (a count
on the request; never a readable list of who prayed), behind the existing seam, with security rules +
tests. Then revisit account deletion again to handle a deleting user's own interactions. Reports
(admin-read only) follow in their own phase, and account deletion should be revisited there too.
