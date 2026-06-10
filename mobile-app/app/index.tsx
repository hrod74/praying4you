import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../src/theme/theme';

/**
 * Welcome / entry screen.
 *
 * Phase A placeholder: explains the concept in a sentence and provides links that
 * confirm navigation into both route groups — the (auth) group and the (app) tab
 * shell. Real onboarding / auth-gating arrives in Phase B.
 */
export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Praying 4 You</Text>
        <Text style={styles.subtitle}>
          Share a prayer request, or pick one up and pray for someone else.
        </Text>
        <Text style={styles.placeholderNote}>
          Phase A foundation — placeholder screens to confirm navigation. Features
          arrive in later phases.
        </Text>
      </View>

      <View style={styles.actions}>
        <Link href="/(app)/feed" style={[styles.button, styles.buttonPrimary]}>
          Enter app shell (tabs)
        </Link>
        <Link href="/(auth)/sign-in" style={[styles.button, styles.buttonSecondary]}>
          Auth screens (Phase B placeholder)
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  hero: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  title: typography.title,
  subtitle: typography.body,
  placeholderNote: {
    ...typography.muted,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  button: {
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    color: colors.primaryText,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
