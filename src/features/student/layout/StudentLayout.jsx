import { Outlet, useNavigate } from 'react-router-dom';
import DashboardShell from '../../../components/layout/DashboardShell';
import { getCurrentStudent, logoutStudent } from '../../../services/authService';

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/tests', label: 'Tests' },
  { to: '/student/goals', label: 'Goals' },
  { to: '/student/leaderboard', label: 'Leaderboard' },
  { to: '/student/interviews', label: 'Mock Interviews' },
  { to: '/student/log', label: 'Log Activity' },
  { to: '/student/messages', label: 'Admin Messages' },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const student = getCurrentStudent();

  const handleLogout = async () => {
    try {
      await logoutStudent();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      navigate('/login');
    }
  };

  return (
    <DashboardShell
      roleTitle="Student Workspace"
      roleTagline="Stay consistent and placement-ready"
      navItems={navItems}
      onLogout={handleLogout}
      streakText="Current streak tracking"
      userName={student?.displayName || student?.email || 'Student'}
    >
      <Outlet />
    </DashboardShell>
  );
}
