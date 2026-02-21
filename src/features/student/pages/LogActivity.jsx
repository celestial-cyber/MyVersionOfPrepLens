import { useEffect, useState } from 'react';
import { deleteActivityForUser, logActivity, subscribeActivitiesForUser } from '../services/activityService';
import { getCurrentStudent, subscribeToStudentAuth } from '../../../services/authService';
import '../styles/studentDashboard.css';

const CATEGORY_OPTIONS = [
  { value: 'aptitude', label: 'Aptitude' },
  { value: 'technical', label: 'Technical' },
  { value: 'verbal', label: 'Verbal' },
  { value: 'softskills', label: 'Softskills' },
];

export default function LogActivity() {
  const [student, setStudent] = useState(getCurrentStudent());
  const [activities, setActivities] = useState([]);
  const [deletingActivityId, setDeletingActivityId] = useState('');
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

  useEffect(() => {
    let stopActivities = () => {};
    const stopAuth = subscribeToStudentAuth((user) => {
      setStudent(user);
      stopActivities();
      if (!user?.uid) {
        setActivities([]);
        return;
      }
      stopActivities = subscribeActivitiesForUser(user.uid, setActivities);
    });

    return () => {
      stopActivities();
      stopAuth();
    };
  }, []);

  async function handleDeleteActivity(activityId) {
    const userId = student?.uid || '';
    if (!userId) return;
    const shouldDelete = window.confirm('Delete this activity log?');
    if (!shouldDelete) return;
    setDeletingActivityId(activityId);
    setError('');
    try {
      await deleteActivityForUser({ userId, activityId });
      setMessage('Activity deleted successfully.');
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete activity.');
    } finally {
      setDeletingActivityId('');
    }
  }

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

      <section className="dashboard-section dashboard-section-hover">
        <h3 className="dashboard-section-title">Recent Activity Logs</h3>
        {!activities.length ? (
          <p className="dashboard-empty">No activity logs yet.</p>
        ) : (
          <ul className="activity-list">
            {activities.slice(0, 8).map((activity) => (
              <li key={activity.id} className="activity-item">
                <div>
                  <p className="activity-title">{activity.topic}</p>
                  <p className="activity-meta">
                    {activity.hours} hr | {activity.category} | {new Date(activity.createdAt || Date.now()).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  className="item-delete-btn"
                  disabled={deletingActivityId === activity.id}
                  onClick={() => handleDeleteActivity(activity.id)}
                >
                  {deletingActivityId === activity.id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
