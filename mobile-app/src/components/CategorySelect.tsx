import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  PRAYER_CATEGORIES,
  PRAYER_CATEGORY_LABELS,
  type PrayerCategory,
} from '../models/types';
import { useAppTheme } from '../context/ThemeContext';
import { colors, createThemedStyles, radius, spacing } from '../theme/theme';

/**
 * CategorySelect — a quiet set of selectable category chips for the submit form.
 *
 * Understated by design (see design-direction.md): soft parchment pills, with the
 * selected one gently emphasized in the navy primary tone — not a loud, colorful badge
 * row. Single-select.
 */
export function CategorySelect({
  value,
  onChange,
}: {
  value: PrayerCategory;
  onChange: (category: PrayerCategory) => void;
}) {
  useAppTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {PRAYER_CATEGORIES.map((key) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={PRAYER_CATEGORY_LABELS[key]}
            style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
          >
            <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
              {PRAYER_CATEGORY_LABELS[key]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = createThemedStyles(() => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipUnselected: {
    backgroundColor: colors.accent,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelUnselected: {
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.primaryText,
  },
} as const));

export default CategorySelect;
