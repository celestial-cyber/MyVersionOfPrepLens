export default function TaskList({ tasks }) {
  if (!tasks.length) {
    return (
      <section className="dashboard-section">
        <h3 className="dashboard-section-title">Tasks</h3>
        <p className="dashboard-empty">No tasks yet.</p>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <h3 className="dashboard-section-title">Tasks</h3>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            {task.title} {task.completed ? '✅' : '⬜'}
          </li>
        ))}
      </ul>
    </section>
  );
}
