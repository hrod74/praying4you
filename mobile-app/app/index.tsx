import { FontAwesome5 } from '@expo/vector-icons';
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
 * Alpha polish: a small, warm open-hands illustration sits above the title, so the first
 * screen feels like care and prayer rather than plain. It is open cupped hands (a vector
 * glyph from the icon set the tab bar already uses, so it is lightweight and never clips)
 * in a warm gold tone, with a small soft glow held just above them. It lives in its own
 * centered box with room beneath it, and is hidden from screen readers as decoration.
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
          {/* Decorative open hands with a small warm glow. Hidden from screen readers. */}
          <View
            style={styles.art}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            {/* A small soft glow held just above the open hands. */}
            <View style={styles.glowHalo}>
              <View style={styles.glowCore} />
            </View>
            <FontAwesome5 name="hands" size={66} color={colors.gold} />
          </View>

          <Text style={styles.title}>Prayer Table</Text>
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
  // The illustration sits centered in its own box above the title, with room to breathe beneath
  // it so it never touches the title. Nothing here clips: the hands are a fully drawn vector glyph.
  art: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.xs,
  },
  // A small, soft warm glow (gentle halo) held just above the hands; sized to feel like light,
  // not a target. The small gap below separates it from the hands.
  glowHalo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(208, 162, 86, 0.18)',
  },
  // A brighter warm core inside the halo, so the glow reads as a small light rather than a ring.
  glowCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(208, 162, 86, 0.92)',
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
