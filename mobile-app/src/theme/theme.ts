import { PixelRatio } from 'react-native';

/**
 * Shared visual theme for the Praying 4 You prototype.
 *
 * Direction (see docs/design-direction.md §3–§4): an old-school Bible / prayer-journal
 * feel made modern — warm parchment surfaces, deep warm "ink" text, and muted,
 * heritage accents (bronze-gold, deep navy) used sparingly. Gentle contrast, soft
 * spacing. Feature screens consume these tokens rather than hard-coding values.
 *
 * Theming foundation (Phase H.3): every color is a named token in `colors`, every
 * component reads from these tokens (no hardcoded hex in screens), and the whole palette
 * is exported as one object. A future "theme" is therefore a swap of this palette (e.g.
 * via a ThemeProvider) without touching component code — see docs/design-direction.md §15
 * for the planned themes. No theme switching or paid themes are built in this milestone;
 * this is only the clean foundation.
 *
 * Accessibility (Phase H.3): text uses the OS Dynamic Type setting (React Native scales
 * `fontSize` by the user's font scale by default). Where we set an explicit `lineHeight`
 * (which RN does NOT auto-scale), we scale it ourselves via `scaleLineHeight` so lines
 * stay proportional and never overlap/clip at larger text sizes.
 */

export const colors = {
  // Warm parchment canvas and ivory "paper" surfaces.
  background: '#F5EFE3',
  surface: '#FCF8F0',
  // Warm hairline border, like the edge of a page.
  border: '#E6DCC8',
  // Deep warm "ink" for primary text; warm taupe for secondary/metadata.
  text: '#2E2620',
  textMuted: '#6B5E4C',
  // Primary action / accent: a deep, reflective navy-indigo (trust, quiet focus).
  primary: '#3B4663',
  primaryText: '#FFFFFF',
  // Soft parchment-tinted surface for gentle callouts (e.g., privacy notes).
  accent: '#EFE6D4',
  // Muted bronze-gold for hope/encouragement — used sparingly (see design-direction §4).
  gold: '#9C7A2E',
  // Calm, non-alarming error tone (muted terracotta), paired with text/icon, never color-alone.
  danger: '#A24A38',
  dangerSurface: '#F6E7E1',
  // Soft warm shadow for the gentle "paper resting on paper" elevation on cards/sheets.
  shadow: '#3A2E20',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
} as const;

/**
 * The user's OS font scale at app start (1.0 = default). React Native scales `fontSize`
 * by this automatically; we read it to keep explicit `lineHeight` values proportional.
 */
export const fontScale = PixelRatio.getFontScale();

/**
 * Scale an explicit line height by the user's font setting so it tracks the (auto-scaled)
 * font size and never clips at larger text sizes. Titles/headings/muted have no explicit
 * line height, so they already scale proportionally on their own.
 */
export const scaleLineHeight = (base: number): number => Math.round(base * fontScale);

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: scaleLineHeight(24),
    color: colors.text,
  },
  muted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
  // Roomy, readable style for prayer text on the detail screen — meant to feel like
  // reading a journal entry or prayer card (generous line height).
  prayerBody: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: scaleLineHeight(28),
    color: colors.text,
  },
} as const;

export const theme = { colors, spacing, radius, typography } as const;

export default theme;
