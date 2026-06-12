import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/context/AuthContext';
import { usePrayers } from '../../src/context/PrayerContext';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

/**
 * Settings / Profile / About (Phase G, polished in Phase H).
 *
 * An intentional settings screen: the local profile (display name + email clearly marked
 * private), plain-language privacy guidance, a sincere About section, a way to reset local
 * prototype activity, and sign-out. Email appears only here, on the owner's own private
 * screen — never on any public prayer surface. This is a local prototype, not a production
 * account system.
 */
export default function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const { resetLocalData } = usePrayers();

  // Reset clears local prototype activity (submitted requests, prayed marks, reports) but
  // keeps the profile. A confirmation guards against an accidental tap.
  const confirmReset = () => {
    Alert.alert(
      'Reset prototype data?',
      'This clears prayer requests you have submitted, your prayed marks, and any reports on this device. Your profile stays signed in. The starter prayers return to how they began.',
      [
        { text: 'Keep my data', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void resetLocalData();
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
            🔒 Private — only you can see your email. It is never shown on prayer requests.
          </Text>
        </View>
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
        <Text style={styles.sectionTitle}>About Praying 4 You</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            Praying 4 You is a quiet, supportive place to share what you're carrying and to
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
        onPress={signOut}
        accessibilityHint="Signs you out and returns to the welcome screen"
      />

      <Text style={styles.footer}>Praying 4 You · Local prototype</Text>
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
