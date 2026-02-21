import { useEffect, useMemo, useState } from 'react';
import { getCurrentStudent } from '../../../services/authService';
import { subscribeActivitiesForUser } from '../../student/services/activityService';
import { adjustGoalTarget, subscribeWeeklyGoals } from '../services/goalService';

export default function StudentGoalCenter() {
  const student = getCurrentStudent();
  const userId = student?.uid || '';
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!userId) return () => {};
    const stopGoals = subscribeWeeklyGoals(userId, setGoals);
    const stopActivities = subscribeActivitiesForUser(userId, setActivities);
    return () => {
      stopGoals();
      stopActivities();
    };
  }, [userId]);

  const goalCards = useMemo(() => {
    const thisWeekCount = activities.filter((item) => (item.createdAt || 0) >= Date.now() - 7 * 24 * 60 * 60 * 1000).length;
    return goals.map((goal) => {
      const nextTarget = goal.autoAdjust ? adjustGoalTarget(goal.target, thisWeekCount) : goal.target;
      const progress = goal.target ? Math.min(100, Math.round((thisWeekCount / goal.target) * 100)) : 0;
      return { ...goal, thisWeekCount, nextTarget, progress };
    });
  }, [goals, activities]);
  const thisWeekCount = activities.filter((item) => (item.createdAt || 0) >= Date.now() - 7 * 24 * 60 * 60 * 1000).length;
  const totalHours = activities
    .filter((item) => (item.createdAt || 0) >= Date.now() - 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
  const recommendation = thisWeekCount < 3
    ? 'Start with 3 focused sessions this week to build momentum.'
    : thisWeekCount < 6
      ? 'Good progress. Push one extra session to move into dedicated mode.'
      : 'Great consistency. Maintain this pace and increase difficulty.';

  return (
    <section className="dashboard-page">
      <h1 className="dashboard-title">Smart Goal System</h1>
      <div className="dashboard-grid">
        <article className="dashboard-card">
          <p className="dashboard-card-label">This Week Sessions</p>
          <p className="dashboard-card-value">{thisWeekCount}</p>
        </article>
        <article className="dashboard-card">
          <p className="dashboard-card-label">This Week Hours</p>
          <p className="dashboard-card-value">{Math.round(totalHours * 100) / 100}</p>
        </article>
        <article className="dashboard-card">
          <p className="dashboard-card-label">Auto Coach Tip</p>
          <p className="dashboard-meta">{recommendation}</p>
        </article>
      </div>
      {goalCards.length === 0 ? (
        <article className="dashboard-section dashboard-section-hover">
          <h3 className="dashboard-section-title">No weekly goals assigned</h3>
          <p className="dashboard-meta">You can still begin with this starter plan:</p>
          <ul className="dashboard-simple-list">
            <li>Attempt 1 timed aptitude set</li>
            <li>Solve 2 technical problems</li>
            <li>Review 1 weak topic and log progress</li>
          </ul>
        </article>
      ) : (
        <div className="dashboard-grid">
          {goalCards.map((goal) => (
            <article key={goal.id} className="dashboard-card">
              <p className="dashboard-card-label">{goal.title}</p>
              <p className="dashboard-meta">Current target: {goal.target}</p>
              <p className="dashboard-meta">You completed: {goal.thisWeekCount}</p>
              <p className="dashboard-meta">Next week target: {goal.nextTarget}</p>
              <div className="test-progress"><div className="test-progress-fill" style={{ width: `${goal.progress}%` }} /></div>
              <p className="dashboard-meta">Progress: {goal.progress}%</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
