import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { useAuth } from '../src/context/AuthContext';
import { colors, radius, spacing, typography } from '../src/theme/theme';

/**
 * Welcome / entry screen.
 *
 * Phase B: the signed-out entry point. A signed-in user is redirected straight into the
 * app. Otherwise it offers a calm introduction and two clear paths: create an account,
 * or sign in to an existing one.
 *
 * Alpha polish: a soft "sunrise" glow (layered translucent gold light) sits above the
 * title to make the first screen feel warm and reverent without imagery that is busy or
 * denomination-specific. It is built from plain Views (no extra assets or libraries, so it
 * stays Expo Go friendly and tiny) and is hidden from screen readers as decoration.
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
          {/* Decorative warm sunrise glow. Marked non-accessible so it is skipped by screen readers. */}
          <View
            style={styles.art}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            <View style={styles.glowOuter}>
              <View style={styles.glowMid}>
                <View style={styles.sun} />
              </View>
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
  // The decorative sunrise sits centered above the title, sized to feel present but unhurried.
  art: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  // Concentric translucent rings read as soft light rays / warmth radiating from the sun.
  glowOuter: {
    width: 216,
    height: 216,
    borderRadius: 108,
    backgroundColor: 'rgba(156, 122, 46, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowMid: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(156, 122, 46, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(196, 156, 74, 0.95)',
  },
  // A soft warm horizon line under the glow, suggesting a gentle dawn without literal scenery.
  horizon: {
    width: 200,
    height: 1,
    marginTop: spacing.md,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
  },
  title: { ...typography.title, textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center' },
  supporting: {
    ...typography.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
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
