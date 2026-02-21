import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    let stopActivities = () => {};
    let stopTasks = () => {};
    let stopProfile = () => {};
    let stopProgress = () => {};
    let stopMessages = () => {};

    const stopAuth = subscribeToStudentAuth((user) => {
      setStudent(user);
      stopActivities();
      stopTasks();
      stopProfile();
      stopProgress();
      stopMessages();

      if (!user?.uid) {
        setActivities([]);
        setTasks([]);
        setProfile(null);
        setProgress(null);
        setMessages([]);
        return;
      }

      stopActivities = subscribeActivitiesForUser(user.uid, setActivities);
      stopTasks = subscribeTasksForUser(user.uid, setTasks);
      stopProfile = subscribeStudentProfile(user.uid, setProfile);
      stopProgress = subscribeStudentProgress(user.uid, setProgress);
      stopMessages = subscribeMessagesForUser(user.uid, setMessages);
    });

    return () => {
      stopActivities();
      stopTasks();
      stopProfile();
      stopProgress();
      stopMessages();
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
  const stats = {
    ...computed,
    readiness,
  };

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
      <SummaryCards stats={stats} />
      <ActivityChart
        data={computed.dailyData}
        title="Daily Progress (Last 7 Days)"
        datasetLabel="Hours"
        color="#737373"
        borderColor="#262626"
      />
      <ActivityChart
        data={computed.weeklyData}
        title="Weekly Progress (Last 4 Weeks)"
        datasetLabel="Total Hours"
        color="#a3a3a3"
        borderColor="#404040"
      />
      <ActivityChart
        data={computed.coreCategoryData}
        title="Category Progress: Aptitude, Technical, Verbal, Softskills"
        datasetLabel="Hours by Category"
        color="#525252"
        borderColor="#171717"
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
