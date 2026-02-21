import { useEffect, useMemo, useState } from 'react';
import { getCurrentStudent } from '../../../services/authService';
import { subscribeActivitiesForUser } from '../../student/services/activityService';
import { averageMockScore, subscribeMockInterviews } from '../../mockInterview/services/mockInterviewService';
import {
  getTestQuestionsForStudent,
  submitTestAttempt,
  subscribeReportsByUser,
  subscribeResultsByUser,
  subscribeTestsForStudent,
} from '../services/testEngineService';
import { downloadAiReportPdf } from '../../insights/services/aiReportPdfService';
import '../styles/testing.css';

const DEFAULT_DURATION_SEC = 20 * 60;

function formatRemaining(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function StudentTestCenter() {
  const current = getCurrentStudent();
  const userId = current?.uid || '';

  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [reports, setReports] = useState([]);
  const [activities, setActivities] = useState([]);
  const [mockInterviews, setMockInterviews] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [remainingSec, setRemainingSec] = useState(DEFAULT_DURATION_SEC);
  const [startedAt, setStartedAt] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [latestReport, setLatestReport] = useState(null);

  useEffect(() => {
    if (!userId) return () => {};
    const stopTests = subscribeTestsForStudent(userId, setTests);
    const stopResults = subscribeResultsByUser(userId, setResults);
    const stopReports = subscribeReportsByUser(userId, setReports);
    const stopActivities = subscribeActivitiesForUser(userId, setActivities);
    const stopMock = subscribeMockInterviews(userId, setMockInterviews);
    return () => {
      stopTests();
      stopResults();
      stopReports();
      stopActivities();
      stopMock();
    };
  }, [userId]);

  useEffect(() => {
    if (!activeTest) return () => {};
    const timer = window.setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeTest]);

  useEffect(() => {
    if (!activeTest || remainingSec > 0) return;
    handleSubmit();
  }, [remainingSec]);

  const attemptedTestIds = useMemo(() => new Set(results.map((item) => item.testId)), [results]);

  const activityCategoryHours = useMemo(() => {
    return activities.reduce((acc, item) => {
      const category = String(item.category || 'technical').toLowerCase();
      acc[category] = (acc[category] || 0) + (Number(item.hours) || 0);
      return acc;
    }, {});
  }, [activities]);

  const progressPercent = questions.length ? Math.round(((activeIndex + 1) / questions.length) * 100) : 0;

  function startTest(test) {
    const orderedQuestions = getTestQuestionsForStudent(test, userId);
    setActiveTest(test);
    setQuestions(orderedQuestions);
    setAnswers(Array.from({ length: orderedQuestions.length }, () => -1));
    setActiveIndex(0);
    setRemainingSec(DEFAULT_DURATION_SEC);
    setStartedAt(Date.now());
    setMessage('');
    setError('');
    setLatestReport(null);
  }

  function chooseAnswer(index) {
    setAnswers((prev) => {
      const next = [...prev];
      next[activeIndex] = index;
      return next;
    });
  }

  async function handleSubmit() {
    if (!activeTest) return;
    try {
      const timeTaken = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : 0;
      const response = await submitTestAttempt({
        uid: userId,
        test: activeTest,
        answers,
        timeTaken,
        activityCategoryHours,
        mockInterviewAverage: averageMockScore(mockInterviews),
      });
      setMessage(`Test submitted. Score: ${response.score}%`);
      setLatestReport({
        ...response.report,
        generatedAt: Date.now(),
      });
      setActiveTest(null);
      setQuestions([]);
      setAnswers([]);
      setActiveIndex(0);
      setRemainingSec(DEFAULT_DURATION_SEC);
    } catch (submitError) {
      setError(submitError.message || 'Failed to submit test.');
    }
  }

  return (
    <section className="dashboard-page">
      <h1 className="dashboard-title">Assigned Tests</h1>

      {!activeTest && (
        <>
          <article className="dashboard-section">
            <h3 className="dashboard-section-title">Pending Tests</h3>
            {tests.length === 0 ? <p className="dashboard-empty">No tests assigned yet.</p> : (
              <ul className="test-list">
                {tests.map((test) => (
                  <li key={test.id}>
                    <strong>{test.title}</strong>
                    <span>{test.categories.join(', ')}</span>
                    <span>{attemptedTestIds.has(test.id) ? 'Completed' : 'Pending'}</span>
                    <button
                      type="button"
                      className="task-delete-btn"
                      onClick={() => startTest(test)}
                      disabled={attemptedTestIds.has(test.id)}
                    >
                      {attemptedTestIds.has(test.id) ? 'Already Attempted' : 'Start Test'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="dashboard-section">
            <h3 className="dashboard-section-title">AI Reports</h3>
            {reports.length === 0 ? <p className="dashboard-empty">No reports available yet.</p> : (
              <ul className="test-list">
                {reports.slice(0, 6).map((report) => (
                  <li key={report.id}>
                    <strong>Test: {report.testId}</strong>
                    <span>Strong: {report.strengths.join(' | ')}</span>
                    <span>Weak: {report.weaknesses.join(' | ')}</span>
                    <span>Lacking: {(report.lackingAreas || []).join(' | ') || 'No major lacking area detected'}</span>
                    <span>Plan: {report.improvementPlan.join(' | ')}</span>
                    <button type="button" className="task-delete-btn" onClick={() => downloadAiReportPdf(report, 'PrepLens Student AI Report')}>
                      Download PDF
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </>
      )}

      {activeTest && questions.length > 0 && (
        <article className="dashboard-section">
          <h3 className="dashboard-section-title">{activeTest.title}</h3>
          <p className="dashboard-meta">Timer: {formatRemaining(remainingSec)}</p>
          <div className="test-progress">
            <div className="test-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="dashboard-meta">Question {activeIndex + 1} / {questions.length}</p>

          <div className="test-question-card">
            <p><strong>{questions[activeIndex].question}</strong></p>
            <div className="test-options">
              {questions[activeIndex].options.map((option, index) => (
                <label key={`${questions[activeIndex].questionId}-${index}`} className="test-check-row">
                  <input
                    type="radio"
                    checked={Number(answers[activeIndex]) === index}
                    onChange={() => chooseAnswer(index)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="test-actions">
            <button
              type="button"
              className="task-delete-btn"
              disabled={activeIndex <= 0}
              onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="task-delete-btn"
              disabled={activeIndex >= questions.length - 1}
              onClick={() => setActiveIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            >
              Next
            </button>
            <button type="button" className="form-submit" onClick={handleSubmit}>Submit Test</button>
          </div>
        </article>
      )}

      {message && <p className="feedback-success">{message}</p>}
      {latestReport && (
        <button
          type="button"
          className="task-delete-btn"
          onClick={() => downloadAiReportPdf(latestReport, 'PrepLens Student AI Report')}
        >
          Download Latest AI Report (PDF)
        </button>
      )}
      {error && <p className="feedback-error">{error}</p>}
    </section>
  );
}
