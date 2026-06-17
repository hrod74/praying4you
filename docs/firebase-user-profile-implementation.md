# Firebase User Profile Implementation (Phase J.2c)

**Status:** the private Firestore **user profile document** (`users/{uid}`) is now created and read
during the Firebase Auth flow. This is the **only** Firestore collection wired. Prayer requests,
prayer interactions, reports, and verses remain **local/mock**. No real Firebase values are
committed, and the app still runs in a **local/mock fallback** when Firebase is not configured.

---

## What was implemented

- **Firestore initialization** via the existing app scaffold: `getFirebaseDb()` in
  `src/services/firebase/firebaseApp.ts` (Firebase JS SDK modular API, Expo Go compatible, no
  native modules, no SDK upgrade). Returns `null` when Firebase is not configured.
- **User profile service** `src/services/firebase/userService.ts` (real implementation, replacing
  the J.2a stub): create-if-missing on sign-up, read + `lastSignedInAt` touch (and backfill) on
  sign-in, and display-name update. All methods no-op when Firebase is not configured.
- **Auth flow wiring** in `src/context/AuthContext.tsx`:
  - Sign-up: creates `users/{uid}` if missing.
  - Sign-in: reads `users/{uid}`, creates it if missing (backfill for accounts made in J.2b),
    and updates `lastSignedInAt`.
  - Edit display name: updates the profile doc (Firebase mode).
  - All profile-doc writes are **best-effort** (`syncProfileDoc`): they never block sign-in,
    sign-up, or edits. If they fail (e.g. rules not yet deployed), the auth flow still succeeds and
    the doc syncs on the next sign-in.
- **Draft security rules** at `mobile-app/firestore.rules` (see below). Not auto-deployed.

## Profile document shape (`users/{uid}`)

| Field            | Type             | Notes                                                        |
|------------------|------------------|-------------------------------------------------------------|
| `uid`            | string           | Matches the Firebase Auth UID. Immutable.                   |
| `displayName`    | string           | Public identity (mirrors the Firebase Auth display name).   |
| `createdAt`      | server timestamp | Set once on creation. Immutable.                            |
| `updatedAt`      | server timestamp | Updated on profile changes / sign-in.                       |
| `lastSignedInAt` | server timestamp | Updated on each sign-in.                                     |
| `profileVersion` | int (`1`)        | For future migrations. Client-immutable.                    |
| `accountStatus`  | string (`active`)| Moderation/account status. Console/admin only (immutable from client). |

## Is email stored in Firestore? No.

**Email is intentionally NOT stored in the Firestore profile doc.** Firebase Auth already owns the
email (privately), so duplicating it into Firestore would only widen its exposure surface for no
benefit. Therefore:

- Email lives only in **Firebase Auth** (private).
- Email is **never** written to `users/{uid}`, never returned in any public feed/detail data,
  never shown on prayer cards, never shown when a user prays for someone, and never in reports.

## Privacy decisions

- **No email in Firestore** (above).
- **Owner-private profile:** rules allow a signed-in user to read/write only their own
  `users/{uid}`. There is **no public read** of `users`.
- **Public data minimization:** the profile doc is not wired into the prayer feed. Raw UIDs are not
  exposed in any public feed/detail assumption. There is no "who prayed" feature, and individual
  `prayerInteractions` are not exposed — other users will only ever see aggregate prayer counts
  (unchanged by this phase).
- **Protected fields:** `uid`, `createdAt`, `profileVersion`, and `accountStatus` cannot be changed
  from the client (enforced by rules); account status / moderation is console/admin only.

## Fallback behavior (no Firebase config)

- With no `.env.local`, `isFirebaseConfigured()` is false → the app runs in **local mode** exactly
  as before (simulated on-device profile, no Firestore calls). `getFirebaseDb()` returns null and
  every user-service method no-ops, so the app **does not crash** without `.env.local`.
- In Firebase mode, Firestore failures are swallowed best-effort, so even a misconfigured or
  not-yet-deployed ruleset cannot break the working auth flow.

## Firestore Console setup / rules required (owner action)

The draft rules in `mobile-app/firestore.rules` are **not auto-deployed**. To make the profile doc
actually read/write, the owner must:

1. In the Firebase Console: **Firestore Database > Create database** (production mode) if not done.
2. Deploy the rules: copy `mobile-app/firestore.rules` into **Firestore Database > Rules** and
   **Publish** (or deploy via the Firebase CLI). Until deployed, default locked rules will reject
   profile writes — the app keeps working; the doc just will not be created until rules are live.
3. No indexes are required for this phase (single-doc reads by id).
4. Do **not** open `users` to public read. Do **not** use open/test-mode rules for a real beta.

The rules encode: signed-in user can read/create/update **only their own** `users/{uid}`; protected
fields (`uid`, `createdAt`, `profileVersion`, `accountStatus`) are immutable from the client; no
client deletes; everything else (prayerRequests, prayerInteractions, reports) is denied until its
own phase.

## What remains local/mock

- Prayer requests, prayer interactions, reports — all still local/mock (`prayerService`,
  `PrayerContext`). No Firestore reads/writes for these; their service stubs still throw
  `NotImplementedError`.
- Verses — bundled local KJV.
- The only Firestore collection touched is `users`.

## Why account deletion is the next required phase

Real accounts now create durable records in **both** Firebase Auth and Firestore (`users/{uid}`).
Before any alpha/beta with real testers, a user must be able to **delete their account** and have
both the Auth user and the Firestore profile removed (or anonymized), per the privacy commitments
in `privacy-safety-copy.md` and the app-store requirements in `product-requirements.md`. Account
deletion is deliberately a separate, carefully verified phase (it touches real user data and must be
correct and irreversible-by-design). It is **not** implemented here, and `deleteAccount()` still
throws until that phase.

## Next recommended phase: J.2d Account Deletion

Implement user-initiated account deletion (delete the Firebase Auth user with reauth-if-needed, and
delete/anonymize `users/{uid}`), add a Settings entry point with a clear confirmation, document the
exact data handling, and verify end to end. This is the gate before broader Firestore work
(prayerRequests, then interactions, then reports) and before external testers.

## Validation performed

- TypeScript type-check passes.
- Production bundle builds (Expo `export`) with `firebase/firestore` reachable — Expo Go
  compatible, no native modules, no SDK upgrade.
- Metro dev server boots with `.env.local` (Firebase mode) and the local fallback path is preserved.
- Only the `users` collection is referenced; no prayerRequests / prayerInteractions / reports
  Firestore access exists.

**Interactive verification** (create account → confirm Auth user → confirm `users/{uid}` doc → sign
out → sign in → confirm read + `lastSignedInAt` update → edit display name → confirm doc update)
should be performed by the owner in Expo Go on a device with `.env.local` present **and the rules
deployed**.
