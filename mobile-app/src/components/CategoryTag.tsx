import { StyleSheet, Text, View } from 'react-native';

import { PRAYER_CATEGORY_LABELS, type PrayerCategory } from '../models/types';
import { useAppTheme } from '../context/ThemeContext';
import { colors, createThemedStyles, radius, spacing } from '../theme/theme';

/**
 * CategoryTag — a small, understated chip showing a prayer's category.
 *
 * Kept quiet per design-direction.md: a soft parchment-tinted pill with muted text, not a
 * loud colored badge. Used on feed cards and the detail screen to help users frame and
 * scan requests.
 */
export function CategoryTag({ category }: { category: PrayerCategory }) {
  useAppTheme();
  return (
    <View style={styles.tag}>
      <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={1.4}>
        {PRAYER_CATEGORY_LABELS[category]}
      </Text>
    </View>
  );
}

const styles = createThemedStyles(() => ({
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.text,
  },
} as const));

export default CategoryTag;
