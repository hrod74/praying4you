import { Tabs } from 'expo-router';

import { colors } from '../../src/theme/theme';

/**
 * Main app tab shell (shown to a signed-in user in later phases).
 *
 * Phase A: a tab navigator over Feed, Verse, and Settings so tab navigation can be
 * confirmed. The Feed tab is itself a stack (feed/index → feed/[id]) to confirm
 * stacked detail navigation inside a tab. No auth-gating yet — Phase B decides when
 * this group is shown.
 */
export default function AppTabsLayout() {
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
