import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import { colors, createThemedStyles, spacing } from '../theme/theme';

/**
 * Screen — a calm, consistently-padded container for a single screen's content.
 *
 * Gives every screen the same warm background, soft padding, and keyboard-avoiding
 * behavior so forms stay usable on a phone. Keeps screens visually consistent per
 * design-direction.md (soft spacing, mobile-first).
 *
 * Keyboard behavior (Phase H.2): scrollable screens dismiss the keyboard on drag
 * (`keyboardDismissMode="on-drag"`) so it goes away with a natural gesture, while taps on
 * controls still work (`keyboardShouldPersistTaps="handled"`).
 */
export function Screen({
  children,
  scroll = false,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  useAppTheme();
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = createThemedStyles(() => ({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
} as const));

export default Screen;
