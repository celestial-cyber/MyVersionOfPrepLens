import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../../services/authService';
import '../styles/admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/admin/dashboard';

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email || !password) return;

    setError('');
    setIsSubmitting(true);

    try {
      await loginAdmin({ email, password });
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Admin login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-auth-wrap">
      <form onSubmit={handleSubmit} className="admin-auth-form">
        <h1>Admin Login</h1>
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
        {error && <p className="admin-error">{error}</p>}
      </form>
    </section>
  );
}
