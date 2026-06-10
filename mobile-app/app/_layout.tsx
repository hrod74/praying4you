import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '../src/theme/theme';

/**
 * Root layout for the Praying 4 You prototype.
 *
 * Phase A: a plain Stack over the welcome screen plus the (auth) and (app) route
 * groups, just enough to confirm navigation works. In later phases this is where the
 * app is wrapped in the Auth and Prayer providers (src/context/) and where auth-gating
 * decides whether to show the (auth) or (app) group. No providers or gating yet.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Praying 4 You' }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
