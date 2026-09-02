import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import { colors, createThemedStyles, radius, spacing, typography } from '../theme/theme';

/**
 * TextField — a labeled input with optional helper and inline error text.
 *
 * Every field has a visible label (not placeholder-only), readable contrast, and a
 * calm error state conveyed by both color and text (never color alone), per
 * design-direction.md. The label doubles as the accessibility label.
 *
 * Forwards a ref to the underlying TextInput so multi-field forms can move focus to the
 * next field on the keyboard "next" key (e.g. Create / Edit Profile).
 */
export const TextField = forwardRef<
  TextInput,
  TextInputProps & {
    label: string;
    helperText?: string;
    errorText?: string | null;
  }
>(function TextField({ label, helperText, errorText, style, ...inputProps }, ref) {
  useAppTheme();
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        style={[
          styles.input,
          focused && styles.inputFocused,
          hasError && styles.inputError,
          style,
        ]}
      />
      {hasError ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {errorText}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
});

const styles = createThemedStyles(() => ({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSurface,
  },
  helperText: typography.muted,
  errorText: {
    ...typography.muted,
    color: colors.danger,
  },
} as const));

export default TextField;
