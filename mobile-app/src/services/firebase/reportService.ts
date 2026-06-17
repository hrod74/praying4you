import { NotImplementedError, type ReportService } from './contracts';

/**
 * Firebase report service stub (Phase J.2a). Reporting stays lightweight: store reports for
 * manual Firebase console review, prevent duplicate reports by the same user/request, block
 * reports on the user's own request, and keep reports admin-read only (no admin dashboard in the
 * first beta). Every method throws until the integration phase wires Firestore in. The live app
 * still records reports locally.
 */
export const firebaseReportService: ReportService = {
  report() {
    throw new NotImplementedError('firebaseReportService.report');
  },
  hasReported() {
    throw new NotImplementedError('firebaseReportService.hasReported');
  },
};
