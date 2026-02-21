import { Link, useNavigate } from 'react-router-dom';
import { logoutStudent } from '../../../services/authService';

export default function Navbar() {
  const navigate = useNavigate();

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
    <nav style={styles.nav}>
      <div style={styles.brand}>PrepLens</div>
      <div style={styles.links}>
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/log">Log Activity</Link>
        <Link to="/student/messages">Admin Messages</Link>
        <button onClick={handleLogout} style={styles.button} type="button">
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #ddd',
  },
  brand: { fontWeight: 700 },
  links: { display: 'flex', gap: 12, alignItems: 'center' },
  button: { cursor: 'pointer' },
};
