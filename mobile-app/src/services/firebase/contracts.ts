import type {
  PrayerCategory,
  PrayerInteraction,
  PrayerRequest,
  Report,
  ReportReason,
  UserProfile,
} from '../../models/types';

/**
 * Firebase service contracts (Phase J.2a scaffold — interfaces only).
 *
 * These typed boundaries describe how the future Firebase-backed services will look, mirroring
 * the local seam (`src/services/prayerService.ts`, `AuthContext`) and the documented plan
 * (`docs/implementation-plan.md` §11, `docs/firebase-mvp-plan.md` §3–§7). They are NOT wired
 * into the app yet; the stubs that implement them throw `NotImplementedError`, so nothing can
 * accidentally read or write real Firebase data in this phase.
 *
 * Privacy invariants carried forward from the plan (must hold once implemented):
 *  - Email is private: never written to requests/interactions/reports, never returned to other users.
 *  - Public data minimization: feed/detail responses must not expose raw user IDs or unnecessary
 *    owner identifiers to other users.
 *  - Prayer interactions are AGGREGATE-ONLY to other users: callers can read the count, never the
 *    list of who prayed; a user may read only their own interaction.
 *  - Email/password is the MVP auth method. Anonymous Firebase auth is a future option, NOT here.
 */

/** Thrown by every scaffold stub. Guarantees no real Firebase call happens in Phase J.2a. */
export class NotImplementedError extends Error {
  constructor(method: string) {
    super(
      `${method} is not implemented yet (Firebase scaffold, Phase J.2a). ` +
        `The app remains local/mock until the integration phase wires this in.`,
    );
    this.name = 'NotImplementedError';
  }
}

/** Account/session boundary. Email/password only for MVP (no anonymous auth in this phase). */
export interface AuthService {
  /** Create an account (email/password) and the backing users/{uid} profile doc. */
  signUp(input: { email: string; password: string; displayName: string }): Promise<UserProfile>;
  /** Sign in with email/password. */
  signIn(input: { email: string; password: string }): Promise<UserProfile>;
  /** Sign out the current session. */
  signOut(): Promise<void>;
  /** The current signed-in profile, or null. */
  getCurrentProfile(): Promise<UserProfile | null>;
  /** Update the signed-in user's display name (Firebase Auth profile). */
  updateDisplayName(displayName: string): Promise<UserProfile>;
  /** Send a password-reset email. */
  sendPasswordReset(email: string): Promise<void>;
  /** Required before the real-tester beta (documented gate; not implemented in J.2b). */
  deleteAccount(): Promise<void>;
}

/**
 * The private Firestore `users/{uid}` profile document shape.
 *
 * Email is intentionally NOT stored here: Firebase Auth already owns the email, so duplicating it
 * into Firestore would only widen its exposure surface. Email therefore lives only in Firebase
 * Auth (private) and never appears in this doc, in any public surface, or in prayer data.
 * Timestamps are ISO strings (converted from Firestore Timestamps), or null while a server
 * timestamp is still resolving.
 */
export interface StoredUserProfile {
  uid: string;
  displayName: string;
  createdAt: string | null;
  updatedAt: string | null;
  lastSignedInAt: string | null;
  profileVersion: number;
  /** e.g. 'active'. Moderation/account-status changes are console/admin only (not client-writable). */
  accountStatus: string;
}

/**
 * Private user profile docs at `users/{uid}` (owner-only). No email is stored (Auth owns it).
 * Writes are best-effort side effects of the auth flow and must never block sign-in/sign-up.
 */
export interface UserService {
  /** Read the signed-in user's own profile doc (own doc only), or null if missing/unavailable. */
  getOwnProfile(uid: string): Promise<StoredUserProfile | null>;
  /** Create the profile doc on sign-up if it does not already exist. */
  ensureProfileForSignUp(uid: string, displayName: string): Promise<void>;
  /** On sign-in: create the doc if missing (backfill), else update lastSignedInAt; return it. */
  recordSignIn(uid: string, displayName: string): Promise<StoredUserProfile | null>;
  /** Update the user's own display name (and updatedAt) on their own doc. */
  updateDisplayName(uid: string, displayName: string): Promise<void>;
  /** Delete the user's own profile doc (account deletion). Owner-only; no-op if missing. */
  deleteOwnProfile(uid: string): Promise<void>;
}

/** Prayer request feed/detail. Returns only what the UX needs; no raw owner ids to other users. */
export interface PrayerRequestService {
  /** Active requests, newest first (feed). */
  listActive(options?: { pageSize?: number; cursor?: string }): Promise<PrayerRequest[]>;
  /** A single request by id (detail), or null. */
  getById(id: string): Promise<PrayerRequest | null>;
  /** Create a request (owner retained even when anonymous). */
  create(input: {
    userId: string;
    displayName: string;
    isAnonymous: boolean;
    body: string;
    category: PrayerCategory;
  }): Promise<PrayerRequest>;
  /** Owner-only edit. */
  edit(
    requestId: string,
    userId: string,
    input: { body: string; category: PrayerCategory; isAnonymous: boolean; ownerDisplayName: string },
  ): Promise<void>;
  /** Owner-only soft remove ("Remove request", never hard delete). */
  remove(requestId: string, userId: string): Promise<void>;
  /** The signed-in user's own requests. */
  listMine(userId: string): Promise<PrayerRequest[]>;
}

/**
 * "I prayed for this" interactions. AGGREGATE-ONLY to other users: the only cross-user signal
 * is the request's prayerCount. Individual interactions are owner-private and never listable to
 * others; there is deliberately no "list who prayed" method.
 */
export interface PrayerInteractionService {
  /** Record a one-per-user interaction and increment the request's prayerCount. Idempotent. */
  pray(userId: string, requestId: string): Promise<PrayerInteraction>;
  /** Whether the signed-in user has already prayed for a request (own record only). */
  hasPrayed(userId: string, requestId: string): Promise<boolean>;
  /** Requests the signed-in user has prayed for (own records only) — for "Prayers I've prayed for". */
  listMinePrayedFor(userId: string): Promise<PrayerRequest[]>;
}

/** Lightweight reporting: store for manual console review; admin-read only; duplicates prevented. */
export interface ReportService {
  /** File a report against another user's request (one per user+request; not on own request). */
  report(input: {
    requestId: string;
    reportedBy: string;
    reason: ReportReason;
    notes?: string;
  }): Promise<Report>;
  /** Whether the signed-in user has already reported a request (own record only). */
  hasReported(userId: string, requestId: string): Promise<boolean>;
}
