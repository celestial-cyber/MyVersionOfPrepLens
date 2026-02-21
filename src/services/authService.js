import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
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
const LOCAL_USERS_KEY = 'preplens_local_users';

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

function getLocalUsers() {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalUsers(users) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function sanitizeLocalUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.name || 'Student',
    name: user.displayName || user.name || 'Student',
    role: 'student',
  };
}

export async function registerStudent({ name, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const displayName = String(name || '').trim() || 'Student';

  if (!hasFirebaseConfig || !auth) {
    const demoUser = getRoleFromEmail(normalizedEmail);
    if (demoUser) {
      throw new Error('This demo email already exists. Use a different email.');
    }

    const users = getLocalUsers();
    const exists = users.some((item) => String(item.email || '').toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const localUser = {
      uid: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email: normalizedEmail,
      displayName,
      role: 'student',
      password: String(password || ''),
      createdAt: Date.now(),
    };
    setLocalUsers([...users, localUser]);
    const sessionUser = sanitizeLocalUser(localUser);
    setDemoSession(sessionUser);
    return sessionUser;
  }

  ensureAuthReady();
  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }

  if (db) {
    const uid = userCredential.user.uid;

    await Promise.all([
      setDoc(
        doc(db, 'profiles', uid),
        {
          name: displayName,
          email: normalizedEmail,
          targetExam: '',
          grade: '',
          role: 'student',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ),
      setDoc(
        doc(db, 'progress', uid),
        {
          readinessScore: 0,
          streakDays: 0,
          completedTasks: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ),
    ]);
  }

  return userCredential.user;
}

export async function loginStudent({ email, password }) {
  const demoUser = getRoleFromEmail(email);
  if (demoUser) {
    setDemoSession(demoUser);
    return demoUser;
  }

  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!hasFirebaseConfig || !auth) {
    const localUser = getLocalUsers().find(
      (item) =>
        String(item.email || '').toLowerCase() === normalizedEmail &&
        String(item.password || '') === String(password || '')
    );
    if (!localUser) {
      throw new Error('Invalid credentials. Please check email/password or register first.');
    }
    const sessionUser = sanitizeLocalUser(localUser);
    setDemoSession(sessionUser);
    return sessionUser;
  }

  ensureAuthReady();
  const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
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
