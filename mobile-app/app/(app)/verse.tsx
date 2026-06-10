import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../src/theme/theme';

/**
 * Verse of the day — Phase A placeholder.
 *
 * Phase F renders a real verse from bundled local data (mockVerses) via verseService —
 * no network. This placeholder just confirms the tab renders.
 */
export default function VerseScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Verse of the day</Text>
        <Text style={styles.muted}>
          Placeholder. The daily verse (from local data) is built in Phase F.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heading: typography.heading,
  muted: typography.muted,
});
