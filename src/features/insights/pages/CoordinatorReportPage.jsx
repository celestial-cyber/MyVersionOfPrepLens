import { useEffect, useMemo, useState } from 'react';
import { getAllStudents } from '../../admin/services/adminDataService';
import { buildStudentInsights } from '../services/insightService';
import { generateCoordinatorPdfReport } from '../services/coordinatorReportService';

export default function CoordinatorReportPage() {
  const [students, setStudents] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const list = await getAllStudents();
      const built = await buildStudentInsights(list);
      if (!mounted) return;
      setStudents(list);
      setInsights(built);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const avgReadiness = students.length
      ? Math.round(students.reduce((sum, item) => sum + (Number(item.readinessScore) || 0), 0) / students.length)
      : 0;
    const readyStudents = [...students]
      .sort((a, b) => (Number(b.readinessScore) || 0) - (Number(a.readinessScore) || 0))
      .slice(0, 10);
    const atRiskIds = new Set(insights.filter((item) => item.isAtRisk).map((item) => item.uid));
    const atRiskStudents = students.filter((item) => atRiskIds.has(item.uid));

    return { avgReadiness, readyStudents, atRiskStudents };
  }, [students, insights]);

  return (
    <section className="admin-page">
      <h1>Placement Coordinator Report</h1>
      <article className="admin-card">
        <p className="admin-subtext">Average readiness: <strong>{summary.avgReadiness}%</strong></p>
        <p className="admin-subtext">Top ready students: {summary.readyStudents.length}</p>
        <p className="admin-subtext">Students at risk: {summary.atRiskStudents.length}</p>
        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => generateCoordinatorPdfReport(summary)}
        >
          Download PDF
        </button>
      </article>

      <div className="admin-chart-grid">
        <article className="admin-card">
          <h3>Top 10 Ready Students</h3>
          <ul className="admin-weak-list">
            {summary.readyStudents.map((student) => (
              <li key={student.uid} className="admin-weak-item">
                <strong>{student.name}</strong>
                <span>{student.readinessScore}% readiness</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-card">
          <h3>Students Needing Intervention</h3>
          <ul className="admin-weak-list">
            {summary.atRiskStudents.map((student) => (
              <li key={student.uid} className="admin-weak-item">
                <strong>{student.name}</strong>
                <span>{student.readinessScore}% readiness</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
