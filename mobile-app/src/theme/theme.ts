/**
 * Shared visual theme for the Praying 4 You prototype.
 *
 * Phase A: a small, intentional set of tokens (colors, spacing, typography) so the
 * placeholder screens share a consistent, warm, card-based, mobile-first look —
 * a deliberate contrast to the legacy Bootstrap-3 web layout. Feature screens in
 * later phases should consume these tokens rather than hard-coding values.
 */

export const colors = {
  background: '#FBF8F4',
  surface: '#FFFFFF',
  border: '#ECE6DD',
  primary: '#6C63FF',
  primaryText: '#FFFFFF',
  text: '#2A2A33',
  textMuted: '#6B6B76',
  accent: '#E6F4FE',
  // Warm gold accent for hope/encouragement (used sparingly — see design-direction.md §4).
  gold: '#C9A227',
  // Calm, non-alarming error tone (muted terracotta), paired with text/icon, never color-alone.
  danger: '#B4533E',
  dangerSurface: '#FBEDE9',
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
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.text },
  muted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
} as const;

export const theme = { colors, spacing, radius, typography } as const;

export default theme;
