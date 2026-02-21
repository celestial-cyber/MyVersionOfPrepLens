import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from '../firebase';

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

export async function isAdminUser(uid) {
  if (!db || !uid) return false;

  const rolesDoc = await getDoc(doc(db, 'roles', uid));
  if (rolesDoc.exists()) {
    const rolesData = rolesDoc.data() || {};
    if (rolesData.role === 'admin' || rolesData.isAdmin === true || rolesData.admin === true) {
      return true;
    }
  }

  const profileDoc = await getDoc(doc(db, 'profiles', uid));
  if (!profileDoc.exists()) return false;
  const profileData = profileDoc.data() || {};
  return profileData.role === 'admin' || profileData.isAdmin === true;
}

export async function loginAdmin({ email, password }) {
  const user = await loginStudent({ email, password });
  const allowed = await isAdminUser(user.uid);

  if (!allowed) {
    await logoutStudent();
    throw new Error('Unauthorized: admin access required.');
  }

  return user;
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
