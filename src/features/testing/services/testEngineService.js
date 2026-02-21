import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { QUESTION_BANK, QUESTION_CATEGORIES } from '../data/questionBank';
import { randomShuffle, readLocalCollection, uid, uniqueById, writeLocalCollection } from '../../../utils/localDb';
import { buildAIReport, weakAreaMessage } from '../../insights/utils/aiAnalyzer';
import { createAdminTask } from '../../admin/services/adminDataService';
import { pushNotification } from '../../notifications/services/notificationService';

const LOCAL_TESTS_KEY = 'preplens_local_tests';
const LOCAL_RESULTS_KEY = 'preplens_local_test_results';
const LOCAL_REPORTS_KEY = 'preplens_local_ai_reports';
const ALL_STUDENTS_SCOPE = '__all_students__';

function normalizeTest(id, data) {
  const createdAt = typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : Number(data.createdAt) || Date.now();
  const deadline = typeof data.deadline?.toMillis === 'function' ? data.deadline.toMillis() : Number(data.deadline) || null;
  return {
    id,
    title: data.title || 'Untitled Test',
    createdBy: data.createdBy || 'admin',
    categories: Array.isArray(data.categories) ? data.categories : QUESTION_CATEGORIES,
    assignedTo: Array.isArray(data.assignedTo) ? data.assignedTo : [ALL_STUDENTS_SCOPE],
    deadline,
    difficulty: data.difficulty || 'medium',
    questionIds: Array.isArray(data.questionIds) ? data.questionIds : [],
    createdAt,
  };
}

function normalizeResult(id, data) {
  const submittedAt = typeof data.submittedAt?.toMillis === 'function' ? data.submittedAt.toMillis() : Number(data.submittedAt) || Date.now();
  return {
    id,
    uid: data.uid,
    testId: data.testId,
    answers: Array.isArray(data.answers) ? data.answers : [],
    score: Number(data.score) || 0,
    categoryWiseScore: data.categoryWiseScore || {},
    timeTaken: Number(data.timeTaken) || 0,
    submittedAt,
  };
}

function normalizeReport(id, data) {
  return {
    id,
    uid: data.uid,
    testId: data.testId,
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
    improvementPlan: Array.isArray(data.improvementPlan) ? data.improvementPlan : [],
    detailedAnalysis: Array.isArray(data.detailedAnalysis) ? data.detailedAnalysis : [],
    lackingAreas: Array.isArray(data.lackingAreas) ? data.lackingAreas : [],
    summary: data.summary || '',
    weakestCategory: data.weakestCategory || 'aptitude',
    generatedAt: typeof data.generatedAt?.toMillis === 'function' ? data.generatedAt.toMillis() : Number(data.generatedAt) || Date.now(),
  };
}

function getQuestionsByIds(ids = []) {
  const map = new Map(QUESTION_BANK.map((item) => [item.questionId, item]));
  return ids.map((id) => map.get(id)).filter(Boolean);
}

function pickQuestions(categories = QUESTION_CATEGORIES) {
  const selectedCategories = categories.length ? categories : QUESTION_CATEGORIES;
  const perCategory = Math.max(1, Math.floor(20 / selectedCategories.length));
  let picked = [];

  selectedCategories.forEach((category) => {
    const pool = QUESTION_BANK.filter((item) => item.category === category);
    picked = [...picked, ...randomShuffle(pool).slice(0, perCategory)];
  });

  if (picked.length < 20) {
    const remaining = QUESTION_BANK.filter((question) => !picked.find((item) => item.questionId === question.questionId));
    picked = [...picked, ...randomShuffle(remaining).slice(0, 20 - picked.length)];
  }

  if (picked.length > 20) picked = picked.slice(0, 20);
  return uniqueById(picked, 'questionId').slice(0, 20);
}

function seededShuffle(items = [], seedValue = '') {
  const seed = String(seedValue || 'seed').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return [...items]
    .map((item, index) => ({ item, rank: Math.sin(seed + index * 13.37) }))
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.item);
}

export async function createTest({ title, createdBy, categories, assignedTo, deadline, difficulty }) {
  const chosenQuestions = pickQuestions(categories);
  const payload = {
    title: String(title || '').trim(),
    createdBy: createdBy || 'admin',
    categories: categories?.length ? categories : QUESTION_CATEGORIES,
    assignedTo: assignedTo?.length ? assignedTo : [ALL_STUDENTS_SCOPE],
    deadline: deadline ? Number(deadline) : null,
    difficulty: difficulty || 'medium',
    questionIds: chosenQuestions.map((question) => question.questionId),
    createdAt: serverTimestamp(),
  };

  if (!payload.title) throw new Error('Test title is required.');

  if (!db) {
    const tests = readLocalCollection(LOCAL_TESTS_KEY, []);
    const test = { ...payload, id: uid('test'), createdAt: Date.now() };
    tests.unshift(test);
    writeLocalCollection(LOCAL_TESTS_KEY, tests);
    const recipients = payload.assignedTo.includes(ALL_STUDENTS_SCOPE) ? [] : payload.assignedTo;
    await Promise.all(
      recipients.map((studentId) =>
        pushNotification({ userId: studentId, title: 'New test assigned', message: `${payload.title} has been assigned.` })
      )
    );
    return test;
  }

  const ref = await addDoc(collection(db, 'tests'), payload);
  const recipients = payload.assignedTo.includes(ALL_STUDENTS_SCOPE) ? [] : payload.assignedTo;
  await Promise.all(
    recipients.map((studentId) =>
      pushNotification({ userId: studentId, title: 'New test assigned', message: `${payload.title} has been assigned.` })
    )
  );
  return { id: ref.id, ...payload };
}

export function subscribeTestsForStudent(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!db) {
    const emit = () => {
      const tests = readLocalCollection(LOCAL_TESTS_KEY, [])
        .filter((item) => Array.isArray(item.assignedTo) && (item.assignedTo.includes(userId) || item.assignedTo.includes(ALL_STUDENTS_SCOPE)))
        .map((item) => normalizeTest(item.id, item))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(tests);
    };
    emit();
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_TESTS_KEY) return;
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  const ownQuery = query(collection(db, 'tests'), where('assignedTo', 'array-contains', userId), orderBy('createdAt', 'desc'));
  const allQuery = query(collection(db, 'tests'), where('assignedTo', 'array-contains', ALL_STUDENTS_SCOPE), orderBy('createdAt', 'desc'));

  let own = [];
  let shared = [];
  const emit = () => callback(uniqueById([...own, ...shared], 'id').sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));

  const unsubOwn = onSnapshot(ownQuery, (snapshot) => {
    own = snapshot.docs.map((entry) => normalizeTest(entry.id, entry.data()));
    emit();
  });
  const unsubAll = onSnapshot(allQuery, (snapshot) => {
    shared = snapshot.docs.map((entry) => normalizeTest(entry.id, entry.data()));
    emit();
  });

  return () => {
    unsubOwn();
    unsubAll();
  };
}

export function subscribeAllTests(callback) {
  if (!db) {
    const emit = () => {
      const tests = readLocalCollection(LOCAL_TESTS_KEY, []).map((item) => normalizeTest(item.id, item));
      callback(tests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    };
    emit();
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_TESTS_KEY) return;
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  const q = query(collection(db, 'tests'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((entry) => normalizeTest(entry.id, entry.data()))), () => callback([]));
}

export function getTestQuestionsForStudent(test, userId) {
  const questions = getQuestionsByIds(test?.questionIds || []);
  return seededShuffle(questions, `${userId}-${test?.id || ''}`);
}

export async function submitTestAttempt({ uid: userId, test, answers = [], timeTaken = 0, activityCategoryHours = {}, mockInterviewAverage = 0 }) {
  if (!userId || !test?.id) throw new Error('Invalid test submission request.');

  const questions = getTestQuestionsForStudent(test, userId);
  const byCategory = {};
  let correct = 0;

  const normalizedAnswers = questions.map((question, index) => {
    const selected = Number(answers[index]);
    const isCorrect = selected === question.correctAnswer;
    if (isCorrect) correct += 1;

    if (!byCategory[question.category]) byCategory[question.category] = { correct: 0, total: 0 };
    byCategory[question.category].total += 1;
    if (isCorrect) byCategory[question.category].correct += 1;

    return {
      questionId: question.questionId,
      selectedAnswer: Number.isFinite(selected) ? selected : -1,
      correctAnswer: question.correctAnswer,
      isCorrect,
      category: question.category,
    };
  });

  const totalQuestions = questions.length || 20;
  const score = Math.round((correct / totalQuestions) * 100);
  const categoryWiseScore = Object.entries(byCategory).reduce((acc, [category, values]) => {
    acc[category] = values.total ? Math.round((values.correct / values.total) * 100) : 0;
    return acc;
  }, {});

  const resultPayload = {
    uid: userId,
    testId: test.id,
    answers: normalizedAnswers,
    score,
    categoryWiseScore,
    timeTaken: Number(timeTaken) || 0,
    submittedAt: serverTimestamp(),
  };

  let resultId = uid('result');

  if (!db) {
    const results = readLocalCollection(LOCAL_RESULTS_KEY, []);
    const row = { ...resultPayload, id: resultId, submittedAt: Date.now() };
    results.unshift(row);
    writeLocalCollection(LOCAL_RESULTS_KEY, results);
  } else {
    const resultRef = await addDoc(collection(db, 'testResults'), resultPayload);
    resultId = resultRef.id;
  }

  const aiReport = buildAIReport({
    uid: userId,
    testId: test.id,
    categoryWiseScore,
    activityCategoryHours,
    mockInterviewAverage,
  });

  const reportPayload = {
    uid: aiReport.uid,
    testId: aiReport.testId,
    strengths: aiReport.strengths,
    weaknesses: aiReport.weaknesses,
    improvementPlan: aiReport.improvementPlan,
    detailedAnalysis: aiReport.detailedAnalysis,
    lackingAreas: aiReport.lackingAreas,
    summary: aiReport.summary,
    weakestCategory: aiReport.weakestCategory,
    generatedAt: db ? serverTimestamp() : Date.now(),
  };

  if (!db) {
    const reports = readLocalCollection(LOCAL_REPORTS_KEY, []);
    reports.unshift({ ...reportPayload, id: uid('report'), generatedAt: Date.now() });
    writeLocalCollection(LOCAL_REPORTS_KEY, reports);
  } else {
    await addDoc(collection(db, 'aiReports'), reportPayload);
  }

  // Auto assign three AI tasks from improvement plan
  await Promise.all(
    aiReport.improvementPlan.map((task) =>
      createAdminTask({ userId, title: `[AI] ${task}`, createdBy: 'ai-engine', status: 'pending' })
    )
  );

  await pushNotification({
    userId,
    title: 'AI analysis ready',
    message: weakAreaMessage(aiReport.weakestCategory),
    type: 'insight',
  });

  return {
    resultId,
    score,
    categoryWiseScore,
    report: aiReport,
  };
}

export function subscribeResultsByUser(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!db) {
    const emit = () => {
      const results = readLocalCollection(LOCAL_RESULTS_KEY, [])
        .filter((entry) => entry.uid === userId)
        .map((entry) => normalizeResult(entry.id, entry))
        .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
      callback(results);
    };
    emit();
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_RESULTS_KEY) return;
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  const q = query(collection(db, 'testResults'), where('uid', '==', userId), orderBy('submittedAt', 'desc'));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((entry) => normalizeResult(entry.id, entry.data()))), () => callback([]));
}

export function subscribeReportsByUser(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!db) {
    const emit = () => {
      const reports = readLocalCollection(LOCAL_REPORTS_KEY, [])
        .filter((entry) => entry.uid === userId)
        .map((entry) => normalizeReport(entry.id, entry))
        .sort((a, b) => (b.generatedAt || 0) - (a.generatedAt || 0));
      callback(reports);
    };
    emit();
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_REPORTS_KEY) return;
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  const q = query(collection(db, 'aiReports'), where('uid', '==', userId), orderBy('generatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((entry) => normalizeReport(entry.id, entry.data()))), () => callback([]));
}

export function subscribeReportsForAdmin(callback) {
  if (!db) {
    const emit = () => {
      const reports = readLocalCollection(LOCAL_REPORTS_KEY, [])
        .map((entry) => normalizeReport(entry.id, entry))
        .sort((a, b) => (b.generatedAt || 0) - (a.generatedAt || 0));
      callback(reports);
    };
    emit();
    const onStorage = (event) => {
      if (event.key && event.key !== LOCAL_REPORTS_KEY) return;
      emit();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }

  const q = query(collection(db, 'aiReports'), orderBy('generatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((entry) => normalizeReport(entry.id, entry.data()))), () => callback([]));
}

export async function listResultsForAdmin() {
  if (!db) {
    return readLocalCollection(LOCAL_RESULTS_KEY, []).map((entry) => normalizeResult(entry.id, entry));
  }
  const snapshot = await getDocs(query(collection(db, 'testResults'), orderBy('submittedAt', 'desc')));
  return snapshot.docs.map((entry) => normalizeResult(entry.id, entry.data()));
}

export { ALL_STUDENTS_SCOPE };
