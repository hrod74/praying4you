import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { colors, spacing, typography } from '../src/theme/theme';

/**
 * Root layout.
 *
 * Phase B: wraps the app in AuthProvider and gates navigation on the simulated session.
 * While the persisted profile/session is loading we show a calm splash to avoid a
 * flash of the wrong screen. Actual signed-in vs. signed-out routing is enforced by the
 * group layouts ((auth) and (app)) and the welcome screen via <Redirect>.
 */
function RootNavigator() {
  const { isHydrating } = useAuth();

  if (isHydrating) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>Praying For You</Text>
        <ActivityIndicator color={colors.primary} />
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
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  splashTitle: typography.title,
});
