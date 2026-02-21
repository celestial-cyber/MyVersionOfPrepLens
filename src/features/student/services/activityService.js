import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  query,
  setDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { calculateReadiness } from '../../../utils/readinessCalculator';

const LOCAL_ACTIVITIES_KEY = 'preplens_local_activities';
const LOCAL_USERS_KEY = 'preplens_local_users';
const CATEGORY_FALLBACK = 'technical';
const ALLOWED_CATEGORIES = ['aptitude', 'technical', 'verbal', 'softskills'];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
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

function setLocalActivities(items) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(items));
}

function getStartOfDayMillis(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getNextStreak(previousStreak, lastActiveAt, nextActiveAt) {
  const prevDay = getStartOfDayMillis(lastActiveAt || 0);
  const nextDay = getStartOfDayMillis(nextActiveAt);
  const diffDays = Math.round((nextDay - prevDay) / (24 * 60 * 60 * 1000));

  if (!prevDay) return 1;
  if (diffDays === 0) return previousStreak;
  if (diffDays === 1) return previousStreak + 1;
  return 1;
}

function normalizeActivity(data) {
  const createdAt =
    typeof data.createdAt?.toMillis === 'function'
      ? data.createdAt.toMillis()
      : Number(data.createdAt) || Date.now();
  return {
    id: data.id || `local-${createdAt}`,
    day: data.day || 'N/A',
    hours: Number(data.hours) || 0,
    topic: data.topic || 'General study',
    category: String(data.category || CATEGORY_FALLBACK).toLowerCase(),
    createdAt,
  };
}

export function getRecentActivities() {
  return getLocalActivities().map((item) => normalizeActivity(item));
}

export async function logActivity(entry) {
  const hours = Number(entry.hours);
  const topic = String(entry.topic || '').trim() || 'General study';
  const rawCategory = String(entry.category || CATEGORY_FALLBACK).trim().toLowerCase();
  const normalizedCategory = rawCategory === 'soft-skills' ? 'softskills' : rawCategory;
  const category = ALLOWED_CATEGORIES.includes(normalizedCategory) ? normalizedCategory : CATEGORY_FALLBACK;
  const userId = entry.userId || null;
  if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
    throw new Error('Hours must be between 0.5 and 24.');
  }
  if (!userId) {
    throw new Error('Please login before logging activity.');
  }

  const day = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const payload = {
    day,
    hours,
    topic,
    category,
    userId,
    createdAt: serverTimestamp(),
  };

  if (db && userId) {
    await addDoc(collection(db, 'activities'), payload);
    try {
      const progressRef = doc(db, 'progress', userId);
      const progressSnap = await getDoc(progressRef);
      const existing = progressSnap.exists() ? progressSnap.data() : {};
      const previousReadiness = Number(existing.readinessScore) || 0;
      const previousStreak = Number(existing.streakDays) || 0;
      const lastActiveAt =
        typeof existing.lastActiveAt?.toMillis === 'function'
          ? existing.lastActiveAt.toMillis()
          : Number(existing.lastActiveAt) || 0;
      const currentMillis = Date.now();
      const nextReadiness = Math.min(
        100,
        Math.max(previousReadiness, calculateReadiness({ hoursStudied: hours, completedTasks: 0, totalTasks: 1 }))
      );
      const nextStreak = getNextStreak(previousStreak, lastActiveAt, currentMillis);

      await setDoc(
        progressRef,
        {
          readinessScore: nextReadiness,
          streakDays: nextStreak,
          lastActiveAt: currentMillis,
        },
        { merge: true }
      );
    } catch (progressError) {
      console.error('Failed to update progress after activity log.', progressError);
    }
    return { success: true, entry: payload };
  }

  const createdAt = Date.now();
  const localEntry = { id: `local-${createdAt}`, day, hours, topic, category, userId, createdAt };
  const allActivities = getLocalActivities();
  const nextActivities = [localEntry, ...allActivities];
  setLocalActivities(nextActivities);

  if (canUseStorage()) {
    try {
      const rawUsers = window.localStorage.getItem(LOCAL_USERS_KEY);
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const safeUsers = Array.isArray(users) ? users : [];
      const byUser = nextActivities.filter((item) => item.userId === userId);
      const totalHours = byUser.reduce((acc, item) => acc + (Number(item.hours) || 0), 0);
      const avgHours = byUser.length ? totalHours / byUser.length : 0;

      const nextUsers = safeUsers.map((user) => {
        if (user.uid !== userId) return user;
        const previousStreak = Number(user.streakDays) || 0;
        const nextStreak = getNextStreak(previousStreak, user.lastActiveAt, createdAt);
        return {
          ...user,
          readinessScore: Math.min(
            100,
            Math.max(Number(user.readinessScore) || 0, calculateReadiness({ hoursStudied: avgHours, completedTasks: 0, totalTasks: 1 }))
          ),
          streakDays: nextStreak,
          lastActiveAt: createdAt,
        };
      });
      window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(nextUsers));
    } catch (error) {
      console.error('Failed to update local user progress.', error);
    }
  }

  return { success: true, entry: localEntry };
}

export async function fetchActivitiesForUser(userId) {
  if (!userId) {
    return [];
  }

  if (!db) {
    return getLocalActivities()
      .filter((item) => item.userId === userId)
      .map((item) => normalizeActivity(item))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  try {
    const activitiesRef = collection(db, 'activities');
    const activitiesQuery = query(activitiesRef, where('userId', '==', userId));
    const snapshot = await getDocs(activitiesQuery);
    return snapshot.docs.map((doc) => normalizeActivity(doc.data()));
  } catch (error) {
    console.error('Failed to read activities from Firebase.', error);
    return [];
  }
}

export function subscribeActivitiesForUser(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!db) {
    const emit = () => {
      const items = getLocalActivities()
        .filter((item) => item.userId === userId)
        .map((item) => normalizeActivity(item))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(items);
    };
    emit();
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_ACTIVITIES_KEY) return;
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  try {
    const activitiesRef = collection(db, 'activities');
    const activitiesQuery = query(activitiesRef, where('userId', '==', userId));
    return onSnapshot(
      activitiesQuery,
      (snapshot) => {
        callback(snapshot.docs.map((doc) => normalizeActivity({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error('Failed to subscribe to activities.', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Failed to start activity subscription.', error);
    callback([]);
    return () => {};
  }
}
