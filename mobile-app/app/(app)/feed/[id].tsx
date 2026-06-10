import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../src/theme/theme';

/**
 * Prayer detail — Phase A placeholder.
 *
 * Reads the route id only, to prove dynamic routing works. The full request body,
 * prayer count, "I prayed for this" action, and report flow are built in Phases C–G.
 */
export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Prayer detail</Text>
      <Text style={styles.muted}>Placeholder for request id: {id}</Text>
      <Text style={styles.muted}>
        The full request, prayer count, and "I prayed for this" action arrive in
        Phases C–E.
      </Text>
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
});
