import { FontAwesome5 } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRAYER_CATEGORY_LABELS, type PrayerRequest } from '../models/types';
import { useAppTheme } from '../context/ThemeContext';
import { colors, createThemedStyles, radius, spacing, typography } from '../theme/theme';
import { HIDE_ACCOUNT_ACTION_LABEL } from '../utils/hideAccountCopy';
import { formatPrayerCount, formatShortDate, truncate } from '../utils/format';
import { CategoryTag } from './CategoryTag';

/**
 * PrayerCard — a single prayer request shown as a calm, journal-style card.
 *
 * Design (see design-direction.md §6, §14): warm paper surface, soft hairline border,
 * gentle low shadow; reads like a prayer card / journal note, not a social-media row.
 * The poster's name (or "Anonymous") is quiet, understated metadata; the prayer count is
 * framed as encouragement, never a score. Email never appears here (the model has none).
 *
 * Layout note (Phase H.4): the card body (category, name, prayer text) is one Pressable
 * that opens the detail screen, and the footer holds the prayer count plus a lightweight
 * "Pray" action. The body and the Pray action are SIBLING pressables inside a plain View
 * (not nested), so each is an independent touch + accessibility target: tapping the body
 * opens detail, tapping "Pray" only records the prayer and never navigates.
 *
 * "Hide requests from this account" (account-level user-blocking): an optional small overflow
 * button in the header, shown ONLY when `onHide` is supplied (never on the viewer's own request).
 * It is a single-action affordance, not a multi-item menu, so its accessible label IS the required
 * menu-action copy; tapping it goes straight to the confirmation the parent screen owns.
 */
function PrayerCardComponent({
  prayer,
  onPress,
  onPray,
  onHide,
  prayed = false,
}: {
  prayer: PrayerRequest;
  /**
   * Open the full prayer detail screen. Receives the request id so the parent can pass ONE stable
   * callback for every card (instead of a fresh per-item closure), which keeps `React.memo` below
   * effective: unchanged cards keep identical props and skip re-rendering when the feed updates.
   */
  onPress: (id: string) => void;
  /**
   * Record an "I prayed for this" interaction directly from the card. Receives the request id, for
   * the same stable-callback reason as `onPress`. Omitted when the action does not apply (e.g. the
   * viewer's own request), in which case no CTA is shown unless the request is already prayed for.
   */
  onPray?: (id: string) => void;
  /**
   * "Hide requests from this account", scoped to this request's author. Receives the request id,
   * for the same stable-callback reason as `onPress`/`onPray`; the parent resolves the id to an
   * author. Omitted for the viewer's own request, which hides the affordance entirely.
   */
  onHide?: (id: string) => void;
  /** Whether the current user has prayed for this request (lightweight feed indicator). */
  prayed?: boolean;
}) {
  useAppTheme();
  // Display name is derived from the anonymity flag, so an anonymous post can never
  // reveal a real name even if cached data were inconsistent.
  const shownName = prayer.isAnonymous ? 'Anonymous' : prayer.displayName;

  // The Pray CTA has three modes: already prayed (a quiet static badge), prayable (an
  // interactive button), or absent (own request, where praying does not apply).
  const showInteractivePray = !prayed && Boolean(onPray);

  return (
    <View style={styles.card}>
      {onHide ? (
        // A SIBLING pressable to the card-body Pressable below (not nested), so it is an
        // independent touch + accessibility target that never triggers "open detail".
        <Pressable
          onPress={() => onHide(prayer.id)}
          accessibilityRole="button"
          accessibilityLabel={HIDE_ACCOUNT_ACTION_LABEL}
          accessibilityHint="Stops showing prayer requests from this account"
          hitSlop={8}
          style={({ pressed }) => [styles.hideButton, pressed && styles.pressed]}
        >
          <FontAwesome5 name="ellipsis-h" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}

      <Pressable
        onPress={() => onPress(prayer.id)}
        accessibilityRole="button"
        accessibilityLabel={`${PRAYER_CATEGORY_LABELS[prayer.category]} prayer request from ${shownName}.`}
        accessibilityHint="Opens the full prayer request"
        style={({ pressed }) => [styles.cardBody, pressed && styles.pressed]}
      >
        <View style={[styles.header, onHide && styles.headerWithHideButton]}>
          <CategoryTag category={prayer.category} />
          <Text style={styles.date}>{formatShortDate(prayer.createdAt)}</Text>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {shownName}
        </Text>

        <Text style={styles.bodyText}>{truncate(prayer.body, 200)}</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.count}>{formatPrayerCount(prayer.prayerCount)}</Text>

        {prayed ? (
          <View
            style={styles.prayedBadge}
            accessible
            accessibilityRole="text"
            accessibilityLabel="You prayed for this request"
          >
            <Text style={styles.ctaEmoji} allowFontScaling={false}>
              🙏
            </Text>
            <Text style={styles.prayedText} maxFontSizeMultiplier={1.4} numberOfLines={1}>
              Prayed
            </Text>
          </View>
        ) : showInteractivePray ? (
          <Pressable
            onPress={() => onPray?.(prayer.id)}
            accessibilityRole="button"
            accessibilityLabel="Pray for this request"
            accessibilityHint="Marks that you prayed for this request"
            hitSlop={8}
            style={({ pressed }) => [styles.prayButton, pressed && styles.prayButtonPressed]}
          >
            <Text style={styles.ctaEmoji} allowFontScaling={false}>
              🙏
            </Text>
            <Text style={styles.prayText} maxFontSizeMultiplier={1.4} numberOfLines={1}>
              Pray
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const PrayerCard = memo(PrayerCardComponent);

const styles = createThemedStyles(() => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    // Gentle, low shadow — paper resting on paper, not a glossy elevated card.
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  // The detail-opening tap area (category, name, prayer text) stacked with gentle spacing.
  cardBody: {
    gap: spacing.sm,
  },
  // "Hide requests from this account" overflow button. Absolutely positioned in the card's top
  // right corner, sized well under the touch-target minimum on its own, but reaches 44x44+ via
  // hitSlop, matching the pattern used for other lightweight icon-only affordances in this app.
  hideButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  // Reserves room so the date never sits under the absolutely-positioned hide button.
  headerWithHideButton: {
    paddingRight: 36,
  },
  name: {
    ...typography.muted,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },
  date: {
    ...typography.muted,
  },
  bodyText: {
    ...typography.body,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  count: {
    ...typography.muted,
    color: colors.gold,
    flexShrink: 1,
  },
  // Interactive "Pray" affordance: a quiet outlined pill, not a glossy social button.
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  prayButtonPressed: {
    opacity: 0.9,
    backgroundColor: colors.accent,
  },
  prayText: {
    ...typography.muted,
    fontWeight: '600',
    color: colors.primary,
    flexShrink: 1,
  },
  // Folded-hands emoji used on the Pray / Prayed affordances. A fixed, modest size keeps it
  // intentional and in line with the label, never oversized; accessibility comes from the
  // surrounding control's label, so the glyph itself is not separately announced.
  ctaEmoji: {
    fontSize: 15,
  },
  // Already-prayed: a calm parchment-tinted badge with a gold icon, marking it as done.
  prayedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.accent,
  },
  prayedText: {
    ...typography.muted,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },
} as const));

export default PrayerCard;
