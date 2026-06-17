import { NotImplementedError, type PrayerRequestService } from './contracts';

/**
 * Firebase prayer-request service stub (Phase J.2a). Feed/detail reads must return only what the
 * UX needs and must not expose raw user IDs or unnecessary owner identifiers to other users.
 * Every method throws until the integration phase wires Firestore in. The live app still reads
 * from the local prayerService seam.
 */
export const firebasePrayerRequestService: PrayerRequestService = {
  listActive() {
    throw new NotImplementedError('firebasePrayerRequestService.listActive');
  },
  getById() {
    throw new NotImplementedError('firebasePrayerRequestService.getById');
  },
  create() {
    throw new NotImplementedError('firebasePrayerRequestService.create');
  },
  edit() {
    throw new NotImplementedError('firebasePrayerRequestService.edit');
  },
  remove() {
    throw new NotImplementedError('firebasePrayerRequestService.remove');
  },
  listMine() {
    throw new NotImplementedError('firebasePrayerRequestService.listMine');
  },
};
