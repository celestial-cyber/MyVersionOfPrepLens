const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDayKey(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getIntensityClass(hours) {
  if (hours <= 0) return 'heatmap-cell-0';
  if (hours < 1) return 'heatmap-cell-1';
  if (hours < 2) return 'heatmap-cell-2';
  if (hours < 4) return 'heatmap-cell-3';
  return 'heatmap-cell-4';
}

export default function StreakHeatmap({ activities = [], totalDays = 56 }) {
  const today = getDayKey(Date.now());
  const dayTotals = new Map();

  activities.forEach((activity) => {
    const createdAt = Number(activity.createdAt);
    const hours = Number(activity.hours);
    if (!Number.isFinite(createdAt) || createdAt <= 0 || createdAt > Date.now()) return;
    if (!Number.isFinite(hours) || hours <= 0) return;
    const key = getDayKey(createdAt);
    dayTotals.set(key, (dayTotals.get(key) || 0) + hours);
  });

  const cells = [];
  for (let i = totalDays - 1; i >= 0; i -= 1) {
    const dayMillis = today - i * DAY_MS;
    const hours = Math.round((dayTotals.get(dayMillis) || 0) * 10) / 10;
    cells.push({
      dayMillis,
      hours,
      label: new Date(dayMillis).toLocaleDateString(),
      weekday: new Date(dayMillis).getDay(),
      intensityClass: getIntensityClass(hours),
    });
  }

  const totalLoggedDays = cells.filter((cell) => cell.hours > 0).length;

  return (
    <section className="dashboard-section dashboard-section-hover">
      <h3 className="dashboard-section-title">Consistency Streak Grid</h3>
      <p className="streak-note">GitHub-style view of your last {Math.round(totalDays / 7)} weeks.</p>
      <div className="heatmap-wrap" role="img" aria-label="Streak heatmap for recent study activity">
        <div className="heatmap-weekdays">
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
        <div className="heatmap-grid">
          {cells.map((cell) => (
            <span
              key={cell.dayMillis}
              className={`heatmap-cell ${cell.intensityClass}`}
              title={`${cell.label}: ${cell.hours} hrs`}
              aria-label={`${cell.label} ${cell.hours} hours`}
              data-weekday={cell.weekday}
            />
          ))}
        </div>
      </div>
      <p className="heatmap-summary">{totalLoggedDays} active days in the last {Math.round(totalDays / 7)} weeks.</p>
    </section>
  );
}
