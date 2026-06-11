import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../src/components/Button';
import { CategorySelect } from '../../../src/components/CategorySelect';
import { Screen } from '../../../src/components/Screen';
import { TextField } from '../../../src/components/TextField';
import { useAuth } from '../../../src/context/AuthContext';
import { usePrayers } from '../../../src/context/PrayerContext';
import type { PrayerCategory } from '../../../src/models/types';
import { colors, radius, spacing, typography } from '../../../src/theme/theme';
import { PRAYER_BODY_MAX, validatePrayerBody } from '../../../src/utils/validation';

/**
 * Submit a prayer request (Phase D, write path — local/mock only).
 *
 * A signed-in user composes a request (text + category + named/anonymous choice). On
 * submit it is added to local state via PrayerContext and the user is taken to the new
 * request's detail screen; it also appears at the top of the feed. The owner (the local
 * profile) is always retained privately; email is never shown. Calm, respectful, and
 * private per design-direction.md.
 */
export default function SubmitPrayerScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { addPrayer } = usePrayers();

  const [body, setBody] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const bodyError = submitted ? validatePrayerBody(body) : null;
  const canSubmit = body.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (validatePrayerBody(body) || !profile) return;
    setSaving(true);
    const newId = await addPrayer({
      userId: profile.id,
      displayName: profile.displayName,
      isAnonymous,
      body,
      category,
    });
    router.replace(`/(app)/feed/${newId}`);
  };

  return (
    <Screen scroll>
      <View style={styles.intro}>
        <Text style={styles.heading}>Share a prayer request</Text>
        <Text style={styles.subtitle}>
          Write what you're carrying. Others in the community will lift it up in prayer.
        </Text>
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
          <Text style={styles.choiceSubtitle}>
            Shown publicly as “{profile?.displayName ?? 'your name'}”.
          </Text>
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
          🔒 Your email is never shown on prayer requests — only your display name, or
          “Anonymous” if you choose.
        </Text>
      </View>

      <Button
        label="Share request"
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityHint="Adds your prayer request and opens it"
      />
    </Screen>
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
