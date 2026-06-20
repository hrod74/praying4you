import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing, typography } from '../src/theme/theme';

/**
 * Welcome / entry screen.
 *
 * Phase B: the signed-out entry point. A signed-in user is redirected straight into the
 * app. Otherwise it offers a calm introduction and two clear paths: create an account,
 * or sign in to an existing one.
 *
 * Alpha polish: a soft sunrise rising over a gentle horizon sits above the title, so the
 * first screen feels warm and hopeful rather than plain. It is a single warm sun disc with
 * one soft halo, clipped at the horizon so it reads as a calm dawn (not a target/bullseye).
 * It is built from plain Views (no extra assets or libraries, so it stays Expo Go friendly
 * and tiny) and is hidden from screen readers as decoration.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(app)/feed" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Scrolls when larger text makes the content taller than the screen. */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          {/* Decorative sunrise. Marked non-accessible so it is skipped by screen readers. */}
          <View
            style={styles.art}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            {/* The sky clips the halo and sun at its bottom edge, so they rise over the horizon. */}
            <View style={styles.sky}>
              <View style={styles.halo} />
              <View style={styles.sun} />
            </View>
            <View style={styles.horizon} />
          </View>

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
            accessibilityHint="Create your account"
          />
          <Button
            label="I already have an account"
            variant="secondary"
            onPress={() => router.push('/(auth)/sign-in')}
            accessibilityHint="Sign in to your existing account"
            style={styles.secondaryButton}
          />
          <Text style={styles.footnote}>A quiet place to carry one another in prayer.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
  },
  // The decorative sunrise sits centered above the title, with room to breathe beneath it.
  art: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  // Fixed-width stage; `overflow: hidden` cuts the halo and sun at the bottom so they "rise".
  sky: {
    width: 240,
    height: 96,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  // A single soft glow behind the sun (one halo, not concentric rings) for gentle warmth.
  halo: {
    position: 'absolute',
    left: 10,
    bottom: -110,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(196, 156, 74, 0.12)',
  },
  // The sun; its lower half is clipped by the sky, leaving a warm dome resting on the horizon.
  sun: {
    width: 104,
    height: 104,
    borderRadius: 52,
    marginBottom: -52,
    backgroundColor: 'rgba(208, 162, 86, 0.95)',
  },
  // A soft warm horizon line, flush with the clipped sun, suggesting dawn without literal scenery.
  horizon: {
    width: 232,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(156, 122, 46, 0.30)',
  },
  title: { ...typography.title, textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center' },
  supporting: {
    ...typography.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  // Pulled away from the supporting text so the primary CTA has clear breathing room.
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  // A slightly more defined outline (calm blue) so the secondary action stays easy to see.
  secondaryButton: {
    borderColor: 'rgba(59, 70, 99, 0.35)',
  },
  // Given its own space so the closing line feels intentional, not crowded under the buttons.
  footnote: {
    ...typography.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
