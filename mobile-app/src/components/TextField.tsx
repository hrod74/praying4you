import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors, radius, spacing, typography } from '../theme/theme';

/**
 * TextField — a labeled input with optional helper and inline error text.
 *
 * Every field has a visible label (not placeholder-only), readable contrast, and a
 * calm error state conveyed by both color and text (never color alone), per
 * design-direction.md. The label doubles as the accessibility label.
 */
export function TextField({
  label,
  helperText,
  errorText,
  style,
  ...inputProps
}: TextInputProps & {
  label: string;
  helperText?: string;
  errorText?: string | null;
}) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
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
}

const styles = StyleSheet.create({
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
});

export default TextField;
