import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from '../firebase';

const DEMO_USERS = {
  'admin@email.com': {
    uid: 'demo-admin-uid',
    email: 'admin@email.com',
    displayName: 'Demo Admin',
    role: 'admin',
  },
  'student@email.com': {
    uid: 'demo-student-uid',
    email: 'student@email.com',
    displayName: 'Demo Student',
    role: 'student',
  },
};
const DEMO_SESSION_KEY = 'preplens_demo_auth';

function ensureAuthReady() {
  if (!hasFirebaseConfig || !auth) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values in your .env file.');
  }
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getDemoSession() {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setDemoSession(user) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
}

function clearDemoSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
}

function getRoleFromEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return DEMO_USERS[normalized] || null;
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
  const demoUser = getRoleFromEmail(email);
  if (demoUser) {
    setDemoSession(demoUser);
    return demoUser;
  }

  ensureAuthReady();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  clearDemoSession();
  return { ...userCredential.user, role: 'student' };
}

export async function logoutStudent() {
  clearDemoSession();
  if (hasFirebaseConfig && auth) {
    await signOut(auth);
  }
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
  if (user?.role === 'admin') return user;

  const allowed = await isAdminUser(user.uid);
  if (!allowed) {
    await logoutStudent();
    throw new Error('Unauthorized: admin access required.');
  }
  return { ...user, role: 'admin' };
}

export function getCurrentStudent() {
  const demoSession = getDemoSession();
  if (demoSession) return demoSession;
  return auth?.currentUser || null;
}

export function getCurrentUserRole() {
  const current = getCurrentStudent();
  if (!current) return null;
  const email = String(current.email || '').toLowerCase();
  if (email === 'admin@email.com' || current.role === 'admin') return 'admin';
  if (email === 'student@email.com' || current.role === 'student') return 'student';
  return null;
}

export function subscribeToStudentAuth(callback) {
  const demoSession = getDemoSession();
  if (demoSession) {
    callback(demoSession);
    return () => {};
  }

  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
