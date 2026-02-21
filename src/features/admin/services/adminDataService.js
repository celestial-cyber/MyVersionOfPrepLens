import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';

const DAY_MS = 24 * 60 * 60 * 1000;
const LOCAL_USERS_KEY = 'preplens_local_users';
const LOCAL_TASKS_KEY = 'preplens_local_tasks';
const LOCAL_ACTIVITIES_KEY = 'preplens_local_activities';
const CATEGORY_KEYS = ['aptitude', 'technical', 'verbal', 'softskills'];
const GLOBAL_TEST_SCOPE = '__all_students__';
const TASK_STATUS = ['pending', 'in_progress', 'completed'];

const DEMO_ACTIVITY_MAP = {
  'demo-student-uid': [
    { id: 'a1', day: 'Mon', hours: 2.5, topic: 'Algebra drill', category: 'technical', createdAt: Date.now() - DAY_MS },
    { id: 'a2', day: 'Tue', hours: 1.75, topic: 'Reading comprehension', category: 'verbal', createdAt: Date.now() - 2 * DAY_MS },
    { id: 'a3', day: 'Thu', hours: 2, topic: 'Mock test review', category: 'aptitude', createdAt: Date.now() - 4 * DAY_MS },
  ],
  'demo-student-uid-2': [
    { id: 'b1', day: 'Mon', hours: 3, topic: 'Physics numericals', category: 'technical', createdAt: Date.now() - DAY_MS },
    { id: 'b2', day: 'Wed', hours: 2.25, topic: 'Chemistry revision', category: 'technical', createdAt: Date.now() - 3 * DAY_MS },
    { id: 'b3', day: 'Fri', hours: 2.5, topic: 'Formula recap', category: 'aptitude', createdAt: Date.now() - 5 * DAY_MS },
  ],
  'demo-student-uid-3': [
    { id: 'c1', day: 'Tue', hours: 1, topic: 'Vocabulary', category: 'verbal', createdAt: Date.now() - 6 * DAY_MS },
    { id: 'c2', day: 'Thu', hours: 1.5, topic: 'History notes', category: 'softskills', createdAt: Date.now() - 7 * DAY_MS },
  ],
  'demo-student-uid-4': [
    { id: 'd1', day: 'Sun', hours: 2.2, topic: 'Probability practice', category: 'aptitude', createdAt: Date.now() - 2 * DAY_MS },
    { id: 'd2', day: 'Tue', hours: 2.8, topic: 'Mock paper analysis', category: 'technical', createdAt: Date.now() - 5 * DAY_MS },
    { id: 'd3', day: 'Thu', hours: 1.4, topic: 'Error notebook revision', category: 'softskills', createdAt: Date.now() - 8 * DAY_MS },
  ],
  'demo-student-uid-5': [
    { id: 'e1', day: 'Mon', hours: 0.9, topic: 'Biology diagrams', category: 'technical', createdAt: Date.now() - 4 * DAY_MS },
    { id: 'e2', day: 'Wed', hours: 1.2, topic: 'Organic chemistry recap', category: 'verbal', createdAt: Date.now() - 9 * DAY_MS },
  ],
  'demo-student-uid-6': [
    { id: 'f1', day: 'Sat', hours: 3.5, topic: 'Quant aptitude marathon', category: 'aptitude', createdAt: Date.now() - DAY_MS },
    { id: 'f2', day: 'Thu', hours: 2.7, topic: 'Logical reasoning set', category: 'technical', createdAt: Date.now() - 3 * DAY_MS },
    { id: 'f3', day: 'Tue', hours: 2.1, topic: 'Verbal section timed test', category: 'verbal', createdAt: Date.now() - 6 * DAY_MS },
    { id: 'f4', day: 'Sun', hours: 1.5, topic: 'Interview prep notes', category: 'softskills', createdAt: Date.now() - 10 * DAY_MS },
  ],
  'demo-student-uid-7': [
    { id: 'g1', day: 'Mon', hours: 1.8, topic: 'Speed math drills', category: 'aptitude', createdAt: Date.now() - 2 * DAY_MS },
    { id: 'g2', day: 'Wed', hours: 2.2, topic: 'OOP revision', category: 'technical', createdAt: Date.now() - 4 * DAY_MS },
    { id: 'g3', day: 'Fri', hours: 1.4, topic: 'Mock HR answers', category: 'softskills', createdAt: Date.now() - 6 * DAY_MS },
  ],
  'demo-student-uid-8': [
    { id: 'h1', day: 'Tue', hours: 2.9, topic: 'Graphs and tables', category: 'aptitude', createdAt: Date.now() - DAY_MS },
    { id: 'h2', day: 'Thu', hours: 2.4, topic: 'JS problem solving', category: 'technical', createdAt: Date.now() - 3 * DAY_MS },
    { id: 'h3', day: 'Sat', hours: 1.3, topic: 'Reading practice', category: 'verbal', createdAt: Date.now() - 5 * DAY_MS },
  ],
  'demo-student-uid-9': [
    { id: 'i1', day: 'Mon', hours: 0.8, topic: 'Resume points update', category: 'softskills', createdAt: Date.now() - 5 * DAY_MS },
    { id: 'i2', day: 'Thu', hours: 1.1, topic: 'Grammar quiz', category: 'verbal', createdAt: Date.now() - 7 * DAY_MS },
  ],
  'demo-student-uid-10': [
    { id: 'j1', day: 'Sun', hours: 3.1, topic: 'Arrays and hashing', category: 'technical', createdAt: Date.now() - 2 * DAY_MS },
    { id: 'j2', day: 'Tue', hours: 2.0, topic: 'Percentages worksheet', category: 'aptitude', createdAt: Date.now() - 4 * DAY_MS },
    { id: 'j3', day: 'Thu', hours: 1.6, topic: 'Group discussion prep', category: 'softskills', createdAt: Date.now() - 8 * DAY_MS },
  ],
  'demo-student-uid-11': [
    { id: 'k1', day: 'Sat', hours: 2.6, topic: 'DBMS normalization', category: 'technical', createdAt: Date.now() - DAY_MS },
    { id: 'k2', day: 'Wed', hours: 1.9, topic: 'Reasoning puzzle set', category: 'aptitude', createdAt: Date.now() - 3 * DAY_MS },
    { id: 'k3', day: 'Mon', hours: 1.2, topic: 'Email writing', category: 'verbal', createdAt: Date.now() - 6 * DAY_MS },
  ],
  'demo-student-uid-12': [
    { id: 'l1', day: 'Tue', hours: 1.4, topic: 'Interview confidence practice', category: 'softskills', createdAt: Date.now() - 2 * DAY_MS },
    { id: 'l2', day: 'Thu', hours: 1.7, topic: 'Data interpretation', category: 'aptitude', createdAt: Date.now() - 5 * DAY_MS },
  ],
  'demo-student-uid-13': [
    { id: 'm1', day: 'Mon', hours: 2.4, topic: 'React hooks revision', category: 'technical', createdAt: Date.now() - DAY_MS },
    { id: 'm2', day: 'Wed', hours: 1.8, topic: 'Vocabulary building', category: 'verbal', createdAt: Date.now() - 3 * DAY_MS },
    { id: 'm3', day: 'Fri', hours: 2.0, topic: 'Probability timed test', category: 'aptitude', createdAt: Date.now() - 6 * DAY_MS },
  ],
  'demo-student-uid-14': [
    { id: 'n1', day: 'Tue', hours: 0.9, topic: 'Communication feedback review', category: 'softskills', createdAt: Date.now() - 4 * DAY_MS },
    { id: 'n2', day: 'Sat', hours: 1.0, topic: 'Critical reasoning', category: 'technical', createdAt: Date.now() - 9 * DAY_MS },
  ],
  'demo-student-uid-15': [
    { id: 'o1', day: 'Sun', hours: 3.2, topic: 'Dynamic programming basics', category: 'technical', createdAt: Date.now() - DAY_MS },
    { id: 'o2', day: 'Thu', hours: 2.7, topic: 'Mock aptitude test', category: 'aptitude', createdAt: Date.now() - 3 * DAY_MS },
    { id: 'o3', day: 'Tue', hours: 1.5, topic: 'HR behavioral set', category: 'softskills', createdAt: Date.now() - 6 * DAY_MS },
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
  {
    id: 'demo-student-uid-7',
    uid: 'demo-student-uid-7',
    name: 'Aditya Rao',
    email: 'aditya.student@email.com',
    targetExam: 'GATE',
    grade: 'College',
    readinessScore: 68,
    streakDays: 5,
    completedTasks: 10,
  },
  {
    id: 'demo-student-uid-8',
    uid: 'demo-student-uid-8',
    name: 'Nisha Patil',
    email: 'nisha.student@email.com',
    targetExam: 'CAT',
    grade: 'College',
    readinessScore: 79,
    streakDays: 7,
    completedTasks: 16,
  },
  {
    id: 'demo-student-uid-9',
    uid: 'demo-student-uid-9',
    name: 'Karan Desai',
    email: 'karan.student@email.com',
    targetExam: 'NEET',
    grade: '12',
    readinessScore: 42,
    streakDays: 1,
    completedTasks: 4,
  },
  {
    id: 'demo-student-uid-10',
    uid: 'demo-student-uid-10',
    name: 'Pooja Menon',
    email: 'pooja.student@email.com',
    targetExam: 'JEE Main',
    grade: '12',
    readinessScore: 84,
    streakDays: 8,
    completedTasks: 18,
  },
  {
    id: 'demo-student-uid-11',
    uid: 'demo-student-uid-11',
    name: 'Rahul Singh',
    email: 'rahul.student@email.com',
    targetExam: 'GATE',
    grade: 'College',
    readinessScore: 73,
    streakDays: 6,
    completedTasks: 13,
  },
  {
    id: 'demo-student-uid-12',
    uid: 'demo-student-uid-12',
    name: 'Ananya Gupta',
    email: 'ananya.student@email.com',
    targetExam: 'CUET',
    grade: '12',
    readinessScore: 58,
    streakDays: 3,
    completedTasks: 7,
  },
  {
    id: 'demo-student-uid-13',
    uid: 'demo-student-uid-13',
    name: 'Vikram Joshi',
    email: 'vikram.student@email.com',
    targetExam: 'CAT',
    grade: 'College',
    readinessScore: 81,
    streakDays: 9,
    completedTasks: 19,
  },
  {
    id: 'demo-student-uid-14',
    uid: 'demo-student-uid-14',
    name: 'Meera Kulkarni',
    email: 'meera.student@email.com',
    targetExam: 'NEET',
    grade: '12',
    readinessScore: 37,
    streakDays: 0,
    completedTasks: 3,
  },
  {
    id: 'demo-student-uid-15',
    uid: 'demo-student-uid-15',
    name: 'Arjun Malhotra',
    email: 'arjun.student@email.com',
    targetExam: 'JEE Advanced',
    grade: '12',
    readinessScore: 93,
    streakDays: 14,
    completedTasks: 27,
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
  const rawCategory = String(data.category || 'technical').toLowerCase();
  const category = rawCategory === 'soft-skills' ? 'softskills' : rawCategory;
  return {
    id,
    userId: data.userId || data.uid || '',
    day: data.day || (createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'),
    hours: toNumber(data.hours, 0),
    topic: data.topic || 'General study',
    category: CATEGORY_KEYS.includes(category) ? category : 'technical',
    createdAt,
  };
}

function normalizeTask(id, data) {
  const fallbackStatus = data.completed ? 'completed' : 'pending';
  const status = TASK_STATUS.includes(String(data.status || '').toLowerCase())
    ? String(data.status).toLowerCase()
    : fallbackStatus;
  return {
    id,
    userId: data.userId || '',
    title: data.title || 'Untitled task',
    status,
    completed: status === 'completed',
    scope: data.scope || 'single',
    updatedAt: toMillis(data.updatedAt) || null,
    createdAt: toMillis(data.createdAt) || null,
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

function getCategoryTotals(activities = []) {
  const totals = { aptitude: 0, technical: 0, verbal: 0, softskills: 0 };
  activities.forEach((activity) => {
    const key = String(activity.category || 'technical').toLowerCase();
    if (totals[key] === undefined) return;
    totals[key] += toNumber(activity.hours, 0);
  });
  return totals;
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

function getLocalActivities() {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ACTIVITIES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getLocalTasks() {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_TASKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getCompletedTaskCount(userId) {
  if (!userId) return 0;
  return getLocalTasks().reduce((count, task) => {
    const matchesUser = task.userId === userId || task.userId === GLOBAL_TEST_SCOPE || task.scope === 'all';
    if (!matchesUser) return count;
    const status = String(task.status || '').toLowerCase();
    const isCompleted = status ? status === 'completed' : Boolean(task.completed);
    return isCompleted ? count + 1 : count;
  }, 0);
}

function getLocalStudents() {
  const localActivities = getLocalActivities();
  return getLocalUsers().map((user) => {
    const uid = user.uid || `local-${String(user.email || '').toLowerCase()}`;
    const activities = localActivities
      .filter((item) => item.userId === uid)
      .map((item) => normalizeActivity(item.id || `local-${item.createdAt || Date.now()}`, item))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return {
      id: uid,
      uid,
      name: user.displayName || user.name || 'Student',
      email: String(user.email || '').toLowerCase(),
      targetExam: user.targetExam || 'General',
      grade: user.grade || '',
      readinessScore: toNumber(user.readinessScore, 0),
      streakDays: toNumber(user.streakDays, 0),
      completedTasks: Math.max(toNumber(user.completedTasks, 0), getCompletedTaskCount(uid)),
      totalActivities: activities.length,
      lastActiveAt: activities[0]?.createdAt || toMillis(user.lastActiveAt),
      lastActivityTopic: activities[0]?.topic || 'No activity logged',
      categoryTotals: getCategoryTotals(activities),
      createdAt: toMillis(user.createdAt),
      registrationType: 'Portal',
    };
  });
}

function getDemoStudents() {
  const baseStudents = DEMO_STUDENTS_BASE.map((student, index) => {
    const activities = getDemoActivitiesByUserId(student.uid);
    return {
      ...student,
      completedTasks: Math.max(student.completedTasks, getCompletedTaskCount(student.uid)),
      totalActivities: activities.length,
      lastActiveAt: activities[0]?.createdAt || null,
      lastActivityTopic: activities[0]?.topic || 'No activity logged',
      categoryTotals: getCategoryTotals(activities),
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
  if (!db) {
    return getLocalActivities()
      .filter((item) => item.userId === userId)
      .map((item) => normalizeActivity(item.id || `local-${item.createdAt || Date.now()}`, item))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

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
          categoryTotals: getCategoryTotals(activities),
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

export async function createAdminTask({ userId, title, completed = false, status = 'pending', createdBy = 'admin' }) {
  const normalizedTitle = String(title || '').trim();
  const normalizedUserId = String(userId || '').trim();
  const isGlobal = normalizedUserId === GLOBAL_TEST_SCOPE;
  const normalizedStatus = TASK_STATUS.includes(String(status || '').toLowerCase())
    ? String(status).toLowerCase()
    : completed
      ? 'completed'
      : 'pending';
  if (!userId) {
    throw new Error('Please select a student.');
  }
  if (!normalizedTitle) {
    throw new Error('Task title is required.');
  }

  if (!db) {
    if (!canUseStorage()) {
      throw new Error('Unable to save task in this environment.');
    }
    const raw = window.localStorage.getItem(LOCAL_TASKS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(existing) ? existing : [];
    next.push(
      {
        id: `local-task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId: normalizedUserId,
        title: normalizedTitle,
        completed: normalizedStatus === 'completed',
        status: normalizedStatus,
        scope: isGlobal ? 'all' : 'single',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy,
      }
    );
    window.localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(next));
    return { id: next[next.length - 1].id };
  }

  if (isGlobal) {
    return addDoc(collection(db, 'tasks'), {
      userId: GLOBAL_TEST_SCOPE,
      title: normalizedTitle,
      completed: normalizedStatus === 'completed',
      status: normalizedStatus,
      scope: 'all',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy,
    });
  }

  return addDoc(collection(db, 'tasks'), {
    userId: normalizedUserId,
    title: normalizedTitle,
    completed: normalizedStatus === 'completed',
    status: normalizedStatus,
    scope: 'single',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy,
  });
}

export async function getTasksByUserId(userId) {
  if (!userId) return [];

  if (!db) {
    if (!canUseStorage()) return [];
    try {
      const raw = window.localStorage.getItem(LOCAL_TASKS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const items = Array.isArray(parsed) ? parsed : [];
      return items
        .filter((task) => task.userId === userId || task.userId === GLOBAL_TEST_SCOPE || task.scope === 'all')
        .map((task) => normalizeTask(task.id || `local-${task.title}`, task))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } catch {
      return [];
    }
  }

  const tasksRef = collection(db, 'tasks');
  const [personal, global] = await Promise.all([
    getDocs(query(tasksRef, where('userId', '==', userId))),
    getDocs(query(tasksRef, where('userId', '==', GLOBAL_TEST_SCOPE))),
  ]);

  return mergeById([
    ...personal.docs.map((item) => normalizeTask(item.id, item.data())),
    ...global.docs.map((item) => normalizeTask(item.id, item.data())),
  ]).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function deleteAdminTask(taskId) {
  const normalizedTaskId = String(taskId || '').trim();
  if (!normalizedTaskId) {
    throw new Error('Task ID is required.');
  }

  if (!db) {
    if (!canUseStorage()) {
      throw new Error('Unable to delete task in this environment.');
    }
    const raw = window.localStorage.getItem(LOCAL_TASKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const tasks = Array.isArray(parsed) ? parsed : [];
    const nextTasks = tasks.filter((task) => task.id !== normalizedTaskId);
    window.localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(nextTasks));
    return;
  }

  await deleteDoc(doc(db, 'tasks', normalizedTaskId));
}
