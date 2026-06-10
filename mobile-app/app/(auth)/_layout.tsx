import { Stack } from 'expo-router';

import { colors } from '../../src/theme/theme';

/**
 * Auth route group.
 *
 * Phase A: a plain stack holding placeholder sign-in and create-profile screens so
 * the group and its navigation exist from the first commit. Simulated local auth and
 * the signed-out gating logic are built in Phase B.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="create-profile" options={{ title: 'Create profile' }} />
    </Stack>
  );
}
