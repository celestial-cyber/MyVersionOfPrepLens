import { useState } from 'react';
import { deleteTaskForUser, updateTaskProgress } from '../../services/taskService';

const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function TaskList({ tasks, userId }) {
  const [updatingTaskId, setUpdatingTaskId] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState('');

  async function handleStatusChange(taskId, status) {
    if (!userId) return;
    setUpdatingTaskId(taskId);
    try {
      await updateTaskProgress({ userId, taskId, status });
    } catch (error) {
      console.error('Failed to update task status.', error);
    } finally {
      setUpdatingTaskId('');
    }
  }

  async function handleDelete(taskId) {
    if (!userId) return;
    const shouldDelete = window.confirm('Delete this task? This action cannot be undone.');
    if (!shouldDelete) return;
    setDeletingTaskId(taskId);
    try {
      await deleteTaskForUser({ userId, taskId });
    } catch (error) {
      console.error('Failed to delete task.', error);
    } finally {
      setDeletingTaskId('');
    }
  }

  if (!tasks.length) {
    return (
      <section className="dashboard-section">
        <h3 className="dashboard-section-title">Admin Tasks</h3>
        <p className="dashboard-empty">No tasks yet.</p>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <h3 className="dashboard-section-title">Admin Tasks</h3>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <div>
              <p className="task-title">{task.title}</p>
              <span className={`task-status ${task.completed ? 'task-status-completed' : 'task-status-pending'}`}>
                {task.completed ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>
            <label className="task-select-label">
              <select
                className="task-select"
                aria-label={`Update status for ${task.title}`}
                value={task.status || (task.completed ? 'completed' : 'pending')}
                disabled={updatingTaskId === task.id || deletingTaskId === task.id}
                onChange={(event) => handleStatusChange(task.id, event.target.value)}
              >
                {TASK_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="task-delete-btn"
                disabled={deletingTaskId === task.id}
                onClick={() => handleDelete(task.id)}
              >
                {deletingTaskId === task.id ? 'Deleting...' : 'Delete'}
              </button>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
