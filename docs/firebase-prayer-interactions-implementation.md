# Firebase Prayer Interactions Implementation (Phase J.2f.3)

**Status:** the "I prayed for this" interaction now moves from local/mock storage to Firestore. A
signed-in user can pray for a request once, the request's aggregate `prayerCount` increments, and
**only the aggregate count is ever visible to other users** — there is no "who prayed" data anywhere.
No real Firebase values are committed, and the app still runs in a **local/mock fallback** when
Firebase is not configured.

This phase implements **prayer interactions only**. It does not add reports, push notifications, AI,
social/Google sign-in, passwordless, or anonymous auth, and it does not change the aggregate-only
assumption. The manual end-to-end checklist is
[`docs/QA_prayer_interaction_scenarios.md`](./QA_prayer_interaction_scenarios.md).

---

## What moved to Firestore

| Concern | Before (J.2e) | Now (J.2f.3, Firebase mode) |
|---|---|---|
| "I prayed for this" | local AsyncStorage list, derived count | Firestore `prayerInteractions` + server `prayerCount` |
| Already-prayed state | from local list | from the user's own interaction docs |
| Prayers I've prayed for | from local list | from the user's own interaction docs |
| Reports | local/mock | **unchanged — still local/mock** |
| Verses | local | **unchanged — local** |

In **local mode** (no `.env.local`) everything behaves exactly as before.

## Architecture: the mode-aware seam

A new seam `src/services/prayerInteractions.ts` is the single place that decides where interaction
data lives:

- **Firebase mode** (`isFirebaseConfigured()` true): `firebasePrayerInteractionService` reads/writes
  Firestore.
- **Local mode**: `PrayerContext` keeps its original on-device interaction list (`prayerService`).

`PrayerContext` branches on `interactionsUseFirebase()` for `pray`, `hasPrayed`, and
`getPrayedRequests`, so screens (feed card, detail, "Prayers I've prayed for") are unchanged and work
in both modes.

## Collection and fields: `prayerInteractions/{uid}_{requestId}`

The document id is **deterministic** — `{userUid}_{requestId}` — which is what guarantees
**one prayer per user per request**: a repeat attempt targets the same id, so a duplicate can never
be created. (Firebase UIDs and Firestore auto-ids contain no underscores, so the id is unambiguous.)

| Field | Type | Notes |
|---|---|---|
| `id` | string | The doc id, `{uid}_{requestId}` (stored for parity with the documented model). |
| `userUid` | string | The praying user's own UID. Must equal `request.auth.uid`. Never shown in the UI. |
| `requestId` | string | The request prayed for. |
| `createdAt` | server timestamp | Set on create. |
| `schemaVersion` | number | `1`. For future migrations. |

**No email and no display name** are ever stored on an interaction. There is no "who prayed" list.

## How praying works (`prayForRequest` -> `pray` transaction)

`firebasePrayerInteractionService.pray(userUid, requestId)` runs a **Firestore transaction** so the
interaction creation and the count increment are consistent (both happen, or neither):

1. Confirm the user is signed in (the service is only reached in Firebase mode behind the seam).
2. Read `prayerRequests/{requestId}`. If it is missing or `status !== 'active'`, throw a safe
   `PrayerInteractionError('unavailable')` — never create an interaction, never increment.
3. Read `prayerInteractions/{uid}_{requestId}`. If it already exists, return `{ created: false }` —
   no double-count, no write.
4. Otherwise `set` the interaction doc and `update` the request with a **literal**
   `prayerCount: currentCount + 1` (computed from the value read in step 2), atomically. Return
   `{ created: true }`.

> **Important (bug fix):** the update writes a **literal number**, not `FieldValue.increment(1)`. A
> server-side `increment()` transform is not a concrete value during security-rule evaluation, so the
> rule's exact-value check (`request.resource.data.prayerCount == resource.data.prayerCount + 1`)
> fails and the update is rejected. Because the count update and the interaction `set` commit
> atomically in the transaction, that rejection rolled back **both** writes — so during QA **no
> interaction document was created and the count never moved**. Writing the literal `currentCount + 1`
> (race-safe inside the transaction) makes the rule's check pass. This was the root cause fixed in the
> "fix: create Firestore prayer interactions" change.

`PrayerContext` then marks the request prayed locally and, only when a new interaction was created,
optimistically bumps the displayed count by 1. A later refresh reconciles with the authoritative
Firestore count. A **synchronous guard** (`prayedKeys`) also prevents rapid double-taps from issuing
two writes before state updates; on failure the guard is released so the user can retry.

## Prayer count behavior

- The displayed `prayerCount` in Firebase mode comes **straight from the Firestore request document**
  (the source of truth). No local prayer delta is layered on top (that is local mode only), so counts
  can never double-count across refreshes or devices.
- The count only ever changes by **+1**, and only as part of a valid first-time interaction (enforced
  in the security rules, below). Clients cannot set arbitrary counts.

## Duplicate prevention (three layers)

1. **Deterministic doc id** `{uid}_{requestId}` — a second pray targets the same doc.
2. **Transaction check** — if the interaction already exists, the transaction makes no change.
3. **Security rules** — `create` is allowed only when the doc does not already exist, and the +1 to
   `prayerCount` is allowed only when the interaction did **not** exist before and **will** exist
   after the same commit (`!exists` + `existsAfter`).

## Prayers I've prayed for

Wired to Firestore in this phase. On load, `PrayerContext` hydrates the current user's prayed-for set
from `listMinePrayedFor(uid)` (a query of the user's **own** interactions, returning request ids
only). The existing screen (`app/(app)/feed/prayed-for.tsx`) filters the loaded active feed by that
set, so it shows the user's prayed-for **active** requests and never any who-prayed data about anyone
else. A request the user prayed for that is later removed simply drops out of the list (it leaves the
feed). No screen changes were needed.

## Error handling

`src/services/firebase/interactionErrors.ts` maps failures to calm, safe copy (no raw Firebase
detail, no em dashes). A `PrayerInteractionError` carries a `code` plus user-facing `message`; the
feed and detail screens surface the message.

| Situation | Code | Copy shown |
|---|---|---|
| Could not pray (write failed) | `generic` | We could not mark this as prayed for right now. Please try again. |
| Already prayed | `already` | You have already prayed for this request. |
| Request removed / missing | `unavailable` | This prayer request is no longer available. |
| Network issue | `network` | We could not connect right now. Please check your connection and try again. |
| Permission / stale session | `permission` | We could not complete that request. Please try signing in again. |

> Note on a removed request: if a non-owner taps pray on a request that was just removed, the
> transaction's read of that request is denied by the request read rule, so the user sees the
> `permission` copy rather than `unavailable`. Either way no interaction is created and the count is
> not changed. Removed requests normally leave the feed, so this is an edge case.

## Security rules — owner must republish

`mobile-app/firestore.rules` was **updated**, so the owner **must republish the full file** in the
Firebase Console (Firestore Database > Rules > Publish) **before QA**.

What changed:

- **`prayerInteractions/{interactionId}` block:**
  - `get` (single doc): authorized from the **document id prefix** —
    `interactionId[0:(uid.size()+1)] == uid + '_'` — so a user may read only their own deterministic
    doc, **and it works even when that doc does not exist yet**. This is what the pray transaction's
    duplicate-check read needs (see the bug fix below).
  - `list` (query): only when constrained to the caller's own `userUid`
    (`resource.data.userUid == request.auth.uid`), exactly how `listMinePrayedFor` queries, so no one
    can enumerate who prayed.
  - `create`: signed-in, `userUid == request.auth.uid`, the doc id must equal
    `{uid}_{requestId}`, no `email` field, and the target request must **exist and be active**.
  - `update`, `delete`: denied (interactions are immutable from the client; no "un-pray").

  > **Bug fix (permission-denied on the duplicate check):** the read rule was originally a single
  > `allow read: if isSignedIn() && resource.data.userUid == request.auth.uid`. The pray transaction
  > reads `prayerInteractions/{uid}_{requestId}` **before** creating it, to avoid a double-count. For
  > a not-yet-existing doc, `resource` is `null`, so `resource.data.userUid` errors and the get is
  > denied — surfacing as `permission-denied` on `BatchGetDocuments`, which (inside the transaction)
  > failed the whole pray. Splitting `read` into an id-prefix-based `get` (works when the doc is
  > missing) and a `userUid`-based `list` fixes it while keeping the same privacy guarantees.
- **"pray" `allow update` on `prayerRequests`:** a signed-in user may raise `prayerCount` by
  **exactly +1**, and change **only** `prayerCount`, on an **active** request, but only in the same
  commit that creates their **brand-new** interaction doc (`!exists` before + `existsAfter`). This
  ties the increment to a real, first-time, per-user interaction so the count cannot be inflated on
  its own. The rule logic is unchanged by the bug fix; only its comment was clarified to require the
  client to write a **literal** `+ 1` (not an `increment()` transform) so the exact-value check
  passes.

What the rules still **block**: unauthenticated access; creating an interaction for another user;
duplicate interactions (deterministic id + create-only); praying for a removed request; arbitrary or
repeated `prayerCount` changes; editing another user's request; changing `authorUid` / `createdAt`;
hard-deleting requests; reading another user's `users/{uid}` profile; any listing of who prayed; and
`reports` / any other collection (catch-all `allow read, write: if false`).

## Fallback behavior (no Firebase config)

- With no `.env.local`, `isFirebaseConfigured()` is false → `interactionsUseFirebase()` is false →
  `PrayerContext` uses the original on-device interaction list and derived counts. Praying, the
  already-prayed badge, and "Prayers I've prayed for" all work locally, exactly as before.
- No Firestore calls are made in local mode, and the app **does not crash** without `.env.local`.

## Privacy / aggregate-only guarantees

- Other users see only `prayerCount`. There is no API, query, screen, or rule that exposes the list
  of who prayed.
- Interactions store no email and no display name. Email is never stored in `prayerRequests` or
  `prayerInteractions`.
- Raw UIDs are never shown in the UI (`userUid`/`authorUid` are internal only).

## Files changed

- `src/services/firebase/interactionErrors.ts` — **new**: `INTERACTION_ERROR_COPY`,
  `PrayerInteractionError`, `prayerInteractionError`.
- `src/services/firebase/prayerInteractionService.ts` — implemented `pray` (transaction),
  `hasPrayed`, `listMinePrayedFor` (no longer a `NotImplementedError` stub).
- `src/services/firebase/contracts.ts` — updated `PrayerInteractionService` (`pray` returns
  `{ created }`, `listMinePrayedFor` returns request ids).
- `src/services/prayerInteractions.ts` — **new** mode-aware seam.
- `src/services/firebase/index.ts` — re-exports the interaction error helpers.
- `src/context/PrayerContext.tsx` — mode-aware `pray` / `hasPrayed` / `getPrayedRequests`; hydrates
  the user's prayed-for set in Firebase mode; count from Firestore with optimistic +1.
- `app/(app)/feed/index.tsx`, `app/(app)/feed/[id].tsx` — surface the safe interaction error copy.
- `firestore.rules` — `prayerInteractions` rules + the controlled `prayerCount` +1 rule.

## Testing steps

See [`docs/QA_prayer_interaction_scenarios.md`](./QA_prayer_interaction_scenarios.md) for the full
owner checklist. Quick summary: with `.env.local` present and the updated rules **published**, create
a request, pray from the feed card (count +1, already-prayed state, interaction doc appears), confirm
a duplicate tap does not double-count, pray from detail, test a multi-user count, confirm a removed
request cannot be prayed for, and check "Prayers I've prayed for". Confirm no reports collection, no
email stored, no raw UIDs, and no "who prayed" UI. Optionally test the local/mock fallback.

## Validation performed

- TypeScript type-check passes (`npx tsc --noEmit`).
- Metro bundler boots cleanly with `npx expo start -c` (Firebase env loaded; no errors).
- Secret scan: no real Firebase config, project IDs, keys, tokens, or service-account keys committed;
  `.env.local` remains gitignored.
- `legacy-web-app/` and `.claude/` untouched; Expo SDK unchanged; no native modules added.

## Next recommended phase: J.2g — Firestore reports

Move **reports** into Firestore (store-for-manual-review, admin-read only, duplicate-prevented, no
public listing), with security rules + tests. Then revisit account deletion to also handle a deleting
user's own interactions and reports.
