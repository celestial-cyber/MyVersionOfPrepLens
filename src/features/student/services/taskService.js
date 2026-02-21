import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';

const LOCAL_TASKS_KEY = 'preplens_local_tasks';
const LOCAL_USERS_KEY = 'preplens_local_users';
const GLOBAL_TASK_USER_ID = '__all_students__';
const TASK_STATUS = ['pending', 'in_progress', 'completed'];

function normalizeTask(id, data) {
  const fallbackStatus = data.completed ? 'completed' : 'pending';
  const status = TASK_STATUS.includes(String(data.status || '').toLowerCase())
    ? String(data.status).toLowerCase()
    : fallbackStatus;
  return {
    id,
    userId: data.userId || '',
    title: data.title || 'Untitled task',
    completed: status === 'completed',
    status,
    scope: data.scope || 'single',
    updatedAt: Number(data.updatedAt) || 0,
    sourceTaskId: data.sourceTaskId || '',
  };
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getLocalTasksForUser(userId) {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_TASKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    return list
      .filter((task) => task.userId === userId || task.userId === GLOBAL_TASK_USER_ID || task.scope === 'all')
      .map((task) => normalizeTask(task.id || `local-${task.title}`, task));
  } catch {
    return [];
  }
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

function setLocalUsers(users) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function countCompletedTasks(tasks, userId) {
  return tasks.filter((task) => task.userId === userId && task.status === 'completed').length;
}

async function syncCompletedTaskCount(userId) {
  if (!userId) return;
  if (!db) {
    const users = getLocalUsers();
    const tasks = getLocalTasksForUser(userId);
    const completedTasks = countCompletedTasks(tasks, userId);
    const nextUsers = users.map((user) =>
      user.uid === userId
        ? {
            ...user,
            completedTasks,
          }
        : user
    );
    setLocalUsers(nextUsers);
    return;
  }

  try {
    const userTasksQuery = query(collection(db, 'tasks'), where('userId', '==', userId));
    const userTasksSnapshot = await getDocs(userTasksQuery);
    const completedTasks = userTasksSnapshot.docs.reduce((count, taskDoc) => {
      const data = taskDoc.data() || {};
      const status = String(data.status || '').toLowerCase();
      const isCompleted = status ? status === 'completed' : Boolean(data.completed);
      return isCompleted ? count + 1 : count;
    }, 0);
    await setDoc(
      doc(db, 'progress', userId),
      {
        completedTasks,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to sync completed tasks count.', error);
  }
}

export function subscribeTasksForUser(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!db) {
    callback(getLocalTasksForUser(userId));
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_TASKS_KEY) return;
      callback(getLocalTasksForUser(userId));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  try {
    const tasksRef = collection(db, 'tasks');
    const personalQuery = query(tasksRef, where('userId', '==', userId));
    const globalQuery = query(tasksRef, where('userId', '==', GLOBAL_TASK_USER_ID));
    let personalTasks = [];
    let globalTasks = [];

    const emit = () => {
      // For admin-global template tasks, prefer user-specific overrides (same sourceTaskId).
      const byKey = new Map();
      [...globalTasks, ...personalTasks].forEach((task) => {
        const key = task.sourceTaskId || task.id;
        byKey.set(key, task);
      });
      callback(Array.from(byKey.values()));
    };

    const unsubscribePersonal = onSnapshot(
      personalQuery,
      (snapshot) => {
        personalTasks = snapshot.docs.map((doc) => normalizeTask(doc.id, doc.data()));
        emit();
      },
      (error) => {
        console.error('Failed to subscribe to tasks.', error);
        personalTasks = [];
        emit();
      }
    );

    const unsubscribeGlobal = onSnapshot(
      globalQuery,
      (snapshot) => {
        globalTasks = snapshot.docs.map((doc) => normalizeTask(doc.id, doc.data()));
        emit();
      },
      (error) => {
        console.error('Failed to subscribe to global tasks.', error);
        globalTasks = [];
        emit();
      }
    );

    return () => {
      unsubscribePersonal();
      unsubscribeGlobal();
    };
  } catch (error) {
    console.error('Failed to start tasks subscription.', error);
    callback([]);
    return () => {};
  }
}

export async function updateTaskProgress({ userId, taskId, status }) {
  const safeStatus = String(status || '').toLowerCase();
  if (!userId) throw new Error('User is required.');
  if (!taskId) throw new Error('Task is required.');
  if (!TASK_STATUS.includes(safeStatus)) throw new Error('Invalid task status.');

  const completed = safeStatus === 'completed';

  if (!db) {
    if (!canUseStorage()) throw new Error('Unable to update task in this environment.');
    const raw = window.localStorage.getItem(LOCAL_TASKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const tasks = Array.isArray(parsed) ? parsed : [];
    const nextTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;
      if (task.userId !== userId && task.userId !== GLOBAL_TASK_USER_ID && task.scope !== 'all') return task;
      return {
        ...task,
        status: safeStatus,
        completed,
        updatedAt: Date.now(),
      };
    });
    window.localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(nextTasks));
    await syncCompletedTaskCount(userId);
    return;
  }

  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);
  const taskData = taskSnap.exists() ? taskSnap.data() || {} : {};
  const isGlobalTemplateTask =
    taskData.userId === GLOBAL_TASK_USER_ID || String(taskData.scope || '').toLowerCase() === 'all';

  if (isGlobalTemplateTask) {
    const personalTaskRef = doc(db, 'tasks', `${taskId}__${userId}`);
    await setDoc(
      personalTaskRef,
      {
        userId,
        title: taskData.title || 'Untitled task',
        scope: 'single',
        sourceTaskId: taskId,
        status: safeStatus,
        completed,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } else {
    await updateDoc(taskRef, {
      status: safeStatus,
      completed,
      updatedAt: Date.now(),
    });
  }

  await syncCompletedTaskCount(userId);
}
