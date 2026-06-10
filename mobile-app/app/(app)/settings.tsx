import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/context/AuthContext';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

/**
 * Settings / about.
 *
 * Phase B: shows the local profile (display name, and email clearly marked private)
 * and provides sign-out. Display-name editing and the fuller about content arrive in
 * Phase G. Email is shown only here, on the owner's own private settings screen — never
 * on any public prayer surface.
 */
export default function SettingsScreen() {
  const { profile, signOut } = useAuth();

  return (
    <Screen scroll>
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
            🔒 Private — only you can see this. It's never shown on prayer requests.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            Praying 4 You is a calm, supportive space to share prayer requests and pray
            for others. This is an early local prototype — your profile and data stay on
            this device.
          </Text>
        </View>
      </View>

      <Button
        label="Sign out"
        variant="secondary"
        onPress={signOut}
        accessibilityHint="Signs you out and returns to the welcome screen"
      />
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
  aboutText: typography.body,
});
