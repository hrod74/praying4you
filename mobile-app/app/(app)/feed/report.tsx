import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../src/components/Button';
import { Screen } from '../../../src/components/Screen';
import { TextField } from '../../../src/components/TextField';
import { useAuth } from '../../../src/context/AuthContext';
import { usePrayers } from '../../../src/context/PrayerContext';
import {
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  type ReportReason,
} from '../../../src/models/types';
import { colors, radius, spacing, typography } from '../../../src/theme/theme';

const NOTE_MAX = 300;

/**
 * Report a prayer request (Phase G — local/mock only).
 *
 * Presented as a calm modal from the detail screen. The user picks a reason and may add a
 * short note; submitting records the report locally (increments reportCount, flags the
 * request) and shows a gentle confirmation. There is NO real moderation backend. Reporting
 * one's own request is prevented (the detail hides the entry point; this also guards).
 */
export default function ReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { getById, reportPrayer } = usePrayers();

  const prayer = getById(id);

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const isOwn = Boolean(profile && prayer && prayer.userId === profile.id);

  const handleSubmit = async () => {
    if (!reason || !profile || !prayer || isOwn) return;
    setSaving(true);
    await reportPrayer(prayer.id, profile.id, reason, notes);
    setDone(true);
  };

  if (done) {
    return (
      <Screen>
        <View style={styles.confirm}>
          <Text style={styles.confirmIcon}>🕊️</Text>
          <Text style={styles.confirmTitle}>Thank you for letting us know.</Text>
          <Text style={styles.confirmText}>
            This request has been flagged for review. In this prototype there is no
            moderation team yet — but in the real app, a person would take a look.
          </Text>
        </View>
        <Button label="Done" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (isOwn) {
    return (
      <Screen>
        <Text style={styles.heading}>This is your request</Text>
        <Text style={styles.intro}>You can't report your own prayer request.</Text>
        <Button label="Go back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.introBlock}>
        <Text style={styles.heading}>Report this request</Text>
        <Text style={styles.intro}>
          Thank you for helping keep this a safe, respectful space. Let us know what's
          wrong — this is private and won't be shown to the person who posted.
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Reason</Text>
        <View style={styles.reasons} accessibilityRole="radiogroup">
          {REPORT_REASONS.map((key) => {
            const selected = key === reason;
            return (
              <Pressable
                key={key}
                onPress={() => setReason(key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={REPORT_REASON_LABELS[key]}
                style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
              >
                <Text style={selected ? styles.chipLabelSelected : styles.chipLabel}>
                  {REPORT_REASON_LABELS[key]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextField
        label="Anything else? (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add a short note for the reviewer…"
        helperText={`${notes.length}/${NOTE_MAX}`}
        multiline
        numberOfLines={4}
        maxLength={NOTE_MAX}
        style={styles.noteInput}
      />

      <Button
        label="Submit report"
        onPress={handleSubmit}
        disabled={!reason || saving}
        accessibilityHint="Sends your report for this prototype"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  introBlock: {
    gap: spacing.sm,
  },
  heading: typography.heading,
  intro: typography.muted,
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  reasons: {
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
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipLabelSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  noteInput: {
    minHeight: 96,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  confirm: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  confirmIcon: {
    fontSize: 40,
  },
  confirmTitle: {
    ...typography.heading,
    textAlign: 'center',
  },
  confirmText: {
    ...typography.body,
    textAlign: 'center',
  },
});
