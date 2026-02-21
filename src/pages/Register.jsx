import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent } from '../services/authService';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name || !email || !password) return;
    setError('');
    setIsSubmitting(true);
    try {
      await registerStudent({ name, email, password });
      navigate('/student/dashboard', { replace: true });
    } catch (firebaseError) {
      setError(firebaseError.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Register</h2>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Account'}
      </button>
      {error && <p style={styles.error}>{error}</p>}
      <p>
        Already registered? <Link to="/login">Sign in</Link>
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
