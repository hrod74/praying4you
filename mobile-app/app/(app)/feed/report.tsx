import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../src/components/Button';
import { Screen } from '../../../src/components/Screen';
import { TextField } from '../../../src/components/TextField';
import { useAuth } from '../../../src/context/AuthContext';
import { usePrayers } from '../../../src/context/PrayerContext';
import { useAppTheme } from '../../../src/context/ThemeContext';
import {
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  type ReportReason,
} from '../../../src/models/types';
import { ReportError } from '../../../src/services/firebase/reportErrors';
import { colors, createThemedStyles, radius, spacing, typography } from '../../../src/theme/theme';
import {
  confirmHideAccount,
  HIDE_ACCOUNT_ACTION_LABEL,
  HIDE_ACCOUNT_SUCCESS_MESSAGE,
} from '../../../src/utils/hideAccountCopy';

const NOTE_MAX = 300;

/**
 * Report a prayer request.
 *
 * Presented as a calm modal from the detail screen. The user picks a reason and may add a
 * short note; the mode-aware service submits it to private manual review (Firestore in the
 * beta, on-device storage in local fallback mode) and shows a gentle confirmation. Reporting
 * one's own request is prevented (the detail hides the entry point; this also guards).
 */
export default function ReportScreen() {
  useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { getById, reportPrayer, hideAccountForRequest } = usePrayers();

  const prayer = getById(id);

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional next action after a successful report, kept fully separate from the verified report
  // submission state above (reason/notes/saving/done/error) so this addition cannot affect it.
  const [hidingAccount, setHidingAccount] = useState(false);
  const [accountHidden, setAccountHidden] = useState(false);
  const [hideError, setHideError] = useState<string | null>(null);

  const handleHideAccount = () => {
    if (!profile || !prayer) return;
    confirmHideAccount(() => {
      void (async () => {
        setHidingAccount(true);
        setHideError(null);
        try {
          await hideAccountForRequest(prayer.id, profile.id);
          setAccountHidden(true);
        } catch (e) {
          setHideError(
            e instanceof Error && e.message
              ? e.message
              : 'We could not update this right now. Please try again.',
          );
        } finally {
          setHidingAccount(false);
        }
      })();
    });
  };

  const isOwn = Boolean(profile && prayer && prayer.userId === profile.id);

  const handleSubmit = async () => {
    if (!reason || !profile || !prayer || isOwn || saving) return;
    setError(null);
    setSaving(true);
    try {
      await reportPrayer(prayer.id, profile.id, reason, notes);
      setDone(true);
    } catch (e) {
      setSaving(false);
      // "Already reported" is a calm, expected outcome (e.g. reported in a previous session): show
      // the same gentle thank-you rather than an error.
      if (e instanceof ReportError && e.code === 'already') {
        setDone(true);
        return;
      }
      // Otherwise surface the report layer's safe copy; never a raw Firebase error.
      setError(
        e instanceof Error && e.message
          ? e.message
          : 'We could not submit your report right now. Please try again.',
      );
    }
  };

  if (done) {
    return (
      <Screen>
        <View style={styles.confirm}>
          <Text style={styles.confirmIcon}>🕊️</Text>
          <Text style={styles.confirmTitle}>Thank you for letting us know.</Text>
          <Text style={styles.confirmText}>
            We have received your report, and a person will review it. This is private and is
            not shown to the person who posted.
          </Text>
        </View>

        {/* Optional next action: hiding is separate from reporting (it does not create or change
            a report, and reporting never hides an account automatically). */}
        {accountHidden ? (
          <Text style={styles.hideDoneText}>{HIDE_ACCOUNT_SUCCESS_MESSAGE}</Text>
        ) : (
          <View style={styles.hideOptionBlock}>
            <Text style={styles.hideOptionText}>
              You can also stop seeing requests from this account.
            </Text>
            <Button
              label={hidingAccount ? 'Hiding…' : HIDE_ACCOUNT_ACTION_LABEL}
              variant="secondary"
              onPress={handleHideAccount}
              disabled={hidingAccount}
              accessibilityHint="Stops showing prayer requests from this account"
            />
            {hideError ? (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {hideError}
              </Text>
            ) : null}
          </View>
        )}

        <Button
          label="Done"
          onPress={() => {
            // Preserves the verified report-submission behavior when no account was hidden
            // (router.back(), unchanged). If the optional hide action succeeded, router.back()
            // would return to the now-hidden author's detail route, which the detail screen
            // correctly (but unhelpfully) resolves to "Prayer not found." Route to the feed
            // instead, so a successful hide never intentionally lands the user on that screen.
            if (accountHidden) {
              router.replace('/(app)/feed');
            } else {
              router.back();
            }
          }}
        />
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
          Choose why this request concerns you. Your report is private, will be reviewed by a
          person, and won't be shown to the person who posted it.
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

      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        label={saving ? 'Submitting…' : 'Submit report'}
        onPress={handleSubmit}
        disabled={!reason || saving}
        accessibilityHint="Sends your report for a person to review privately"
      />
    </Screen>
  );
}

const styles = createThemedStyles(() => ({
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
  errorText: {
    ...typography.muted,
    color: colors.danger,
  },
  hideOptionBlock: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  hideOptionText: {
    ...typography.muted,
    textAlign: 'center',
  },
  hideDoneText: {
    ...typography.muted,
    textAlign: 'center',
    paddingBottom: spacing.md,
  },
} as const));
