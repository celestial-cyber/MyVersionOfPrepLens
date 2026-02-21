function formatLastActive(lastActiveAt) {
  if (!lastActiveAt) return 'N/A';
  return new Date(lastActiveAt).toLocaleDateString();
}

function formatRegisteredAt(createdAt) {
  if (!createdAt) return 'N/A';
  return new Date(createdAt).toLocaleDateString();
}

export default function StudentTable({ students = [], onSelect, scrollable = false }) {
  const tableWrapClass = scrollable ? 'admin-table-wrap admin-table-wrap-scroll' : 'admin-table-wrap';
  return (
    <div className={tableWrapClass}>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Registered Via</th>
            <th>Registered On</th>
            <th>Total Activities</th>
            <th>Streak</th>
            <th>Tasks Done</th>
            <th>Progress</th>
            <th>Last Active</th>
            <th>Latest Activity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const activeCutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
            const isActive = (student.lastActiveAt || 0) >= activeCutoff;
            const readiness = Math.max(0, Math.min(100, Number(student.readinessScore) || 0));
            return (
              <tr
                key={student.uid || student.id}
                className="admin-table-row"
                onClick={() => onSelect && onSelect(student)}
              >
                <td>{student.name}</td>
                <td>{student.email || 'N/A'}</td>
                <td>{student.registrationType || 'Portal'}</td>
                <td>{formatRegisteredAt(student.createdAt)}</td>
                <td>{student.totalActivities ?? 0}</td>
                <td>{student.streakDays ?? 0} days</td>
                <td>{student.completedTasks ?? 0}</td>
                <td>
                  <div className="admin-progress-wrap">
                    <div
                      className="admin-progress-fill"
                      style={{ width: `${readiness}%` }}
                      aria-hidden="true"
                    />
                    <span>{readiness}% readiness</span>
                  </div>
                </td>
                <td>{formatLastActive(student.lastActiveAt)}</td>
                <td>{student.lastActivityTopic || 'No activity logged'}</td>
                <td>{isActive ? 'Active' : 'Inactive'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
