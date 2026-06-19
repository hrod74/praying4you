# Firebase Reports Implementation (Phase J.2g)

**Status:** "Report this request" now moves from local/mock to Firestore so reports can be reviewed
**manually in the Firebase Console** during Alpha/Beta. Reports are a **private moderation record**:
they are never listed in the app, never publicly readable, never reveal who reported, and never store
an email, display name, or phone number. No real Firebase values are committed, and the app still runs
in a **local/mock fallback** when Firebase is not configured.

This phase is intentionally lightweight: **no admin dashboard, no notifications, no AI moderation, no
auto-removal/blocking**. Manual review happens in the Console. The manual checklist is
[`docs/QA_report_scenarios.md`](./QA_report_scenarios.md).

---

## Collection and fields: `reports/{uid}_{requestId}`

The document id is **deterministic** — `{reporterUid}_{requestId}` — which guarantees **one report per
user per request** (a repeat targets the same id, and updates are denied, so no duplicate can exist).

| Field | Type | Notes |
|---|---|---|
| `id` | string | The doc id, `{reporterUid}_{requestId}`. |
| `reporterUid` | string | The reporter's own UID. Must equal `request.auth.uid`. Never shown in the UI. |
| `requestId` | string | The reported request. |
| `requestAuthorUid` | string | The reported request's author UID (verified against the real request by the rules). Opaque; never shown. |
| `reason` | string | One of the app's existing reasons: `spam`, `inappropriate`, `harmful`, `other`. |
| `status` | string | `open` on create. Only manual Console review changes it; the client never can. |
| `createdAt` | server timestamp | Set on create. |
| `schemaVersion` | number | `1`. For future migrations. |
| `notes` | string | Optional reviewer note typed by the reporter; omitted entirely when blank. |

**Never stored:** reporter email, author email, display name, phone number, device identifiers, or any
private config. The security rules enforce this with `keys().hasOnly([...])` (any field outside the
allowed set is rejected) plus an explicit `!('email' in ...)`.

## Architecture: the mode-aware seam

A new seam `src/services/reports.ts` decides where a report goes:

- **Firebase mode** (`isFirebaseConfigured()` true): `firebaseReportService` writes the report doc.
- **Local mode**: `PrayerContext` keeps the original on-device report list (`prayerService`).

`PrayerContext.reportPrayer` / `hasReported` branch on `reportsUseFirebase()`, so the existing report
screen (`app/(app)/feed/report.tsx`) works unchanged in both modes. The reporter's app already knows
the (opaque, never-shown) `authorUid` from the loaded request, so the context supplies it to the
report doc; the rules verify it against the real request.

## How reporting works

`firebaseReportService.report({ reporterUid, requestId, requestAuthorUid, reason, notes })`:

1. **Pre-check** the reporter's own report doc (a `get` the rules allow). If it already exists, throw a
   safe `ReportError('already')` so a duplicate is handled calmly. The rules are still the hard
   guarantee (create-only + no update), so a race cannot create or overwrite a duplicate.
2. Otherwise `setDoc` the report (status `open`, only opaque UIDs + reason + optional note + metadata).

`PrayerContext` also keeps an in-session set of reported request ids (`reportedIds`) so the "you
reported this" state shows immediately. Because reports are a private record with **no client list**,
that state is session-only in Firebase mode; after a restart the link may reappear, but a duplicate
submission is caught (pre-check or rules) and shown as the same calm thank-you.

## Error handling

`src/services/firebase/reportErrors.ts` maps failures to calm copy (no raw Firebase detail, no em
dashes). The report screen surfaces it, and treats `already` as a gentle thank-you rather than an
error.

| Situation | Code | Copy |
|---|---|---|
| Could not submit | `generic` | We could not submit your report right now. Please try again. |
| Already reported | `already` | Thank you. You have already reported this request. |
| Request removed/missing | `unavailable` | This prayer request is no longer available. |
| Own request (defensive) | `ownRequest` | You cannot report your own request. |
| Network | `network` | We could not connect right now. Please check your connection and try again. |
| Permission / stale session | `permission` | We could not complete that request. Please try signing in again. |

## Security rules (owner must republish)

`mobile-app/firestore.rules` was **updated**, so the owner **must republish the full file** in the
Firebase Console (Firestore Database > Rules > Publish) **before QA**.

The new `reports/{reportId}` block:

- `get`: a reporter may read **only their own** report doc, authorized from the id prefix `{uid}_`
  (works even before the doc exists, for the duplicate pre-check). Reading another user's report is
  blocked.
- `list`: **denied** — there is no "who reported" surface anywhere.
- `create`: signed-in; id must equal `{uid}_{requestId}`; `reporterUid == request.auth.uid`; `status`
  must be `open`; `reason` must be allowed; `keys().hasOnly([...])` (no email/name/phone); the target
  request must **exist and be active**; and its real author must **not** be the reporter (cannot
  report your own request).
- `update`, `delete`: **denied** — status changes and removal happen only via manual Console review.

Unchanged and still enforced: owner-only `users/{uid}`; prayer-request read/create/edit/soft-remove
rules; the aggregate-only prayer-interaction rules; no email in any prayer data; no hard deletes.

## Fallback behavior (no Firebase config)

With no `.env.local`, `reportsUseFirebase()` is false → `PrayerContext` uses the original on-device
report list. Reporting and the "you reported" state work locally, exactly as before. No Firestore
calls are made, and the app does not crash without `.env.local`.

## Automated rules tests

`mobile-app/firebase-tests/tests/reports.test.mjs` covers: report another user's active request;
unauthenticated cannot report; cannot report own/removed request; cannot report twice; cannot file for
another reporterUid; no email; reason must be allowed; status must be `open`; `requestAuthorUid` must
match the real author; cannot update status; cannot delete; cannot list; can get own report but not
another's. Run with `cd mobile-app && npm run test:rules` (Java 11+); the full suite passes **47/47**.

## Files changed

- `src/services/firebase/reportErrors.ts` — **new**: `REPORT_ERROR_COPY`, `ReportError`, `reportError`.
- `src/services/firebase/reportService.ts` — implemented `report` (pre-check + create) and
  `hasReported` (no longer a `NotImplementedError` stub).
- `src/services/firebase/contracts.ts` — updated `ReportService` (`reporterUid`, `requestAuthorUid`,
  returns `void`).
- `src/services/reports.ts` — **new** mode-aware seam.
- `src/services/firebase/index.ts` — re-exports the report error helpers.
- `src/context/PrayerContext.tsx` — mode-aware `reportPrayer` / `hasReported`; in-session
  `reportedIds` for Firebase mode.
- `app/(app)/feed/report.tsx` — calm error + duplicate handling; accurate review copy.
- `firestore.rules` — new `reports` block.
- `firebase-tests/tests/reports.test.mjs`, `firebase-tests/tests/helpers.mjs` — rules tests + helper.

## What is out of scope (next phases)

- No admin UI, notifications, AI moderation, email, or auto-removal/blocking.
- **Account-deletion cleanup for interactions/reports** is deferred to a follow-up: when a user
  deletes their account, their interactions and reports are not yet cleaned up.

## Next recommended phase

Revisit **account deletion** to also clean up the deleting user's `prayerInteractions` and `reports`
(the requests are already soft-removed), with matching rules tests. After that, consider a minimal
moderation workflow doc for the owner's manual Console review.
