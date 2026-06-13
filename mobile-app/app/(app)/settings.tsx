import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { useFeedback } from '../../src/context/FeedbackContext';
import { usePrayers } from '../../src/context/PrayerContext';
import { colors, radius, spacing, typography } from '../../src/theme/theme';
import {
  DISPLAY_NAME_MAX,
  validateDisplayName,
  validateEmail,
} from '../../src/utils/validation';

/**
 * Settings / Profile / About (Phase G, polished in Phase H, Phase H.1).
 *
 * An intentional settings screen: the local profile (display name + email clearly marked
 * private), a quiet "Your prayer activity" summary with links to the user's own requests and
 * the prayers they have lifted up, plain-language privacy guidance, a sincere About section, a
 * way to reset local prototype activity, and sign-out. Email appears only here, on the owner's
 * own private screen — never on any public prayer surface. This is a local prototype, not a
 * production account system.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut, updateProfile } = useAuth();
  const { resetLocalData, getMyRequests, getPrayedRequests } = usePrayers();
  const { showSuccess, showError } = useFeedback();

  // A quiet record of the user's own prayer activity — companionship, not a score.
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

  const nameError = submitted ? validateDisplayName(name) : null;
  const emailError = submitted ? validateEmail(email) : null;
  const canSave = name.trim().length > 0 && email.trim().length > 0 && !saving;

  const startEdit = () => {
    setName(profile?.displayName ?? '');
    setEmail(profile?.email ?? '');
    setSubmitted(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    Keyboard.dismiss();
    setEditing(false);
    setSubmitted(false);
  };

  const handleSaveProfile = async () => {
    setSubmitted(true);
    if (validateDisplayName(name) || validateEmail(email)) return;
    setSaving(true);
    try {
      await updateProfile({ displayName: name, email });
      Keyboard.dismiss();
      setEditing(false);
      setSaving(false);
      showSuccess('Profile updated.');
    } catch {
      setSaving(false);
      showError('We could not save your profile just now. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showSuccess('You’re signed out.');
  };

  // Reset clears local prototype activity (submitted requests, prayed marks, reports, owner
  // edits, and removals) but keeps the profile. A confirmation guards against an accidental tap.
  const confirmReset = () => {
    Alert.alert(
      'Reset prototype data?',
      'This clears prayer requests you have submitted, your prayed marks, any reports, and any edits or removals on this device. Your profile stays signed in. The starter prayers return to how they began.',
      [
        { text: 'Keep my data', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void resetLocalData().then(() => showSuccess('Local prototype data reset.'));
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
              onChangeText={setName}
              placeholder="e.g. Jordan"
              helperText={`Shown publicly on your prayer requests. Up to ${DISPLAY_NAME_MAX} characters.`}
              errorText={nameError}
              autoCapitalize="words"
              maxLength={DISPLAY_NAME_MAX}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
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
            <Button
              label="Save profile"
              onPress={handleSaveProfile}
              disabled={!canSave}
              accessibilityHint="Saves your display name and email on this device"
            />
            <Button label="Cancel" variant="secondary" onPress={cancelEdit} />
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Display name</Text>
              <Text style={styles.rowValue}>{profile?.displayName ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{profile?.email ?? '—'}</Text>
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
              name</Text> or <Text style={styles.bold}>“Anonymous”</Text> — your choice,
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
              This is an early <Text style={styles.bold}>local prototype</Text>, not a
              production account system — your profile and data stay on this device.
            </Text>
          </View>
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
            It's built to feel calm and respectful — closer to an old, well-loved prayer
            journal than a busy social feed. You're never asked to perform; you're simply
            invited to be present with one another.
          </Text>
          <Text style={styles.aboutMuted}>
            A local prototype. Be kind with what you share, and with one another.
          </Text>
        </View>
      </View>

      {/* Prototype data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prototype data</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            Your requests, prayed marks, and reports are saved on this device so they are
            still here when you reopen the app. You can clear them anytime and start fresh.
          </Text>
          <Button
            label="Reset prototype data"
            variant="secondary"
            onPress={confirmReset}
            accessibilityHint="Clears your local prayer requests, prayed marks, and reports. Keeps your profile."
          />
        </View>
      </View>

      <Button
        label="Sign out"
        variant="secondary"
        onPress={handleSignOut}
        accessibilityHint="Signs you out and returns to the welcome screen"
      />

      <Text style={styles.footer}>Praying For You · Local prototype</Text>
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
  footer: {
    ...typography.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
