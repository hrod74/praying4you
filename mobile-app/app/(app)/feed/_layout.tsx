import { Stack } from 'expo-router';

import { colors } from '../../../src/theme/theme';

/**
 * Feed stack (lives inside the Feed tab).
 *
 * Routes: index (the prayer feed), [id] (prayer detail), and report (a modal to report a
 * request, Phase G). Composing a new request now lives in its own persistent tab
 * (app/(app)/submit.tsx), so it is always reachable from the bottom navigation.
 */
export default function FeedStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Prayer feed' }} />
      <Stack.Screen name="[id]" options={{ title: 'Prayer detail' }} />
      <Stack.Screen
        name="report"
        options={{ title: 'Report request', presentation: 'modal' }}
      />
    </Stack>
  );
}
