import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';

const LOCAL_MESSAGES_KEY = 'preplens_local_messages';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getLocalMessages() {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_MESSAGES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLocalMessages(items) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(items));
}

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
    const next = [
      { id: `local-${Date.now()}`, userId, text: trimmed, from: 'admin', createdAt: Date.now() },
      ...getLocalMessages(),
    ];
    setLocalMessages(next);
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
    const emit = () => {
      const items = getLocalMessages()
        .filter((item) => item.userId === userId)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(items);
    };
    emit();
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_MESSAGES_KEY) return;
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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

export async function deleteMessageForUser({ userId, messageId }) {
  if (!userId) throw new Error('User is required.');
  if (!messageId) throw new Error('Message is required.');

  if (!db) {
    const next = getLocalMessages().filter((item) => !(item.id === messageId && item.userId === userId));
    setLocalMessages(next);
    return;
  }

  const messageRef = doc(db, 'messages', messageId);
  const messageSnap = await getDoc(messageRef);
  if (!messageSnap.exists()) return;
  const message = messageSnap.data() || {};
  if (message.userId !== userId) {
    throw new Error('You can only delete your own message.');
  }
  await deleteDoc(messageRef);
}
