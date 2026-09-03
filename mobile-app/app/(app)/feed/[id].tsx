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
import { useAppTheme } from '../../../src/context/ThemeContext';
import type { PrayerRequest } from '../../../src/models/types';
import { getRequestById } from '../../../src/services/prayerRequests';
import { colors, createThemedStyles, radius, spacing, typography } from '../../../src/theme/theme';
import { formatLongDate, formatPrayerCount } from '../../../src/utils/format';
import {
  confirmHideAccount,
  HIDE_ACCOUNT_ACTION_LABEL,
  HIDE_ACCOUNT_SUCCESS_MESSAGE,
} from '../../../src/utils/hideAccountCopy';

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
  useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { getById, hasPrayed, pray, undoPrayer, hasReported, removePrayer, hideAccountForRequest, isAccountHidden } =
    usePrayers();
  const { showSuccess, showError } = useFeedback();
  const fromContext = getById(id);

  const [pending, setPending] = useState(false);
  const [hiding, setHiding] = useState(false);

  // undefined = still resolving the fallback; null = confirmed not found.
  const [fetched, setFetched] = useState<PrayerRequest | null | undefined>(undefined);

  useEffect(() => {
    if (fromContext) return;
    let active = true;
    void getRequestById(id)
      .then((p) => {
        // This fallback bypasses PrayerContext's `prayers` filtering (it exists specifically for
        // a direct/deep link not already in the loaded feed), so hidden-account safety has to be
        // re-checked here explicitly: a stale or shared link to a now-hidden account's request
        // must resolve to the same calm "not found" state as a removed request, never render it.
        if (active) setFetched(p && !isAccountHidden(p.userId) ? p : null);
      })
      .catch(() => {
        // A lookup failure resolves to the calm "not found" state rather than a raw error.
        if (active) setFetched(null);
      });
    return () => {
      active = false;
    };
  }, [id, fromContext, isAccountHidden]);

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
      showSuccess('You prayed for this.', {
        label: 'Undo',
        onPress: () => { void handleUndoPrayer(); },
      });
    } catch (e) {
      // Surface the interaction layer's calm, safe copy (e.g. removed request / network); never a
      // raw Firebase error.
      showError(
        e instanceof Error && e.message
          ? e.message
          : 'We could not mark this as prayed for right now. Please try again.',
      );
    } finally {
      setPending(false);
    }
  };

  const handleUndoPrayer = async () => {
    if (!profile) return;
    setPending(true);
    try {
      await undoPrayer(prayer.id, profile.id);
      showSuccess('Accidental prayer action corrected.');
    } catch (e) {
      showError(
        e instanceof Error && e.message
          ? e.message
          : 'We could not correct that prayer action right now. Please try again.',
      );
    } finally {
      setPending(false);
    }
  };

  const confirmUndoPrayer = () => {
    Alert.alert(
      'Undo prayer?',
      'This removes your prayer mark and decreases the prayer count by one.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo prayer',
          onPress: () => { void handleUndoPrayer(); },
        },
      ],
    );
  };

  // "Hide requests from this account" from the detail screen. On success, per the required
  // behavior, this completes the hide, removes the request from visible state (it already
  // disappears from `prayers` once `hiddenAccounts` updates), and returns the user safely to the
  // feed rather than leaving them on a detail screen for content they just chose to stop seeing.
  const handleHideAccount = () => {
    if (!profile) return;
    confirmHideAccount(() => {
      void (async () => {
        setHiding(true);
        try {
          await hideAccountForRequest(prayer.id, profile.id);
          showSuccess(HIDE_ACCOUNT_SUCCESS_MESSAGE);
          router.replace('/(app)/feed');
        } catch (e) {
          setHiding(false);
          showError(
            e instanceof Error && e.message
              ? e.message
              : 'We could not update this right now. Please try again.',
          );
        }
      })();
    });
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
          <View style={styles.prayedBlock}>
            <View style={styles.prayedConfirm} accessibilityRole="text">
              <Text style={styles.prayedConfirmText}>🙏 You prayed for this</Text>
            </View>
            <Pressable
              onPress={confirmUndoPrayer}
              disabled={pending}
              accessibilityRole="button"
              accessibilityLabel="Undo prayer"
              accessibilityHint="Removes your prayer mark and decreases the prayer count by one"
              hitSlop={8}
              style={({ pressed }) => [styles.undoLink, pressed && styles.undoLinkPressed]}
            >
              <Text style={styles.undoLinkText}>Undo prayer</Text>
            </Pressable>
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

      {/* Safety actions stay separate from the primary prayer moment, but reporting must still be
          findable without coaching. Hidden on the user's own request. */}
      {!isOwnRequest ? (
        <View style={styles.safetyBlock}>
          <View style={styles.safetyIntro}>
            <Text style={styles.safetyHeading}>Safety and privacy</Text>
            <Text style={styles.safetyText}>
              If this request feels unsafe or inappropriate, you can report it privately for
              review. The person who posted it will not see who reported it.
            </Text>
          </View>
          {alreadyReported ? (
            <View style={styles.reportedState} accessibilityRole="text">
              <Text style={styles.reportedTitle}>Report submitted</Text>
              <Text style={styles.reportedNote}>
                Thank you. Your report is private and will be reviewed.
              </Text>
            </View>
          ) : (
            <Button
              label="Report this request"
              variant="secondary"
              onPress={() => router.push(`/(app)/feed/report?id=${prayer.id}`)}
              accessibilityHint="Opens a private report form for this prayer request"
            />
          )}
          <Pressable
            onPress={handleHideAccount}
            disabled={hiding}
            accessibilityRole="button"
            accessibilityLabel={HIDE_ACCOUNT_ACTION_LABEL}
            accessibilityHint="Stops showing prayer requests from this account and returns to the feed"
            hitSlop={8}
            style={styles.safetyLink}
          >
            <Text style={styles.reportLink}>{HIDE_ACCOUNT_ACTION_LABEL}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = createThemedStyles(() => ({
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
  prayedBlock: {
    gap: spacing.sm,
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
  undoLink: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  undoLinkPressed: {
    opacity: 0.7,
  },
  undoLinkText: {
    ...typography.muted,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  safetyBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  safetyIntro: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  safetyHeading: {
    ...typography.body,
    fontWeight: '600',
  },
  safetyText: typography.muted,
  reportLink: {
    ...typography.muted,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  safetyLink: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportedState: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  reportedTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  reportedNote: typography.muted,
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
} as const));
