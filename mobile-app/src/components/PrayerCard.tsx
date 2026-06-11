import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRAYER_CATEGORY_LABELS, type PrayerRequest } from '../models/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { formatPrayerCount, formatShortDate, truncate } from '../utils/format';
import { CategoryTag } from './CategoryTag';

/**
 * PrayerCard — a single prayer request shown as a calm, journal-style card.
 *
 * Design (see design-direction.md §6, §14): warm paper surface, soft hairline border,
 * gentle low shadow; reads like a prayer card / journal note, not a social-media row.
 * The poster's name (or "Anonymous") is quiet, understated metadata; the prayer count is
 * framed as encouragement, never a score. Email never appears here (the model has none).
 */
function PrayerCardComponent({
  prayer,
  onPress,
}: {
  prayer: PrayerRequest;
  onPress: () => void;
}) {
  // Display name is derived from the anonymity flag, so an anonymous post can never
  // reveal a real name even if cached data were inconsistent.
  const shownName = prayer.isAnonymous ? 'Anonymous' : prayer.displayName;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${PRAYER_CATEGORY_LABELS[prayer.category]} prayer request from ${shownName}. ${formatPrayerCount(prayer.prayerCount)}.`}
      accessibilityHint="Opens the full prayer request"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <CategoryTag category={prayer.category} />
        <Text style={styles.date}>{formatShortDate(prayer.createdAt)}</Text>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {shownName}
      </Text>

      <Text style={styles.body}>{truncate(prayer.body, 200)}</Text>

      <Text style={styles.count}>{formatPrayerCount(prayer.prayerCount)}</Text>
    </Pressable>
  );
}

export const PrayerCard = memo(PrayerCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    // Gentle, low shadow — paper resting on paper, not a glossy elevated card.
    shadowColor: '#3A2E20',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
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
  body: {
    ...typography.body,
  },
  count: {
    ...typography.muted,
    color: colors.gold,
    marginTop: spacing.xs,
  },
});

export default PrayerCard;
