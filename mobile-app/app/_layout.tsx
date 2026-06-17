import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { FeedbackProvider } from '../src/context/FeedbackContext';
import { colors, spacing, typography } from '../src/theme/theme';

/**
 * Root layout.
 *
 * Phase B: wraps the app in AuthProvider and gates navigation on the simulated session.
 * While the persisted profile/session is loading we show a calm, branded splash to avoid a
 * flash of the wrong screen. Actual signed-in vs. signed-out routing is enforced by the
 * group layouts ((auth) and (app)) and the welcome screen via <Redirect>.
 *
 * Branding (Phase H.4b): this in-app loading screen is the part of the launch experience we
 * fully control (the native/Expo Go splash is configured in app.json with the warm parchment
 * background and folded-hands mark). It shows 🙏, the product name, and calm copy on the warm
 * theme. The emoji is decorative; the visible text carries the meaning for screen readers.
 */
function RootNavigator() {
  const { isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <View style={styles.splash}>
        {/* Decorative emoji; meaning is carried by the text below for screen readers. */}
        <Text
          style={styles.splashEmoji}
          allowFontScaling={false}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          🙏
        </Text>
        <Text style={styles.splashTitle}>Praying For You</Text>
        <Text style={styles.splashSubtitle}>Preparing your prayer space…</Text>
        <ActivityIndicator color={colors.primary} style={styles.splashSpinner} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <FeedbackProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </FeedbackProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  splashEmoji: {
    fontSize: 64,
    marginBottom: spacing.xs,
  },
  splashTitle: typography.title,
  splashSubtitle: {
    ...typography.muted,
    textAlign: 'center',
  },
  splashSpinner: {
    marginTop: spacing.md,
  },
});
