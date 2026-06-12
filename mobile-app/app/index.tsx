import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing, typography } from '../src/theme/theme';

/**
 * Welcome / entry screen.
 *
 * Phase B: the signed-out entry point. A signed-in user is redirected straight into the
 * app. Otherwise it offers a calm introduction and two clear paths — create a profile,
 * or sign in to an existing local profile.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(app)/feed" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Text style={styles.title}>Praying For You</Text>
        <Text style={styles.subtitle}>
          Share a prayer request, or pick one up and pray for someone else.
        </Text>
        <Text style={styles.supporting}>
          A calm, supportive space. You stay in control of what you share.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Get started"
          onPress={() => router.push('/(auth)/create-profile')}
          accessibilityHint="Create your local profile"
        />
        <Button
          label="I already have a profile"
          variant="secondary"
          onPress={() => router.push('/(auth)/sign-in')}
          accessibilityHint="Sign in to your existing local profile"
        />
        <Text style={styles.footnote}>A local prototype. Your profile stays on this device.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  hero: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  title: typography.title,
  subtitle: typography.body,
  supporting: {
    ...typography.muted,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  footnote: {
    ...typography.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
