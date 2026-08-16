import { Alert } from 'react-native';

/**
 * Shared copy and confirmation helper for "Hide requests from this account," the app's
 * account-level user-blocking control (see `docs/firebase-hidden-accounts-implementation.md`).
 *
 * Kept in one place so the required interface copy is identical across every entry point (feed
 * card, prayer detail, post-report), rather than re-typed at each call site. "Block user" is
 * intentionally never used as user-facing text; the internal code/docs term is "account blocking"
 * only where platform-policy clarity is useful (App Review Guidelines 1.2 / Google Play UGC
 * policy), never in anything a user sees. No em dashes anywhere below.
 */

/** The menu action label, and the accessible name for every entry point's affordance. */
export const HIDE_ACCOUNT_ACTION_LABEL = 'Hide requests from this account';

const CONFIRM_TITLE = 'Hide requests from this account?';
const CONFIRM_MESSAGE =
  'You will no longer see current or future prayer requests from this account. This also ' +
  'applies when the account posts as Anonymous. They will not be notified. You can undo this ' +
  'later in Settings.\n\n' +
  'This does not prevent them from seeing prayer requests you share with the community.';

/** Shown after a successful hide, from any entry point. */
export const HIDE_ACCOUNT_SUCCESS_MESSAGE = 'Requests from this account are now hidden.';

/**
 * Show the required confirmation dialog, then run `onConfirm` if the person taps "Hide requests".
 * `onConfirm` should perform the hide and its own success/error handling; this helper only owns
 * the confirmation step, matching how `confirmDeleteAccount` and the detail screen's remove-
 * request confirmation are already structured in this app.
 */
export function confirmHideAccount(onConfirm: () => void): void {
  Alert.alert(CONFIRM_TITLE, CONFIRM_MESSAGE, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Hide requests', style: 'destructive', onPress: onConfirm },
  ]);
}
