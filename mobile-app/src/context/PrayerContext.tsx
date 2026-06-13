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
  clearLocalPrayerData,
  createPrayer,
  interactionKey,
  listActivePrayers,
  loadInteractions,
  loadOverrides,
  loadRemovedIds,
  loadReports,
  recordPrayerInteraction,
  recordReport,
  saveInteractions,
  saveOverrides,
  saveRemovedIds,
  saveReports,
  saveSubmittedPrayers,
  type NewPrayerInput,
} from '../services/prayerService';
import type {
  PrayerCategory,
  PrayerInteraction,
  PrayerRequest,
  Report,
  ReportReason,
} from '../models/types';

/**
 * PrayerContext — prayer-request state for the signed-in app, with local persistence.
 *
 * Read path (Phase C): loads the active prayer requests (newest first) via
 * `prayerService` and exposes them, plus loading/error state and a refresh action, to
 * the Feed and Detail screens. Screens never import mock data directly — they read from
 * here, which reads from the service seam.
 *
 * Write path (Phase D): `addPrayer` creates a new request via the service and prepends it
 * to the in-memory baseline so it appears at the top of the feed immediately.
 *
 * Interaction (Phase E): `pray` records a one-per-user "I prayed for this" interaction;
 * `hasPrayed` reports whether the given user has already prayed.
 *
 * Reporting (Phase G): `reportPrayer` records a one-per-user report (reason + optional
 * note) and flags the request; `hasReported` reports whether the user already reported it.
 * There is NO real moderation backend — this is local/mock only.
 *
 * Persistence (Phase H): submitted requests, interactions, and reports are loaded from
 * on-device storage on startup and saved as they change, so local activity survives app
 * restarts. Counts are DERIVED: the displayed `prayers` recomputes each request's
 * prayerCount/reportCount/flag from the interaction/report lists layered on the base
 * record, so a refresh or restart can never double-count. `resetLocalData` clears all
 * local prototype activity (the profile, owned by AuthContext, is left intact). Email is
 * never stored in or derived from any of this data.
 */

/** Fields an owner may change when editing their own request. */
export interface EditPrayerInput {
  body: string;
  category: PrayerCategory;
  isAnonymous: boolean;
  /** The owner's real display name, used when the request is not anonymous. */
  ownerDisplayName: string;
}

interface PrayerContextValue {
  /** Active prayer requests, newest first (with derived live counts). */
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
  /** Owner-only edit of a request (body/category/anonymous choice). No-op if not owner. */
  editPrayer: (requestId: string, userId: string, input: EditPrayerInput) => Promise<void>;
  /** Owner-only soft remove (hidden from feed/detail; never hard-deleted). No-op if not owner. */
  removePrayer: (requestId: string, userId: string) => Promise<void>;
  /** Active prayer requests created by the given user (for "My prayer requests" + counts). */
  getMyRequests: (userId: string) => PrayerRequest[];
  /** Active prayer requests the given user has prayed for (for "Prayers I've prayed for"). */
  getPrayedRequests: (userId: string) => PrayerRequest[];
  /** Whether the given user has already prayed for the given request. */
  hasPrayed: (requestId: string, userId: string) => boolean;
  /** Record an "I prayed for this" interaction (idempotent per user+request). */
  pray: (requestId: string, userId: string) => Promise<void>;
  /** Whether the given user has already reported the given request. */
  hasReported: (requestId: string, userId: string) => boolean;
  /** Report a request locally (idempotent per user+request); flags it and counts it. */
  reportPrayer: (
    requestId: string,
    userId: string,
    reason: ReportReason,
    notes?: string,
  ) => Promise<void>;
  /** Clear all local prototype activity (submitted requests, prayed marks, reports). */
  resetLocalData: () => Promise<void>;
}

const PrayerContext = createContext<PrayerContextValue | undefined>(undefined);

export function PrayerProvider({ children }: { children: ReactNode }) {
  // Base records (seed + locally-submitted), with their BASE counts; live counts are
  // derived below from the interaction/report lists.
  const [baseline, setBaseline] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Recorded "I prayed for this" interactions; state drives the derived counts/re-render.
  const [interactions, setInteractions] = useState<PrayerInteraction[]>([]);
  // Synchronous guard so rapid double-taps can't double-record before state updates.
  const prayedKeys = useRef<Set<string>>(new Set());
  // Recorded reports + a synchronous one-per-user guard.
  const [reports, setReports] = useState<Report[]>([]);
  const reportedKeys = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [list, storedInteractions, storedReports] = await Promise.all([
        listActivePrayers(),
        loadInteractions(),
        loadReports(),
      ]);
      setBaseline(list);
      setInteractions(storedInteractions);
      setReports(storedReports);
      // Rebuild the synchronous guards from persisted data so restored marks aren't redone.
      prayedKeys.current = new Set(
        storedInteractions.map((i) => interactionKey(i.userId, i.requestId)),
      );
      reportedKeys.current = new Set(
        storedReports.map((r) => interactionKey(r.reportedBy, r.requestId)),
      );
    } catch {
      setError('We could not load prayer requests right now. Pull down to try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Displayed list: layer interaction/report deltas onto each base record. Recomputing
  // from the deduped lists (rather than mutating) guarantees no double-counting on
  // refresh/restart, and flags any request that has at least one report.
  const prayers = useMemo<PrayerRequest[]>(() => {
    if (interactions.length === 0 && reports.length === 0) return baseline;
    return baseline.map((p) => {
      const prayerDelta = interactions.filter((i) => i.requestId === p.id).length;
      const reportDelta = reports.filter((r) => r.requestId === p.id).length;
      if (prayerDelta === 0 && reportDelta === 0) return p;
      return {
        ...p,
        prayerCount: p.prayerCount + prayerDelta,
        reportCount: p.reportCount + reportDelta,
        status: reportDelta > 0 ? 'flagged' : p.status,
      };
    });
  }, [baseline, interactions, reports]);

  const getById = useCallback(
    (id: string) => prayers.find((p) => p.id === id),
    [prayers],
  );

  const addPrayer = useCallback(async (input: NewPrayerInput) => {
    const created = await createPrayer(input);
    // Prepend so the new request appears at the top of the feed (it is also the newest),
    // then persist the locally-submitted subset so it survives a restart.
    setBaseline((prev) => {
      const next = [created, ...prev];
      void saveSubmittedPrayers(next.filter((p) => p.id.startsWith('local-')));
      return next;
    });
    return created.id;
  }, []);

  // Owner-only edit. Persists a per-id override (so editing a seed request never mutates
  // the seed) and updates the in-memory baseline so feed/detail reflect the change at once.
  // The anonymity rule lives here, mirroring createPrayer: anonymous hides the name.
  const editPrayer = useCallback(
    async (requestId: string, userId: string, input: EditPrayerInput) => {
      const target = baseline.find((p) => p.id === requestId);
      if (!target || target.userId !== userId) return; // owner-only guard
      const body = input.body.trim();
      const displayName = input.isAnonymous ? 'Anonymous' : input.ownerDisplayName;
      const overrides = await loadOverrides();
      overrides[requestId] = {
        body,
        category: input.category,
        isAnonymous: input.isAnonymous,
        displayName,
      };
      await saveOverrides(overrides);
      setBaseline((prev) =>
        prev.map((p) =>
          p.id === requestId
            ? { ...p, body, category: input.category, isAnonymous: input.isAnonymous, displayName }
            : p,
        ),
      );
    },
    [baseline],
  );

  // Owner-only soft remove. Adds the id to the removed-by-owner set (persisted) and drops it
  // from the in-memory baseline so it leaves the feed/detail immediately. Never hard-deletes.
  const removePrayer = useCallback(
    async (requestId: string, userId: string) => {
      const target = baseline.find((p) => p.id === requestId);
      if (!target || target.userId !== userId) return; // owner-only guard
      const removedIds = await loadRemovedIds();
      if (!removedIds.includes(requestId)) {
        await saveRemovedIds([...removedIds, requestId]);
      }
      setBaseline((prev) => prev.filter((p) => p.id !== requestId));
    },
    [baseline],
  );

  // Active requests created by the user (derived, so removed/edited state is always current).
  const getMyRequests = useCallback(
    (userId: string) => prayers.filter((p) => p.userId === userId),
    [prayers],
  );

  // Active requests the user has prayed for (from the deduped interaction list).
  const getPrayedRequests = useCallback(
    (userId: string) =>
      prayers.filter((p) =>
        interactions.some((i) => i.requestId === p.id && i.userId === userId),
      ),
    [prayers, interactions],
  );

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
    setInteractions((prev) => {
      const next = [...prev, interaction];
      void saveInteractions(next);
      return next;
    });
  }, []);

  const hasReported = useCallback(
    (requestId: string, userId: string) =>
      reports.some((r) => r.requestId === requestId && r.reportedBy === userId),
    [reports],
  );

  const reportPrayer = useCallback(
    async (requestId: string, userId: string, reason: ReportReason, notes?: string) => {
      const key = interactionKey(userId, requestId);
      if (reportedKeys.current.has(key)) return; // one report per user+request
      reportedKeys.current.add(key);

      const report = await recordReport({ requestId, reportedBy: userId, reason, notes });
      setReports((prev) => {
        const next = [...prev, report];
        void saveReports(next);
        return next;
      });
    },
    [],
  );

  const resetLocalData = useCallback(async () => {
    await clearLocalPrayerData();
    prayedKeys.current = new Set();
    reportedKeys.current = new Set();
    setInteractions([]);
    setReports([]);
    // Reload the baseline so the feed returns to seed-only (submitted requests cleared).
    const list = await listActivePrayers();
    setBaseline(list);
  }, []);

  const value = useMemo<PrayerContextValue>(
    () => ({
      prayers,
      isLoading,
      error,
      refresh: load,
      getById,
      addPrayer,
      editPrayer,
      removePrayer,
      getMyRequests,
      getPrayedRequests,
      hasPrayed,
      pray,
      hasReported,
      reportPrayer,
      resetLocalData,
    }),
    [
      prayers,
      isLoading,
      error,
      load,
      getById,
      addPrayer,
      editPrayer,
      removePrayer,
      getMyRequests,
      getPrayedRequests,
      hasPrayed,
      pray,
      hasReported,
      reportPrayer,
      resetLocalData,
    ],
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
