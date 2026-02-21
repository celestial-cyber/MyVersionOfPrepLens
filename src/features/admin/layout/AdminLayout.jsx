import { Outlet, useNavigate } from 'react-router-dom';
import DashboardShell from '../../../components/layout/DashboardShell';
import { getCurrentStudent, logoutStudent } from '../../../services/authService';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/tests', label: 'Tests' },
  { to: '/admin/goals', label: 'Goals' },
  { to: '/admin/report', label: 'Coordinator Report' },
  { to: '/admin/create-task', label: 'Create Task' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const currentUser = getCurrentStudent();

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
      roleTitle="Admin Command Center"
      roleTagline="Mentor smarter with unified analytics"
      navItems={navItems}
      onLogout={handleLogout}
      streakText="Mentoring streak insights"
      userName={currentUser?.displayName || currentUser?.email || 'Admin'}
    >
      <Outlet />
    </DashboardShell>
  );
}
