/**
 * Small, pure formatting helpers for displaying prayer data.
 *
 * Framework-agnostic and side-effect-free so they are easy to unit test and reuse.
 */

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
const LONG_DATE: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
};

/** Short date for feed cards, e.g., "Jun 8". */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, SHORT_DATE);
}

/** Full date for the detail screen, e.g., "Monday, June 8, 2026". */
export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, LONG_DATE);
}

/** Truncate long text for feed previews, breaking on a word boundary where possible. */
export function truncate(text: string, max = 200): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

/**
 * Encouraging, non-gamified phrasing for the prayer count (see design-direction.md §6).
 * Frames the number as companionship — "12 people prayed" — not a score.
 */
export function formatPrayerCount(count: number): string {
  if (count <= 0) return 'Be the first to pray';
  if (count === 1) return '1 person prayed';
  return `${count} people prayed`;
}
