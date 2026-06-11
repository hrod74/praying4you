import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '../theme/theme';

/**
 * EmptyState — a calm, warm message for empty / not-found / error situations.
 *
 * Per design-direction.md: empty states should be warm and guiding, never blank or
 * broken. Kept simple and quiet, in keeping with the prayer-journal tone.
 */
export function EmptyState({
  title,
  message,
  icon = '🕊️',
}: {
  title: string;
  message?: string;
  icon?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">
        {icon}
      </Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  message: {
    ...typography.muted,
    textAlign: 'center',
  },
});

export default EmptyState;
