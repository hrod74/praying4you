import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../../src/components/EmptyState';
import { PrayerCard } from '../../../src/components/PrayerCard';
import { useAuth } from '../../../src/context/AuthContext';
import { usePrayers } from '../../../src/context/PrayerContext';
import { useAppTheme } from '../../../src/context/ThemeContext';
import { createThemedStyles, spacing, typography } from '../../../src/theme/theme';

/**
 * Prayers I've prayed for (Phase H.1).
 *
 * Reached from "Your prayer activity" in Settings. Shows the requests the current local user
 * has prayed for, as the same calm journal cards used in the feed. Tapping a card opens its
 * detail. A warm empty state invites the user to pray for someone. Local/mock only.
 */
export default function PrayedForScreen() {
  useAppTheme();
  const router = useRouter();
  const { profile } = useAuth();
  const { getPrayedRequests, hasPrayed } = usePrayers();

  const prayedFor = profile ? getPrayedRequests(profile.id) : [];

  // Stable callback so memoized cards keep identical props across renders.
  const handlePress = useCallback(
    (id: string) => router.push(`/(app)/feed/${id}`),
    [router],
  );

  return (
    <FlatList
      data={prayedFor}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Prayers I’ve prayed for</Text>
          <Text style={styles.subtitle}>
            Requests you have lifted up. Open one to read it again.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <PrayerCard
          prayer={item}
          prayed={profile ? hasPrayed(item.id, profile.id) : false}
          onPress={handlePress}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <EmptyState
          title="No prayers yet"
          message="When you pray for a request, it will appear here."
        />
      }
    />
  );
}

const styles = createThemedStyles(() => ({
  list: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: typography.title,
  subtitle: typography.muted,
  separator: {
    height: spacing.md,
  },
} as const));
