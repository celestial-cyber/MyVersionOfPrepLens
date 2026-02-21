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

  return (
    <section className="dashboard-page">
      <h1 className="dashboard-title">Smart Goal System</h1>
      {goalCards.length === 0 ? <p className="dashboard-empty">No weekly goals assigned.</p> : (
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
