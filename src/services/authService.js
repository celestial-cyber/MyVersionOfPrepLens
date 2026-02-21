import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../firebase';

function ensureAuthReady() {
  if (!hasFirebaseConfig || !auth) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values in your .env file.');
  }
}

export async function registerStudent({ name, email, password }) {
  ensureAuthReady();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(userCredential.user, { displayName: name });
  }
  return userCredential.user;
}

export async function loginStudent({ email, password }) {
  ensureAuthReady();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutStudent() {
  ensureAuthReady();
  await signOut(auth);
}

export function getCurrentStudent() {
  return auth?.currentUser || null;
}

export function subscribeToStudentAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
