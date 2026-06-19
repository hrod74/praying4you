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
  interactionKey,
  loadInteractions,
  loadReports,
  recordPrayerInteraction,
  recordReport,
  saveInteractions,
  saveReports,
  saveSubmittedPrayers,
  type NewPrayerInput,
} from '../services/prayerService';
import {
  createRequest,
  editRequest,
  listActiveRequests,
  persistsRequestsLocally,
  removeRequest,
} from '../services/prayerRequests';
import {
  interactionsUseFirebase,
  listMyPrayedRequestIds,
  prayForRequest,
} from '../services/prayerInteractions';
import { reportsUseFirebase, reportRequest } from '../services/reports';
import { ReportError } from '../services/firebase/reportErrors';
import { useAuth } from './AuthContext';
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
 *
 * Firestore prayer requests (Phase J.2e): the request read/create/edit/remove path goes through the
 * mode-aware seam (`src/services/prayerRequests.ts`). When Firebase is configured the requests come
 * from the Firestore `prayerRequests` collection; otherwise the original local/mock path is used.
 *
 * Firestore prayer interactions (Phase J.2f.3): "I prayed for this" is now also mode-aware via
 * `src/services/prayerInteractions.ts`. In Firebase mode, praying writes a one-per-user
 * `prayerInteractions/{uid}_{requestId}` doc and increments the request's aggregate `prayerCount` in
 * a transaction; the displayed count comes straight from Firestore (no local delta), and the current
 * user's already-prayed set is hydrated from their own interaction docs. In local mode the original
 * on-device interaction list + derived counts are used, unchanged. REPORTS remain local/mock in both
 * modes. Interactions are AGGREGATE-ONLY to others: there is no "who prayed" data anywhere.
 */

/** Interactions are Firestore-backed when Firebase is configured; else local/mock. Decided once. */
const USE_FIREBASE_INTERACTIONS = interactionsUseFirebase();

/** Reports are Firestore-backed when Firebase is configured; else local/mock. Decided once. */
const USE_FIREBASE_REPORTS = reportsUseFirebase();

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
  // The signed-in user's uid is needed to hydrate their own prayed-for set in Firebase mode.
  const { profile } = useAuth();
  const uid = profile?.id ?? null;

  // Base records (seed + locally-submitted), with their BASE counts; live counts are
  // derived below from the interaction/report lists.
  const [baseline, setBaseline] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // LOCAL mode: recorded "I prayed for this" interactions; state drives the derived counts/re-render.
  const [interactions, setInteractions] = useState<PrayerInteraction[]>([]);
  // FIREBASE mode: the request ids the CURRENT user has prayed for (hydrated from their own
  // interaction docs). Drives already-prayed state and "Prayers I've prayed for"; counts come from
  // the Firestore request docs (with an optimistic +1 applied to the baseline on a new pray).
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  // Synchronous guard so rapid double-taps can't double-record before state updates.
  const prayedKeys = useRef<Set<string>>(new Set());
  // LOCAL mode: recorded reports; drives the local derived flag/report count.
  const [reports, setReports] = useState<Report[]>([]);
  // FIREBASE mode: request ids the CURRENT user has reported this session (reports are a private
  // moderation record with no client list, so this drives the "you reported" UI without reading
  // back from Firestore).
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  // Synchronous one-per-user guard (both modes).
  const reportedKeys = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In Firebase mode interactions live in Firestore: skip the on-device interaction list and
      // hydrate the current user's prayed-for set from their own interaction docs instead. Reports
      // are still local/mock in both modes. A prayed-for lookup failure must not break the feed, so
      // it degrades to an empty set rather than throwing.
      const [list, storedInteractions, storedReports, myPrayedIds] = await Promise.all([
        listActiveRequests(),
        USE_FIREBASE_INTERACTIONS ? Promise.resolve<PrayerInteraction[]>([]) : loadInteractions(),
        loadReports(),
        USE_FIREBASE_INTERACTIONS && uid
          ? listMyPrayedRequestIds(uid).catch(() => [] as string[])
          : Promise.resolve<string[]>([]),
      ]);
      setBaseline(list);
      setInteractions(storedInteractions);
      setReports(storedReports);
      setPrayedIds(new Set(myPrayedIds));
      // Rebuild the synchronous guards so restored/loaded marks aren't redone.
      prayedKeys.current = USE_FIREBASE_INTERACTIONS
        ? new Set(uid ? myPrayedIds.map((rid) => interactionKey(uid, rid)) : [])
        : new Set(storedInteractions.map((i) => interactionKey(i.userId, i.requestId)));
      reportedKeys.current = new Set(
        storedReports.map((r) => interactionKey(r.reportedBy, r.requestId)),
      );
    } catch (e) {
      // Prefer the seam's safe copy (e.g. permission/network) and fall back to the pull-to-refresh
      // wording. Raw Firebase detail is never surfaced.
      setError(
        e instanceof Error && e.message
          ? e.message
          : 'We could not load prayer requests right now. Pull down to try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  // Displayed list: layer interaction/report deltas onto each base record. Recomputing
  // from the deduped lists (rather than mutating) guarantees no double-counting on
  // refresh/restart, and flags any request that has at least one report.
  //
  // In FIREBASE mode the prayerCount already comes from Firestore (the source of truth, kept current
  // by the transaction + an optimistic +1 applied to the baseline on a new pray), so no local prayer
  // delta is layered here. Reports are still local/mock in both modes, so the report delta always
  // applies.
  const prayers = useMemo<PrayerRequest[]>(() => {
    if (interactions.length === 0 && reports.length === 0) return baseline;
    return baseline.map((p) => {
      const prayerDelta = USE_FIREBASE_INTERACTIONS
        ? 0
        : interactions.filter((i) => i.requestId === p.id).length;
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
    const created = await createRequest(input);
    // Prepend so the new request appears at the top of the feed (it is also the newest). In local
    // mode, persist the locally-submitted subset so it survives a restart; in Firebase mode the
    // Firestore document is the source of truth, so there is nothing to persist on-device.
    setBaseline((prev) => {
      const next = [created, ...prev];
      if (persistsRequestsLocally()) {
        void saveSubmittedPrayers(next.filter((p) => p.id.startsWith('local-')));
      }
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
      // Persist via the seam (Firestore in Firebase mode; on-device override in local mode). A
      // failure throws and is surfaced by the caller; the in-memory baseline updates only on success.
      await editRequest(requestId, userId, {
        body: input.body,
        category: input.category,
        isAnonymous: input.isAnonymous,
        ownerDisplayName: input.ownerDisplayName,
      });
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
      // Soft remove via the seam (Firestore status -> removed in Firebase mode; on-device removed
      // set in local mode). Never a hard delete. Drop from the in-memory baseline only on success.
      await removeRequest(requestId, userId);
      setBaseline((prev) => prev.filter((p) => p.id !== requestId));
    },
    [baseline],
  );

  // Active requests created by the user (derived, so removed/edited state is always current).
  const getMyRequests = useCallback(
    (userId: string) => prayers.filter((p) => p.userId === userId),
    [prayers],
  );

  // Active requests the user has prayed for. Firebase mode uses the hydrated prayedIds set; local
  // mode uses the on-device interaction list. Either way, only the current user's own prayers.
  const getPrayedRequests = useCallback(
    (userId: string) =>
      USE_FIREBASE_INTERACTIONS
        ? prayers.filter((p) => prayedIds.has(p.id))
        : prayers.filter((p) =>
            interactions.some((i) => i.requestId === p.id && i.userId === userId),
          ),
    [prayers, interactions, prayedIds],
  );

  const hasPrayed = useCallback(
    (requestId: string, userId: string) =>
      USE_FIREBASE_INTERACTIONS
        ? prayedIds.has(requestId)
        : interactions.some((i) => i.requestId === requestId && i.userId === userId),
    [interactions, prayedIds],
  );

  const pray = useCallback(async (requestId: string, userId: string) => {
    const key = interactionKey(userId, requestId);
    // Claim the key synchronously; if already claimed, this is a duplicate — do nothing.
    if (prayedKeys.current.has(key)) return;
    prayedKeys.current.add(key);

    if (USE_FIREBASE_INTERACTIONS) {
      try {
        // Firestore: create the one-per-user interaction + increment the count, atomically.
        const { created } = await prayForRequest(userId, requestId);
        // Mark prayed locally for immediate already-prayed UI.
        setPrayedIds((prev) => {
          const next = new Set(prev);
          next.add(requestId);
          return next;
        });
        // Optimistically reflect the +1 (only when a NEW interaction was created, never on a
        // no-op repeat). A later refresh reconciles with the authoritative Firestore count.
        if (created) {
          setBaseline((prev) =>
            prev.map((p) => (p.id === requestId ? { ...p, prayerCount: p.prayerCount + 1 } : p)),
          );
        }
      } catch (e) {
        // Release the synchronous guard so a transient failure can be retried, and rethrow the
        // safe copy for the screen to surface.
        prayedKeys.current.delete(key);
        throw e;
      }
      return;
    }

    // Local/mock mode: append to the on-device interaction list (derived count handles the rest).
    const interaction = await recordPrayerInteraction(userId, requestId);
    setInteractions((prev) => {
      const next = [...prev, interaction];
      void saveInteractions(next);
      return next;
    });
  }, []);

  const hasReported = useCallback(
    (requestId: string, userId: string) =>
      USE_FIREBASE_REPORTS
        ? reportedIds.has(requestId)
        : reports.some((r) => r.requestId === requestId && r.reportedBy === userId),
    [reports, reportedIds],
  );

  const reportPrayer = useCallback(
    async (requestId: string, userId: string, reason: ReportReason, notes?: string) => {
      const key = interactionKey(userId, requestId);
      if (reportedKeys.current.has(key)) return; // one report per user+request (synchronous guard)

      if (USE_FIREBASE_REPORTS) {
        // Firestore: write a private report doc for manual review. Derive the (opaque, never-shown)
        // author uid from the loaded request so the rules can verify it against the real request.
        const target = baseline.find((p) => p.id === requestId);
        if (!target) throw new ReportError('unavailable');
        if (target.userId === userId) throw new ReportError('ownRequest');
        if (target.status !== 'active') throw new ReportError('unavailable');
        reportedKeys.current.add(key);
        try {
          await reportRequest({
            reporterUid: userId,
            requestId,
            requestAuthorUid: target.userId,
            reason,
            notes,
          });
          setReportedIds((prev) => {
            const next = new Set(prev);
            next.add(requestId);
            return next;
          });
        } catch (e) {
          // On an "already reported" result, keep the reported state (it IS reported); otherwise
          // release the guard so a transient failure can be retried. Always rethrow safe copy.
          if (e instanceof ReportError && e.code === 'already') {
            setReportedIds((prev) => {
              const next = new Set(prev);
              next.add(requestId);
              return next;
            });
          } else {
            reportedKeys.current.delete(key);
          }
          throw e;
        }
        return;
      }

      // Local/mock mode: append to the on-device report list (derived flag/count handles the rest).
      reportedKeys.current.add(key);
      const report = await recordReport({ requestId, reportedBy: userId, reason, notes });
      setReports((prev) => {
        const next = [...prev, report];
        void saveReports(next);
        return next;
      });
    },
    [baseline],
  );

  const resetLocalData = useCallback(async () => {
    // Clears LOCAL prototype activity only (local prayed/report marks and any local submitted/edited/
    // removed requests). In Firebase mode the Firestore requests AND prayer interactions are the
    // source of truth and are NOT cleared here (only the local report marks reset). Reloading
    // rehydrates everything from the active source: the feed baseline, the user's prayed-for set,
    // and the synchronous guards, so nothing is left stale or out of sync.
    await clearLocalPrayerData();
    await load();
  }, [load]);

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
