# Phase H.2 Completion Review: Mobile UX Fix Pass

**Review type:** Completion (go/no-go to commit Phase H.2 and proceed to Firebase MVP
planning in Plan Mode)
**Reviewed against:** `../implementation-plan.md`, `../prototype-roadmap.md`,
`../product-requirements.md`, `../design-direction.md`, `../project-handoff-summary.md`,
`phase-h1-visual-qa-polish-review.md`, `../agents/`
**Roles applied:** Product Owner, UI/UX Designer, React Native Engineer, Code Reviewer,
Security Reviewer, Test Engineer, QA Engineer, Release Manager (Backend Engineer and
Systems Admin / DevOps Engineer consulted — see §13).
**Subject:** owner on-device iOS QA fixes — iOS keyboard behavior on forms, post-submit
navigation, a local edit-profile flow, and bottom-navigation sizing. Still strictly
local/mock.

---

## 1. Executive Summary

Phase H.2 is **complete and ready to commit.** It resolves four owner-identified mobile UX
issues found during an on-device iOS QA pass after Phase H.1, with no change to scope — still
local/mock only, no Firebase, no networking, no auth, no ads, no app-store config.

1. **iOS keyboard behavior.** The most important fix: **Create Profile no longer creates the
   profile when the keyboard return/done key is tapped.** The email field's "done" key now
   only dismisses the keyboard; the profile is created only by an intentional tap on the
   "Create profile" button. Shared improvements: `Screen` dismisses the keyboard on drag
   (`keyboardDismissMode="on-drag"`), and `TextField` forwards a ref so the name field's
   "next" key moves focus to email. Multiline prayer/report inputs keep return as a newline.

2. **Submit navigation.** After sharing a prayer request, the user is returned to the
   **Feed** with the new request at the top (and a "Prayer request shared." confirmation),
   instead of landing on the request's detail/owner screen. Editing an existing request is
   unchanged (it still returns to the detail).

3. **Local edit profile.** Settings gains an inline **Edit profile** section (display name +
   email) backed by a new `AuthContext.updateProfile`, with the same validation as Create
   Profile and a confirmation banner on save. Email stays on-device and private. No real
   auth; the future duplicate-email/verification rules are documented (PRD §19, plan §11).

4. **Bottom navigation sizing.** Tab icons are slightly larger (20 → 24) and labels are a
   readable 12pt/600; the four tabs (Feed | Pray | Verse | Settings) stay balanced.

Validation is green: `tsc` passes, the dev server bundles the iOS entry (1,214 modules) with
no errors, the secret scan is clean, email remains private, and only expected files changed
(`legacy-web-app/` and `.claude/` untouched). All eight role lenses return **Proceed.**

## 2. What was changed

- **`src/components/TextField.tsx`** — now `forwardRef<TextInput>` so forms can move focus to
  the next field.
- **`src/components/Screen.tsx`** — `keyboardDismissMode="on-drag"` on the scroll view
  (keeps `keyboardShouldPersistTaps="handled"`).
- **`app/(auth)/create-profile.tsx`** — email "done" dismisses the keyboard (no longer calls
  submit); name "next" focuses email via ref; a user-facing em dash removed from the privacy
  note.
- **`app/(app)/submit.tsx`** — navigates to `/(app)/feed` after a successful share (was
  `/(app)/feed/{id}`); remounts the form via a `key` so it is clear next time.
- **`src/context/AuthContext.tsx`** — new `updateProfile({ displayName, email })` (local,
  best-effort persistence, email private).
- **`app/(app)/settings.tsx`** — inline Edit profile section (validated fields, Save/Cancel,
  confirmation feedback, the same keyboard behavior).
- **`app/(app)/_layout.tsx`** — larger tab icon (24) and label (12pt/600), small spacing.
- Docs: `product-requirements.md` (§19 email-change/duplicate rule), `implementation-plan.md`
  (Auth service note + Phase H.2), `project-handoff-summary.md`, `demo-readiness-checklist.md`,
  `reviews/README.md`, and this review.

## 3. Keyboard behavior fixes

- **No accidental submit.** Create Profile's email field changed from
  `onSubmitEditing={handleSubmit}` to `onSubmitEditing={() => Keyboard.dismiss()}`. The
  profile (a sensitive account-like object) is created only by an intentional CTA tap. The
  same pattern is used in the new Edit Profile fields.
- **Natural dismissal.** `Screen` now dismisses the keyboard on drag, so it goes away with a
  scroll gesture; tapping a non-interactive area still dismisses it
  (`keyboardShouldPersistTaps="handled"`), and tapping controls still works.
- **Next-field flow.** `TextField` forwards a ref; the name field uses
  `returnKeyType="next"` + `submitBehavior="submit"` to focus email without blurring.
- **Multiline inputs.** The prayer body (PrayerForm) and the report note remain multiline, so
  return inserts a newline as expected; they benefit from drag-to-dismiss.
- **Sign In.** Has no text inputs (it is a button-only confirm screen), so there is no
  keyboard-submit risk to fix there; behavior is correct by construction.

## 4. Submit navigation fix

- Sharing a request now calls `router.navigate('/(app)/feed')`, returning to the Feed tab
  where the new request is prepended (so it appears at the top), with the confirmation
  banner. The submit form is remounted (cleared) for next time.
- **Edit is preserved:** the owner Edit flow still returns to the request's detail via
  `router.back()`; only the post-**create** destination changed.

## 5. Edit profile behavior

- **Inline, simple, local.** An "Edit profile" button reveals validated display-name and
  email fields with Save / Cancel; no new routes or navigation churn. `updateProfile` writes
  the local profile (in-memory first, best-effort persistence).
- **Validation** reuses `validateDisplayName` / `validateEmail`; Save is disabled until both
  fields are non-empty and re-validates on submit.
- **Confirmation** banner "Profile updated." on success; a gentle error on failure.
- **Privacy preserved.** Email is edited only on the owner's private Settings screen and is
  never written to public/prayer data or displayed publicly — before or after the edit.
- **Future backend rule documented.** No duplicate-email detection exists locally (single
  local profile); PRD §19 and plan §11 now require the future Auth layer to reject changing to
  an email already attached to another account (calm message: *"That email is already
  connected to another profile. Please use a different email or sign in."*), optionally
  verify the new address, and protect account ownership.

## 6. Bottom nav sizing changes

- Icon size 20 → **24**; label **12pt / 600** (from the default ~10); small `paddingTop`/icon
  margin for balance. No icon or label changes; the four-tab layout (Feed | Pray | Verse |
  Settings) is unchanged and still fits comfortably on iPhone. Not a redesign.

## 7. Product Owner Review

- **On-scope.** Pure mobile UX bug/polish from real device testing; no feature creep, no
  milestone pull-forward. Edit profile is a natural local affordance. **Verdict: Proceed.**

## 8. UI/UX Designer Review

- Heritage feel preserved: same parchment/ink tokens, calm copy, no em dashes in new
  user-facing strings (one pre-existing em dash in the Create Profile privacy note removed).
  Larger nav improves readability and tap confidence without looking oversized. Edit profile
  reuses the existing field/button patterns. **Verdict: Proceed.**

## 9. React Native Engineer Review

- Fixes live in **shared components** (`TextField` ref forwarding, `Screen` dismiss mode) so
  keyboard behavior is consistent everywhere. `submitBehavior`/`returnKeyType`/ref focus are
  idiomatic RN. `updateProfile` mirrors `createProfile` (in-memory first, best-effort
  persistence) and keeps the `AuthContext` the migration seam. Navigation uses Expo Router
  tab/stack semantics correctly. **Verdict: Proceed.**

## 10. Code Reviewer Review

- Small, focused, typed changes; `tsc --noEmit` passes (strict). No duplicated logic — the
  profile form reuses the shared `TextField` and validation utils. Form remount via `key`
  is a clean reset. No dead code or debug left. **Verdict: Proceed.**

## 11. Security Reviewer Review

- **No secrets** (scan clean over `mobile-app/app` and `mobile-app/src`). **Email stays
  private** through the edit flow — only on the Settings screen and the local profile, never
  in public/prayer data. The local edit is explicitly not real auth; the ownership and
  duplicate-email protections are documented as future Auth requirements. **Verdict: Proceed.**

## 12. Test Engineer Review

- Validation performed: `tsc` (pass), dev-server iOS bundle (1,214 modules, no errors),
  secret scan (clean). Manual QA checklist in §14 covers the keyboard, navigation, edit, and
  nav-sizing changes. When Firebase arrives, the email-change/duplicate rule becomes part of
  the Auth service + security-rule tests already enumerated (PRD §19, plan §11). **Verdict:
  Proceed.**

## 13. QA Engineer Review

- The reported issues are addressed: Create Profile no longer submits on return; sharing
  returns to the Feed with the new request on top; profile name/email are editable with
  confirmation; nav is more readable. Existing flows (feed, detail, pray, report, verse,
  edit/remove, activity lists) are unaffected. **Verdict: Proceed.**

## 14. Backend Engineer & Systems Admin / DevOps Engineer (consulted)

- **Backend Engineer:** the documented email-change handling is correct — route changes
  through Auth, reject duplicates with a calm message, optionally verify the new address, and
  derive identity from `request.auth.uid` so no user can take over another's email/profile.
  `updateProfile` maps cleanly onto that future service method.
- **Systems Admin / DevOps:** no new dependencies, config, secrets, services, or build
  changes; the app still runs in public Expo Go (SDK 54). No setup/cost impact.

## 15. Manual QA Checklist

- [ ] Create Profile: tap the email field, press return/done → keyboard dismisses, profile is
      **not** created.
- [ ] Create Profile: name field "next" key moves focus to email.
- [ ] Create Profile: only tapping "Create profile" creates the profile and enters the app.
- [ ] Drag/scroll on a form dismisses the keyboard; tapping a button still works.
- [ ] Submit/Pray: write a request and Share → land on the **Feed**, new request at the top,
      confirmation shown; the Pray tab form is cleared next time.
- [ ] Edit an existing request → still opens the edit screen and returns to its detail.
- [ ] Report note field: return inserts a newline; drag dismisses the keyboard.
- [ ] Settings → Edit profile: change name and email, Save → "Profile updated."; values
      update; Cancel discards changes.
- [ ] Edit profile validation: empty name or invalid email blocks save with a calm message.
- [ ] Edited email is shown only in Settings, never on the feed/detail/lists.
- [ ] Bottom nav icons/labels look larger and balanced; all four tabs reachable.
- [ ] Verse tab and About still work.

## 16. Validation Performed

- `npx tsc --noEmit` — **pass** (strict).
- Dev server (`expo start`) served HTTP 200 and bundled the iOS entry — **1,214 modules, no
  errors** in the Metro log.
- Secret scan over `mobile-app/app` and `mobile-app/src` — **clean** (no real values).
- Em dashes — no em dashes in new user-facing copy (and one removed from the Create Profile
  privacy note).
- Changed files reviewed — **only `docs/` and `mobile-app/` (app + src)**; no
  `legacy-web-app/`, no `.claude/`.

## 17. Known Issues / Follow-ups

- **Confirmation banner placement** (from H.1) still anchors near the top and may briefly
  overlay a header while it auto-dismisses — acceptable; a future pass could offset per
  screen.
- **No tap-outside-to-dismiss on non-scroll screens** — only Sign In uses the non-scroll
  `Screen`, and it has no inputs, so this is a non-issue today.
- **Local profile edit has no duplicate-email detection** — by design (single local
  profile); the rule is documented for the future Auth layer.
- **No automated tests yet** — by design for this milestone; future testing expectations are
  documented (PRD §19, plan §11).

## 18. Go / No-Go

**Decision: Proceed.** Phase H.2 is complete, local/mock only, on-brand, typechecked, and
bundles cleanly. It is safe to commit. The recommended next step is unchanged: **Firebase MVP
planning in Plan Mode (roadmap Phase I)**, with the Backend Engineer and Systems Admin /
DevOps Engineer on the review panel, before any backend code, project, or account is created.
