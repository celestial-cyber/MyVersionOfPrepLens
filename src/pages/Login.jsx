import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginStudent } from '../services/authService';

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
      await loginStudent({ email, password });
      navigate(from, { replace: true });
    } catch (firebaseError) {
      setError(firebaseError.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Login</h2>
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
      <p>
        New user? <Link to="/register">Create account</Link>
      </p>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: 360,
    margin: '48px auto',
    display: 'grid',
    gap: 10,
    padding: 16,
    border: '1px solid #ddd',
    borderRadius: 8,
  },
  error: { margin: 0, color: '#b00020' },
};
