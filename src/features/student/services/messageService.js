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

const localMessages = [];

function normalizeMessage(id, data) {
  const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
  return {
    id,
    userId: data.userId || '',
    text: data.text || '',
    from: data.from || 'admin',
    createdAt,
  };
}

export async function appendAdminMessage({ userId, text }) {
  const trimmed = String(text || '').trim();
  if (!userId) throw new Error('Select a student before sending a message.');
  if (!trimmed) throw new Error('Message cannot be empty.');

  const payload = {
    userId,
    text: trimmed,
    from: 'admin',
    createdAt: serverTimestamp(),
  };

  if (!db) {
    localMessages.push({ id: `local-${Date.now()}`, ...payload, createdAt: Date.now() });
    return;
  }

  await addDoc(collection(db, 'messages'), payload);
}

export function subscribeMessagesForUser(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!db) {
    callback(localMessages.filter((item) => item.userId === userId));
    return () => {};
  }

  const messagesRef = collection(db, 'messages');
  const messagesQuery = query(messagesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(
    messagesQuery,
    (snapshot) => callback(snapshot.docs.map((doc) => normalizeMessage(doc.id, doc.data()))),
    (error) => {
      console.error('Failed to subscribe to messages.', error);
      callback([]);
    }
  );
}
