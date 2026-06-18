# Firebase Account Deletion Implementation (Phase J.2d)

**Status:** user-initiated **account deletion** is now implemented from Settings. A signed-in user
can delete their Firebase Auth sign-in and their private Firestore profile document (`users/{uid}`)
in one calm, confirmed flow, and the app returns to the signed-out / welcome state. No real Firebase
values are committed, and the app still runs in a **local/mock fallback** when Firebase is not
configured.

This is the gate that had to land before broader Firestore work (prayer requests, then interactions,
then reports) and before external testers. The manual end-to-end checklist is
[`docs/QA_delete_scenarios.md`](./QA_delete_scenarios.md).

---

## What deletion does now

From **Settings → Delete account**, after an explicit confirmation:

1. Deletes the user's private Firestore profile document at `users/{uid}` **first**, while the user
   is still authenticated (owner-only rules require an active session).
2. Deletes the **Firebase Auth user** (by the book, via the Firebase JS SDK `deleteUser`).
3. Clears local session state and returns the app to the **signed-out / welcome** state, showing a
   calm confirmation: "Your account has been deleted."

It deletes **only the signed-in user**. There is no admin / service-account behavior, and no other
user can be affected.

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
- Only the `users/{uid}` document is touched. No prayer data is read, written, or deleted.

## Deletion order (and why)

The order is **Firestore profile first, then Firebase Auth**:

1. **Delete `users/{uid}` first**, while still authenticated. The owner-only rules require an active
   session, so the profile must be removed before the Auth user is gone. If this step fails (e.g.
   `permission-denied` or a network drop), the flow stops and surfaces calm copy; the Auth user is
   left intact so nothing is orphaned and the user can retry.
2. **Delete the Firebase Auth user** next.
3. **Clear local session state** and return to the signed-out / welcome state.

Doing Auth first would risk an **orphaned** profile document: once the Auth user is gone there is no
authenticated session to satisfy the owner-only delete rule, so the doc could never be removed by the
client. Firestore-first avoids that. (Edge case: if Auth deletion is blocked by requires-recent-login
*after* the profile doc was deleted, the next sign-in simply backfills a fresh profile doc via the
existing J.2c sign-in path, and the retry deletes it again. No orphan, no data leak.)

## Fallback behavior (no Firebase config)

- With no `.env.local`, `isFirebaseConfigured()` is false → the app runs in **local mode**. Account
  deletion clears the on-device profile/session (`AsyncStorage` keys `p4u.profile`, `p4u.signedIn`)
  and returns to the signed-out / welcome state.
- No Firestore or Auth calls are made in local mode, and the app **does not crash** without
  `.env.local`.

## Error handling

All copy is calm and non-technical, with no em dashes, and no raw Firebase detail
(`src/services/firebase/authErrors.ts`):

| Situation                | Code(s)                                          | Copy shown |
|--------------------------|--------------------------------------------------|------------|
| Recent login required    | `auth/requires-recent-login`                     | "For your security, please sign in again before deleting your account." |
| Network issue            | `auth/network-request-failed`, `unavailable`, `deadline-exceeded` | "We could not connect right now. Please check your connection and try again." |
| Permission / stale session | `permission-denied`, `unauthenticated`         | "We could not complete that request. Please try signing in again." |
| Anything else            | (fallback)                                        | "We could not delete your account right now. Please try again." |

The recent-login case is special: it sets `requiresRecentLogin` on the `AccountDeletionError`, and the
Settings screen offers a "Sign in again" path. A blocked deletion leaves the Auth user and the
profile doc intact.

## Files changed

- `src/services/firebase/authService.ts` — implemented `deleteAccount` (`deleteUser`), mapping
  failures to safe copy. (No longer throws `NotImplementedError`.)
- `src/services/firebase/userService.ts` — added `deleteOwnProfile(uid)` (`deleteDoc` of own doc).
- `src/services/firebase/contracts.ts` — added `deleteOwnProfile` to `UserService`.
- `src/services/firebase/authErrors.ts` — added `DELETE_ERROR_COPY`, `AccountDeletionError`,
  `accountDeletionError`.
- `src/services/firebase/index.ts` — re-exports the new deletion error helpers.
- `src/context/AuthContext.tsx` — added `deleteAccount` to the auth seam (Firestore-first ordering;
  local/mock fallback).
- `app/(app)/settings.tsx` — added the **Delete account** section, confirmation dialog, success copy,
  and error handling (including the sign-in-again path).
- `firestore.rules` — **unchanged** (owner-only delete on `users/{uid}` was already added in J.2c).

## Rules changes / republish

**No rules change is required for this phase.** The owner-only delete permission on `users/{uid}`
was already present in `mobile-app/firestore.rules` from J.2c:

```
match /users/{uid} {
  allow read, create, update, delete: if isOwner(uid);
}
```

If the owner already published the current `mobile-app/firestore.rules` (the simplified J.2c
version), **no action is needed**. If an older draft is still live, republish the current
`mobile-app/firestore.rules` in the Firebase Console (Firestore Database → Rules → Publish).

## What remains out of scope (until prayer requests move to Firestore)

- Prayer requests, prayer interactions, and reports are still local/mock and are **not** in
  Firestore. Deletion does not (and cannot) touch them there yet.
- Therefore this deletion handles **only** the Firebase Auth user and the `users/{uid}` profile.

## Why deletion must be revisited once `prayerRequests` exist

Once prayer requests, interactions, and reports live in Firestore, "delete my account" must also
decide what happens to that data — for example soft-removing or anonymizing the user's own requests,
removing their interactions, and detaching their reports — so deletion stays a genuine, complete
erasure of personal data. The current flow is correct for today's data surface (Auth + profile), but
the deletion routine, the security rules, and this checklist must be **revisited and expanded** in
the phase that moves prayer data into Firestore, before external testers rely on it.

## Testing steps

See [`docs/QA_delete_scenarios.md`](./QA_delete_scenarios.md) for the full owner checklist. Quick
summary:

1. With `.env.local` present and rules published, create a throwaway account; confirm the Auth user
   and `users/{uid}` profile exist (and that the profile has no email).
2. Settings → Delete account → confirm. Confirm the app returns to the welcome screen, the Auth user
   is gone, and the profile doc is gone.
3. Restart Expo Go; confirm the deleted user is not restored and cannot sign back in.
4. Confirm no `prayerRequests` / `prayerInteractions` / `reports` were written to Firestore.
5. Optionally test the local/mock fallback (rename `.env.local`, confirm deletion clears local
   state and the app does not crash) and the requires-recent-login copy.

## Validation performed

- TypeScript type-check passes (`npx tsc --noEmit`).
- Secret scan: no real Firebase config, project IDs, keys, tokens, or service-account keys committed;
  `.env.local` remains gitignored.
- `legacy-web-app/` and `.claude/` untouched; Expo SDK unchanged; no native modules added.

## Next recommended phase: J.2e — Firestore prayer requests

Move **prayer requests** into Firestore behind the existing service seam (owner-private writes,
public-read with data minimization, no raw UIDs / email leaked), with security rules + emulator
tests. Then revisit account deletion to also handle the user's prayer data. Interactions
(aggregate-only) and reports (admin-read) follow in their own phases.
