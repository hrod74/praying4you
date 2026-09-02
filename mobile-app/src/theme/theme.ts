import { PixelRatio } from 'react-native';

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 20 } as const;

export const lightColors = {
  background: '#F5EFE3', surface: '#FCF8F0', border: '#E6DCC8', text: '#2E2620',
  textMuted: '#6B5E4C', primary: '#3B4663', primaryText: '#FFFFFF', accent: '#EFE6D4',
  gold: '#9C7A2E', danger: '#A24A38', dangerSurface: '#F6E7E1', shadow: '#3A2E20',
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };

/** Night Prayer uses navy-charcoal surfaces and warm text instead of harsh pure black/white. */
export const darkColors: ThemeColors = {
  background: '#151922', surface: '#202631', border: '#5B687C', text: '#F3EBDD',
  textMuted: '#C5B9A7', primary: '#AEBBDD', primaryText: '#18202D', accent: '#2C3441',
  gold: '#E2C46F', danger: '#E19583', dangerSurface: '#3A2829', shadow: '#000000',
};

export type ResolvedAppearance = 'light' | 'dark';
export const fontScale = PixelRatio.getFontScale();
export const scaleLineHeight = (base: number): number => Math.round(base * fontScale);

function createTypography(colors: ThemeColors) {
  return {
    title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
    heading: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: scaleLineHeight(24), color: colors.text },
    muted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
    prayerBody: { fontSize: 17, fontWeight: '400' as const, lineHeight: scaleLineHeight(28), color: colors.text },
  } as const;
}

export function createTheme(appearance: ResolvedAppearance) {
  const colors: ThemeColors = appearance === 'dark' ? darkColors : lightColors;
  return { appearance, colors, spacing, radius, typography: createTypography(colors) } as const;
}

export type AppTheme = ReturnType<typeof createTheme>;

let activeTheme = createTheme('light');
let activeThemeVersion = 0;

/** ThemeProvider activates the resolved palette before descendants render. */
export function activateTheme(theme: AppTheme): void {
  if (activeTheme === theme) return;
  activeTheme = theme;
  activeThemeVersion += 1;
}

/**
 * Existing UI modules read these proxies inside deferred style factories. This keeps the token
 * names stable while resolving each value from the currently active palette.
 */
export const colors = new Proxy({} as ThemeColors, {
  get: (_target, key: keyof ThemeColors) => activeTheme.colors[key],
});
export const typography = new Proxy({} as AppTheme['typography'], {
  get: (_target, key: keyof AppTheme['typography']) => activeTheme.typography[key],
});

/** Deferred plain-object styles, resolved against the active theme on each render. */
export function createThemedStyles<T extends Record<string, object>>(factory: () => T): T {
  let cachedVersion = -1;
  let cachedStyles: T;
  return new Proxy({} as T, {
    get: (_target, key: string) => {
      if (cachedVersion !== activeThemeVersion) {
        cachedStyles = factory();
        cachedVersion = activeThemeVersion;
      }
      return cachedStyles[key];
    },
  });
}

export const theme = activeTheme;
export default theme;
