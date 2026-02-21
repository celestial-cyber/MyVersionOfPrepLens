import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';

const DAY_MS = 24 * 60 * 60 * 1000;
const LOCAL_USERS_KEY = 'preplens_local_users';

const DEMO_ACTIVITY_MAP = {
  'demo-student-uid': [
    { id: 'a1', day: 'Mon', hours: 2.5, topic: 'Algebra drill', createdAt: Date.now() - DAY_MS },
    { id: 'a2', day: 'Tue', hours: 1.75, topic: 'Reading comprehension', createdAt: Date.now() - 2 * DAY_MS },
    { id: 'a3', day: 'Thu', hours: 2, topic: 'Mock test review', createdAt: Date.now() - 4 * DAY_MS },
  ],
  'demo-student-uid-2': [
    { id: 'b1', day: 'Mon', hours: 3, topic: 'Physics numericals', createdAt: Date.now() - DAY_MS },
    { id: 'b2', day: 'Wed', hours: 2.25, topic: 'Chemistry revision', createdAt: Date.now() - 3 * DAY_MS },
    { id: 'b3', day: 'Fri', hours: 2.5, topic: 'Formula recap', createdAt: Date.now() - 5 * DAY_MS },
  ],
  'demo-student-uid-3': [
    { id: 'c1', day: 'Tue', hours: 1, topic: 'Vocabulary', createdAt: Date.now() - 6 * DAY_MS },
    { id: 'c2', day: 'Thu', hours: 1.5, topic: 'History notes', createdAt: Date.now() - 7 * DAY_MS },
  ],
  'demo-student-uid-4': [
    { id: 'd1', day: 'Sun', hours: 2.2, topic: 'Probability practice', createdAt: Date.now() - 2 * DAY_MS },
    { id: 'd2', day: 'Tue', hours: 2.8, topic: 'Mock paper analysis', createdAt: Date.now() - 5 * DAY_MS },
    { id: 'd3', day: 'Thu', hours: 1.4, topic: 'Error notebook revision', createdAt: Date.now() - 8 * DAY_MS },
  ],
  'demo-student-uid-5': [
    { id: 'e1', day: 'Mon', hours: 0.9, topic: 'Biology diagrams', createdAt: Date.now() - 4 * DAY_MS },
    { id: 'e2', day: 'Wed', hours: 1.2, topic: 'Organic chemistry recap', createdAt: Date.now() - 9 * DAY_MS },
  ],
  'demo-student-uid-6': [
    { id: 'f1', day: 'Sat', hours: 3.5, topic: 'Quant aptitude marathon', createdAt: Date.now() - DAY_MS },
    { id: 'f2', day: 'Thu', hours: 2.7, topic: 'Logical reasoning set', createdAt: Date.now() - 3 * DAY_MS },
    { id: 'f3', day: 'Tue', hours: 2.1, topic: 'Verbal section timed test', createdAt: Date.now() - 6 * DAY_MS },
    { id: 'f4', day: 'Sun', hours: 1.5, topic: 'Interview prep notes', createdAt: Date.now() - 10 * DAY_MS },
  ],
};

const DEMO_STUDENTS_BASE = [
  {
    id: 'demo-student-uid',
    uid: 'demo-student-uid',
    name: 'Aarav Sharma',
    email: 'student@email.com',
    targetExam: 'JEE Main',
    grade: '12',
    readinessScore: 82,
    streakDays: 6,
    completedTasks: 14,
  },
  {
    id: 'demo-student-uid-2',
    uid: 'demo-student-uid-2',
    name: 'Maya Iyer',
    email: 'maya.student@email.com',
    targetExam: 'NEET',
    grade: '12',
    readinessScore: 74,
    streakDays: 4,
    completedTasks: 11,
  },
  {
    id: 'demo-student-uid-3',
    uid: 'demo-student-uid-3',
    name: 'Rohan Mehta',
    email: 'rohan.student@email.com',
    targetExam: 'CUET',
    grade: '11',
    readinessScore: 56,
    streakDays: 2,
    completedTasks: 8,
  },
  {
    id: 'demo-student-uid-4',
    uid: 'demo-student-uid-4',
    name: 'Sneha Kapoor',
    email: 'sneha.student@email.com',
    targetExam: 'JEE Advanced',
    grade: '12',
    readinessScore: 88,
    streakDays: 9,
    completedTasks: 17,
  },
  {
    id: 'demo-student-uid-5',
    uid: 'demo-student-uid-5',
    name: 'Ishan Verma',
    email: 'ishan.student@email.com',
    targetExam: 'NEET',
    grade: '11',
    readinessScore: 49,
    streakDays: 1,
    completedTasks: 5,
  },
  {
    id: 'demo-student-uid-6',
    uid: 'demo-student-uid-6',
    name: 'Diya Nair',
    email: 'diya.student@email.com',
    targetExam: 'CAT',
    grade: 'College',
    readinessScore: 91,
    streakDays: 12,
    completedTasks: 24,
  },
];

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function normalizeActivity(id, data) {
  const createdAt = toMillis(data.createdAt) || toMillis(data.date);
  return {
    id,
    userId: data.userId || data.uid || '',
    day: data.day || (createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'),
    hours: toNumber(data.hours, 0),
    topic: data.topic || 'General study',
    createdAt,
  };
}

function mergeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function getDemoActivitiesByUserId(userId) {
  const items = DEMO_ACTIVITY_MAP[userId] || [];
  return items
    .map((item) => ({
      ...item,
      userId,
    }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
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

function getLocalStudents() {
  return getLocalUsers().map((user) => ({
    id: user.uid || `local-${String(user.email || '').toLowerCase()}`,
    uid: user.uid || `local-${String(user.email || '').toLowerCase()}`,
    name: user.displayName || user.name || 'Student',
    email: String(user.email || '').toLowerCase(),
    targetExam: user.targetExam || 'General',
    grade: user.grade || '',
    readinessScore: toNumber(user.readinessScore, 0),
    streakDays: toNumber(user.streakDays, 0),
    completedTasks: toNumber(user.completedTasks, 0),
    totalActivities: 0,
    lastActiveAt: null,
    lastActivityTopic: 'No activity logged',
    createdAt: toMillis(user.createdAt),
    registrationType: 'Portal',
  }));
}

function getDemoStudents() {
  const baseStudents = DEMO_STUDENTS_BASE.map((student, index) => {
    const activities = getDemoActivitiesByUserId(student.uid);
    return {
      ...student,
      totalActivities: activities.length,
      lastActiveAt: activities[0]?.createdAt || null,
      lastActivityTopic: activities[0]?.topic || 'No activity logged',
      createdAt: Date.now() - (30 - index * 3) * DAY_MS,
      registrationType: 'Demo',
    };
  });

  const merged = [...baseStudents];
  const existingEmails = new Set(baseStudents.map((student) => String(student.email || '').toLowerCase()));
  const existingUids = new Set(baseStudents.map((student) => student.uid));

  getLocalStudents().forEach((student) => {
    const email = String(student.email || '').toLowerCase();
    if (existingUids.has(student.uid) || existingEmails.has(email)) return;
    merged.push(student);
  });

  return merged;
}

export async function getActivitiesByUserId(userId) {
  if (!userId) return [];
  if (DEMO_ACTIVITY_MAP[userId]) return getDemoActivitiesByUserId(userId);
  if (!db) return [];

  const activitiesRef = collection(db, 'activities');
  const [byUserId, byLegacyUid] = await Promise.all([
    getDocs(query(activitiesRef, where('userId', '==', userId))),
    getDocs(query(activitiesRef, where('uid', '==', userId))),
  ]);

  return mergeById([
    ...byUserId.docs.map((item) => normalizeActivity(item.id, item.data())),
    ...byLegacyUid.docs.map((item) => normalizeActivity(item.id, item.data())),
  ]).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getAllStudents() {
  if (!db) return getDemoStudents();

  try {
    const profilesRef = collection(db, 'profiles');
    const snapshot = await getDocs(profilesRef);
    if (snapshot.empty) return getDemoStudents();

    const students = await Promise.all(
      snapshot.docs.map(async (profileDoc) => {
        const uid = profileDoc.id;
        const profile = profileDoc.data() || {};
        const progressDoc = await getDoc(doc(db, 'progress', uid));
        const progress = progressDoc.exists() ? progressDoc.data() : {};
        const activities = await getActivitiesByUserId(uid);

        return {
          id: uid,
          uid,
          name: profile.name || 'Unknown',
          email: profile.email || '',
          targetExam: profile.targetExam || '',
          grade: profile.grade || '',
          readinessScore: toNumber(progress.readinessScore, 0),
          streakDays: toNumber(progress.streakDays, 0),
          completedTasks: toNumber(progress.completedTasks, 0),
          totalActivities: activities.length,
          lastActiveAt: activities[0]?.createdAt || null,
          lastActivityTopic: activities[0]?.topic || 'No activity logged',
          createdAt: toMillis(profile.createdAt),
          registrationType: 'Portal',
        };
      })
    );

    return students.length ? students : getDemoStudents();
  } catch {
    return getDemoStudents();
  }
}

export function subscribeAllStudents(callback, onError) {
  if (!db) {
    callback(getDemoStudents());
    return () => {};
  }

  const profilesRef = collection(db, 'profiles');
  return onSnapshot(
    profilesRef,
    async () => {
      try {
        const students = await getAllStudents();
        callback(students);
      } catch (error) {
        if (onError) onError(error);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function createAdminTask({ userId, title, completed = false }) {
  if (!db) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values in your .env file.');
  }

  const normalizedTitle = String(title || '').trim();
  if (!userId) {
    throw new Error('Please select a student.');
  }
  if (!normalizedTitle) {
    throw new Error('Task title is required.');
  }

  return addDoc(collection(db, 'tasks'), {
    userId,
    title: normalizedTitle,
    completed: Boolean(completed),
  });
}
