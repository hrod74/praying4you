import { Redirect, Stack } from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/theme';

/**
 * Auth route group (shown when signed out).
 *
 * Phase B: holds the create-profile and simulated sign-in screens. If the user is
 * already signed in, redirect them into the app so they never see auth screens.
 */
export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(app)/feed" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="create-profile" options={{ title: 'Create profile' }} />
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
    </Stack>
  );
}
