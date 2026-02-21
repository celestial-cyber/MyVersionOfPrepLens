import { useState } from 'react';
import { logActivity } from '../services/activityService';
import { getCurrentStudent } from '../../../services/authService';
import '../styles/studentDashboard.css';

const CATEGORY_OPTIONS = [
  { value: 'aptitude', label: 'Aptitude' },
  { value: 'technical', label: 'Technical' },
  { value: 'verbal', label: 'Verbal' },
  { value: 'softskills', label: 'Softskills' },
];

export default function LogActivity() {
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState(1);
  const [category, setCategory] = useState('technical');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const currentStudent = getCurrentStudent();
      await logActivity({ topic, category, hours: Number(hours), userId: currentStudent?.uid || '' });
      setMessage('Activity logged successfully.');
      setTopic('');
      setHours(1);
      setCategory('technical');
    } catch (submitError) {
      setError(submitError.message || 'Could not log activity.');
    }
  };

  return (
    <section className="dashboard-page">
      <h1 className="dashboard-title">Log Daily Preparation</h1>
      <p className="dashboard-meta">Track your learning by category to unlock better weak-area insights.</p>
      <form onSubmit={handleSubmit} className="form-card">
        <label htmlFor="activity-topic">Topic</label>
        <input
          id="activity-topic"
          className="form-control"
          placeholder="e.g., Arrays practice set"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
        <label htmlFor="activity-category">Category</label>
        <select
          id="activity-category"
          className="form-control"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor="activity-hours">Hours</label>
        <input
          id="activity-hours"
          className="form-control"
          min="0.5"
          step="0.5"
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          required
        />
        <button className="form-submit" type="submit">Save Activity</button>
      </form>
      {message && <p className="feedback-success">{message}</p>}
      {error && <p className="feedback-error">{error}</p>}
    </section>
  );
}
