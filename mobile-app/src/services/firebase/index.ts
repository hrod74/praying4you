/**
 * Firebase service module (Phase J.2a scaffold) — barrel exports.
 *
 * SAFE / INERT BY DESIGN: importing from here pulls in interfaces, throwing stubs, and a guarded
 * app accessor that does nothing without real config. Nothing in the running app imports this
 * module yet, so the prototype stays fully local/mock. The integration phase (J.2b+) will
 * implement these stubs against Firestore/Auth and swap them in behind the existing seam, one
 * concern at a time, without changing screens or shared types.
 */

export { getFirebaseApp, getFirebaseDb, isFirebaseReady } from './firebaseApp';
export {
  NotImplementedError,
  type AuthService,
  type UserService,
  type StoredUserProfile,
  type PrayerRequestService,
  type PrayerInteractionService,
  type ReportService,
} from './contracts';
export { firebaseAuthService, getFirebaseAuth, subscribeToProfile } from './authService';
export { AUTH_ERROR_COPY, authErrorMessage } from './authErrors';
export { firebaseUserService } from './userService';
export { firebasePrayerRequestService } from './prayerRequestService';
export { firebasePrayerInteractionService } from './prayerInteractionService';
export { firebaseReportService } from './reportService';
