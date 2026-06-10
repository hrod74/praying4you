/**
 * TypeScript contracts for Praying 4 You.
 *
 * These shapes intentionally mirror the PRD's Firestore entities so they carry
 * forward unchanged into the Firebase-backed MVP. In the prototype milestone they
 * describe the mock/local data; the `src/services/` layer is the only place that
 * knows where instances of these types actually come from.
 *
 * Phase A defines the contracts only — no data and no behavior are implemented here.
 */

export interface UserProfile {
  /** Local id (e.g., "local-user"). */
  id: string;
  /** Public display name. */
  displayName: string;
  /** PRIVATE — never shown on any public surface (feed, detail, etc.). */
  email: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export type PrayerStatus = 'active' | 'flagged' | 'removed';

export interface PrayerRequest {
  id: string;
  /** Owner — always set, even when the request is displayed anonymously. */
  userId: string;
  /** Controls display only; ownership is always retained for moderation. */
  isAnonymous: boolean;
  /** Cached display name, or "Anonymous" when isAnonymous is true. */
  displayName: string;
  /** Request body (10–500 chars, enforced in later phases). */
  body: string;
  createdAt: string;
  status: PrayerStatus;
  prayerCount: number;
  reportCount: number;
}

export interface PrayerInteraction {
  /** Who prayed. */
  userId: string;
  /** What they prayed for. */
  requestId: string;
  prayedAt: string;
}

export type ReportReason = 'spam' | 'inappropriate' | 'harmful' | 'other';

export interface Report {
  id: string;
  requestId: string;
  reportedBy: string;
  reason: ReportReason;
  /** Optional, <= 300 chars. */
  notes?: string;
  createdAt: string;
}

export interface Verse {
  /** e.g., "John 3:16". */
  reference: string;
  text: string;
  /** e.g., "NIV". */
  translation: string;
}
