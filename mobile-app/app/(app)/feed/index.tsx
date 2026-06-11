import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../src/components/Button';
import { EmptyState } from '../../../src/components/EmptyState';
import { PrayerCard } from '../../../src/components/PrayerCard';
import { useAuth } from '../../../src/context/AuthContext';
import { usePrayers } from '../../../src/context/PrayerContext';
import { colors, spacing, typography } from '../../../src/theme/theme';

/**
 * Prayer feed (Phase C, read path).
 *
 * Renders the active prayer requests (newest first) from PrayerContext as calm,
 * journal-style cards. Tapping a card opens its detail screen. Loading, empty, and error
 * states are warm and quiet, in keeping with the prayer-journal tone. No submission or
 * "I prayed for this" interaction yet — those are Phases D and E.
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
          <Button
            label="Share a prayer request"
            onPress={() => router.push('/(app)/feed/submit')}
            accessibilityHint="Opens the form to write a new prayer request"
            style={styles.shareButton}
          />
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
  shareButton: {
    marginTop: spacing.md,
  },
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
