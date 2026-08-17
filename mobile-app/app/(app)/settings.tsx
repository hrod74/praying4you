import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { PolicyLinks } from '../../src/components/PolicyLinks';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { useFeedback } from '../../src/context/FeedbackContext';
import { usePrayers } from '../../src/context/PrayerContext';
import {
  AccountDeletionError,
  CHANGE_PASSWORD_COPY,
  DELETE_ERROR_COPY,
  PasswordChangeError,
} from '../../src/services/firebase/authErrors';
import { colors, radius, spacing, typography } from '../../src/theme/theme';
import { evaluateDisplayNameSubmission } from '../../src/utils/displayNameSubmissionGate';
import { formatShortDate } from '../../src/utils/format';
import {
  DISPLAY_NAME_MAX,
  validateDisplayName,
  validateEmail,
  validatePassword,
} from '../../src/utils/validation';

/**
 * Settings / Profile / About (Phase G, polished in Phase H, Phase H.1).
 *
 * An intentional settings screen: the profile (display name + email clearly marked private), a
 * quiet "Your prayer activity" summary with links to the user's own requests and the prayers they
 * have lifted up, plain-language privacy guidance, a sincere About section, password change (Firebase
 * mode), sign-out, and account deletion. Email appears only here, on the owner's own private screen,
 * never on any public prayer surface.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut, updateProfile, requiresPassword, changePassword, deleteAccount } =
    useAuth();
  const {
    getMyRequests,
    getPrayedRequests,
    hiddenAccounts,
    isLoading: hiddenAccountsLoading,
    error: hiddenAccountsError,
    unhideAccount,
  } = usePrayers();
  const { showSuccess, showError } = useFeedback();
  const [deleting, setDeleting] = useState(false);

  // A quiet record of the user's own prayer activity, companionship, not a score.
  const sharedCount = profile ? getMyRequests(profile.id).length : 0;
  const liftedCount = profile ? getPrayedRequests(profile.id).length : 0;

  // Inline local edit of the profile (display name + email). Saving requires an intentional
  // tap on Save; the keyboard "next"/"done" keys move focus or dismiss, never save.
  const emailRef = useRef<TextInput>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  // Set only when the content filter (not ordinary validation) rejected the current display
  // name. Cleared as soon as the user edits the field, so stale feedback never lingers.
  const [nameFilterError, setNameFilterError] = useState<string | null>(null);

  // In Firebase mode the email is managed by Firebase Auth and is not editable here yet (an email
  // change needs verification/reauth, deferred to a later phase), so only the display name is edited.
  const nameError = submitted ? validateDisplayName(name) : null;
  const emailError = submitted && !requiresPassword ? validateEmail(email) : null;
  const canSave =
    name.trim().length > 0 && (requiresPassword || email.trim().length > 0) && !saving;

  // Inline change-password form (Firebase mode only). Like Edit profile, saving requires an
  // explicit tap; the keyboard keys only move focus or dismiss. Passwords use secure entry, are
  // cleared from state on close/success, and are never shown back to the user or logged.
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSubmitted, setPwSubmitted] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const newPasswordError = pwSubmitted ? validatePassword(newPassword) : null;
  const confirmPasswordError =
    pwSubmitted && !validatePassword(newPassword) && newPassword !== confirmPassword
      ? CHANGE_PASSWORD_COPY.mismatch
      : null;
  const canChangePassword =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    !savingPassword;

  const startEdit = () => {
    setName(profile?.displayName ?? '');
    setEmail(profile?.email ?? '');
    setSubmitted(false);
    setNameFilterError(null);
    setEditing(true);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameFilterError) setNameFilterError(null);
  };

  const startChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwSubmitted(false);
    setChangingPassword(true);
  };

  const closeChangePassword = () => {
    Keyboard.dismiss();
    setChangingPassword(false);
    setPwSubmitted(false);
    // Clear secrets from memory once the form is closed.
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    setPwSubmitted(true);
    // Validate locally first: a real new password, and a matching confirmation.
    if (validatePassword(newPassword)) return;
    if (newPassword !== confirmPassword) return;
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      closeChangePassword();
      setSavingPassword(false);
      showSuccess(CHANGE_PASSWORD_COPY.success);
    } catch (e) {
      setSavingPassword(false);
      // Firebase may require a fresh sign-in before changing a password. Offer a calm path to
      // sign in again rather than failing silently.
      if (e instanceof PasswordChangeError && e.requiresRecentLogin) {
        Alert.alert('Please sign in again', e.message, [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Sign in again',
            onPress: () => {
              closeChangePassword();
              void signOut();
            },
          },
        ]);
        return;
      }
      showError(e instanceof Error && e.message ? e.message : CHANGE_PASSWORD_COPY.generic);
    }
  };

  const cancelEdit = () => {
    Keyboard.dismiss();
    setEditing(false);
    setSubmitted(false);
    setNameFilterError(null);
  };

  const handleSaveProfile = async () => {
    setSubmitted(true);
    if (validateDisplayName(name) || (!requiresPassword && validateEmail(email))) return;
    // Only after all ordinary validation has passed does the content filter run, and only on the
    // public display name; this happens before the Firebase/local persistence call below.
    const nameGate = evaluateDisplayNameSubmission(name);
    if (nameGate.status !== 'ready') {
      setNameFilterError(nameGate.message);
      return;
    }
    setNameFilterError(null);
    setSaving(true);
    try {
      // Firebase mode updates the display name only; the email stays as-is.
      await updateProfile({ displayName: name, email: requiresPassword ? (profile?.email ?? '') : email });
      Keyboard.dismiss();
      setEditing(false);
      setSaving(false);
      showSuccess('Profile updated.');
    } catch (e) {
      setSaving(false);
      showError(
        e instanceof Error && e.message
          ? e.message
          : 'We could not save your profile just now. Please try again.',
      );
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showSuccess('You’re signed out.');
  };

  // Run the deletion. On success the (app) layout redirects to the welcome screen as soon as the
  // session clears; the success toast lives above that navigation so it still shows. Failures are
  // mapped to calm copy; a requires-recent-login result offers a path to sign in again and retry.
  const runDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      showSuccess('Your account has been deleted.');
    } catch (e) {
      setDeleting(false);
      if (e instanceof AccountDeletionError && e.requiresRecentLogin) {
        Alert.alert('Please sign in again', e.message, [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Sign in again',
            onPress: () => {
              void signOut();
            },
          },
        ]);
        return;
      }
      showError(
        e instanceof Error && e.message ? e.message : DELETE_ERROR_COPY.generic,
      );
    }
  };

  // Two-step deletion guarded by an explicit confirmation so it cannot be triggered by an
  // accidental tap. The copy is clear about what is removed and that it cannot be undone. It speaks
  // in user-facing terms (profile removed, active requests removed from the feed) and deliberately
  // does not explain the backend soft-remove detail.
  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'Deleting your account will remove your profile and remove your active prayer requests from the feed. ' +
        'People will no longer be able to see or pray for those requests. This cannot be undone.',
      [
        { text: 'Keep my account', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            void runDeleteAccount();
          },
        },
      ],
    );
  };

  // "Unhide" a previously hidden account, behind its own confirmation so it cannot be triggered
  // by an accidental tap. Copy is not one of the task's required-verbatim strings, so it is
  // written in the app's existing calm, plain tone (see confirmDeleteAccount above for the same
  // pattern: a destructive-adjacent confirm dialog with a clear Cancel and a labeled action).
  const confirmUnhide = (hiddenUserId: string) => {
    Alert.alert(
      'Unhide this account?',
      'You will see current and future prayer requests from this account again. They will not be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unhide',
          onPress: () => {
            void (async () => {
              if (!profile) return;
              try {
                await unhideAccount(hiddenUserId, profile.id);
                showSuccess('That account is no longer hidden.');
              } catch (e) {
                showError(
                  e instanceof Error && e.message
                    ? e.message
                    : 'We could not update this right now. Please try again.',
                );
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Screen scroll>
      {/* Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your profile</Text>
        {editing ? (
          <View style={styles.card}>
            <TextField
              label="Display name"
              value={name}
              onChangeText={handleNameChange}
              placeholder="e.g. Jordan"
              helperText={`Shown publicly on your prayer requests. Up to ${DISPLAY_NAME_MAX} characters.`}
              errorText={nameError ?? nameFilterError}
              autoCapitalize="words"
              maxLength={DISPLAY_NAME_MAX}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            {requiresPassword ? (
              <View>
                <Text style={styles.rowLabel}>Email</Text>
                <Text style={styles.rowValue}>{profile?.email ?? '-'}</Text>
                <Text style={styles.privateNote}>
                  🔒 Private. Your email is managed by your account sign-in and is not editable
                  here yet.
                </Text>
              </View>
            ) : (
              <TextField
                ref={emailRef}
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                helperText="Private. Kept on your device and never shown publicly."
                errorText={emailError}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            )}
            <Button
              label="Save profile"
              onPress={handleSaveProfile}
              disabled={!canSave}
              accessibilityHint={
                requiresPassword
                  ? 'Saves your display name'
                  : 'Saves your display name and email on this device'
              }
            />
            <Button label="Cancel" variant="secondary" onPress={cancelEdit} />
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Display name</Text>
              <Text style={styles.rowValue}>{profile?.displayName ?? '-'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{profile?.email ?? '-'}</Text>
            </View>
            <Text style={styles.privateNote}>
              🔒 Private. Only you can see your email. It is never shown on prayer requests.
            </Text>
            <Button
              label="Edit profile"
              variant="secondary"
              onPress={startEdit}
              accessibilityHint="Edit your display name and email on this device"
            />
          </View>
        )}
      </View>

      {/* Change password: Firebase mode only (local profiles have no password to change). */}
      {requiresPassword ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>
          {changingPassword ? (
            <View style={styles.card}>
              <Text style={styles.aboutText}>
                Enter your current password, then choose a new one.
              </Text>
              <TextField
                label="Current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Your current password"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                textContentType="password"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
              />
              <TextField
                ref={newPasswordRef}
                label="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                helperText="Use at least 6 characters."
                errorText={newPasswordError}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <TextField
                ref={confirmPasswordRef}
                label="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your new password"
                errorText={confirmPasswordError}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              <Button
                label={savingPassword ? 'Updating password…' : 'Update password'}
                onPress={handleChangePassword}
                disabled={!canChangePassword}
                accessibilityHint="Reauthenticates and updates your account password"
              />
              <Button label="Cancel" variant="secondary" onPress={closeChangePassword} />
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.aboutText}>
                Update the password you use to sign in. You will need your current password.
              </Text>
              <Button
                label="Change password"
                variant="secondary"
                onPress={startChangePassword}
                accessibilityHint="Opens a form to change your account password"
              />
            </View>
          )}
        </View>
      ) : null}

      {/* Your prayer activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your prayer activity</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.activityRow}
            onPress={() => router.push('/(app)/feed/my-requests')}
            accessibilityRole="button"
            accessibilityLabel={`My prayer requests. ${sharedCount} shared.`}
            accessibilityHint="Opens the requests you have shared"
          >
            <View style={styles.activityText}>
              <Text style={styles.activityLabel}>Requests shared</Text>
              <Text style={styles.activitySub}>Prayer requests you have shared</Text>
            </View>
            <View style={styles.activityEnd}>
              <Text style={styles.activityCount}>{sharedCount}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={styles.activityRow}
            onPress={() => router.push('/(app)/feed/prayed-for')}
            accessibilityRole="button"
            accessibilityLabel={`Prayers I have prayed for. ${liftedCount} lifted.`}
            accessibilityHint="Opens the requests you have prayed for"
          >
            <View style={styles.activityText}>
              <Text style={styles.activityLabel}>Prayers lifted</Text>
              <Text style={styles.activitySub}>Requests you have prayed for</Text>
            </View>
            <View style={styles.activityEnd}>
              <Text style={styles.activityCount}>{liftedCount}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>
        </View>
        <Text style={styles.activityNote}>
          A quiet record of your own prayers, not a score.
        </Text>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.card}>
          <View style={styles.bullet}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.bulletText}>
              Your prayer requests show either your <Text style={styles.bold}>display
              name</Text> or <Text style={styles.bold}>“Anonymous”</Text>, your choice,
              each time you post.
            </Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.bulletText}>
              Your <Text style={styles.bold}>email is private</Text> and is never shown on
              prayer requests or to other people.
            </Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.bulletText}>
              You can <Text style={styles.bold}>delete your account</Text> at any time. Your profile
              is removed and your active prayer requests leave the feed.
            </Text>
          </View>
          <View style={styles.divider} />
          <PolicyLinks />
        </View>
      </View>

      {/* Hidden accounts: "Hide requests from this account" is the app's account-level
          user-blocking control (see docs/firebase-hidden-accounts-implementation.md). */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hidden accounts</Text>
        <View style={styles.card}>
          {hiddenAccountsLoading ? (
            <Text style={styles.aboutText}>Loading your hidden accounts…</Text>
          ) : hiddenAccountsError ? (
            // A load failure here must never be misread as "no accounts are hidden": show the
            // same safe error state the feed uses, not an empty list.
            <Text style={styles.dangerNote}>{hiddenAccountsError}</Text>
          ) : hiddenAccounts.length === 0 ? (
            <Text style={styles.aboutText}>
              You haven't hidden any accounts. When you hide an account, it will appear here.
            </Text>
          ) : (
            hiddenAccounts.map((entry, index) => (
              <View key={entry.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.hiddenRow}>
                  <View style={styles.activityText}>
                    <Text style={styles.activityLabel} numberOfLines={1}>
                      {/* Never the real name behind an Anonymous request: only an
                          already-public display-name snapshot, or this calm placeholder. */}
                      {entry.displayLabelSnapshot ?? 'Account hidden from an Anonymous request'}
                    </Text>
                    <Text style={styles.activitySub}>Hidden {formatShortDate(entry.createdAt)}</Text>
                  </View>
                  <Button
                    label="Unhide"
                    variant="secondary"
                    onPress={() => confirmUnhide(entry.hiddenUid)}
                    accessibilityHint="Shows current and future prayer requests from this account again"
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Praying For You</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            Praying For You is a quiet, supportive place to share what you're carrying and to
            pray for others who are carrying their own. Post a request, or pick one up and
            lift it in prayer.
          </Text>
          <Text style={styles.aboutText}>
            It's built to feel calm and respectful, closer to an old, well-loved prayer
            journal than a busy social feed. You're never asked to perform; you're simply
            invited to be present with one another.
          </Text>
          <Text style={styles.aboutMuted}>
            Be kind with what you share, and with one another.
          </Text>
        </View>
      </View>

      <Button
        label="Sign out"
        variant="secondary"
        onPress={handleSignOut}
        accessibilityHint="Signs you out and returns to the welcome screen"
      />

      {/* Delete account: placed last, behind a confirmation, so it is hard to tap by accident. */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delete account</Text>
        <View style={styles.dangerCard}>
          <Text style={styles.aboutText}>
            Deleting your account removes your sign-in and your private profile from this app.
            This cannot be undone.
          </Text>
          <Text style={styles.dangerNote}>
            Your active prayer requests will be removed from the feed, so people can no longer
            see or pray for them.
          </Text>
          <Button
            label={deleting ? 'Deleting account…' : 'Delete account'}
            variant="secondary"
            onPress={confirmDeleteAccount}
            disabled={deleting}
            style={styles.deleteButton}
            accessibilityHint="Asks you to confirm, then permanently deletes your account and removes your active prayer requests from the feed"
          />
        </View>
      </View>

      <Text style={styles.footer}>Praying For You</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  rowValue: {
    ...typography.body,
    color: colors.textMuted,
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  hiddenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  activityText: {
    flexShrink: 1,
    gap: 2,
  },
  activityLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  activitySub: typography.muted,
  activityEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activityCount: {
    ...typography.heading,
    color: colors.gold,
  },
  chevron: {
    ...typography.heading,
    color: colors.textMuted,
    fontWeight: '400',
  },
  activityNote: {
    ...typography.muted,
    marginTop: spacing.xs,
  },
  privateNote: {
    ...typography.muted,
    marginTop: spacing.xs,
  },
  bullet: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    ...typography.body,
    color: colors.gold,
  },
  bulletText: {
    ...typography.body,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  aboutText: typography.body,
  aboutMuted: {
    ...typography.muted,
    marginTop: spacing.xs,
  },
  dangerCard: {
    backgroundColor: colors.dangerSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dangerNote: {
    ...typography.muted,
    color: colors.danger,
  },
  deleteButton: {
    borderColor: colors.danger,
  },
  footer: {
    ...typography.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
