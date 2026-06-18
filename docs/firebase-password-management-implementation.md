# Firebase Password Management Implementation (Phase J.2f.1)

**Status:** the app now has two password account-management flows, both by the book on Firebase
Auth via the Firebase JS SDK (Expo Go compatible, no native modules):

1. **Forgot password / reset** from the sign-in screen.
2. **Change password** while signed in, from Settings.

No real Firebase values are committed, no passwords are ever stored or logged, and the app still
runs in a **local/mock fallback** when Firebase is not configured.

This is an Auth account-management phase only. It does **not** touch prayer requests, prayer
interactions, reports, push notifications, AI features, social/Google sign-in, or
passwordless/email-link sign-in. The manual end-to-end checklist is
[`docs/QA_password_management_scenarios.md`](./QA_password_management_scenarios.md).

---

## 1. Forgot password / reset

From the **sign-in screen** (Firebase mode only), a "Forgot password? Send a reset email" link
lets a user request a reset:

1. The user types their email in the Email field, then taps the link.
2. The app validates the email shape locally. If it is not a valid address, it shows
   "Please enter a valid email address." and sends nothing.
3. Otherwise the app calls Firebase `sendPasswordResetEmail(auth, email)`. Firebase owns the reset
   email, the reset link, and the token. The app stores nothing.
4. The app shows a **non-enumerating** confirmation:
   "If an account exists for that email, password reset instructions will be sent."

### Account-enumeration safety

The confirmation copy is shown **whether or not** an account exists for that email, so the flow
never reveals which addresses are registered. To keep that guarantee at the data layer (not just in
one screen), `firebaseAuthService.sendPasswordReset` **swallows** `auth/user-not-found` and resolves
normally. The caller then shows the same neutral confirmation either way.

Genuine failures (network, rate limit, malformed email) still surface as safe copy from
`passwordResetErrorMessage` in `src/services/firebase/authErrors.ts` (`PASSWORD_RESET_COPY`). Raw
Firebase codes/messages are never shown.

Relevant files:

- `app/(auth)/sign-in.tsx` — `handleForgotPassword`, the link, and the sending state.
- `src/context/AuthContext.tsx` — `sendPasswordReset` (no-op in local mode).
- `src/services/firebase/authService.ts` — `sendPasswordReset` (Firebase call + non-enumeration).
- `src/services/firebase/authErrors.ts` — `PASSWORD_RESET_COPY`, `passwordResetErrorMessage`.

## 2. Change password while signed in

From **Settings → Password → Change password** (Firebase mode only), a signed-in user can update
their password through an inline form (the same calm inline pattern as Edit profile):

1. The user enters their **current password** (needed for reauthentication).
2. The user enters a **new password** and **confirms** it.
3. The app validates locally: the new password must be at least 6 characters (mirrors Firebase's own
   minimum), and the confirmation must match. Mismatch shows "The new passwords do not match." and
   nothing is sent.
4. The app calls Firebase by the book:
   - `EmailAuthProvider.credential(email, currentPassword)` then
     `reauthenticateWithCredential(user, credential)` to confirm the current password and satisfy
     Firebase's recent-login requirement.
   - `updatePassword(user, newPassword)` to set the new password.
5. On success the app shows "Your password has been updated.", closes the form, and clears the
   password fields from memory.

Only the **signed-in user's own** password is ever changed. There is no admin/service-account
behavior. Passwords use secure text entry, are never shown back to the user, are never logged, and
are cleared from component state when the form closes or succeeds.

### Recent-login handling

If Firebase returns `auth/requires-recent-login` (it can require a fresh session), the flow surfaces
calm copy:

> For your security, please sign in again before changing your password.

It offers a "Sign in again" action that signs the user out so they can sign in fresh and retry. The
password is **not** changed until an update actually succeeds, so a blocked attempt leaves the old
password in place.

Relevant files:

- `app/(app)/settings.tsx` — the inline Change password section, validation, success, and the
  requires-recent-login Alert.
- `src/context/AuthContext.tsx` — `changePassword` (local mode throws a calm
  `PasswordChangeError`).
- `src/services/firebase/authService.ts` — `changePassword` (reauthenticate + updatePassword).
- `src/services/firebase/authErrors.ts` — `CHANGE_PASSWORD_COPY`, `PasswordChangeError`,
  `passwordChangeError`.

## 3. Error handling (safe, user-facing copy)

All Firebase Auth errors are mapped to calm, plain-language copy. Raw Firebase codes/messages are
never shown. No em dashes in user-facing copy.

| Situation | Copy shown |
| --- | --- |
| Invalid email (reset) | Please enter a valid email address. |
| Weak new password | Please choose a stronger password. Use at least 6 characters. |
| Wrong current password | That password does not look right. Please try again. |
| New passwords do not match | The new passwords do not match. |
| Network issue | We could not connect right now. Please check your connection and try again. |
| Too many attempts | Too many attempts. Please wait a little while and try again. |
| Recent login required | For your security, please sign in again before changing your password. |
| Generic reset failure | We could not send password reset instructions right now. Please try again. |
| Generic change failure | We could not update your password right now. Please try again. |
| Reset confirmation (always) | If an account exists for that email, password reset instructions will be sent. |
| Change success | Your password has been updated. |

Mapping lives in `src/services/firebase/authErrors.ts`:

- `PASSWORD_RESET_COPY` + `passwordResetErrorMessage(error)` for the reset flow.
- `CHANGE_PASSWORD_COPY` + `passwordChangeError(error)` for the change flow (returns a
  `PasswordChangeError` carrying safe copy and a `requiresRecentLogin` flag).

## 4. Local / mock fallback

When Firebase is **not** configured (`AUTH_MODE === 'local'`), the app uses the original on-device
profile and has no real credentials or backend:

- **Forgot password:** the "Forgot password?" link only renders in Firebase mode (it lives inside
  the email/password sign-in view). In local mode there is no password sign-in, so the link is not
  shown. `AuthContext.sendPasswordReset` is a safe no-op in local mode, and
  `PASSWORD_RESET_COPY.localUnavailable` ("Password reset is available when Firebase is configured.")
  is available as copy if a future surface needs it.
- **Change password:** the Settings "Password" section only renders in Firebase mode
  (`requiresPassword`), because local profiles have no password to change. As defense in depth,
  `AuthContext.changePassword` throws a calm `PasswordChangeError`
  ("Password change is available when Firebase is configured.") if it is ever called in local mode,
  so nothing crashes.

To exercise the fallback safely, temporarily rename `mobile-app/.env.local` (for example to
`.env.local.bak`), run `npx expo start -c`, confirm neither flow crashes, then rename it back so
Firebase mode returns.

## 5. By the book / safety summary

- Firebase owns all credential verification, hashing, session/token management, and the reset email.
  The app only calls the SDK and maps results to safe copy.
- No passwords are stored anywhere. No passwords are logged. Secure text entry is used for every
  password field, and screen-reader labels are provided via the `TextField` label.
- No raw Firebase error codes/messages are shown to users.
- No Firestore changes were needed; the `users/{uid}` profile never stored a password and still does
  not store the email.
- No prayer requests, prayer interactions, reports, push notifications, AI, social/Google sign-in,
  passwordless/email-link, or anonymous auth were added or changed.
- No real Firebase config values, project ids, keys, buckets, or service-account keys were committed.
  `.env.local` remains git-ignored.
