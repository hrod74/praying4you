import { StyleSheet, Text, View } from 'react-native';

import { PRAYER_CATEGORY_LABELS, type PrayerCategory } from '../models/types';
import { colors, radius, spacing } from '../theme/theme';

/**
 * CategoryTag — a small, understated chip showing a prayer's category.
 *
 * Kept quiet per design-direction.md: a soft parchment-tinted pill with muted text, not a
 * loud colored badge. Used on feed cards and the detail screen to help users frame and
 * scan requests.
 */
export function CategoryTag({ category }: { category: PrayerCategory }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.label} numberOfLines={1}>
        {PRAYER_CATEGORY_LABELS[category]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
});

export default CategoryTag;
