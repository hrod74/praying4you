import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/theme';

/**
 * Main app tab shell (shown only to a signed-in user).
 *
 * Phase B: gated on the simulated session — a signed-out user is redirected to the
 * welcome screen and cannot reach the tabs. Feed is itself a stack (feed/index →
 * feed/[id]); the feed/verse/detail content remains Phase A placeholders until Phase C+.
 */
export default function AppTabsLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="feed" options={{ title: 'Feed', headerShown: false }} />
      <Tabs.Screen name="verse" options={{ title: 'Verse' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
