import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';

function mapProfile(data) {
  if (!data) return null;
  return {
    name: data.name || '',
    email: data.email || '',
    targetExam: data.targetExam || '',
    grade: data.grade || '',
  };
}

function mapProgress(data) {
  if (!data) return null;
  return {
    readinessScore: Number(data.readinessScore) || 0,
    streakDays: Number(data.streakDays) || 0,
    completedTasks: Number(data.completedTasks) || 0,
  };
}

export function subscribeStudentProfile(userId, callback) {
  if (!db || !userId) {
    callback(null);
    return () => {};
  }

  return onSnapshot(
    doc(db, 'profiles', userId),
    (snapshot) => callback(snapshot.exists() ? mapProfile(snapshot.data()) : null),
    (error) => {
      console.error('Failed to subscribe to student profile.', error);
      callback(null);
    }
  );
}

export function subscribeStudentProgress(userId, callback) {
  if (!db || !userId) {
    callback(null);
    return () => {};
  }

  return onSnapshot(
    doc(db, 'progress', userId),
    (snapshot) => callback(snapshot.exists() ? mapProgress(snapshot.data()) : null),
    (error) => {
      console.error('Failed to subscribe to student progress.', error);
      callback(null);
    }
  );
}
