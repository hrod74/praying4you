import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  createPrayer,
  interactionKey,
  listActivePrayers,
  recordPrayerInteraction,
  type NewPrayerInput,
} from '../services/prayerService';
import type { PrayerInteraction, PrayerRequest } from '../models/types';

/**
 * PrayerContext — in-memory prayer-request state for the signed-in app.
 *
 * Read path (Phase C): loads the active prayer requests (newest first) via
 * `prayerService` and exposes them, plus loading/error state and a refresh action, to
 * the Feed and Detail screens. Screens never import mock data directly — they read from
 * here, which reads from the service seam.
 *
 * Write path (Phase D): `addPrayer` creates a new request via the service and prepends it
 * to the in-memory list so it appears at the top of the feed immediately.
 *
 * Interaction (Phase E): `pray` records a one-per-user "I prayed for this" interaction
 * and increments that request's `prayerCount` locally; `hasPrayed` reports whether the
 * given user has already prayed. Interactions are session-only (in-memory) and map to a
 * future Firebase `prayerInteractions` collection. All local/mock — nothing is persisted
 * to a backend. Report remains for Phase G.
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
  /** Whether the given user has already prayed for the given request. */
  hasPrayed: (requestId: string, userId: string) => boolean;
  /** Record an "I prayed for this" interaction (idempotent per user+request). */
  pray: (requestId: string, userId: string) => Promise<void>;
}

const PrayerContext = createContext<PrayerContextValue | undefined>(undefined);

export function PrayerProvider({ children }: { children: ReactNode }) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Recorded "I prayed for this" interactions (session-only); state drives re-render.
  const [interactions, setInteractions] = useState<PrayerInteraction[]>([]);
  // Synchronous guard so rapid double-taps can't double-count before state updates.
  const prayedKeys = useRef<Set<string>>(new Set());

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

  const hasPrayed = useCallback(
    (requestId: string, userId: string) =>
      interactions.some((i) => i.requestId === requestId && i.userId === userId),
    [interactions],
  );

  const pray = useCallback(async (requestId: string, userId: string) => {
    const key = interactionKey(userId, requestId);
    // Claim the key synchronously; if already claimed, this is a duplicate — do nothing.
    if (prayedKeys.current.has(key)) return;
    prayedKeys.current.add(key);

    const interaction = await recordPrayerInteraction(userId, requestId);
    setInteractions((prev) => [...prev, interaction]);
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === requestId ? { ...p, prayerCount: p.prayerCount + 1 } : p,
      ),
    );
  }, []);

  const value = useMemo<PrayerContextValue>(
    () => ({ prayers, isLoading, error, refresh: load, getById, addPrayer, hasPrayed, pray }),
    [prayers, isLoading, error, load, getById, addPrayer, hasPrayed, pray],
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
