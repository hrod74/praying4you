import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../src/theme/theme';

/**
 * Simulated sign-in screen — Phase A placeholder.
 *
 * No authentication runs here yet. Phase B adds the local AuthContext, sets the
 * signed-in state, and links create-profile into the flow.
 */
export default function SignInScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign in</Text>
      <Text style={styles.muted}>
        Placeholder. Simulated local sign-in is implemented in Phase B.
      </Text>
      <Link href="/(auth)/create-profile" style={styles.link}>
        Go to create profile →
      </Link>
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
