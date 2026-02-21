import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { readLocalCollection, uid, writeLocalCollection } from '../../../utils/localDb';

const LOCAL_KEY = 'preplens_local_weekly_goals';
const ALL_STUDENTS = '__all_students__';

function normalizeGoal(id, data) {
  const createdAt = typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : Number(data.createdAt) || Date.now();
  return {
    id,
    uid: data.uid,
    title: data.title || 'Weekly Goal',
    target: Number(data.target) || 0,
    achieved: Number(data.achieved) || 0,
    weekStart: Number(data.weekStart) || Date.now(),
    autoAdjust: data.autoAdjust !== false,
    createdAt,
  };
}

export async function createWeeklyGoal({ uid: userId, title, target, weekStart, autoAdjust = true }) {
  if (!userId || !title) throw new Error('Goal owner and title are required.');
  const payload = {
    uid: userId,
    title,
    target: Number(target) || 0,
    achieved: 0,
    weekStart: Number(weekStart) || Date.now(),
    autoAdjust,
    createdAt: serverTimestamp(),
  };

  if (!db) {
    const items = readLocalCollection(LOCAL_KEY, []);
    items.unshift({ ...payload, id: uid('goal'), createdAt: Date.now() });
    writeLocalCollection(LOCAL_KEY, items);
    return;
  }

  await addDoc(collection(db, 'weeklyGoals'), payload);
}

export function subscribeWeeklyGoals(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!db) {
    const emit = () => {
      const items = readLocalCollection(LOCAL_KEY, [])
        .filter((goal) => goal.uid === userId || goal.uid === ALL_STUDENTS)
        .sort((a, b) => (b.weekStart || 0) - (a.weekStart || 0));
      callback(items);
    };
    emit();
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_KEY) return;
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  const ownQuery = query(collection(db, 'weeklyGoals'), where('uid', '==', userId), orderBy('createdAt', 'desc'));
  const allQuery = query(collection(db, 'weeklyGoals'), where('uid', '==', ALL_STUDENTS), orderBy('createdAt', 'desc'));

  let personal = [];
  let shared = [];
  const emit = () => callback([...personal, ...shared]);

  const unsubOwn = onSnapshot(ownQuery, (snapshot) => {
    personal = snapshot.docs.map((entry) => normalizeGoal(entry.id, entry.data()));
    emit();
  });
  const unsubAll = onSnapshot(allQuery, (snapshot) => {
    shared = snapshot.docs.map((entry) => normalizeGoal(entry.id, entry.data()));
    emit();
  });

  return () => {
    unsubOwn();
    unsubAll();
  };
}

export function adjustGoalTarget(currentTarget, achievedCount) {
  const safeTarget = Number(currentTarget) || 0;
  const safeAchieved = Number(achievedCount) || 0;
  if (safeAchieved >= safeTarget) return safeTarget + 1;
  if (safeAchieved <= Math.max(1, Math.floor(safeTarget * 0.4))) return Math.max(1, safeTarget - 1);
  return safeTarget;
}

export { ALL_STUDENTS as GOAL_ALL_STUDENTS_SCOPE };
