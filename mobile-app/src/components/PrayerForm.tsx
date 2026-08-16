import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PrayerCategory } from '../models/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { evaluatePrayerSubmission } from '../utils/prayerSubmissionGate';
import { PRAYER_BODY_MAX, validatePrayerBody } from '../utils/validation';
import { Button } from './Button';
import { CategorySelect } from './CategorySelect';
import { PolicyLinks, TERMS_URL } from './PolicyLinks';
import { TextField } from './TextField';

/**
 * PrayerForm, the shared compose form for a prayer request (Phase H.1).
 *
 * Used by both the "Share a prayer request" (create) screen and the owner "Edit request"
 * screen, so the body/category/named-or-anonymous fields, validation, character counter,
 * and privacy note live in one place rather than being duplicated. The parent owns
 * navigation and confirmation feedback; this component owns only the form state and
 * validation. Local/mock only, no backend.
 *
 * Submission also runs the pre-publication content filter, through the pure
 * `evaluatePrayerSubmission` gate (see `../utils/prayerSubmissionGate.ts`), before `onSubmit` is
 * ever called. Since both the create and edit screens render this one form, both are protected
 * the same way without either screen duplicating the check. See that module for the exact
 * ordering guarantee (required-field and length validation always run first).
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
  termsAccepted = true,
  onAcceptTerms,
  cancelLabel,
  onCancel,
  onSubmit,
}: {
  heading: string;
  subtitle: string;
  submitLabel: string;
  /** The owner's display name, shown in the "Post with my name" choice. */
  ownerDisplayName: string;
  /** Pre-fill values (edit mode). Defaults to an empty, non-anonymous request. */
  initialValues?: PrayerFormValues;
  /** Require an explicit Terms acknowledgment before a new request can be shared. */
  termsAccepted?: boolean;
  onAcceptTerms?: () => Promise<void>;
  cancelLabel?: string;
  onCancel?: () => void;
  /** Called with the validated values. May reject; the form re-enables on rejection. */
  onSubmit: (values: PrayerFormValues) => Promise<void>;
}) {
  const [body, setBody] = useState(initialValues?.body ?? '');
  const [category, setCategory] = useState<PrayerCategory>(initialValues?.category ?? 'other');
  const [isAnonymous, setIsAnonymous] = useState(initialValues?.isAnonymous ?? false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  // Set only when the content filter (not ordinary validation) rejected the current draft.
  // Cleared as soon as the user edits the body, so stale feedback never lingers while they revise.
  const [filterError, setFilterError] = useState<string | null>(null);

  const bodyError = submitted ? validatePrayerBody(body) : null;
  const canSubmit =
    body.trim().length > 0 && termsAccepted && !saving && !acceptingTerms;

  const handleBodyChange = (value: string) => {
    setBody(value);
    if (filterError) setFilterError(null);
  };

  const handleCancel = () => {
    setBody(initialValues?.body ?? '');
    setCategory(initialValues?.category ?? 'other');
    setIsAnonymous(initialValues?.isAnonymous ?? false);
    setSubmitted(false);
    setFilterError(null);
    onCancel?.();
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const gateResult = evaluatePrayerSubmission(body);
    if (gateResult.status === 'blockedByValidation') return;
    if (gateResult.status === 'blockedByFilter') {
      // Blocked: never call onSubmit (no Firebase or local persistence path runs), and keep the
      // user's full draft in the form so they can revise and retry. The anonymous/named choice
      // is irrelevant here; the gate only evaluates the body text either way.
      setFilterError(gateResult.message);
      return;
    }
    setFilterError(null);
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
        onChangeText={handleBodyChange}
        placeholder="What would you like prayer for?"
        helperText={`${body.length}/${PRAYER_BODY_MAX}`}
        errorText={bodyError ?? filterError}
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
          <View style={styles.choiceText}>
            <Text style={styles.choiceTitle}>Post with my name</Text>
            <Text style={styles.choiceSubtitle}>Shown publicly as “{ownerDisplayName}”.</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setIsAnonymous(true)}
          accessibilityRole="radio"
          accessibilityState={{ selected: isAnonymous }}
          style={[styles.choice, isAnonymous && styles.choiceSelected]}
        >
          <View style={styles.choiceText}>
            <Text style={styles.choiceTitle}>Post as Anonymous</Text>
            <Text style={styles.choiceSubtitle}>
              Your name won't be shown.{`\n`}You're still the private owner of this request.
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Your email is never shown on prayer requests. Only your display name, or
          “Anonymous” if you choose.
        </Text>
      </View>

      {!termsAccepted && onAcceptTerms ? (
        <View style={styles.termsBlock}>
          <Pressable
            onPress={() => {
              setAcceptingTerms(true);
              void onAcceptTerms()
                .catch(() => undefined)
                .finally(() => setAcceptingTerms(false));
            }}
            disabled={acceptingTerms}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: false, disabled: acceptingTerms }}
            accessibilityLabel="I agree to the Terms of Use and community rules"
            accessibilityHint="Required before sharing a prayer request"
            style={styles.termsRow}
          >
            <View style={styles.checkbox}>
              <Text style={styles.checkmark}>{acceptingTerms ? '…' : ''}</Text>
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text
                style={styles.inlineLink}
                accessibilityRole="link"
                onPress={(event) => {
                  event.stopPropagation();
                  void Linking.openURL(TERMS_URL);
                }}
              >
                Terms of Use
              </Text>{' '}
              and{' '}
              <Text
                style={styles.inlineLink}
                accessibilityRole="link"
                onPress={(event) => {
                  event.stopPropagation();
                  void Linking.openURL(TERMS_URL);
                }}
              >
                community rules
              </Text>
              . This one-time acceptance will be saved to my private profile.
            </Text>
          </Pressable>
          <PolicyLinks />
        </View>
      ) : null}

      <Button
        label={submitLabel}
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityHint="Saves your prayer request"
      />
      {onCancel ? (
        <Button
          label={cancelLabel ?? 'Cancel'}
          variant="secondary"
          onPress={handleCancel}
          disabled={saving}
          accessibilityHint="Clears this form and returns to the prayer feed"
        />
      ) : null}
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
  choiceText: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xs,
  },
  choiceTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  choiceSubtitle: {
    ...typography.muted,
    alignSelf: 'stretch',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  privacyNote: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  privacyText: {
    ...typography.muted,
    color: colors.text,
  },
  termsBlock: {
    gap: spacing.sm,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkmark: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  termsText: {
    ...typography.muted,
    color: colors.text,
    flex: 1,
  },
  inlineLink: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PrayerForm;
