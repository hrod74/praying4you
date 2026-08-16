import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { PolicyLinks, TERMS_URL } from '../../src/components/PolicyLinks';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { useFeedback } from '../../src/context/FeedbackContext';
import { colors, spacing, typography } from '../../src/theme/theme';
import { evaluateDisplayNameSubmission } from '../../src/utils/displayNameSubmissionGate';
import {
  DISPLAY_NAME_MAX,
  PASSWORD_MIN,
  validateDisplayName,
  validateEmail,
  validatePassword,
} from '../../src/utils/validation';

/**
 * Create local profile (display name + email).
 *
 * Phase B: collects a display name (shown publicly) and an email (kept private). On
 * submit it creates the local profile and enters the app. No backend, no password;
 * this is a simulated local profile only.
 *
 * Keyboard behavior (Phase H.2): the profile is created only by an intentional tap on the
 * "Create profile" button. The keyboard "next" key on the name field moves focus to email;
 * the email "done" key only dismisses the keyboard (it does not submit the form), so a
 * sensitive account is never created by an accidental return tap.
 */
export default function CreateProfileScreen() {
  const router = useRouter();
  const { createProfile, requiresPassword } = useAuth();
  const { showSuccess, showError } = useFeedback();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  // Set only when the content filter (not ordinary validation) rejected the current display
  // name. Cleared as soon as the user edits the field, so stale feedback never lingers.
  const [nameFilterError, setNameFilterError] = useState<string | null>(null);

  // Validation errors are only surfaced after the first submit attempt, then update live.
  const nameError = submitted ? validateDisplayName(displayName) : null;
  const emailError = submitted ? validateEmail(email) : null;
  // A password is only collected (and required) when Firebase Auth is the active mode.
  const passwordError = submitted && requiresPassword ? validatePassword(password) : null;
  const canSubmit =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    (!requiresPassword || password.length > 0) &&
    acceptedTerms &&
    !saving;

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (nameFilterError) setNameFilterError(null);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (
      validateDisplayName(displayName) ||
      validateEmail(email) ||
      (requiresPassword && validatePassword(password))
    ) {
      return;
    }
    // Only after all ordinary validation has passed does the content filter run, and only on the
    // public display name; this happens before any Firebase Auth or local persistence call below.
    const nameGate = evaluateDisplayNameSubmission(displayName);
    if (nameGate.status !== 'ready') {
      setNameFilterError(nameGate.message);
      return;
    }
    setNameFilterError(null);
    setSaving(true);
    try {
      await createProfile({
        displayName,
        email,
        password: requiresPassword ? password : undefined,
        acceptedTerms,
      });
      showSuccess('Profile created.');
      router.replace('/(app)/feed');
    } catch (e) {
      setSaving(false);
      // Safe, mapped copy from the auth layer (e.g. duplicate email); never raw Firebase detail.
      showError(
        e instanceof Error && e.message
          ? e.message
          : 'We could not create your profile. Please try again.',
      );
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
        onChangeText={handleDisplayNameChange}
        placeholder="e.g. Jordan"
        helperText={`Shown publicly on your prayer requests. Up to ${DISPLAY_NAME_MAX} characters.`}
        errorText={nameError ?? nameFilterError}
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
        helperText={
          requiresPassword
            ? 'Private. Used to sign in, and never shown on prayer requests.'
            : 'Private. Kept on your device and never shown publicly.'
        }
        errorText={emailError}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType={requiresPassword ? 'next' : 'done'}
        submitBehavior={requiresPassword ? 'submit' : 'blurAndSubmit'}
        onSubmitEditing={() =>
          requiresPassword ? passwordRef.current?.focus() : Keyboard.dismiss()
        }
      />

      {requiresPassword ? (
        <TextField
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          helperText={`Choose a password of at least ${PASSWORD_MIN} characters. Kept private by Firebase.`}
          errorText={passwordError}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      ) : null}

      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Your email stays private. Prayer requests only ever show your display name, or
          "Anonymous" if you choose.
        </Text>
      </View>

      <View style={styles.betaNotice}>
        <Text style={styles.betaTitle}>Controlled beta eligibility</Text>
        <Text style={styles.privacyText}>
          This initial controlled beta is for invited testers who are 18 or older. This is a
          temporary beta requirement, not the app's permanent audience positioning.
        </Text>
        <PolicyLinks />
      </View>

      <Pressable
        onPress={() => setAcceptedTerms((accepted) => !accepted)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptedTerms }}
        accessibilityLabel="I agree to the Terms of Use and community rules"
        accessibilityHint="Required to create your account"
        style={styles.termsRow}
      >
        <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
          <Text style={styles.checkmark}>{acceptedTerms ? '✓' : ''}</Text>
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
          .
        </Text>
      </Pressable>

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
  betaNotice: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  betaTitle: {
    ...typography.body,
    fontWeight: '600',
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
  },
  checkboxChecked: { backgroundColor: colors.primary },
  checkmark: { color: colors.primaryText, fontWeight: '700' },
  termsText: { ...typography.muted, color: colors.text, flex: 1 },
  inlineLink: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
