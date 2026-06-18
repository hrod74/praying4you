# Firebase Prayer Requests Implementation (Phase J.2e)

**Status:** prayer requests now live in Firestore. Creating, reading (feed + detail), editing, and
removing a prayer request use the `prayerRequests` collection when Firebase is configured. Prayer
interactions ("I prayed for this") and reports are deliberately **unchanged** — they remain
local/mock in both modes. No real Firebase values are committed, and the app still runs in a
**local/mock fallback** when Firebase is not configured.

The manual end-to-end checklist is [`docs/QA_prayer_request_scenarios.md`](./QA_prayer_request_scenarios.md).

---

## What moved to Firestore (and what did not)

| Concern | Where it lives now |
|---|---|
| Prayer requests: create / feed / detail / edit / remove / my-requests | **Firestore `prayerRequests`** (Firebase mode) |
| Prayer interactions ("I prayed for this", prayed-for list, counts) | **Local/mock** (unchanged) |
| Reports | **Local/mock** (unchanged) |
| Verses | **Local** bundled KJV (unchanged) |

Only prayer requests moved. The aggregate prayer-count / interaction model and the "never show who
prayed" rule are untouched. There is no `prayerInteractions` or `reports` collection in Firestore.

## Architecture: the mode-aware seam

`src/services/prayerRequests.ts` is the single place that decides where a prayer request comes
from:

- **Firebase mode** (`EXPO_PUBLIC_FIREBASE_*` configured): routes to
  `src/services/firebase/prayerRequestService.ts` (the Firestore implementation).
- **Local mode** (no config): routes to the original `src/services/prayerService.ts` (bundled seed
  + on-device overrides / removed-ids), so the prototype runs unchanged with no `.env.local`.

`PrayerContext` calls the seam for request create/read/edit/remove and keeps the interaction/report
state local in both modes, layering local prayed/report deltas on top of whichever request baseline
was loaded. The feed UI, the prayed-for CTA, and the derived counts therefore behave exactly as
before; only the source of the request list changed.

## Collection and fields: `prayerRequests/{requestId}`

| Field | Type | Notes |
|---|---|---|
| `authorUid` | string | Owner UID. Required for owner-only rules. **Never shown in the UI.** |
| `isAnonymous` | bool | Display choice only; ownership is always retained. |
| `displayName` | string | **Public** name shown on the request: the literal `"Anonymous"` when anonymous, else the real name. |
| `body` | string | The request text. |
| `category` | string | One of the controlled `PrayerCategory` keys. |
| `status` | string | `"active"` or `"removed"` (soft remove). |
| `prayerCount` | number | Starts at `0`. Not raised by client edits in this phase (interactions are still local). |
| `schemaVersion` | number | `1`. For future migrations. |
| `createdAt` | server timestamp | Set on create. |
| `updatedAt` | server timestamp | Updated on edit / remove. |
| `removedAt` | server timestamp | Set only when soft-removed. |

**Email is never stored** in a prayer request (and the rules forbid an `email` field on create and
update). There is no `title` field (the app has no title; body only). `reportCount` is not stored
in Firestore (reports are local); the app derives it from the local report list as before.

## Privacy decisions

- **No email**, ever — not stored, not displayed. Enforced in code and in the security rules.
- **Anonymous stays anonymous.** For an anonymous post, only the public string `"Anonymous"` is
  stored in `displayName`; the real name is **not** written to the document. Any signed-in user can
  read an active request, so storing the real name would leak the identity behind an anonymous
  post. The owner's real name is only ever known to the owner (from their own Auth profile), and is
  supplied again at edit time from the signed-in profile.
- **`authorUid` is retained but opaque.** It is needed for owner-only edit/remove rules and for
  "My prayer requests". It is a Firebase UID, is never rendered in the UI, and cannot be mapped to a
  person by other users because the `users/{uid}` profile is owner-only. (Note: two anonymous posts
  by the same user share the same `authorUid`, so an observer with raw document access could tell
  they came from the same anonymous author — but not who. This matches the existing local model,
  which also retains ownership, and is acceptable for Alpha.)
- **No "who prayed" data.** Interactions remain local and aggregate-only by design; nothing here
  exposes the list of who prayed.

## Feed, detail, and "My prayer requests" behavior

- **Feed:** reads active requests (`status == 'active'`) and shows them newest first. The feed is
  only reachable when signed in (the `(app)` layout gates on the session). Sorting is done
  **client-side** so no Firestore composite index is required for Alpha.
- **Detail:** loads from the already-loaded feed; on a direct link it falls back to the seam
  (`getRequestById`), which reads the Firestore document. A removed request, or one a non-owner is
  not allowed to read, resolves to the calm "Prayer not found" state (never a raw error). Owner
  controls (Edit / Remove request) render only for the owner; non-owners never see them.
- **My prayer requests:** derived from the loaded active feed filtered by the signed-in
  `authorUid`, so it shows the user's own active requests and hides removed ones (matching the
  current UX). Other users' requests never appear there. (`listMine` is also implemented in the
  Firestore service for completeness.)

## Create / edit / remove behavior

- **Create:** writes a new document owned by the signed-in user, `status: 'active'`,
  `prayerCount: 0`, public `displayName` per the anonymous rule, no email. The new request is
  optimistically prepended to the feed and confirmed on the next refresh.
- **Edit (owner only):** updates `body`, `category`, `isAnonymous`, `displayName`, and `updatedAt`.
  It never sends `authorUid`, `createdAt`, or `prayerCount`, so those cannot change. The rules
  reject edits to another user's request and edits that touch protected fields.
- **Remove (owner only):** a **soft remove** — sets `status: 'removed'`, `removedAt`, and
  `updatedAt`. The user-facing language stays **"Remove request"**. Removed requests disappear from
  the feed and detail. Documents are **never hard-deleted** from the client (the rules forbid
  `delete`).

## Error handling

`src/services/firebase/prayerErrors.ts` maps Firestore failures to calm, safe copy (no raw Firebase
detail, no em dashes). The Firestore service throws these; the feed and the submit/edit/detail
screens surface the message, falling back to per-operation copy:

| Situation | Copy |
|---|---|
| Could not load requests | "We could not load prayer requests right now. Please try again." |
| Could not share request | "We could not share your request right now. Please try again." |
| Could not update request | "We could not update your request right now. Please try again." |
| Could not remove request | "We could not remove your request right now. Please try again." |
| Permission / not signed in (`permission-denied`, `unauthenticated`) | "We could not complete that request. Please try signing in again." |
| Network (`unavailable`, `deadline-exceeded`) | "We could not connect right now. Please check your connection and try again." |

## Fallback behavior (no Firebase config)

With no `.env.local`, `isFirebaseConfigured()` is false → the seam uses the local `prayerService`
exactly as before: bundled seed prayers, on-device submitted requests, per-id edit overrides, and
soft-removed ids. Interactions and reports were already local. The app **does not crash** without
`.env.local`.

## Security rules — owner must republish

`mobile-app/firestore.rules` was **updated** in this phase to add the `prayerRequests` rules
(the `users/{uid}` rules are unchanged). The rules enforce:

- signed-in users can **read active** requests (an owner can also read their own in any status);
- signed-in users can **create** only their **own** request, starting `active`, `prayerCount == 0`,
  with safe field shapes and **no `email`** field;
- only the **owner** can **update** (edit) or **soft-remove** their request, and **protected
  fields** (`authorUid`, `createdAt`, `prayerCount`) cannot change, nor can an `email` field be
  added;
- clients **cannot hard-delete** a request (`allow delete: if false`);
- `users/{uid}` stays owner-only; everything else (prayerInteractions, reports, ...) stays denied.

> **ACTION REQUIRED:** these rules are NOT auto-deployed. The owner must publish the **full updated
> contents** of `mobile-app/firestore.rules` in the Firebase Console → **Firestore Database → Rules
> → Publish** (or via the Firebase CLI). Until republished, prayer-request reads/writes in Firebase
> mode will be rejected with `permission-denied` (surfaced to the user as calm copy). No composite
> index is required for this phase (queries use a single equality filter and sort client-side).

## Data migration

Old local/mock prayer data is **not** migrated automatically. In Firebase mode the feed starts with
**new** prayer requests created in Firestore; previously created local prototype requests will not
appear in Firebase mode unless intentionally migrated in a later effort. This is deliberate for
Alpha.

## What remains out of scope (next phases)

- **Prayer interactions in Firestore** (aggregate prayer count + one-per-user interaction doc,
  AGGREGATE-ONLY to others, never "who prayed"). This is the recommended next phase (J.2f). When it
  lands, `prayerCount` becomes server-incremented and the rules gain an interactions collection.
- **Reports in Firestore** (store-for-manual-review, admin-read, duplicate-prevented).
- Account deletion (J.2d) currently removes the Auth user + `users/{uid}` profile only; once prayer
  requests are in Firestore for real testers, deletion should be revisited to also handle a user's
  own prayer requests (e.g. soft-remove or anonymize).

## Validation performed

- TypeScript type-check passes (`npx tsc --noEmit`).
- Production iOS bundle builds via `npx expo export` (Expo Go compatible, no native modules, no SDK
  upgrade).
- Secret scan: no real Firebase config, project IDs, keys, tokens, or service-account keys
  committed; `.env.local` remains gitignored.
- No `prayerInteractions` or `reports` Firestore access exists; verses stay local;
  `legacy-web-app/` and `.claude/` untouched.

Interactive end-to-end testing (create / feed / detail / edit / soft-remove / non-owner
restrictions, with the Firestore Console open) is the owner's checklist in
[`docs/QA_prayer_request_scenarios.md`](./QA_prayer_request_scenarios.md), and requires
`.env.local` present **and the updated rules republished**.

## Files changed

- `src/services/firebase/prayerRequestService.ts` — implemented Firestore CRUD (was a throwing stub).
- `src/services/firebase/prayerErrors.ts` — new safe error copy + mapper.
- `src/services/firebase/index.ts` — re-exports the prayer error helpers.
- `src/services/prayerRequests.ts` — new mode-aware seam (list / get / create / edit / remove).
- `src/context/PrayerContext.tsx` — request CRUD routed through the seam; interactions/reports
  remain local; safe load-error copy.
- `app/(app)/feed/[id].tsx` — mode-aware detail lookup; safe remove-error copy; mode-neutral remove
  confirmation copy.
- `app/(app)/submit.tsx`, `app/(app)/feed/edit.tsx` — surface safe create/edit error copy.
- `firestore.rules` — added `prayerRequests` rules (owner-only; soft-remove; no hard delete).

## Next recommended phase: J.2f — Firestore prayer interactions

Move "I prayed for this" into Firestore as **aggregate-only** interactions (one-per-user
interaction doc + a server-incremented `prayerCount` on the request), never exposing who prayed,
with security rules + tests. Then reports (J.2g), then revisit account deletion for prayer data.
