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

const LOCAL_KEY = 'preplens_local_mock_interviews';

function normalize(id, data) {
  const interviewDate = Number(data.interviewDate) || Date.now();
  const createdAt = typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : Number(data.createdAt) || Date.now();
  return {
    id,
    uid: data.uid,
    interviewDate,
    feedbackScore: Number(data.feedbackScore) || 0,
    weakAreas: Array.isArray(data.weakAreas) ? data.weakAreas : [],
    notes: data.notes || '',
    createdAt,
  };
}

export async function logMockInterview({ uid: userId, interviewDate, feedbackScore, weakAreas = [], notes = '' }) {
  if (!userId) throw new Error('User is required.');
  const payload = {
    uid: userId,
    interviewDate: Number(interviewDate) || Date.now(),
    feedbackScore: Number(feedbackScore) || 0,
    weakAreas,
    notes,
    createdAt: serverTimestamp(),
  };

  if (!db) {
    const items = readLocalCollection(LOCAL_KEY, []);
    items.unshift({ ...payload, id: uid('mock'), createdAt: Date.now() });
    writeLocalCollection(LOCAL_KEY, items);
    return;
  }

  await addDoc(collection(db, 'mockInterviews'), payload);
}

export function subscribeMockInterviews(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!db) {
    const emit = () => {
      const items = readLocalCollection(LOCAL_KEY, [])
        .filter((entry) => entry.uid === userId)
        .sort((a, b) => (b.interviewDate || 0) - (a.interviewDate || 0));
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

  const q = query(
    collection(db, 'mockInterviews'),
    where('uid', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((entry) => normalize(entry.id, entry.data()))),
    () => callback([])
  );
}

export function averageMockScore(items = []) {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => sum + (Number(item.feedbackScore) || 0), 0);
  return Math.round((total / items.length) * 100) / 100;
}
