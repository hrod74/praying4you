import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../src/theme/theme';

/**
 * Prayer feed — Phase A placeholder.
 *
 * No data is loaded yet. Phase C wires PrayerContext + prayerService to the mock data
 * and renders real cards (newest first). The single placeholder "card" below links to
 * the detail route to confirm stacked navigation works.
 */
export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.muted}>
        Placeholder feed. The card list (from mock data, via the services layer) is
        built in Phase C.
      </Text>

      <Link href="/(app)/feed/sample-1" style={styles.card}>
        <Text style={styles.cardTitle}>Sample prayer request</Text>
        <Text style={styles.cardBody}>
          Tap to open the detail screen (confirms stacked navigation).
        </Text>
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
  muted: typography.muted,
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardTitle: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  cardBody: typography.muted,
});
