export default function SummaryCards({ stats }) {
  const cards = [
    { label: 'Total Activities', value: stats.totalActivities },
    { label: 'Hours This Week', value: stats.weekHours },
    { label: 'Completed Tasks', value: stats.completedTasks },
    { label: 'Readiness Score', value: `${stats.readiness}%` },
    { label: 'Current Streak', value: `${stats.streakDays} days` },
    { label: 'Weak Areas', value: stats.weakAreasCount },
  ];

  return (
    <section className="dashboard-grid">
      {cards.map((card) => (
        <article key={card.label} className="dashboard-card">
          <div className="dashboard-card-label">{card.label}</div>
          <div className="dashboard-card-value">{card.value}</div>
        </article>
      ))}
    </section>
  );
}
