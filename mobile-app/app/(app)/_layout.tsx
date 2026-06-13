import { FontAwesome5 } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';
import { PrayerProvider } from '../../src/context/PrayerContext';
import { colors } from '../../src/theme/theme';

/**
 * Main app tab shell (shown only to a signed-in user).
 *
 * Gated on the simulated session — a signed-out user is redirected to the welcome screen
 * and cannot reach the tabs. Wrapped in PrayerProvider so all app screens share the
 * loaded prayer list and interactions.
 *
 * Navigation: four tabs with quiet, concept-matched FontAwesome5 icons — a dove for the
 * feed, a fountain pen for composing a prayer request (the act is writing/journaling, not
 * social "sharing"), a Bible for the verse, and a person for settings. The compose tab is
 * labeled "Pray" and is persistent, so it is always reachable from the bottom bar, even
 * after scrolling the feed. The bar reads: Feed | Pray | Verse | Settings.
 *
 * Sizing (Phase H.2): icons and labels are slightly larger for readability and tap
 * confidence on iPhone, while staying calm and not oversized; all four tabs still fit.
 */

// Small helper: render a FontAwesome5 glyph tinted by the tab's active/inactive color.
const tabIcon =
  (name: React.ComponentProps<typeof FontAwesome5>['name']) =>
  ({ color }: { color: string }) =>
    <FontAwesome5 name={name} size={24} color={color} />;

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
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarIconStyle: { marginTop: 2 },
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{ title: 'Feed', headerShown: false, tabBarIcon: tabIcon('dove') }}
        />
        <Tabs.Screen
          name="submit"
          options={{ title: 'Pray', tabBarIcon: tabIcon('pen-fancy') }}
        />
        <Tabs.Screen
          name="verse"
          options={{ title: 'Verse', tabBarIcon: tabIcon('bible') }}
        />
        <Tabs.Screen
          name="settings"
          options={{ title: 'Settings', tabBarIcon: tabIcon('user') }}
        />
      </Tabs>
    </PrayerProvider>
  );
}
