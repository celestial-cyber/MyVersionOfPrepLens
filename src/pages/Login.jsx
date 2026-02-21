import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginStudent } from '../services/authService';
import '../styles/global.css';

const DEMO_PASSWORD = 'demo123';
const DEMO_ACCOUNTS = [
  {
    label: 'Admin Demo',
    email: 'admin@email.com',
    destination: 'Admin dashboard with student analytics',
  },
  {
    label: 'Student Demo',
    email: 'student@email.com',
    destination: 'Student dashboard with tasks and activity log',
  },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/student/dashboard';

  useEffect(() => {
    window.history.pushState({ loginGuard: true }, '', window.location.href);

    const handlePopState = () => {
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const fillDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

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
    <section className="relative min-h-screen overflow-hidden bg-white text-black transition-colors duration-500 dark:bg-black dark:text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-neutral-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-neutral-200/30 blur-3xl dark:bg-neutral-700/20" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-neutral-400/20 blur-3xl dark:bg-neutral-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(120,120,120,0.22)_1px,transparent_0)] [background-size:22px_22px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(180,180,180,0.12)_1px,transparent_0)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10 sm:px-8">
        <form
          onSubmit={handleSubmit}
          className="grid w-full max-w-lg gap-4 rounded-3xl border border-neutral-300 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8 dark:border-neutral-800 dark:bg-black/90"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tight text-black dark:text-white">
              PrepLens
            </h2>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:border-neutral-500 hover:text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              Back to Home
            </button>
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Sign in to continue to your learning command center.
          </p>

          <div className="grid gap-2 rounded-2xl border border-neutral-300 bg-neutral-100 p-3 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700 dark:text-neutral-300">
              Quick Demo Access
            </p>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemoCredentials(account.email)}
              className="grid gap-0.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <strong className="text-sm text-neutral-800 dark:text-neutral-100">{account.label}</strong>
              <span className="text-xs text-neutral-600 dark:text-neutral-300">{account.destination}</span>
            </button>
          ))}
            <p className="text-xs text-neutral-600 dark:text-neutral-300">Password for demo: {DEMO_PASSWORD}</p>
          </div>

          <label htmlFor="login-email" className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Email</label>
          <input
            id="login-email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <label htmlFor="login-password" className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Password</label>
          <input
            id="login-password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl border border-neutral-700 bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 dark:border-neutral-300 dark:bg-white dark:text-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
          {error && <p className="text-sm text-neutral-700 dark:text-neutral-300">{error}</p>}
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            New user? <Link className="font-semibold text-black underline dark:text-white" to="/register">Create account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}



