import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '../../../src/components/Button';
import { CategoryTag } from '../../../src/components/CategoryTag';
import { EmptyState } from '../../../src/components/EmptyState';
import { useAuth } from '../../../src/context/AuthContext';
import { useFeedback } from '../../../src/context/FeedbackContext';
import { usePrayers } from '../../../src/context/PrayerContext';
import type { PrayerRequest } from '../../../src/models/types';
import { getRequestById } from '../../../src/services/prayerRequests';
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
  const router = useRouter();
  const { profile } = useAuth();
  const { getById, hasPrayed, pray, hasReported, removePrayer } = usePrayers();
  const { showSuccess, showError } = useFeedback();
  const fromContext = getById(id);

  const [pending, setPending] = useState(false);

  // undefined = still resolving the fallback; null = confirmed not found.
  const [fetched, setFetched] = useState<PrayerRequest | null | undefined>(undefined);

  useEffect(() => {
    if (fromContext) return;
    let active = true;
    void getRequestById(id)
      .then((p) => {
        if (active) setFetched(p);
      })
      .catch(() => {
        // A lookup failure resolves to the calm "not found" state rather than a raw error.
        if (active) setFetched(null);
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
  const isOwnRequest = Boolean(profile && prayer.userId === profile.id);
  const alreadyPrayed = Boolean(profile && hasPrayed(prayer.id, profile.id));
  const alreadyReported = Boolean(profile && hasReported(prayer.id, profile.id));

  const handlePray = async () => {
    if (!profile) return;
    setPending(true);
    try {
      await pray(prayer.id, profile.id);
      showSuccess('You prayed for this.');
    } catch {
      showError('We could not record that just now. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const handleRemove = () => {
    if (!profile) return;
    Alert.alert(
      'Remove this prayer request?',
      'This removes it from the prayer feed. You can do this only on your own request.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove request',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await removePrayer(prayer.id, profile.id);
                showSuccess('Prayer request removed.');
                router.replace('/(app)/feed');
              } catch (e) {
                showError(
                  e instanceof Error && e.message
                    ? e.message
                    : 'We could not remove your request right now. Please try again.',
                );
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.page}>
        <CategoryTag category={prayer.category} />

        <View style={styles.meta}>
          <Text style={styles.name}>{shownName}</Text>
          <Text style={styles.date}>{formatLongDate(prayer.createdAt)}</Text>
        </View>

        <Text style={styles.body}>{prayer.body}</Text>

        <View style={styles.divider} />

        <Text style={styles.count}>{formatPrayerCount(prayer.prayerCount)}</Text>

        {isOwnRequest ? (
          <View style={styles.ownerBlock}>
            <Text style={styles.ownNote}>This is your request.</Text>
            <Button
              label="Edit request"
              variant="secondary"
              onPress={() => router.push(`/(app)/feed/edit?id=${prayer.id}`)}
              accessibilityHint="Change the text, category, or name shown on your request"
            />
            <Button
              label="Remove request"
              variant="secondary"
              onPress={handleRemove}
              accessibilityHint="Removes your request from the feed"
            />
          </View>
        ) : alreadyPrayed ? (
          <View style={styles.prayedConfirm} accessibilityRole="text">
            <Text style={styles.prayedConfirmText}>🙏 You prayed for this</Text>
          </View>
        ) : (
          <Button
            label="🙏 I prayed for this"
            accessibilityLabel="I prayed for this"
            onPress={handlePray}
            disabled={pending}
            accessibilityHint="Marks that you prayed for this request"
          />
        )}
      </View>

      {/* Reporting — quiet and understated; hidden on the user's own request. */}
      {!isOwnRequest ? (
        <View style={styles.reportRow}>
          {alreadyReported ? (
            <Text style={styles.reportedNote}>You reported this request. Thank you.</Text>
          ) : (
            <Pressable
              onPress={() => router.push(`/(app)/feed/report?id=${prayer.id}`)}
              accessibilityRole="button"
              accessibilityLabel="Report this request"
              hitSlop={8}
            >
              <Text style={styles.reportLink}>Report this request</Text>
            </Pressable>
          )}
        </View>
      ) : null}
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
    shadowColor: colors.shadow,
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
  ownerBlock: {
    gap: spacing.sm,
  },
  ownNote: {
    ...typography.muted,
    fontStyle: 'italic',
  },
  prayedConfirm: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  prayedConfirmText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  reportRow: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  reportLink: {
    ...typography.muted,
    textDecorationLine: 'underline',
  },
  reportedNote: typography.muted,
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
});
