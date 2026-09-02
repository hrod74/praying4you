import { Stack } from 'expo-router';

import { useAppTheme } from '../../../src/context/ThemeContext';
import { colors } from '../../../src/theme/theme';

/**
 * Feed stack (lives inside the Feed tab).
 *
 * Routes: index (the prayer feed), [id] (prayer detail), report (a modal to report a
 * request, Phase G), edit (owner-only edit of a request, Phase H.1), and the two personal
 * lists reachable from Settings — my-requests and prayed-for (Phase H.1). Composing a new
 * request lives in its own persistent tab (app/(app)/submit.tsx), always reachable from the
 * bottom navigation.
 */
export default function FeedStackLayout() {
  useAppTheme();
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
      <Stack.Screen name="edit" options={{ title: 'Edit request' }} />
      <Stack.Screen name="my-requests" options={{ title: 'My prayer requests' }} />
      <Stack.Screen name="prayed-for" options={{ title: 'Prayers I’ve prayed for' }} />
    </Stack>
  );
}
