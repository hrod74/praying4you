import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';
import { PrayerProvider } from '../../src/context/PrayerContext';
import { colors } from '../../src/theme/theme';

/**
 * Main app tab shell (shown only to a signed-in user).
 *
 * Gated on the simulated session — a signed-out user is redirected to the welcome
 * screen and cannot reach the tabs. Wrapped in PrayerProvider so the Feed and Detail
 * screens share the loaded prayer list (Phase C, read path). Feed is itself a stack
 * (feed/index → feed/[id]); Verse remains a Phase A placeholder until Phase F.
 */
export default function AppTabsLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <PrayerProvider>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen name="feed" options={{ title: 'Feed', headerShown: false }} />
        <Tabs.Screen name="verse" options={{ title: 'Verse' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </PrayerProvider>
  );
}
