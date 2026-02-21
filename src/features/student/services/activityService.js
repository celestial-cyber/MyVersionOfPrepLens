import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';

const activities = [];

function normalizeActivity(data) {
  return {
    day: data.day || 'N/A',
    hours: Number(data.hours) || 0,
    topic: data.topic || 'General study',
  };
}

export function getRecentActivities() {
  return activities;
}

export async function logActivity(entry) {
  const hours = Number(entry.hours) || 0;
  const topic = entry.topic || 'General study';
  const day = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const payload = {
    day,
    hours,
    topic,
    userId: entry.userId || null,
    createdAt: serverTimestamp(),
  };

  if (db && entry.userId) {
    await addDoc(collection(db, 'activities'), payload);
    return { success: true, entry: payload };
  }

  activities.push({ day, hours, topic });
  return { success: true, entry: { day, hours, topic } };
}

export async function fetchActivitiesForUser(userId) {
  if (!db || !userId) {
    return [];
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
  if (!db || !userId) {
    callback([]);
    return () => {};
  }

  try {
    const activitiesRef = collection(db, 'activities');
    const activitiesQuery = query(activitiesRef, where('userId', '==', userId));
    return onSnapshot(
      activitiesQuery,
      (snapshot) => {
        callback(snapshot.docs.map((doc) => normalizeActivity(doc.data())));
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
