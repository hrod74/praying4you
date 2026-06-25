import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PRAYER_CATEGORIES,
  PRAYER_CATEGORY_LABELS,
  type PrayerCategory,
} from '../models/types';
import {
  CATEGORY_ALL,
  isFeedCustomized,
  isFeedFiltered,
  type FeedCategory,
  type FeedControls as FeedControlsState,
  type FeedSort,
} from '../feed/feedQuery';
import { colors, radius, spacing, typography } from '../theme/theme';

/**
 * FeedControls — a compact, calm sort + filter bar shown above the prayer feed.
 *
 * Design intent: this stays a quiet prayer-journal surface, not an enterprise dashboard. Controls
 * are the same soft parchment pills used elsewhere (see CategorySelect), grouped into a short Sort
 * row, two scope toggles, and a horizontally scrollable category row. A subtle status line plus a
 * single Reset action appears only once something is changed, so the default feed shows almost no
 * chrome. Copy avoids em dashes by design. All controls are 44pt tall touch targets with
 * accessibility roles/labels.
 *
 * It DERIVES nothing about the data: it only reports control changes upward. The Feed screen owns
 * the control state and applies it to the list, so this component re-renders only when the controls
 * (or the small result counts) change, never per prayer card.
 */

const SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'mostPrayed', label: 'Most prayed' },
];

function Chip({
  label,
  selected,
  onPress,
  role,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  role: 'radio' | 'button';
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={6}
      style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
    >
      <Text
        style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextUnselected]}
        numberOfLines={1}
        maxFontSizeMultiplier={1.4}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FeedControlsComponent({
  controls,
  onChange,
  onReset,
  resultCount,
}: {
  controls: FeedControlsState;
  /** Report a new control state (sort or filters). The Feed screen owns and applies it. */
  onChange: (next: FeedControlsState) => void;
  /** Restore the calm default feed (newest first, no filters). */
  onReset: () => void;
  /** How many requests the current controls surface (for the calm status line). */
  resultCount: number;
}) {
  const customized = isFeedCustomized(controls);
  const filtered = isFeedFiltered(controls);

  const setSort = (sort: FeedSort) => onChange({ ...controls, sort });
  const setCategory = (category: FeedCategory) => onChange({ ...controls, category });
  const toggleUnprayed = () => onChange({ ...controls, onlyUnprayed: !controls.onlyUnprayed });
  const toggleMine = () => onChange({ ...controls, onlyMine: !controls.onlyMine });

  return (
    <View style={styles.container}>
      {/* Sort: single-select segment. */}
      <View style={styles.group} accessibilityRole="radiogroup">
        <Text style={styles.groupLabel}>Sort</Text>
        <View style={styles.row}>
          {SORT_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={controls.sort === option.value}
              onPress={() => setSort(option.value)}
              role="radio"
            />
          ))}
        </View>
      </View>

      {/* Scope toggles: independent on/off filters. */}
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Show</Text>
        <View style={styles.row}>
          <Chip
            label="To pray for"
            selected={controls.onlyUnprayed}
            onPress={toggleUnprayed}
            role="button"
            accessibilityLabel="Show only requests you have not prayed for"
          />
          <Chip
            label="My requests"
            selected={controls.onlyMine}
            onPress={toggleMine}
            role="button"
            accessibilityLabel="Show only your own requests"
          />
        </View>
      </View>

      {/* Category: single-select, horizontally scrollable so the row stays one calm line. */}
      <View style={styles.group} accessibilityRole="radiogroup">
        <Text style={styles.groupLabel}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          <Chip
            label="All"
            selected={controls.category === CATEGORY_ALL}
            onPress={() => setCategory(CATEGORY_ALL)}
            role="radio"
            accessibilityLabel="All categories"
          />
          {PRAYER_CATEGORIES.map((key: PrayerCategory) => (
            <Chip
              key={key}
              label={PRAYER_CATEGORY_LABELS[key]}
              selected={controls.category === key}
              onPress={() => setCategory(key)}
              role="radio"
            />
          ))}
        </ScrollView>
      </View>

      {/* Status + reset: only present once the feed is customized, so the default stays quiet. */}
      {customized ? (
        <View style={styles.statusRow}>
          <Text style={styles.statusText} numberOfLines={1}>
            {filtered
              ? `Filters on. ${resultCount} ${resultCount === 1 ? 'request' : 'requests'} shown.`
              : 'Sorted view.'}
          </Text>
          <Pressable
            onPress={onReset}
            accessibilityRole="button"
            accessibilityLabel="Reset filters and sorting"
            hitSlop={8}
            style={({ pressed }) => [styles.resetButton, pressed && styles.resetPressed]}
          >
            <Text style={styles.resetText} maxFontSizeMultiplier={1.4}>
              Reset
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export const FeedControls = memo(FeedControlsComponent);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    ...typography.muted,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  chip: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
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
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.primaryText,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statusText: {
    ...typography.muted,
    color: colors.gold,
    flexShrink: 1,
  },
  resetButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  resetPressed: {
    opacity: 0.9,
    backgroundColor: colors.accent,
  },
  resetText: {
    ...typography.muted,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default FeedControls;
