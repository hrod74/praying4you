import { Stack } from 'expo-router';

import { colors } from '../../../src/theme/theme';

/**
 * Feed stack (lives inside the Feed tab).
 *
 * Phase A: index (the feed list placeholder) plus a [id] detail route, so stacked
 * navigation from a feed item to its detail can be confirmed. The real card list and
 * detail content arrive in Phase C.
 */
export default function FeedStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Prayer feed' }} />
      <Stack.Screen name="[id]" options={{ title: 'Prayer detail' }} />
    </Stack>
  );
}
