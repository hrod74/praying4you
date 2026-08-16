import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyState } from '../../../src/components/EmptyState';
import { FeedControls } from '../../../src/components/FeedControls';
import { PrayerCard } from '../../../src/components/PrayerCard';
import { useAuth } from '../../../src/context/AuthContext';
import { useFeedback } from '../../../src/context/FeedbackContext';
import { usePrayers } from '../../../src/context/PrayerContext';
import {
  applyFeedControls,
  DEFAULT_FEED_CONTROLS,
  isFeedCustomized,
  type FeedControls as FeedControlsState,
} from '../../../src/feed/feedQuery';
import { colors, spacing, typography } from '../../../src/theme/theme';
import {
  confirmHideAccount,
  HIDE_ACCOUNT_SUCCESS_MESSAGE,
} from '../../../src/utils/hideAccountCopy';
import type { PrayerRequest } from '../../../src/models/types';

/**
 * Prayer feed (read path) with sorting + filtering and feed-scale performance hardening.
 *
 * Renders the active prayer requests from PrayerContext as calm, journal-style cards; tapping a
 * card opens its detail. A compact FeedControls bar above the list provides three sort orders
 * (newest / oldest / most prayed) and three combinable filters (category, "to pray for", "my
 * requests"). The visible list is DERIVED from the loaded requests by `applyFeedControls`; it never
 * changes stored data, and removed requests are always excluded.
 *
 * Performance (Feed Scale Readiness): the previous version recreated `renderItem` and a per-item
 * `onPress`/`onPray` closure on every render, which defeated `React.memo` on PrayerCard, so a single
 * prayer-count change re-rendered every visible card (the source of React Native's "VirtualizedList
 * ... slow to update" warning on a large feed). Now `renderItem`, `keyExtractor`, and the row
 * callbacks are stable via `useCallback`, PrayerCard takes id-based stable callbacks, the sorted/
 * filtered array is memoized, and the FlatList is given conservative virtualization windows. The
 * net effect: only the one card whose prayed state actually changed re-renders after praying.
 */

// Stable, module-level separator so it is not re-created on every feed render.
function Separator() {
  return <View style={styles.separator} />;
}

export default function FeedScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { prayers, isLoading, error, refresh, hasPrayed, pray, hideAccountForRequest } =
    usePrayers();
  const { showSuccess, showError } = useFeedback();

  const [controls, setControls] = useState<FeedControlsState>(DEFAULT_FEED_CONTROLS);

  const userId = profile?.id ?? null;

  // Derived visible list: filter + sort over the FULL loaded active set (an honest whole-dataset
  // view for this pre-beta phase, not a partial page). Memoized so it only recomputes when the
  // loaded requests, the controls, or the viewer's own prayed state change. `hasPrayed` from context
  // changes identity when the user prays, which correctly refreshes the "to pray for" filter.
  const visiblePrayers = useMemo(
    () =>
      applyFeedControls(prayers, controls, {
        userId,
        hasPrayed: (id) => (userId ? hasPrayed(id, userId) : false),
      }),
    [prayers, controls, userId, hasPrayed],
  );

  const customized = isFeedCustomized(controls);

  const handlePress = useCallback(
    (id: string) => router.push(`/(app)/feed/${id}`),
    [router],
  );

  // Pray directly from a feed card. Reuses the same idempotent PrayerContext action as the detail
  // screen; the count is derived in context, so only the affected card re-renders into its "Prayed"
  // state. Stable across renders so memoized cards are not invalidated.
  const handlePray = useCallback(
    async (id: string) => {
      if (!profile) return;
      try {
        await pray(id, profile.id);
        showSuccess('You prayed for this.');
      } catch (e) {
        // Surface the interaction layer's calm, safe copy (e.g. removed request / network); never a
        // raw Firebase error.
        showError(
          e instanceof Error && e.message
            ? e.message
            : 'We could not mark this as prayed for right now. Please try again.',
        );
      }
    },
    [profile, pray, showSuccess, showError],
  );

  // "Hide requests from this account" from a feed card. Confirms, then hides the author (looked
  // up from the request id by context), never the request alone. The card disappears on its own
  // once `hiddenAccounts` updates, since `prayers` is filtered by hidden authors upstream.
  const handleHide = useCallback(
    (id: string) => {
      if (!profile) return;
      confirmHideAccount(() => {
        void (async () => {
          try {
            await hideAccountForRequest(id, profile.id);
            showSuccess(HIDE_ACCOUNT_SUCCESS_MESSAGE);
          } catch (e) {
            showError(
              e instanceof Error && e.message
                ? e.message
                : 'We could not update this right now. Please try again.',
            );
          }
        })();
      });
    },
    [profile, hideAccountForRequest, showSuccess, showError],
  );

  const keyExtractor = useCallback((item: PrayerRequest) => item.id, []);

  const renderItem = useCallback<ListRenderItem<PrayerRequest>>(
    ({ item }) => {
      // You cannot pray for your own request (mirrors the detail screen), so the CTA is only offered
      // on others' requests. `undefined` here is a stable value, so memo still holds for own cards.
      // The hide affordance is offered on the same basis, and never on the viewer's own request.
      const isOwn = Boolean(userId && item.userId === userId);
      return (
        <PrayerCard
          prayer={item}
          prayed={userId ? hasPrayed(item.id, userId) : false}
          onPress={handlePress}
          onPray={isOwn ? undefined : handlePray}
          onHide={isOwn ? undefined : handleHide}
        />
      );
    },
    [userId, hasPrayed, handlePress, handlePray, handleHide],
  );

  const onReset = useCallback(() => setControls(DEFAULT_FEED_CONTROLS), []);

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
        <EmptyState icon="🌥️" title="Couldn't load the feed" message={error} />
      </View>
    );
  }

  return (
    <FlatList
      data={visiblePrayers}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Text style={styles.title}>Prayer requests</Text>
            <Text style={styles.subtitle}>
              Read what others are carrying, and lift them up in prayer.
            </Text>
          </View>
          <FeedControls controls={controls} onChange={setControls} onReset={onReset} />
        </View>
      }
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={
        customized ? (
          <EmptyState
            title="Nothing matches yet"
            message="No requests match these filters right now. Try Reset to see the whole feed."
          />
        ) : (
          <EmptyState
            title="No prayer requests yet"
            message="When requests are shared, they'll appear here."
          />
        )
      }
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />
      }
      // --- Virtualization tuning (Feed Scale Readiness) ---
      // Row height is variable (body text truncated to ~200 chars wraps to different heights), so
      // getItemLayout is deliberately NOT provided; FlatList measures rows instead. These values keep
      // the first paint light and bound how much work each update does.
      // ~one screen of cards on first paint:
      initialNumToRender={8}
      // cap per-batch mounting so scroll-driven renders stay smooth:
      maxToRenderPerBatch={8}
      // smaller retained window (default 21) trims off-screen work on a long feed:
      windowSize={11}
      updateCellsBatchingPeriod={50}
      // Only enable view recycling on Android, where it is the default and safe; on iOS it can blank
      // cells in lists with variable height, so we leave it off there.
      removeClippedSubviews={Platform.OS === 'android'}
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
