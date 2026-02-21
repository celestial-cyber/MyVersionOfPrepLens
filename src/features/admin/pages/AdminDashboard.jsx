import { useEffect, useMemo, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import StatsCards from '../components/StatsCards';
import StudentTable from '../components/StudentTable';
import { getAllStudents, subscribeAllStudents } from '../services/adminDataService';
import { calculateReadinessScore } from '../utils/readinessScore';
import '../styles/admin.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const allStudents = await getAllStudents();
        if (!isMounted) return;
        setStudents(allStudents);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || 'Failed to load admin dashboard.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    const unsubscribe = subscribeAllStudents(
      (allStudents) => {
        if (!isMounted) return;
        setStudents(allStudents);
      },
      (loadError) => {
        if (!isMounted) return;
        setError(loadError.message || 'Failed to keep dashboard in sync.');
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const stats = useMemo(() => {
    const activeCutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const weakCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let activeStudents = 0;
    let inactiveStudents = 0;
    let readinessTotal = 0;
    let totalActivities = 0;
    let streakTotal = 0;
    let weakStudents = 0;

    students.forEach((student) => {
      const readiness = calculateReadinessScore({ readinessScore: student.readinessScore });
      readinessTotal += readiness;
      totalActivities += Number(student.totalActivities) || 0;
      streakTotal += Number(student.streakDays) || 0;
      if ((student.lastActiveAt || 0) >= activeCutoff) activeStudents += 1;
      else inactiveStudents += 1;
      if (readiness < 40 || (student.lastActiveAt || 0) < weakCutoff || (student.streakDays || 0) <= 1) {
        weakStudents += 1;
      }
    });

    return {
      totalStudents: students.length,
      activeStudents,
      inactiveStudents,
      avgReadiness: students.length ? Math.round((readinessTotal / students.length) * 100) / 100 : 0,
      totalActivities,
      avgStreak: students.length ? Math.round((streakTotal / students.length) * 100) / 100 : 0,
      weakStudents,
    };
  }, [students]);

  const readinessBuckets = useMemo(() => {
    const buckets = { High: 0, Medium: 0, Low: 0 };
    students.forEach((student) => {
      const score = calculateReadinessScore({ readinessScore: student.readinessScore });
      if (score >= 75) buckets.High += 1;
      else if (score >= 40) buckets.Medium += 1;
      else buckets.Low += 1;
    });
    return buckets;
  }, [students]);

  const categoryProgress = useMemo(() => {
    const totals = { aptitude: 0, technical: 0, verbal: 0, softskills: 0 };
    students.forEach((student) => {
      const categoryTotals = student.categoryTotals || {};
      totals.aptitude += Number(categoryTotals.aptitude) || 0;
      totals.technical += Number(categoryTotals.technical) || 0;
      totals.verbal += Number(categoryTotals.verbal) || 0;
      totals.softskills += Number(categoryTotals.softskills) || 0;
    });

    return {
      labels: ['Aptitude', 'Technical', 'Verbal', 'Softskills'],
      values: [totals.aptitude, totals.technical, totals.verbal, totals.softskills].map((value) =>
        Math.round(value * 100) / 100
      ),
    };
  }, [students]);

  const streakBuckets = useMemo(() => {
    const buckets = { '0 days': 0, '1-3 days': 0, '4-7 days': 0, '8+ days': 0 };
    students.forEach((student) => {
      const streak = Number(student.streakDays) || 0;
      if (streak <= 0) buckets['0 days'] += 1;
      else if (streak <= 3) buckets['1-3 days'] += 1;
      else if (streak <= 7) buckets['4-7 days'] += 1;
      else buckets['8+ days'] += 1;
    });
    return buckets;
  }, [students]);

  const weakStudentsList = useMemo(() => {
    const weakCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return students
      .filter((student) => {
        const readiness = calculateReadinessScore({ readinessScore: student.readinessScore });
        return readiness < 40 || (student.lastActiveAt || 0) < weakCutoff || (student.streakDays || 0) <= 1;
      })
      .sort((a, b) => (Number(a.readinessScore) || 0) - (Number(b.readinessScore) || 0))
      .slice(0, 6);
  }, [students]);

  const studentProgressChart = useMemo(() => {
    const ranked = [...students]
      .sort((a, b) => (Number(a.readinessScore) || 0) - (Number(b.readinessScore) || 0))
      .slice(0, 12);

    const labels = ranked.map((student) => student.name || 'Unknown');
    const readiness = ranked.map((student) => Number(student.readinessScore) || 0);
    const activities = ranked.map((student) => Number(student.totalActivities) || 0);
    const streaks = ranked.map((student) => Number(student.streakDays) || 0);

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Readiness %',
          data: readiness,
          borderRadius: 8,
          backgroundColor: readiness.map((value) => {
            if (value < 40) return 'rgba(163, 163, 163, 0.85)';
            if (value < 75) return 'rgba(115, 115, 115, 0.85)';
            return 'rgba(23, 23, 23, 0.85)';
          }),
          borderWidth: 1,
          borderColor: 'rgba(15, 23, 42, 0.15)',
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Streak Days',
          data: streaks,
          borderColor: '#525252',
          pointBackgroundColor: '#262626',
          pointRadius: 3,
          tension: 0.3,
          yAxisID: 'y1',
        },
        {
          type: 'line',
          label: 'Total Activities',
          data: activities,
          borderColor: '#a3a3a3',
          pointBackgroundColor: '#525252',
          pointRadius: 3,
          tension: 0.3,
          yAxisID: 'y1',
        },
      ],
    };
  }, [students]);

  const studentProgressOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 35,
            minRotation: 20,
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Readiness %',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.2)',
          },
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          title: {
            display: true,
            text: 'Activities / Streak',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    }),
    []
  );

  if (loading) {
    return <div className="admin-page"><p>Loading dashboard...</p></div>;
  }

  if (error) {
    return <div className="admin-page"><p className="admin-error">{error}</p></div>;
  }

  return (
    <section className="admin-page admin-dashboard-scroll">
      <div className="admin-dashboard-inner">
        <h1>Admin Dashboard</h1>
        <StatsCards stats={stats} />

        <div className="admin-chart-grid">
          <article className="admin-card">
            <h3>Active vs Inactive</h3>
            <Pie
              data={{
                labels: ['Active', 'Inactive'],
                datasets: [
                  {
                    data: [stats.activeStudents, stats.inactiveStudents],
                    backgroundColor: ['#111111', '#9ca3af'],
                  },
                ],
              }}
            />
          </article>

          <article className="admin-card">
            <h3>Readiness Distribution</h3>
            <Bar
              data={{
                labels: Object.keys(readinessBuckets),
                datasets: [
                  {
                    label: 'Students',
                    data: Object.values(readinessBuckets),
                    backgroundColor: ['#111111', '#525252', '#a3a3a3'],
                  },
                ],
              }}
            />
          </article>

          <article className="admin-card">
          <h3>Category Progress (Hours)</h3>
            <Bar
              data={{
                labels: categoryProgress.labels,
                datasets: [
                  {
                    label: 'Avg readiness',
                    data: categoryProgress.values,
                    backgroundColor: '#404040',
                  },
                ],
              }}
            />
          </article>

          <article className="admin-card">
            <h3>Consistency Tracking (Streaks)</h3>
            <Bar
              data={{
                labels: Object.keys(streakBuckets),
                datasets: [
                  {
                    label: 'Students',
                    data: Object.values(streakBuckets),
                    backgroundColor: ['#d4d4d4', '#a3a3a3', '#737373', '#262626'],
                  },
                ],
              }}
            />
          </article>
        </div>

        <article className="admin-card">
          <h3>Student Progress Snapshot</h3>
          <p className="admin-subtext">Click any row in Students page for detailed activity chart.</p>
          <StudentTable students={students} />
        </article>

        <article className="admin-card">
          <h3>Student Progress Matrix</h3>
          <p className="admin-subtext">
            Combined view: readiness bars + activity and streak trend lines (up to 12 students).
          </p>
          <div style={{ height: 360 }}>
            <Bar data={studentProgressChart} options={studentProgressOptions} />
          </div>
        </article>

        <article className="admin-card">
          <h3>Automatically Identified Weak Students</h3>
          {weakStudentsList.length === 0 ? (
            <p className="admin-subtext">No weak students detected right now.</p>
          ) : (
            <ul className="admin-weak-list">
              {weakStudentsList.map((student) => (
                <li key={student.uid || student.id} className="admin-weak-item">
                  <strong>{student.name}</strong>
                  <span>{student.email || 'N/A'}</span>
                  <span>Readiness: {student.readinessScore ?? 0}%</span>
                  <span>Streak: {student.streakDays ?? 0} days</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}
