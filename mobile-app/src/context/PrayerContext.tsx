import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { createPrayer, listActivePrayers, type NewPrayerInput } from '../services/prayerService';
import type { PrayerRequest } from '../models/types';

/**
 * PrayerContext — in-memory prayer-request state for the signed-in app.
 *
 * Read path (Phase C): loads the active prayer requests (newest first) via
 * `prayerService` and exposes them, plus loading/error state and a refresh action, to
 * the Feed and Detail screens. Screens never import mock data directly — they read from
 * here, which reads from the service seam.
 *
 * Write path (Phase D): `addPrayer` creates a new request via the service and prepends it
 * to the in-memory list so it appears at the top of the feed immediately (local/mock
 * only — nothing is persisted to a backend). "I prayed for this" and report remain for
 * Phases E and G.
 */

interface PrayerContextValue {
  /** Active prayer requests, newest first. */
  prayers: PrayerRequest[];
  /** True while the initial load (or a refresh) is in flight. */
  isLoading: boolean;
  /** A user-facing error message if loading failed, else null. */
  error: string | null;
  /** Reload the feed from the service. */
  refresh: () => Promise<void>;
  /** Look up a loaded request by id (used by the detail screen). */
  getById: (id: string) => PrayerRequest | undefined;
  /** Create a new prayer request locally; returns its new id. */
  addPrayer: (input: NewPrayerInput) => Promise<string>;
}

const PrayerContext = createContext<PrayerContextValue | undefined>(undefined);

export function PrayerProvider({ children }: { children: ReactNode }) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await listActivePrayers();
      setPrayers(list);
    } catch {
      setError('We could not load prayer requests right now. Pull down to try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const getById = useCallback(
    (id: string) => prayers.find((p) => p.id === id),
    [prayers],
  );

  const addPrayer = useCallback(async (input: NewPrayerInput) => {
    const created = await createPrayer(input);
    // Prepend so the new request appears at the top of the feed (it is also the newest).
    setPrayers((prev) => [created, ...prev]);
    return created.id;
  }, []);

  const value = useMemo<PrayerContextValue>(
    () => ({ prayers, isLoading, error, refresh: load, getById, addPrayer }),
    [prayers, isLoading, error, load, getById, addPrayer],
  );

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>;
}

export function usePrayers(): PrayerContextValue {
  const ctx = useContext(PrayerContext);
  if (!ctx) {
    throw new Error('usePrayers must be used within a PrayerProvider');
  }
  return ctx;
}
