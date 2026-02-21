import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './studentLayout.css';

export default function StudentLayout() {
  return (
    <div className="student-shell">
      <Navbar />
      <div className="student-body">
        <aside className="student-sidebar" aria-label="Student section links">
          <Link to="/student/dashboard">Dashboard</Link>
          <Link to="/student/log">Log Activity</Link>
          <Link to="/student/messages">Admin Messages</Link>
        </aside>
        <main className="student-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
