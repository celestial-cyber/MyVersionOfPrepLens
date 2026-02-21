import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';

function normalizeTask(id, data) {
  return {
    id,
    title: data.title || 'Untitled task',
    completed: Boolean(data.completed),
  };
}

export function subscribeTasksForUser(userId, callback) {
  if (!db || !userId) {
    callback([]);
    return () => {};
  }

  try {
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(tasksRef, where('userId', '==', userId));
    return onSnapshot(
      tasksQuery,
      (snapshot) => {
        callback(snapshot.docs.map((doc) => normalizeTask(doc.id, doc.data())));
      },
      (error) => {
        console.error('Failed to subscribe to tasks.', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Failed to start tasks subscription.', error);
    callback([]);
    return () => {};
  }
}
