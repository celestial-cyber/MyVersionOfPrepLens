import { useEffect, useMemo, useState } from 'react';
import { getAllStudents } from '../../admin/services/adminDataService';
import { QUESTION_CATEGORIES } from '../data/questionBank';
import { ALL_STUDENTS_SCOPE, createTest, subscribeAllTests, subscribeReportsForAdmin } from '../services/testEngineService';
import { downloadAiReportPdf } from '../../insights/services/aiReportPdfService';
import '../styles/testing.css';

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];

function formatDate(value) {
  if (!value) return 'No deadline';
  return new Date(value).toLocaleString();
}

export default function AdminTestCenter() {
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([...QUESTION_CATEGORIES]);
  const [assignToAll, setAssignToAll] = useState(true);
  const [assignedStudentIds, setAssignedStudentIds] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAllStudents().then((rows) => mounted && setStudents(rows));
    const stopTests = subscribeAllTests(setTests);
    const stopReports = subscribeReportsForAdmin(setReports);
    return () => {
      mounted = false;
      stopTests();
      stopReports();
    };
  }, []);

  const reportPreview = useMemo(() => reports.slice(0, 8), [reports]);
  const studentNameMap = useMemo(
    () => new Map(students.map((student) => [student.uid, student.name])),
    [students]
  );

  const toggleCategory = (category) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const toggleStudent = (studentId) => {
    setAssignedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const assignedTo = assignToAll ? [ALL_STUDENTS_SCOPE] : assignedStudentIds;
      await createTest({
        title,
        createdBy: 'admin',
        categories,
        assignedTo,
        deadline: deadline ? new Date(deadline).getTime() : null,
        difficulty,
      });
      setTitle('');
      setAssignedStudentIds([]);
      setDeadline('');
      setDifficulty('medium');
      setMessage('Test created successfully. 20 questions were auto-picked from the 50-question bank.');
    } catch (submitError) {
      setError(submitError.message || 'Unable to create test.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-page">
      <h1>AI Skill Assessment & Test Engine</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label htmlFor="test-title">Test Title</label>
        <input id="test-title" value={title} onChange={(event) => setTitle(event.target.value)} required />

        <label>Categories</label>
        <div className="test-chip-wrap">
          {QUESTION_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`test-chip ${categories.includes(category) ? 'test-chip-active' : ''}`}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <label htmlFor="test-difficulty">Difficulty</label>
        <select id="test-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <label htmlFor="test-deadline">Deadline</label>
        <input id="test-deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} />

        <label className="test-check-row">
          <input type="checkbox" checked={assignToAll} onChange={(event) => setAssignToAll(event.target.checked)} /> Assign to all students
        </label>

        {!assignToAll && (
          <div className="test-student-grid">
            {students.map((student) => (
              <label key={student.uid} className="test-check-row">
                <input
                  type="checkbox"
                  checked={assignedStudentIds.includes(student.uid)}
                  onChange={() => toggleStudent(student.uid)}
                />
                {student.name}
              </label>
            ))}
          </div>
        )}

        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Test'}</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p className="admin-error">{error}</p>}

      <article className="admin-card">
        <h3>Created Tests</h3>
        {tests.length === 0 ? <p>No tests yet.</p> : (
          <ul className="test-list">
            {tests.map((test) => (
              <li key={test.id}>
                <strong>{test.title}</strong>
                <span>{test.categories.join(', ')}</span>
                <span>Questions: {test.questionIds.length}</span>
                <span>Deadline: {formatDate(test.deadline)}</span>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="admin-card">
        <h3>Latest AI Reports</h3>
        {reportPreview.length === 0 ? <p>No AI reports generated yet.</p> : (
          <ul className="test-list">
            {reportPreview.map((report) => (
              <li key={report.id}>
                <strong>{studentNameMap.get(report.uid) || report.uid}</strong>
                <span>Weakest: {report.weakestCategory}</span>
                <span>Strengths: {report.strengths.join(' | ')}</span>
                <span>
                  Metrics: Accuracy {report.performanceMetrics?.accuracy ?? '-'}% | Completion {report.performanceMetrics?.completionRate ?? '-'}%
                </span>
                <span>
                  Category Marks:{' '}
                  {(report.categorySpecificMarks || []).map((item) => (
                    <strong key={`${report.id}-${item.category}`} style={{ color: item.color, marginRight: 8 }}>
                      {item.label}: {item.marks}%
                    </strong>
                  ))}
                </span>
                <span>Plan: {report.improvementPlan.join(' | ')}</span>
                <span>Lacking: {(report.lackingAreas || []).join(' | ') || 'No major lacking area detected'}</span>
                <button type="button" className="task-delete-btn" onClick={() => downloadAiReportPdf(report, 'PrepLens Admin AI Report')}>
                  Download PDF
                </button>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
