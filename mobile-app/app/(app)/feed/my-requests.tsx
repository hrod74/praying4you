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
 * My prayer requests (Phase H.1).
 *
 * Reached from "Your prayer activity" in Settings. Shows the requests the current local user
 * created, newest first, as the same calm journal cards used in the feed. Tapping a card
 * opens its detail, where the owner controls (Edit / Remove request) live. A warm empty state
 * guides a first share. Local/mock only.
 */
export default function MyRequestsScreen() {
  useAppTheme();
  const router = useRouter();
  const { profile } = useAuth();
  const { getMyRequests, hasPrayed } = usePrayers();

  const mine = profile ? getMyRequests(profile.id) : [];

  // Stable callback so memoized cards keep identical props across renders.
  const handlePress = useCallback(
    (id: string) => router.push(`/(app)/feed/${id}`),
    [router],
  );

  return (
    <FlatList
      data={mine}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>My prayer requests</Text>
          <Text style={styles.subtitle}>
            Requests you have shared. Open one to edit or remove it.
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
          title="No prayer requests yet"
          message="Requests you share will appear here. Tap the Pray tab to share your first."
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
