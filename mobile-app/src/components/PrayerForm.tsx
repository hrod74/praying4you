import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PrayerCategory } from '../models/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { PRAYER_BODY_MAX, validatePrayerBody } from '../utils/validation';
import { Button } from './Button';
import { CategorySelect } from './CategorySelect';
import { TextField } from './TextField';

/**
 * PrayerForm — the shared compose form for a prayer request (Phase H.1).
 *
 * Used by both the "Share a prayer request" (create) screen and the owner "Edit request"
 * screen, so the body/category/named-or-anonymous fields, validation, character counter,
 * and privacy note live in one place rather than being duplicated. The parent owns
 * navigation and confirmation feedback; this component owns only the form state and
 * validation. Local/mock only — no backend.
 */

export interface PrayerFormValues {
  body: string;
  category: PrayerCategory;
  isAnonymous: boolean;
}

export function PrayerForm({
  heading,
  subtitle,
  submitLabel,
  ownerDisplayName,
  initialValues,
  onSubmit,
}: {
  heading: string;
  subtitle: string;
  submitLabel: string;
  /** The owner's display name, shown in the "Post with my name" choice. */
  ownerDisplayName: string;
  /** Pre-fill values (edit mode). Defaults to an empty, non-anonymous request. */
  initialValues?: PrayerFormValues;
  /** Called with the validated values. May reject; the form re-enables on rejection. */
  onSubmit: (values: PrayerFormValues) => Promise<void>;
}) {
  const [body, setBody] = useState(initialValues?.body ?? '');
  const [category, setCategory] = useState<PrayerCategory>(initialValues?.category ?? 'other');
  const [isAnonymous, setIsAnonymous] = useState(initialValues?.isAnonymous ?? false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const bodyError = submitted ? validatePrayerBody(body) : null;
  const canSubmit = body.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (validatePrayerBody(body)) return;
    setSaving(true);
    try {
      await onSubmit({ body, category, isAnonymous });
      // On success the parent navigates away (this form unmounts), so we leave it disabled.
    } catch {
      // The parent surfaces the error; re-enable the form so the user can try again.
      setSaving(false);
    }
  };

  return (
    <>
      <View style={styles.intro}>
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <TextField
        label="Your prayer request"
        value={body}
        onChangeText={setBody}
        placeholder="What would you like prayer for?"
        helperText={`${body.length}/${PRAYER_BODY_MAX}`}
        errorText={bodyError}
        multiline
        numberOfLines={6}
        maxLength={PRAYER_BODY_MAX}
        style={styles.bodyInput}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <CategorySelect value={category} onChange={setCategory} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Who can see your name?</Text>

        <Pressable
          onPress={() => setIsAnonymous(false)}
          accessibilityRole="radio"
          accessibilityState={{ selected: !isAnonymous }}
          style={[styles.choice, !isAnonymous && styles.choiceSelected]}
        >
          <Text style={styles.choiceTitle}>Post with my name</Text>
          <Text style={styles.choiceSubtitle}>Shown publicly as “{ownerDisplayName}”.</Text>
        </Pressable>

        <Pressable
          onPress={() => setIsAnonymous(true)}
          accessibilityRole="radio"
          accessibilityState={{ selected: isAnonymous }}
          style={[styles.choice, isAnonymous && styles.choiceSelected]}
        >
          <Text style={styles.choiceTitle}>Post as Anonymous</Text>
          <Text style={styles.choiceSubtitle}>
            Your name won't be shown. You're still the private owner of this request.
          </Text>
        </Pressable>
      </View>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Your email is never shown on prayer requests. Only your display name, or
          “Anonymous” if you choose.
        </Text>
      </View>

      <Button
        label={submitLabel}
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityHint="Saves your prayer request"
      />
    </>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: spacing.sm,
  },
  heading: typography.heading,
  subtitle: typography.muted,
  bodyInput: {
    minHeight: 140,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  choice: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  choiceTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  choiceSubtitle: typography.muted,
  privacyNote: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  privacyText: {
    ...typography.muted,
    color: colors.text,
  },
});

export default PrayerForm;
