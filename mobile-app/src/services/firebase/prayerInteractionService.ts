import { NotImplementedError, type PrayerInteractionService } from './contracts';

/**
 * Firebase prayer-interaction service stub (Phase J.2a). Interactions are AGGREGATE-ONLY to
 * other users: the only cross-user signal is the request's prayerCount, never the list of who
 * prayed. There is deliberately no "list who prayed" method. Every method throws until the
 * integration phase wires Firestore in. The live app still records interactions locally.
 */
export const firebasePrayerInteractionService: PrayerInteractionService = {
  pray() {
    throw new NotImplementedError('firebasePrayerInteractionService.pray');
  },
  hasPrayed() {
    throw new NotImplementedError('firebasePrayerInteractionService.hasPrayed');
  },
  listMinePrayedFor() {
    throw new NotImplementedError('firebasePrayerInteractionService.listMinePrayedFor');
  },
};
