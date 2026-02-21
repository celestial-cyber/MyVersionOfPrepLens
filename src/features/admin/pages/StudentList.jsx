import { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import StudentTable from '../components/StudentTable';
import {
  deleteAdminTask,
  getActivitiesByUserId,
  getAllStudents,
  getTasksByUserId,
  subscribeAllStudents,
} from '../services/adminDataService';
import '../styles/admin.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activities, setActivities] = useState([]);
  const [studentTasks, setStudentTasks] = useState([]);
  const [sortBy, setSortBy] = useState('weak_first');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      try {
        const allStudents = await getAllStudents();
        if (!isMounted) return;
        setStudents(allStudents);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || 'Failed to load students.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStudents();
    const unsubscribe = subscribeAllStudents(
      (allStudents) => {
        if (!isMounted) return;
        setStudents(allStudents);
      },
      (loadError) => {
        if (!isMounted) return;
        setError(loadError.message || 'Failed to keep students in sync.');
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  async function handleSelect(student) {
    setSelectedStudent(student);
    setActivities([]);
    setStudentTasks([]);

    try {
      const [items, tasks] = await Promise.all([
        getActivitiesByUserId(student.uid || student.id),
        getTasksByUserId(student.uid || student.id),
      ]);
      setActivities(items);
      setStudentTasks(tasks);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load activities for student.');
    }
  }

  async function handleDeleteTask(taskId) {
    if (!selectedStudent) return;
    const shouldDelete = window.confirm('Delete this assigned task?');
    if (!shouldDelete) return;
    setDeletingTaskId(taskId);
    setError('');
    try {
      await deleteAdminTask(taskId);
      const [tasks, allStudents] = await Promise.all([
        getTasksByUserId(selectedStudent.uid || selectedStudent.id),
        getAllStudents(),
      ]);
      setStudentTasks(tasks);
      setStudents(allStudents);
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete task.');
    } finally {
      setDeletingTaskId('');
    }
  }

  const activityChartData = useMemo(() => {
    const labels = activities.map((item) => item.day);
    const values = activities.map((item) => item.hours || 0);
    return {
      labels,
      datasets: [
        {
          label: 'Study hours',
          data: values,
          backgroundColor: '#111111',
        },
      ],
    };
  }, [activities]);

  const categoryChartData = useMemo(() => {
    const totals = { aptitude: 0, technical: 0, verbal: 0, softskills: 0 };
    activities.forEach((item) => {
      const key = String(item.category || 'technical').toLowerCase();
      if (totals[key] === undefined) return;
      totals[key] += Number(item.hours) || 0;
    });
    return {
      labels: ['Aptitude', 'Technical', 'Verbal', 'Softskills'],
      datasets: [
        {
          label: 'Hours by category',
          data: [totals.aptitude, totals.technical, totals.verbal, totals.softskills],
          backgroundColor: ['#111111', '#404040', '#737373', '#a3a3a3'],
        },
      ],
    };
  }, [activities]);

  const selectedSummary = useMemo(() => {
    const totalHours = activities.reduce((acc, item) => acc + (Number(item.hours) || 0), 0);
    return {
      totalHours: Math.round(totalHours * 100) / 100,
      totalLogs: activities.length,
    };
  }, [activities]);

  const filteredAndSortedStudents = useMemo(() => {
    const now = Date.now();
    const activeCutoff = now - 3 * 24 * 60 * 60 * 1000;
    const weakCutoff = now - 7 * 24 * 60 * 60 * 1000;

    const isWeakStudent = (student) => {
      const readiness = Number(student.readinessScore) || 0;
      const lastActiveAt = student.lastActiveAt || 0;
      const streak = Number(student.streakDays) || 0;
      return readiness < 40 || lastActiveAt < weakCutoff || streak <= 1;
    };

    const filtered = students.filter((student) => {
      const lastActiveAt = student.lastActiveAt || 0;
      const isActive = lastActiveAt >= activeCutoff;
      const weak = isWeakStudent(student);
      if (filterBy === 'portal') return student.registrationType !== 'Demo';
      if (filterBy === 'weak') return weak;
      if (filterBy === 'active') return isActive;
      if (filterBy === 'inactive') return !isActive;
      return true;
    });

    return [...filtered].sort((a, b) => {
      const readinessA = Number(a.readinessScore) || 0;
      const readinessB = Number(b.readinessScore) || 0;
      const activityA = a.lastActiveAt || 0;
      const activityB = b.lastActiveAt || 0;
      const streakA = Number(a.streakDays) || 0;
      const streakB = Number(b.streakDays) || 0;
      const createdA = a.createdAt || 0;
      const createdB = b.createdAt || 0;
      const weakA = isWeakStudent(a);
      const weakB = isWeakStudent(b);

      if (sortBy === 'weak_first') {
        if (weakA !== weakB) return weakA ? -1 : 1;
        return readinessA - readinessB;
      }
      if (sortBy === 'least_active') return activityA - activityB;
      if (sortBy === 'most_active') return activityB - activityA;
      if (sortBy === 'low_readiness') return readinessA - readinessB;
      if (sortBy === 'high_readiness') return readinessB - readinessA;
      if (sortBy === 'streak_low') return streakA - streakB;
      if (sortBy === 'streak_high') return streakB - streakA;
      if (sortBy === 'newest_registered') return createdB - createdA;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [students, sortBy, filterBy]);

  const summary = useMemo(() => {
    const now = Date.now();
    const activeCutoff = now - 3 * 24 * 60 * 60 * 1000;
    const weakCutoff = now - 7 * 24 * 60 * 60 * 1000;
    const weakStudents = students.filter((student) => {
      const readiness = Number(student.readinessScore) || 0;
      const lastActiveAt = student.lastActiveAt || 0;
      const streak = Number(student.streakDays) || 0;
      return readiness < 40 || lastActiveAt < weakCutoff || streak <= 1;
    }).length;
    const portalRegistrations = students.filter((student) => student.registrationType !== 'Demo').length;
    const activeStudents = students.filter((student) => (student.lastActiveAt || 0) >= activeCutoff).length;

    return {
      weakStudents,
      portalRegistrations,
      activeStudents,
    };
  }, [students]);

  return (
    <section className="admin-page">
      <h1>Students</h1>
      {loading && <p>Loading students...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && (
        <>
          <div className="admin-stats-grid">
            <article className="admin-card">
              <p className="admin-card-label">Portal Registrations</p>
              <p className="admin-card-value">{summary.portalRegistrations}</p>
            </article>
            <article className="admin-card">
              <p className="admin-card-label">Weak Students</p>
              <p className="admin-card-value">{summary.weakStudents}</p>
            </article>
            <article className="admin-card">
              <p className="admin-card-label">Active (last 3 days)</p>
              <p className="admin-card-value">{summary.activeStudents}</p>
            </article>
          </div>

          <div className="admin-controls">
            <label htmlFor="student-filter">Filter</label>
            <select id="student-filter" value={filterBy} onChange={(event) => setFilterBy(event.target.value)}>
              <option value="all">All Students</option>
              <option value="portal">Registered on Portal</option>
              <option value="weak">Weak Students Only</option>
              <option value="active">Active Students</option>
              <option value="inactive">Inactive Students</option>
            </select>

            <label htmlFor="student-sort">Sort</label>
            <select id="student-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="weak_first">Weak Students First</option>
              <option value="least_active">Least Active Days First</option>
              <option value="most_active">Most Active Days First</option>
              <option value="streak_low">Lowest Streak First</option>
              <option value="streak_high">Highest Streak First</option>
              <option value="low_readiness">Low Readiness First</option>
              <option value="high_readiness">High Readiness First</option>
              <option value="newest_registered">Newest Registrations</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          <StudentTable students={filteredAndSortedStudents} onSelect={handleSelect} scrollable />
        </>
      )}

      {selectedStudent && (
        <article className="admin-card admin-student-activity">
          <h2>{selectedStudent.name} Activity</h2>
          <p className="admin-subtext">
            Readiness: {selectedStudent.readinessScore ?? 0}% | Streak: {selectedStudent.streakDays ?? 0} days |
            Completed tasks: {selectedStudent.completedTasks ?? 0}
          </p>
          <p className="admin-subtext">
            Total logs: {selectedSummary.totalLogs} | Total hours: {selectedSummary.totalHours}
          </p>
          <p className="admin-subtext">
            Admin tasks: {studentTasks.length} | Completed: {studentTasks.filter((task) => task.completed).length} |
            In Progress: {studentTasks.filter((task) => task.status === 'in_progress').length}
          </p>
          {studentTasks.length > 0 && (
            <ul className="admin-task-progress-list">
              {studentTasks.slice(0, 6).map((task) => (
                <li key={task.id} className="admin-task-progress-item">
                  <span>{task.title}</span>
                  <div className="admin-task-progress-actions">
                    <strong>{task.status === 'in_progress' ? 'In Progress' : task.completed ? 'Completed' : 'Pending'}</strong>
                    <button
                      type="button"
                      className="admin-task-delete-btn"
                      disabled={deletingTaskId === task.id}
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      {deletingTaskId === task.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {activities.length > 0 ? (
            <div className="admin-student-chart-grid">
              <Bar data={activityChartData} />
              <Bar data={categoryChartData} />
            </div>
          ) : (
            <p>No activities found.</p>
          )}
        </article>
      )}
    </section>
  );
}
