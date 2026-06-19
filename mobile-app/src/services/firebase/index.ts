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
export {
  AUTH_ERROR_COPY,
  authErrorMessage,
  DELETE_ERROR_COPY,
  AccountDeletionError,
  accountDeletionError,
  PASSWORD_RESET_COPY,
  passwordResetErrorMessage,
  CHANGE_PASSWORD_COPY,
  PasswordChangeError,
  passwordChangeError,
} from './authErrors';
export { firebaseUserService } from './userService';
export { firebasePrayerRequestService } from './prayerRequestService';
export { PRAYER_ERROR_COPY, prayerRequestError, type PrayerOp } from './prayerErrors';
export { firebasePrayerInteractionService } from './prayerInteractionService';
export {
  INTERACTION_ERROR_COPY,
  PrayerInteractionError,
  prayerInteractionError,
  type InteractionErrorCode,
} from './interactionErrors';
export { firebaseReportService } from './reportService';
export {
  REPORT_ERROR_COPY,
  ReportError,
  reportError,
  type ReportErrorCode,
} from './reportErrors';
