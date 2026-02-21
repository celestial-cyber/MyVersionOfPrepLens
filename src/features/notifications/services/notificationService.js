import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { readLocalCollection, uid, writeLocalCollection } from '../../../utils/localDb';

const LOCAL_NOTIFICATIONS_KEY = 'preplens_local_notifications';

function normalizeNotification(id, data) {
  const createdAt = typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : Number(data.createdAt) || Date.now();
  return {
    id,
    userId: data.userId,
    title: data.title || 'Notification',
    message: data.message || '',
    type: data.type || 'info',
    createdAt,
    read: Boolean(data.read),
  };
}

export async function pushNotification({ userId, title, message, type = 'info' }) {
  if (!userId || !message) return;
  if (!db) {
    const items = readLocalCollection(LOCAL_NOTIFICATIONS_KEY, []);
    items.unshift({ id: uid('note'), userId, title: title || 'Notification', message, type, createdAt: Date.now(), read: false });
    writeLocalCollection(LOCAL_NOTIFICATIONS_KEY, items);
    return;
  }

  await addDoc(collection(db, 'notifications'), {
    userId,
    title: title || 'Notification',
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeNotifications(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!db) {
    const emit = () => {
      const items = readLocalCollection(LOCAL_NOTIFICATIONS_KEY, [])
        .filter((item) => item.userId === userId)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(items);
    };
    emit();
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_NOTIFICATIONS_KEY) return;
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((entry) => normalizeNotification(entry.id, entry.data()))),
    () => callback([])
  );
}
