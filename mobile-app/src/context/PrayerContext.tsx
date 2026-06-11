import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { listActivePrayers } from '../services/prayerService';
import type { PrayerRequest } from '../models/types';

/**
 * PrayerContext — in-memory prayer-request state for the signed-in app.
 *
 * Phase C scope (read path only): loads the active prayer requests (newest first) via
 * `prayerService` and exposes them, plus loading/error state and a refresh action, to
 * the Feed and Detail screens. Screens never import mock data directly — they read from
 * here, which reads from the service seam.
 *
 * Write actions (submit, "I prayed for this", report) are intentionally NOT implemented
 * yet — those arrive in Phases D, E, and G.
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

  const value = useMemo<PrayerContextValue>(
    () => ({ prayers, isLoading, error, refresh: load, getById }),
    [prayers, isLoading, error, load, getById],
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
