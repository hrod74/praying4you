/**
 * Shared visual theme for the Praying 4 You prototype.
 *
 * Direction (see docs/design-direction.md §3–§4): an old-school Bible / prayer-journal
 * feel made modern — warm parchment surfaces, deep warm "ink" text, and muted,
 * heritage accents (bronze-gold, deep navy) used sparingly. Gentle contrast, soft
 * spacing. Feature screens consume these tokens rather than hard-coding values.
 *
 * Phase C moves the palette off the earlier soft-startup tones toward this warmer
 * heritage direction. Exact values remain tunable in a later polish pass.
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

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, color: colors.text },
  muted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
  // Roomy, readable style for prayer text on the detail screen — meant to feel like
  // reading a journal entry or prayer card (generous line height).
  prayerBody: { fontSize: 17, fontWeight: '400' as const, lineHeight: 28, color: colors.text },
} as const;

export const theme = { colors, spacing, radius, typography } as const;

export default theme;
