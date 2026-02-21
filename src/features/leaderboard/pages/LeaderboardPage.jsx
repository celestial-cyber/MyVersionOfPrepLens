import { useEffect, useState } from 'react';
import { getAllStudents } from '../../admin/services/adminDataService';
import { buildLeaderboard, buildStudentInsights } from '../../insights/services/insightService';

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const students = await getAllStudents();
      const insights = await buildStudentInsights(students);
      if (!active) return;
      setRows(buildLeaderboard(students, insights));
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="dashboard-page">
      <h1 className="dashboard-title">Peer Leaderboard</h1>
      {rows.length === 0 ? <p className="dashboard-empty">Leaderboard will appear after activity starts.</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Readiness</th>
                <th>Consistency</th>
                <th>Tests Completed</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.uid}>
                  <td>#{item.rank}</td>
                  <td>{item.name}</td>
                  <td>{item.readiness}%</td>
                  <td>{item.consistency}</td>
                  <td>{item.testsCompleted}</td>
                  <td>{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
