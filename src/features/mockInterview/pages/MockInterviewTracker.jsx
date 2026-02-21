import { useEffect, useState } from 'react';
import { getCurrentStudent } from '../../../services/authService';
import { averageMockScore, logMockInterview, subscribeMockInterviews } from '../services/mockInterviewService';

export default function MockInterviewTracker() {
  const current = getCurrentStudent();
  const userId = current?.uid || '';
  const [items, setItems] = useState([]);
  const [date, setDate] = useState('');
  const [score, setScore] = useState(60);
  const [weakAreas, setWeakAreas] = useState('communication');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return () => {};
    return subscribeMockInterviews(userId, setItems);
  }, [userId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await logMockInterview({
        uid: userId,
        interviewDate: date ? new Date(date).getTime() : Date.now(),
        feedbackScore: score,
        weakAreas: weakAreas.split(',').map((value) => value.trim()).filter(Boolean),
        notes,
      });
      setMessage('Mock interview logged.');
      setNotes('');
    } catch (submitError) {
      setError(submitError.message || 'Could not save mock interview.');
    }
  }

  return (
    <section className="dashboard-page">
      <h1 className="dashboard-title">Mock Interview Tracker</h1>
      <form className="form-card" onSubmit={handleSubmit}>
        <label htmlFor="interview-date">Interview Date</label>
        <input id="interview-date" type="date" className="form-control" value={date} onChange={(event) => setDate(event.target.value)} />

        <label htmlFor="feedback-score">Feedback Score (0-100)</label>
        <input id="feedback-score" type="number" className="form-control" min="0" max="100" value={score} onChange={(event) => setScore(Number(event.target.value) || 0)} />

        <label htmlFor="weak-areas">Weak Areas (comma separated)</label>
        <input id="weak-areas" className="form-control" value={weakAreas} onChange={(event) => setWeakAreas(event.target.value)} />

        <label htmlFor="interview-notes">Notes</label>
        <textarea id="interview-notes" className="form-control" rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} />

        <button type="submit" className="form-submit">Save Interview</button>
      </form>

      {message && <p className="feedback-success">{message}</p>}
      {error && <p className="feedback-error">{error}</p>}

      <article className="dashboard-section">
        <h3 className="dashboard-section-title">Interview Analytics</h3>
        <p className="dashboard-meta">Average feedback score: {averageMockScore(items)}%</p>
        {items.length === 0 ? <p className="dashboard-empty">No mock interviews logged.</p> : (
          <ul className="activity-list">
            {items.map((item) => (
              <li key={item.id} className="activity-item">
                <div>
                  <p className="activity-title">{new Date(item.interviewDate).toLocaleDateString()}</p>
                  <p className="activity-meta">Weak areas: {item.weakAreas.join(', ') || 'N/A'}</p>
                </div>
                <strong>{item.feedbackScore}%</strong>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
