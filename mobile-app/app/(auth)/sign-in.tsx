import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/context/AuthContext';
import { useFeedback } from '../../src/context/FeedbackContext';
import { spacing, typography } from '../../src/theme/theme';

/**
 * Simulated sign-in.
 *
 * Phase B: there is no password or server. If a local profile already exists on the
 * device, "Continue" simply restores the signed-in state. If none exists yet, we guide
 * the user to create one. This is local-only and not real authentication.
 */
export default function SignInScreen() {
  const router = useRouter();
  const { profile, signIn } = useAuth();
  const { showSuccess } = useFeedback();

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
});
