import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../src/theme/theme';

/**
 * Settings / about — Phase A placeholder.
 *
 * Phase G adds display-name editing, sign-out, and an about section. This placeholder
 * confirms the tab renders and offers a link back to the welcome screen.
 */
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings & about</Text>
      <Text style={styles.muted}>
        Placeholder. Display-name editing, sign-out, and the about section are built in
        Phase G.
      </Text>
      <Link href="/" style={styles.link}>
        Back to welcome →
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
