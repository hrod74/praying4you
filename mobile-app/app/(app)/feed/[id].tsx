import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../../src/components/EmptyState';
import { usePrayers } from '../../../src/context/PrayerContext';
import type { PrayerRequest } from '../../../src/models/types';
import { getPrayerById } from '../../../src/services/prayerService';
import { colors, radius, spacing, typography } from '../../../src/theme/theme';
import { formatLongDate, formatPrayerCount } from '../../../src/utils/format';

/**
 * Prayer detail (Phase C, read path).
 *
 * Reads the request id from the route and shows the full prayer text in a reflective,
 * journal-entry style (see design-direction.md §7, §14): warm paper, roomy margins, easy
 * line height, with quiet metadata. The poster shows as their display name or
 * "Anonymous"; email never appears (the model has none). The "I prayed for this" action
 * and reporting arrive in Phases E and G — the count here is read-only.
 *
 * The request is taken from the already-loaded feed (PrayerContext); if it isn't loaded
 * (e.g., a direct link), it falls back to the service so the screen is self-sufficient.
 */
export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById } = usePrayers();
  const fromContext = getById(id);

  // undefined = still resolving the fallback; null = confirmed not found.
  const [fetched, setFetched] = useState<PrayerRequest | null | undefined>(undefined);

  useEffect(() => {
    if (fromContext) return;
    let active = true;
    void getPrayerById(id).then((p) => {
      if (active) setFetched(p);
    });
    return () => {
      active = false;
    };
  }, [id, fromContext]);

  const prayer = fromContext ?? fetched;

  if (prayer === undefined) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (prayer === null) {
    return (
      <View style={styles.centered}>
        <EmptyState
          title="Prayer not found"
          message="This request may have been removed."
        />
      </View>
    );
  }

  const shownName = prayer.isAnonymous ? 'Anonymous' : prayer.displayName;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.page}>
        <View style={styles.meta}>
          <Text style={styles.name}>{shownName}</Text>
          <Text style={styles.date}>{formatLongDate(prayer.createdAt)}</Text>
        </View>

        <Text style={styles.body}>{prayer.body}</Text>

        <View style={styles.divider} />

        <Text style={styles.count}>{formatPrayerCount(prayer.prayerCount)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  page: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
    shadowColor: '#3A2E20',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  meta: {
    gap: spacing.xs,
  },
  name: {
    ...typography.muted,
    fontWeight: '600',
    color: colors.text,
  },
  date: typography.muted,
  body: typography.prayerBody,
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  count: {
    ...typography.muted,
    color: colors.gold,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
});
