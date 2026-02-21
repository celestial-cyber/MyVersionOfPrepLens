import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginStudent } from '../services/authService';
import '../styles/global.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/student/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) return;
    setError('');
    setIsSubmitting(true);
    try {
      const user = await loginStudent({ email, password });
      const normalized = String(user?.email || email).toLowerCase();
      const target = normalized === 'admin@email.com' ? '/admin/dashboard' : from;
      navigate(target, { replace: true });
    } catch (firebaseError) {
      setError(
        firebaseError.message ||
        'Login failed. Use demo emails: admin@email.com or student@email.com.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>PrepLens Login</h2>
        <p style={styles.subtle}>Demo users: admin@email.com, student@email.com</p>
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.subtle}>
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </section>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 16,
  },
  form: {
    maxWidth: 360,
    width: '100%',
    display: 'grid',
    gap: 10,
    padding: 16,
    border: '1px solid #ddd',
    borderRadius: 8,
    background: '#fff',
  },
  title: { margin: 0 },
  subtle: { margin: 0, color: '#444' },
  error: { margin: 0, color: '#b00020' },
};
