/**
 * Stable FlatList invalidation key for the current user's personal prayed state.
 * Sorting keeps the key independent of request ordering; adding or removing any prayer changes it.
 */
export function prayedStateKey(requestIds: string[]): string {
  return [...requestIds].sort().join('|');
}
