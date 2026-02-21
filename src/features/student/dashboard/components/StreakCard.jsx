export default function StreakCard({ streakDays }) {
  return (
    <section className="dashboard-section dashboard-section-hover">
      <h3 className="dashboard-section-title">Study Streak</h3>
      <p className="streak-value">{streakDays} days</p>
      <p className="streak-note">Keep your streak alive by logging at least one session daily.</p>
    </section>
  );
}
