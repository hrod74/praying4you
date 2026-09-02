import { memo, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../context/ThemeContext';
import {
  PRAYER_CATEGORIES,
  PRAYER_CATEGORY_LABELS,
  type PrayerCategory,
} from '../models/types';
import {
  activeFilterCount,
  CATEGORY_ALL,
  DEFAULT_FEED_CONTROLS,
  feedShowOf,
  withFeedShow,
  type FeedControls as FeedControlsState,
  type FeedShow,
  type FeedSort,
} from '../feed/feedQuery';
import { colors, createThemedStyles, radius, spacing, typography } from '../theme/theme';

/**
 * FeedControls — a compact, modern sort/filter toolbar for the prayer feed.
 *
 * Design intent (Feed UI refactor): prayer cards are the priority, so when nothing is open the
 * controls take exactly ONE quiet row below the feed description: a Filters button (with an active
 * count) on the left and the current sort value on the right. Tapping either opens a calm bottom
 * sheet (RN Modal, slide up, safe-area aware) instead of permanently expanding rows of pills. The
 * category list lives inside the filter sheet and WRAPS (never a horizontally clipped pill row).
 * Active filters appear as small removable chips below the toolbar, and only when present.
 *
 * It owns no feed data: it reports control changes upward via `onChange` / `onReset`. The Feed
 * screen applies them to the list, so this re-renders only when the controls change, never per card.
 * The two underlying scope booleans (`onlyUnprayed`, `onlyMine`) are presented as one single-select
 * "Show" choice; all existing sort/filter logic is preserved unchanged (see feedQuery.ts). Copy
 * avoids em dashes; every control is a 44pt touch target with an accessibility role/label.
 */

const SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'mostPrayed', label: 'Most prayed' },
];

const SHOW_OPTIONS: { value: FeedShow; label: string }[] = [
  { value: 'all', label: 'All requests' },
  { value: 'unprayed', label: 'To pray for' },
  { value: 'mine', label: 'My requests' },
];

const sortLabel = (value: FeedSort): string =>
  SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Newest';

const showLabel = (value: FeedShow): string =>
  SHOW_OPTIONS.find((o) => o.value === value)?.label ?? 'All requests';

/** A calm bottom sheet: dim backdrop (tap to dismiss) + a parchment panel anchored to the bottom. */
function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

/** A soft selectable pill (used for Show and Category inside the filter sheet). */
function SelectChip({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
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

/** A removable active-filter chip shown below the toolbar (label plus an x). */
function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Pressable
      onPress={onRemove}
      accessibilityRole="button"
      accessibilityLabel={`Remove filter: ${label}`}
      hitSlop={6}
      style={({ pressed }) => [styles.activeChip, pressed && styles.activeChipPressed]}
    >
      <Text style={styles.activeChipText} numberOfLines={1} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
      <FontAwesome5 name="times" size={11} color={colors.primary} />
    </Pressable>
  );
}

function FeedControlsComponent({
  controls,
  onChange,
  onReset,
}: {
  controls: FeedControlsState;
  /** Report a new control state (sort or filters). The Feed screen owns and applies it. */
  onChange: (next: FeedControlsState) => void;
  /** Restore the calm default feed (Show: All requests, Category: All, Sort: Newest). */
  onReset: () => void;
}) {
  useAppTheme();
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  // The filter sheet edits a DRAFT; nothing changes the feed until Apply (Reset is the exception).
  const [draft, setDraft] = useState<FeedControlsState>(controls);

  const count = activeFilterCount(controls);
  const show = feedShowOf(controls);

  // --- Sort sheet: applies immediately on tap. ---
  const chooseSort = (sort: FeedSort) => {
    onChange({ ...controls, sort });
    setSortOpen(false);
  };

  // --- Filter sheet. ---
  const openFilters = () => {
    setDraft(controls); // start from the live state each time
    setFilterOpen(true);
  };
  const applyFilters = () => {
    onChange(draft);
    setFilterOpen(false);
  };
  const resetFilters = () => {
    // Reset returns to the calm default (Show All, Category All, Sort Newest) and closes. One tap.
    onReset();
    setFilterOpen(false);
  };

  // --- Live removable chips (operate on the committed controls, not the draft). ---
  const removeShow = () => onChange(withFeedShow(controls, 'all'));
  const removeCategory = () => onChange({ ...controls, category: CATEGORY_ALL });

  const draftShow = feedShowOf(draft);

  return (
    <View style={styles.container}>
      {/* One compact row: Filters (left) and the current sort value (right). */}
      <View style={styles.toolbar}>
        <Pressable
          onPress={openFilters}
          accessibilityRole="button"
          accessibilityLabel={count > 0 ? `Filters, ${count} active` : 'Filters'}
          accessibilityHint="Opens the filter options"
          hitSlop={4}
          style={({ pressed }) => [
            styles.toolbarButton,
            count > 0 && styles.toolbarButtonActive,
            pressed && styles.toolbarButtonPressed,
          ]}
        >
          <FontAwesome5
            name="filter"
            size={12}
            color={count > 0 ? colors.primary : colors.textMuted}
          />
          <Text
            style={[styles.toolbarText, count > 0 && styles.toolbarTextActive]}
            maxFontSizeMultiplier={1.4}
          >
            Filters
          </Text>
          {count > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText} allowFontScaling={false}>
                {count}
              </Text>
            </View>
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => setSortOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Sort by ${sortLabel(controls.sort)}`}
          accessibilityHint="Opens the sort options"
          hitSlop={4}
          style={({ pressed }) => [styles.toolbarButton, pressed && styles.toolbarButtonPressed]}
        >
          <Text style={styles.toolbarText} maxFontSizeMultiplier={1.4}>
            {sortLabel(controls.sort)}
          </Text>
          <FontAwesome5 name="chevron-down" size={11} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Active-filter chips: only present when something is filtered. */}
      {count > 0 ? (
        <View style={styles.activeRow}>
          {show !== 'all' ? <ActiveChip label={showLabel(show)} onRemove={removeShow} /> : null}
          {controls.category !== CATEGORY_ALL ? (
            <ActiveChip
              label={PRAYER_CATEGORY_LABELS[controls.category]}
              onRemove={removeCategory}
            />
          ) : null}
        </View>
      ) : null}

      {/* Sort sheet. */}
      <BottomSheet visible={sortOpen} onClose={() => setSortOpen(false)} title="Sort">
        <View accessibilityRole="radiogroup">
          {SORT_OPTIONS.map((option) => {
            const selected = controls.sort === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => chooseSort(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option.label}
                style={({ pressed }) => [styles.sheetRow, pressed && styles.sheetRowPressed]}
              >
                <Text
                  style={[styles.sheetRowText, selected && styles.sheetRowTextSelected]}
                  maxFontSizeMultiplier={1.6}
                >
                  {option.label}
                </Text>
                {selected ? <FontAwesome5 name="check" size={15} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      {/* Filter sheet (draft + Reset / Apply). */}
      <BottomSheet visible={filterOpen} onClose={() => setFilterOpen(false)} title="Filters">
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Show</Text>
          <View style={styles.wrap} accessibilityRole="radiogroup">
            {SHOW_OPTIONS.map((option) => (
              <SelectChip
                key={option.value}
                label={option.label}
                selected={draftShow === option.value}
                onPress={() => setDraft(withFeedShow(draft, option.value))}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.wrap} accessibilityRole="radiogroup">
            <SelectChip
              label="All"
              selected={draft.category === CATEGORY_ALL}
              onPress={() => setDraft({ ...draft, category: CATEGORY_ALL })}
              accessibilityLabel="All categories"
            />
            {PRAYER_CATEGORIES.map((key: PrayerCategory) => (
              <SelectChip
                key={key}
                label={PRAYER_CATEGORY_LABELS[key]}
                selected={draft.category === key}
                onPress={() => setDraft({ ...draft, category: key })}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.sheetActions}>
          <Pressable
            onPress={resetFilters}
            accessibilityRole="button"
            accessibilityLabel="Reset filters and sorting"
            style={({ pressed }) => [styles.resetButton, pressed && styles.resetPressed]}
          >
            <Text style={styles.resetText} maxFontSizeMultiplier={1.4}>
              Reset
            </Text>
          </Pressable>
          <Pressable
            onPress={applyFilters}
            accessibilityRole="button"
            accessibilityLabel="Apply filters"
            style={({ pressed }) => [styles.applyButton, pressed && styles.applyPressed]}
          >
            <Text style={styles.applyText} maxFontSizeMultiplier={1.4}>
              Apply filters
            </Text>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

export const FeedControls = memo(FeedControlsComponent);

const styles = createThemedStyles(() => ({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  // --- Toolbar (closed state) ---
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toolbarButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  toolbarButtonPressed: {
    opacity: 0.9,
  },
  toolbarText: {
    ...typography.muted,
    fontWeight: '600',
    color: colors.text,
  },
  toolbarTextActive: {
    color: colors.primary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  // --- Active filter chips ---
  activeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  activeChipPressed: {
    opacity: 0.85,
  },
  activeChipText: {
    ...typography.muted,
    fontWeight: '600',
    color: colors.primary,
    flexShrink: 1,
  },
  // --- Bottom sheet shell ---
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 38, 32, 0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    maxHeight: '85%',
    gap: spacing.md,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    ...typography.heading,
  },
  sheetScroll: {
    flexShrink: 1,
  },
  sheetScrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.muted,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  // --- Sort sheet rows ---
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingVertical: spacing.sm,
  },
  sheetRowPressed: {
    opacity: 0.7,
  },
  sheetRowText: {
    ...typography.body,
  },
  sheetRowTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  // --- Shared selectable chip ---
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
  // --- Sheet actions ---
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  resetButton: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
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
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  applyButton: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  applyPressed: {
    opacity: 0.9,
  },
  applyText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primaryText,
  },
} as const));

export default FeedControls;
