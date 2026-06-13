import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { useFeedback } from '../../src/context/FeedbackContext';
import { colors, spacing, typography } from '../../src/theme/theme';
import {
  DISPLAY_NAME_MAX,
  validateDisplayName,
  validateEmail,
} from '../../src/utils/validation';

/**
 * Create local profile (display name + email).
 *
 * Phase B: collects a display name (shown publicly) and an email (kept private). On
 * submit it creates the local profile and enters the app. No backend, no password —
 * this is a simulated local profile only.
 *
 * Keyboard behavior (Phase H.2): the profile is created only by an intentional tap on the
 * "Create profile" button. The keyboard "next" key on the name field moves focus to email;
 * the email "done" key only dismisses the keyboard (it does not submit the form), so a
 * sensitive account is never created by an accidental return tap.
 */
export default function CreateProfileScreen() {
  const router = useRouter();
  const { createProfile } = useAuth();
  const { showSuccess, showError } = useFeedback();

  const emailRef = useRef<TextInput>(null);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Validation errors are only surfaced after the first submit attempt, then update live.
  const nameError = submitted ? validateDisplayName(displayName) : null;
  const emailError = submitted ? validateEmail(email) : null;
  const canSubmit = displayName.trim().length > 0 && email.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (validateDisplayName(displayName) || validateEmail(email)) {
      return;
    }
    setSaving(true);
    try {
      await createProfile({ displayName, email });
      showSuccess('Profile created.');
      router.replace('/(app)/feed');
    } catch {
      setSaving(false);
      showError('We could not create your profile. Please try again.');
    }
  };

  return (
    <Screen scroll>
      <View style={styles.intro}>
        <Text style={styles.heading}>Create your profile</Text>
        <Text style={styles.subtitle}>
          Just a name and email to get started. You can post anonymously whenever you
          like.
        </Text>
      </View>

      <TextField
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="e.g. Jordan"
        helperText={`Shown publicly on your prayer requests. Up to ${DISPLAY_NAME_MAX} characters.`}
        errorText={nameError}
        autoCapitalize="words"
        maxLength={DISPLAY_NAME_MAX}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <TextField
        ref={emailRef}
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        helperText="Private. Kept on your device and never shown publicly."
        errorText={emailError}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Your email stays private. Prayer requests only ever show your display name, or
          "Anonymous" if you choose.
        </Text>
      </View>

      <Button
        label="Create profile"
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityHint="Saves your local profile and enters the app"
      />

      <Pressable
        onPress={() => router.push('/(auth)/sign-in')}
        accessibilityRole="button"
        accessibilityLabel="Already have a profile? Sign in"
        accessibilityHint="Goes to the sign-in screen to continue with your existing profile"
        hitSlop={8}
        style={styles.signInRow}
      >
        <Text style={styles.signInText}>Already have a profile? Sign in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: spacing.sm,
  },
  heading: typography.heading,
  subtitle: typography.muted,
  privacyNote: {
    backgroundColor: colors.accent,
    borderRadius: spacing.sm,
    padding: spacing.md,
  },
  privacyText: {
    ...typography.muted,
    color: colors.text,
  },
  signInRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signInText: {
    ...typography.muted,
    color: colors.primary,
    fontWeight: '600',
  },
});
