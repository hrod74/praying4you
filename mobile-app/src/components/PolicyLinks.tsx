import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import { colors, createThemedStyles, spacing, typography } from '../theme/theme';

export const TERMS_URL = 'https://productsparkstudio.com/terms/';

const POLICY_LINKS = [
  { label: 'Privacy Policy', url: 'https://productsparkstudio.com/privacy/' },
  { label: 'Terms of Use', url: TERMS_URL },
  { label: 'Support', url: 'https://productsparkstudio.com/support/' },
] as const;

export function PolicyLinks() {
  useAppTheme();
  return (
    <View style={styles.links} accessibilityRole="summary">
      {POLICY_LINKS.map(({ label, url }) => (
        <Pressable
          key={url}
          onPress={() => void Linking.openURL(url)}
          accessibilityRole="link"
          accessibilityLabel={label}
          accessibilityHint={`Opens the ${label} in your browser`}
          hitSlop={8}
        >
          <Text style={styles.link}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = createThemedStyles(() => ({
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  link: {
    ...typography.muted,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
} as const));

export default PolicyLinks;
