import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { useFeedback } from '../../src/context/FeedbackContext';
import { colors, spacing, typography } from '../../src/theme/theme';
import { validateEmail } from '../../src/utils/validation';

/**
 * Sign in.
 *
 * Two modes behind one screen:
 * - Firebase mode (configured): a real email + password sign-in (by the book). Errors arrive as
 *   calm, safe copy from the auth layer; raw Firebase detail is never shown.
 * - Local mode (no Firebase config): the original simulated "Continue as <name>" restore of the
 *   single on-device profile (no password, no server).
 */
export default function SignInScreen() {
  const router = useRouter();
  const { profile, signIn, requiresPassword, sendPasswordReset } = useAuth();
  const { showSuccess, showError } = useFeedback();

  // ----- Firebase mode: email + password -----
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const emailError = submitted ? validateEmail(email) : null;
  const canSignIn = email.trim().length > 0 && password.length > 0 && !signingIn;

  const handleFirebaseSignIn = async () => {
    setSubmitted(true);
    if (validateEmail(email) || password.length === 0) return;
    setSigningIn(true);
    try {
      const ok = await signIn({ email, password });
      if (ok) {
        showSuccess('You’re signed in.');
        router.replace('/(app)/feed');
      }
    } catch (e) {
      setSigningIn(false);
      showError(
        e instanceof Error && e.message
          ? e.message
          : 'We could not sign you in. Please try again.',
      );
    }
  };

  const handleForgotPassword = async () => {
    if (validateEmail(email)) {
      setSubmitted(true);
      showError('Enter your email above, then tap reset.');
      return;
    }
    try {
      await sendPasswordReset(email);
      showSuccess('If that email has an account, a reset link is on its way.');
    } catch {
      // Keep messaging neutral so we never reveal whether an email exists.
      showSuccess('If that email has an account, a reset link is on its way.');
    }
  };

  if (requiresPassword) {
    return (
      <Screen scroll>
        <View style={styles.block}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.muted}>Sign in with your email and password.</Text>
        </View>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          helperText="Private. Never shown on prayer requests."
          errorText={emailError}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <TextField
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        <View style={styles.actions}>
          <Button
            label="Sign in"
            onPress={handleFirebaseSignIn}
            disabled={!canSignIn}
            accessibilityHint="Signs you in with your email and password"
          />
          <Pressable
            onPress={handleForgotPassword}
            accessibilityRole="button"
            accessibilityLabel="Forgot password? Send a reset email"
            hitSlop={8}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>Forgot password? Send a reset email</Text>
          </Pressable>
          <Button
            label="Create a profile"
            variant="secondary"
            onPress={() => router.replace('/(auth)/create-profile')}
            accessibilityHint="Create a new account"
          />
        </View>
      </Screen>
    );
  }

  // ----- Local mode: simulated restore of the single on-device profile -----
  const handleContinue = async () => {
    const ok = await signIn();
    if (ok) {
      showSuccess('You’re signed in.');
      router.replace('/(app)/feed');
    }
  };

  if (!profile) {
    return (
      <Screen scroll>
        <View style={styles.block}>
          <Text style={styles.heading}>No profile yet</Text>
          <Text style={styles.muted}>
            There's no local profile on this device. Create one to get started — it only
            takes a name and email.
          </Text>
        </View>
        <Button
          label="Create a profile"
          onPress={() => router.replace('/(auth)/create-profile')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.block}>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.muted}>
          You're signing in as <Text style={styles.name}>{profile.displayName}</Text> on
          this device.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label={`Continue as ${profile.displayName}`}
          onPress={handleContinue}
          accessibilityHint="Restores your signed-in session"
        />
        <Button
          label="Use a different profile"
          variant="secondary"
          onPress={() => router.replace('/(auth)/create-profile')}
          accessibilityHint="Create a new local profile"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  heading: typography.heading,
  muted: typography.muted,
  name: {
    ...typography.body,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.md,
  },
  linkRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.muted,
    color: colors.primary,
    fontWeight: '600',
  },
});
