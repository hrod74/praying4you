import type { PrayerInteraction } from '../models/types.ts';

/** Pure, idempotent local undo used before persisting the interaction list. */
export function withoutPrayerInteraction(
  interactions: PrayerInteraction[],
  userId: string,
  requestId: string,
): PrayerInteraction[] {
  return interactions.filter((i) => !(i.userId === userId && i.requestId === requestId));
}
