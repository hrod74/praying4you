import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../../src/components/EmptyState';
import { PrayerCard } from '../../../src/components/PrayerCard';
import { useAuth } from '../../../src/context/AuthContext';
import { usePrayers } from '../../../src/context/PrayerContext';
import { colors, spacing, typography } from '../../../src/theme/theme';

/**
 * Prayer feed (read path).
 *
 * Renders the active prayer requests (newest first) from PrayerContext as calm,
 * journal-style cards; tapping a card opens its detail. Loading, empty, and error states
 * are warm and quiet. Composing a new request is the persistent "Share" tab in the bottom
 * navigation (always reachable, even after scrolling), so the feed itself stays a clean,
 * readable list.
 */
export default function FeedScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { prayers, isLoading, error, refresh, hasPrayed } = usePrayers();

  // First load (nothing to show yet): a quiet centered spinner.
  if (isLoading && prayers.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.centeredText}>Gathering today's prayer requests…</Text>
      </View>
    );
  }

  if (error && prayers.length === 0) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="🌥️"
          title="Couldn't load the feed"
          message={error}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={prayers}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Prayer requests</Text>
          <Text style={styles.subtitle}>
            Read what others are carrying, and lift them up in prayer.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <PrayerCard
          prayer={item}
          prayed={profile ? hasPrayed(item.id, profile.id) : false}
          onPress={() => router.push(`/(app)/feed/${item.id}`)}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <EmptyState
          title="No prayer requests yet"
          message="When requests are shared, they'll appear here."
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  centeredText: typography.muted,
});
