import { NotImplementedError, type UserService } from './contracts';

/**
 * Firebase user/profile service stub (Phase J.2a). Profile docs are private; email lives only
 * here and is never exposed to other users. Every method throws until the integration phase
 * wires Firestore in. The live app still uses the local AuthContext profile.
 */
export const firebaseUserService: UserService = {
  getOwnProfile() {
    throw new NotImplementedError('firebaseUserService.getOwnProfile');
  },
  updateDisplayName() {
    throw new NotImplementedError('firebaseUserService.updateDisplayName');
  },
};
