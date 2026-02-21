import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ActivityChart from '../dashboard/components/ActivityChart';
import StreakCard from '../dashboard/components/StreakCard';
import StreakHeatmap from '../dashboard/components/StreakHeatmap';
import SummaryCards from '../dashboard/components/SummaryCards';
import TaskList from '../dashboard/components/TaskList';
import { subscribeActivitiesForUser } from '../services/activityService';
import { subscribeMessagesForUser } from '../services/messageService';
import { subscribeStudentProfile, subscribeStudentProgress } from '../services/studentDataService';
import { subscribeTasksForUser } from '../services/taskService';
import { getCurrentStudent, subscribeToStudentAuth } from '../../../services/authService';
import { calculateReadiness } from '../../../utils/readinessCalculator';
import { subscribeResultsByUser } from '../../testing/services/testEngineService';
import { subscribeTestsForStudent } from '../../testing/services/testEngineService';
import { subscribeNotifications } from '../../notifications/services/notificationService';
import { pushNotification } from '../../notifications/services/notificationService';
import { predictPlacementReadiness, consistencyTier } from '../../insights/utils/placementReadiness';
import { weakAreaMessage } from '../../insights/utils/aiAnalyzer';
import '../styles/studentDashboard.css';

const CORE_CATEGORIES = ['aptitude', 'technical', 'verbal', 'softskills'];
const ALL_CATEGORIES = ['aptitude', 'technical', 'verbal', 'softskills'];

function getWeekdayLabel(offset) {
  const value = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
  return value.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatCategoryLabel(value) {
  return String(value || '')
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export default function StudentDashboard() {
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [messages, setMessages] = useState([]);
  const [student, setStudent] = useState(getCurrentStudent());
  const [testResults, setTestResults] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let stopActivities = () => {};
    let stopTasks = () => {};
    let stopProfile = () => {};
    let stopProgress = () => {};
    let stopMessages = () => {};
    let stopResults = () => {};
    let stopNotifications = () => {};
    let stopTests = () => {};

    const stopAuth = subscribeToStudentAuth((user) => {
      setStudent(user);
      stopActivities();
      stopTasks();
      stopProfile();
      stopProgress();
      stopMessages();
      stopResults();
      stopNotifications();
      stopTests();

      if (!user?.uid) {
        setActivities([]);
        setTasks([]);
        setProfile(null);
        setProgress(null);
        setMessages([]);
        setTestResults([]);
        setNotifications([]);
        setAssignedTests([]);
        return;
      }

      stopActivities = subscribeActivitiesForUser(user.uid, setActivities);
      stopTasks = subscribeTasksForUser(user.uid, setTasks);
      stopProfile = subscribeStudentProfile(user.uid, setProfile);
      stopProgress = subscribeStudentProgress(user.uid, setProgress);
      stopMessages = subscribeMessagesForUser(user.uid, setMessages);
      stopResults = subscribeResultsByUser(user.uid, setTestResults);
      stopNotifications = subscribeNotifications(user.uid, setNotifications);
      stopTests = subscribeTestsForStudent(user.uid, setAssignedTests);
    });

    return () => {
      stopActivities();
      stopTasks();
      stopProfile();
      stopProgress();
      stopMessages();
      stopResults();
      stopNotifications();
      stopTests();
      stopAuth();
    };
  }, []);

  const computed = useMemo(() => {
    const hoursStudied = activities.reduce((acc, item) => acc + item.hours, 0);
    const completedTasks = progress?.completedTasks ?? tasks.filter((task) => task.completed).length;
    const totalActivities = activities.length;
    const streakDays = progress?.streakDays ?? 0;
    const now = Date.now();
    const weekHours = activities
      .filter((item) => (item.createdAt || 0) >= now - 7 * 24 * 60 * 60 * 1000)
      .reduce((acc, item) => acc + (item.hours || 0), 0);

    const categoryHours = ALL_CATEGORIES.reduce((acc, category) => ({ ...acc, [category]: 0 }), {});
    activities.forEach((item) => {
      const key = String(item.category || 'technical').toLowerCase();
      if (categoryHours[key] === undefined) categoryHours[key] = 0;
      categoryHours[key] += Number(item.hours) || 0;
    });

    const weakAreas = [...CORE_CATEGORIES]
      .map((category) => ({ category, hours: categoryHours[category] || 0 }))
      .sort((a, b) => a.hours - b.hours)
      .slice(0, 2);

    const dailyMap = {};
    for (let i = 6; i >= 0; i -= 1) {
      const label = getWeekdayLabel(i);
      dailyMap[label] = 0;
    }
    activities.forEach((item) => {
      const label = new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyMap[label] !== undefined) {
        dailyMap[label] += Number(item.hours) || 0;
      }
    });

    const weeklyBuckets = [0, 0, 0, 0];
    activities.forEach((item) => {
      const diffDays = Math.floor((now - (item.createdAt || now)) / (24 * 60 * 60 * 1000));
      if (diffDays < 0 || diffDays >= 28) return;
      const index = Math.min(3, Math.floor(diffDays / 7));
      weeklyBuckets[index] += Number(item.hours) || 0;
    });

    return {
      hoursStudied,
      completedTasks,
      totalActivities,
      streakDays,
      weekHours: Math.round(weekHours * 100) / 100,
      categoryHours,
      weakAreas,
      weakAreasCount: weakAreas.filter((item) => item.hours <= 2).length,
      dailyData: Object.entries(dailyMap).map(([label, value]) => ({ label, value })),
      weeklyData: [
        { label: 'This Week', value: Math.round(weeklyBuckets[0] * 100) / 100 },
        { label: 'Last Week', value: Math.round(weeklyBuckets[1] * 100) / 100 },
        { label: '2 Weeks Ago', value: Math.round(weeklyBuckets[2] * 100) / 100 },
        { label: '3 Weeks Ago', value: Math.round(weeklyBuckets[3] * 100) / 100 },
      ],
      coreCategoryData: CORE_CATEGORIES.map((category) => ({
        label: formatCategoryLabel(category),
        value: Math.round((categoryHours[category] || 0) * 100) / 100,
      })),
    };
  }, [activities, progress, tasks]);

  const readiness =
    progress?.readinessScore ??
    calculateReadiness({
      hoursStudied: computed.hoursStudied,
      completedTasks: computed.completedTasks,
      totalTasks: tasks.length,
    });
  const recentMessages = messages.slice(0, 4);
  const recentNotifications = notifications.slice(0, 4);
  const avgTestScore = testResults.length
    ? Math.round(
        testResults.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / testResults.length
      )
    : 0;
  const weakestCategory = computed.weakAreas[0]?.category || 'aptitude';
  const consistency = consistencyTier({
    streakDays: computed.streakDays,
    activityCount: computed.totalActivities,
    testAverage: avgTestScore,
  });
  const placementPrediction = predictPlacementReadiness({
    coding: computed.categoryHours.technical || avgTestScore,
    aptitude: computed.categoryHours.aptitude || avgTestScore,
    technical: avgTestScore,
    softSkills: computed.categoryHours.softskills || 0,
  });
  const stats = {
    ...computed,
    readiness,
  };
  const attemptedTestIds = useMemo(() => new Set(testResults.map((item) => item.testId)), [testResults]);
  const pendingTests = useMemo(
    () => assignedTests.filter((test) => !attemptedTestIds.has(test.id)),
    [assignedTests, attemptedTestIds]
  );

  useEffect(() => {
    if (!student?.uid) return;
    const storageKey = `preplens-reminder-${student.uid}-${new Date().toDateString()}`;
    const hasActivityToday = activities.some((item) => {
      const created = new Date(item.createdAt || 0);
      return created.toDateString() === new Date().toDateString();
    });
    if (!hasActivityToday && !window.localStorage.getItem(storageKey)) {
      pushNotification({
        userId: student.uid,
        title: 'Daily reminder',
        message: 'You missed activity today. Log at least one focused session.',
        type: 'reminder',
      });
      window.localStorage.setItem(storageKey, '1');
    }
  }, [activities, student?.uid]);

  useEffect(() => {
    if (!student?.uid || testResults.length < 2) return;
    const latest = Number(testResults[0]?.score) || 0;
    const previous = Number(testResults[1]?.score) || 0;
    const guardKey = `preplens-score-alert-${student.uid}-${testResults[0]?.id || 'latest'}`;
    if (latest + 10 < previous && !window.localStorage.getItem(guardKey)) {
      pushNotification({
        userId: student.uid,
        title: 'Performance alert',
        message: 'Your score dropped this week. Review weak topics and reattempt practice sets.',
        type: 'alert',
      });
      window.localStorage.setItem(guardKey, '1');
    }
  }, [student?.uid, testResults]);

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Student Dashboard</h1>
      <section className="dashboard-section">
        <h3 className="dashboard-section-title">Profile</h3>
        <p className="dashboard-meta"><strong>Name:</strong> {profile?.name || student?.displayName || 'Not set'}</p>
        <p className="dashboard-meta"><strong>Email:</strong> {profile?.email || student?.email || 'Not set'}</p>
        <p className="dashboard-meta"><strong>Target Exam:</strong> {profile?.targetExam || 'Not set'}</p>
        <p className="dashboard-meta"><strong>Grade:</strong> {profile?.grade || 'Not set'}</p>
      </section>
      <p className="dashboard-readiness">Prep readiness: {readiness}%</p>
      <section className="dashboard-section dashboard-section-hover">
        <h3 className="dashboard-section-title">Consistency & Placement Predictor</h3>
        <p className="dashboard-meta">Consistency tier: <strong>{consistency}</strong></p>
        <p className="dashboard-meta">Placement readiness predictor: <strong>{placementPrediction.score}%</strong> ({placementPrediction.indicator})</p>
        <p className="dashboard-meta">Weak area analyzer: {weakAreaMessage(weakestCategory)}</p>
      </section>
      <section className="dashboard-section dashboard-section-hover">
        <h3 className="dashboard-section-title">Assigned Tests</h3>
        <p className="dashboard-meta">Available tests: {pendingTests.length}</p>
        <p className="dashboard-meta">Completed tests: {testResults.length}</p>
        {pendingTests.length > 0 ? (
          <ul className="dashboard-simple-list">
            {pendingTests.slice(0, 4).map((test) => (
              <li key={test.id}>{test.title}</li>
            ))}
          </ul>
        ) : (
          <p className="dashboard-empty">No pending test right now.</p>
        )}
        <Link to="/student/tests" className="task-delete-btn" style={{ display: 'inline-block', marginTop: '0.6rem' }}>
          Attempt Test & View Progress
        </Link>
      </section>
      <SummaryCards stats={stats} />
      <ActivityChart
        data={computed.dailyData}
        title="Daily Progress (Last 7 Days)"
        datasetLabel="Hours"
        color="rgba(202, 184, 244, 0.9)"
        borderColor="#9b86d8"
      />
      <ActivityChart
        data={computed.weeklyData}
        title="Weekly Progress (Last 4 Weeks)"
        datasetLabel="Total Hours"
        color="rgba(181, 156, 236, 0.9)"
        borderColor="#8f79cf"
      />
      <ActivityChart
        data={computed.coreCategoryData}
        title="Category Progress: Aptitude, Technical, Verbal, Softskills"
        datasetLabel="Hours by Category"
        color="rgba(154, 124, 222, 0.92)"
        borderColor="#7f67c7"
      />
      <section className="dashboard-section dashboard-section-hover">
        <h3 className="dashboard-section-title">Weak Areas</h3>
        {computed.weakAreas.length === 0 ? (
          <p className="dashboard-empty">No weak areas detected yet.</p>
        ) : (
          <ul className="dashboard-simple-list">
            {computed.weakAreas.map((item) => (
              <li key={item.category}>
                {formatCategoryLabel(item.category)}: {Math.round(item.hours * 100) / 100} hrs
              </li>
            ))}
          </ul>
        )}
      </section>
      <StreakCard streakDays={computed.streakDays} />
      <StreakHeatmap activities={activities} />
      <TaskList tasks={tasks} userId={student?.uid || ''} />
      <section className="dashboard-section dashboard-section-hover">
        <h3 className="dashboard-section-title">Notifications & Admin Messages</h3>
        {recentNotifications.length > 0 && (
          <ul className="message-list" style={{ marginBottom: '0.75rem' }}>
            {recentNotifications.map((note) => (
              <li key={note.id} className="message-item">
                <p className="message-text"><strong>{note.title}:</strong> {note.message}</p>
                <p className="message-time">{new Date(note.createdAt || Date.now()).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
        {recentMessages.length === 0 ? (
          <p className="dashboard-empty">No new notifications yet.</p>
        ) : (
          <ul className="message-list">
            {recentMessages.map((message) => (
              <li key={message.id} className="message-item">
                <p className="message-text">{message.text}</p>
                <p className="message-time">{new Date(message.createdAt || Date.now()).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
