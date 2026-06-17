import { NotImplementedError, type AuthService } from './contracts';

/**
 * Firebase auth service stub (Phase J.2a). Email/password is the MVP method; anonymous auth is
 * a documented future option and is NOT implemented. Every method throws until the integration
 * phase wires Firebase Auth in. The live app still uses the local AuthContext simulation.
 */
export const firebaseAuthService: AuthService = {
  signUp() {
    throw new NotImplementedError('firebaseAuthService.signUp');
  },
  signIn() {
    throw new NotImplementedError('firebaseAuthService.signIn');
  },
  signOut() {
    throw new NotImplementedError('firebaseAuthService.signOut');
  },
  getCurrentProfile() {
    throw new NotImplementedError('firebaseAuthService.getCurrentProfile');
  },
  sendPasswordReset() {
    throw new NotImplementedError('firebaseAuthService.sendPasswordReset');
  },
  deleteAccount() {
    throw new NotImplementedError('firebaseAuthService.deleteAccount');
  },
};
