import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../src/components/Screen';
import { getVerseOfTheDay } from '../../src/services/verseService';
import { colors, radius, scaleLineHeight, spacing, typography } from '../../src/theme/theme';
import { formatLongDate } from '../../src/utils/format';

/**
 * Verse of the day (Phase F).
 *
 * Shows a deterministic daily verse from bundled local data via `verseService` — no
 * external Bible API, no network. Reflective, calm, parchment/journal styling per
 * design-direction.md. The scripture is presented as the primary "page"; the app-written
 * reflection sits in a visually distinct, clearly-labeled block so it is never confused
 * with the verse text. Display-only — no sharing or engagement features.
 */
export default function VerseScreen() {
  // Stable for this mount; rotates by calendar day.
  const { verse, reflection } = useMemo(() => getVerseOfTheDay(), []);
  const today = useMemo(() => formatLongDate(new Date().toISOString()), []);

  return (
    <Screen scroll>
      <View style={styles.eyebrowRow}>
        <Text style={styles.eyebrow}>Verse of the day</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      {/* Scripture (the Word) — the primary parchment "page". */}
      <View style={styles.page} accessibilityLabel={`${verse.reference}. ${verse.text}`}>
        {/* Decorative quote mark: cap its scaling so it never dominates the page. */}
        <Text style={styles.quoteMark} maxFontSizeMultiplier={1.3} accessibilityElementsHidden importantForAccessibility="no">
          “
        </Text>
        <Text style={styles.verseText}>{verse.text}</Text>
        <Text style={styles.reference}>
          {verse.reference} · {verse.translation}
        </Text>
      </View>

      {/* App-written reflection — clearly distinct from scripture. */}
      <View style={styles.reflectionBlock}>
        <Text style={styles.reflectionLabel}>Reflection</Text>
        <Text style={styles.reflectionText}>{reflection}</Text>
        <Text style={styles.reflectionNote}>A gentle prompt from Praying For You.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrowRow: {
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.gold,
    fontWeight: '600',
  },
  date: typography.muted,
  page: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  quoteMark: {
    fontSize: 44,
    lineHeight: 44,
    color: colors.border,
    marginBottom: -spacing.md,
  },
  verseText: {
    ...typography.prayerBody,
    fontSize: 20,
    lineHeight: scaleLineHeight(32),
  },
  reference: {
    ...typography.muted,
    fontWeight: '600',
    color: colors.text,
  },
  reflectionBlock: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  reflectionLabel: {
    ...typography.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  reflectionText: {
    ...typography.body,
    fontStyle: 'italic',
  },
  reflectionNote: {
    ...typography.muted,
    marginTop: spacing.xs,
  },
});
