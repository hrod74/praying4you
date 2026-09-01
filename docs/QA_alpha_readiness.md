# Alpha Readiness QA Checklist

A final, owner-run checklist to confirm **Praying For You** is ready to invite **3–4 trusted Alpha
testers**. It is written for the owner (not a developer): run it on a phone with Expo Go, and check each
box when the result matches what is described. If anything fails, stop and note it under
[QA Notes](#qa-notes) before inviting testers.

This is the **release gate** for Alpha. It rolls up the per-feature checklists into one pass:

- [`docs/QA_delete_scenarios.md`](./QA_delete_scenarios.md) — account deletion + cleanup
- [`docs/QA_password_management_scenarios.md`](./QA_password_management_scenarios.md) — forgot/change password
- [`docs/QA_prayer_request_scenarios.md`](./QA_prayer_request_scenarios.md) — create/edit/remove requests
- [`docs/QA_prayer_interaction_scenarios.md`](./QA_prayer_interaction_scenarios.md) — pray flow + counts
- [`docs/QA_report_scenarios.md`](./QA_report_scenarios.md) — reporting

> **The deep, edge-case testing lives in the per-feature checklists above.** This page is the quick,
> end-to-end confidence pass before real people use the app.

## Before You Start

> **Store-release boundary (added 2026-08-28):** This Expo Go checklist is not sufficient approval
> for a Play Store or TestFlight artifact. Before external distribution, the exact store artifact
> must also pass the mandatory release gate in
> [`QA_eas_android_standalone_scenarios.md`](./QA_eas_android_standalone_scenarios.md), including
> automated Firebase-environment validation and clean-device/backend/cross-device verification.

- [x] `mobile-app/.env.local` is present (real Firebase config) and **not committed**
- [x] **The current `mobile-app/firestore.rules` are published** in the Firebase Console
      (Firestore Database → Rules). This is required for reporting and account-deletion cleanup to work.
- [x] Expo is running: `cd mobile-app && npx expo start -c`
- [x] Firebase Console open to **Authentication → Users**
- [x] Firebase Console open to **Firestore Database → Data** (so you can watch `users`,
      `prayerRequests`, `prayerInteractions`, and `reports`)
- [x] You have **two throwaway accounts** available (call them **Tester A** and **Tester B**) so you can
      test cross-user behavior (praying, reporting). A third (**Tester C**) is handy for count tests.
- [x] Using throwaway accounts only — no personal data

---

## 1. Account

- [x] **Sign up** — create a new account (Tester A); confirm it lands in the app and appears in
      Firebase Authentication, and that `users/{uid}` is created in Firestore with **no email field**
- [x] **Sign out** — returns to the welcome/signed-out screen
- [x] **Sign in** — sign back in with the same email/password; confirm `lastSignedInAt` updates on the
      Firestore profile
- [x] **Forgot password** — from the sign-in screen, use "Forgot password?"; confirm a calm, identical
      confirmation appears whether or not the email is registered (no "user not found" leak)
- [x] **Change password** (Firebase mode) — Settings → Change password; enter current + new password;
      confirm success; sign out and sign in with the **new** password
- [x] **Edit profile name** — Settings → Edit profile; change the display name; confirm it saves and the
      new name shows on the user's prayer requests (where not anonymous)
- [x] **Delete account** — Settings → Delete account; confirm the two-step confirmation; confirm the app
      returns to signed-out, the Auth user is removed, and `users/{uid}` is removed
      (full cleanup detail: [`docs/QA_delete_scenarios.md`](./QA_delete_scenarios.md))

> **Manual QA evidence (2026-08-06):** Sign-in (authentication) and password reset were
> independently re-verified by the owner on a physical device, both passing. See
> [`docs/QA_password_management_scenarios.md`](./QA_password_management_scenarios.md#manual-qa-evidence-2026-08-06)
> for the dated record. Sign up, edit profile name, and delete account above are not covered by this
> physical-device evidence and remain as previously recorded.

## 2. Prayer Requests

- [x] **Create prayer request** — post a named request; confirm it appears at the top of the feed and
      exists in Firestore `prayerRequests` (`status: active`, `prayerCount: 0`, **no email field**)
- [x] **Create anonymous prayer request** — post with the anonymous option; confirm the feed shows
      **"Anonymous"** and the stored `displayName` is the literal `"Anonymous"` (the real name is not
      stored on the doc)
- [x] **Edit own prayer request** — edit body/category/anonymous choice on your own request; confirm the
      change shows; confirm `authorUid`, `createdAt`, and `prayerCount` are unchanged in Firestore
- [x] **Remove own prayer request** — remove one of your own requests
- [x] **Removed request leaves feed** — confirm it disappears from the feed and from "My prayer
      requests"; in Firestore it is **soft-removed** (`status: removed`), never hard-deleted

## 3. Prayer Interactions

- [x] **Pray from feed** — as Tester B, tap 🙏 Pray on one of Tester A's requests from the feed card
- [x] **Pray from detail** — open a request's detail screen and pray from there
- [x] **Prayer count increases** — confirm the count goes up by exactly 1 and a
      `prayerInteractions/{uid}_{requestId}` doc appears in Firestore
- [x] **Same user cannot double-count** — tap Pray again as the same user; confirm the count does **not**
      increase and no duplicate interaction doc is created
- [x] **Another user can increase count** — as Tester C, pray for the same request; confirm the count
      goes up again
- [x] **No who-prayed list appears** — confirm there is **nowhere** in the app that shows who prayed for a
      request (only the aggregate count is ever shown)

## 4. Reports

- [x] **Report another user's request** — as Tester B, report one of Tester A's active requests; confirm
      a calm thank-you appears and a `reports/{uid}_{requestId}` doc appears in Firestore (`status: open`)
- [x] **Duplicate report is blocked** — try to report the same request again as the same user; confirm
      the calm "already reported" thank-you and that **no** second report doc is created
- [x] **Reporting own request is blocked** — as the author, confirm there is no report entry point on
      your own request (or it is calmly blocked) and no report doc is created
- [x] **Reporting a removed request is blocked** — try to report a request that has been removed; confirm
      it is calmly blocked ("no longer available") and no report doc is created
- [x] **Report doc appears in Firestore** — confirm the report has `reporterUid`, `requestId`,
      `requestAuthorUid`, `reason`, `status: open`, `createdAt`, `schemaVersion`
- [x] **No email is stored** — confirm the report doc has **no** email, display name, or phone field
- [x] **No who-reported list appears** — confirm there is **nowhere** in the app that lists reports or
      shows who reported a request

## 5. Settings

- [x] **"Reset prototype data" is gone** — confirm there is no "Prototype data" section and no "Reset
      prototype data" button anywhere in Settings
- [x] **Edit profile remains** — present and working
- [x] **Change password remains** (Firebase mode) — present and working
- [x] **Sign out remains** — present and working
- [x] **Delete account remains** — present and working
- [x] No copy in Settings implies local/prototype data can be reset

## 6. Final App Polish

- [x] **No raw Firebase errors shown** — across sign-in, password, request, pray, report, and delete
      flows, every error is calm, plain-language copy (never a raw `auth/...` or `permission-denied`)
- [x] **No raw user IDs shown** — `authorUid` / `userUid` / `reporterUid` never appear in the UI
- [x] **No prototype-only copy remains** — no user-facing screen calls the app a "prototype", a "local
      prototype", or says data "stays on this device" / can be "reset"
- [x] **The app feels calm, trustworthy, and ready for real testers** — no debug text, no placeholder
      copy, no broken layouts, no crash on launch or on a cold start
- [x] **Bottom nav reads `Feed | Pray | Verse | Settings`** (in that order)
- [x] **Product name is "Praying For You"** wherever the app is named

## Pass / Fail Summary

- [x] Account: sign up / in / out, forgot + change password, edit name, delete account all pass
- [x] Prayer requests: create (named + anonymous), edit, remove, leaves feed all pass
- [x] Prayer interactions: pray (feed + detail), count up, no double-count, another user counts, no
      who-prayed
- [x] Reports: report, duplicate blocked, own blocked, removed blocked, doc correct, no email, no
      who-reported
- [x] Settings: no "Reset prototype data"; edit profile / change password / sign out / delete account
      remain
- [x] Polish: no raw errors, no raw IDs, no prototype copy, calm & trustworthy, nav `Feed | Pray | Verse
      | Settings`, name "Praying For You"
- [x] **Privacy invariants hold:** no email in `prayerRequests` / `prayerInteractions` / `reports`; no
      who-prayed or who-reported surface; no raw UIDs in UI

## Go / No-Go

- [x] **GO** — all sections pass; ready to invite 3–4 trusted Alpha testers
- [ ] **NO-GO** — one or more blockers found (note them below and fix before inviting testers)

## QA Notes

Write any observations here (date, device, OS, what you saw):

```
- The first screen needs some design love.
-
-
```
