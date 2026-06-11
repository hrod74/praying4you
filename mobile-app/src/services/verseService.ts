import { mockVerses, type DailyVerse } from '../data/mockVerses';

/**
 * verseService — the data-access seam for the verse of the day.
 *
 * Screens call this module; it is the ONLY place that knows where verse data comes from.
 * Today it reads from a bundled local list (`src/data/mockVerses.ts`) — no external Bible
 * API, no network, no API keys. If a real verse source is ever added, only this file
 * changes.
 *
 * Selection is **deterministic per calendar day**: the same day always yields the same
 * verse, and the verse rotates day to day. It is computed locally from the date (no
 * randomness, no I/O), so it is synchronous and renders instantly.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole-day number for the given date's *local* calendar day (offset-aware). */
function localDayNumber(date: Date): number {
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(localMidnight.getTime() / MS_PER_DAY);
}

/**
 * The verse (and its app-written reflection) for the given day — defaults to today.
 * Same calendar day → same verse; different days rotate through the list.
 */
export function getVerseOfTheDay(date: Date = new Date()): DailyVerse {
  const len = mockVerses.length;
  const index = ((localDayNumber(date) % len) + len) % len;
  return mockVerses[index];
}
