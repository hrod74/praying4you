import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../src/theme/theme';

/**
 * Create-profile screen — Phase A placeholder.
 *
 * No input or storage yet. Phase B collects a name + email locally, saves the local
 * profile, and marks the user signed in. Email is private and never shown publicly.
 */
export default function CreateProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create profile</Text>
      <Text style={styles.muted}>
        Placeholder. Local profile creation (name + email) is implemented in Phase B.
      </Text>
      <Link href="/(app)/feed" style={styles.link}>
        Continue to app shell →
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  heading: typography.heading,
  muted: typography.muted,
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
