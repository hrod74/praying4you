import { Stack } from 'expo-router';

import { colors } from '../../../src/theme/theme';

/**
 * Feed stack (lives inside the Feed tab).
 *
 * Routes: index (the prayer feed), [id] (prayer detail), and submit (compose a new
 * request, Phase D). Submission lives in the feed stack because composing flows out of —
 * and back into — the feed; on success it replaces itself with the new request's detail.
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
      <Stack.Screen name="submit" options={{ title: 'Share a request' }} />
    </Stack>
  );
}
