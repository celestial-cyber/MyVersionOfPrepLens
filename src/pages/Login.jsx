import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginStudent } from '../services/authService';
import '../styles/global.css';
import illustration from '../../images/Illustration.jpg';

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
    <section className="relative min-h-screen overflow-hidden bg-[#f8f3df] text-[#173450] transition-colors duration-500 dark:bg-[#071425] dark:text-[#e2ecf5]">
      <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ebbe44]/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#3b91a6]/20 blur-3xl dark:bg-[#1e5b6f]/30" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[#1d3c6a]/25 blur-3xl dark:bg-[#1d3c6a]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(25,61,95,0.18)_1px,transparent_0)] [background-size:22px_22px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(191,219,254,0.1)_1px,transparent_0)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10 sm:px-8">
        <div className="grid w-full max-w-5xl gap-5 rounded-[2rem] border border-[#bfd4db] bg-[#fffbf0]/95 p-4 shadow-2xl backdrop-blur-sm md:grid-cols-[1fr_1.15fr] md:p-6 dark:border-[#2e4a63] dark:bg-[#0d1f35]/90">
          <aside className="hidden h-full rounded-[1.5rem] bg-gradient-to-br from-[#1c3154] via-[#2f5978] to-[#173450] p-6 text-white md:grid md:grid-rows-[auto_1fr_auto]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4cc61]">
              PrepLens Visual Theme
            </p>
            <div className="grid place-items-center">
              <img
                src={illustration}
                alt="Student learning illustration"
                className="w-full max-w-[300px] rounded-2xl border border-white/15 bg-white/80 object-cover p-2 shadow-2xl"
              />
            </div>
            <p className="text-sm leading-6 text-[#dce9f1]">
              Track activity, close weak areas, and stay placement ready with clarity.
            </p>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 rounded-[1.5rem] border border-[#bfd4db] bg-white p-6 shadow-xl sm:p-8 dark:border-[#2e4a63] dark:bg-[#0b1a2d]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-tight text-[#173450] dark:text-white">PrepLens</h2>
              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="rounded-xl border border-[#9cb6c2] bg-white px-3 py-2 text-xs font-semibold text-[#234a6a] transition hover:border-[#1e5b6f] hover:bg-[#1e5b6f] hover:text-white dark:border-[#2e4a63] dark:bg-[#0d1f35] dark:text-[#dce9f1] dark:hover:bg-[#1e5b6f] dark:hover:text-white"
              >
                Back to Home
              </button>
            </div>

            <p className="text-sm text-[#36546f] dark:text-[#dce9f1]">
              Sign in to continue to your learning command center.
            </p>

            <div className="grid gap-2 rounded-2xl border border-[#bfd4db] bg-[#f6f2de] p-3 dark:border-[#2e4a63] dark:bg-[#132a45]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#234a6a] dark:text-[#dce9f1]">
                Quick Demo Access
              </p>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemoCredentials(account.email)}
                  className="grid gap-0.5 rounded-xl border border-[#bfd4db] bg-white px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-[#1e5b6f] dark:border-[#2e4a63] dark:bg-[#0d1f35]"
                >
                  <strong className="text-sm text-[#173450] dark:text-[#eff6ff]">{account.label}</strong>
                  <span className="text-xs text-[#36546f] dark:text-[#dce9f1]">{account.destination}</span>
                </button>
              ))}
              <p className="text-xs text-[#36546f] dark:text-[#dce9f1]">Password for demo: {DEMO_PASSWORD}</p>
            </div>

            <label htmlFor="login-email" className="text-sm font-semibold text-[#173450] dark:text-[#eff6ff]">
              Email
            </label>
            <input
              id="login-email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-[#9cb6c2] bg-white px-3 py-2.5 text-sm text-[#102337] outline-none transition focus:border-[#1e5b6f] dark:border-[#2e4a63] dark:bg-[#0d1f35] dark:text-white"
            />
            <label htmlFor="login-password" className="text-sm font-semibold text-[#173450] dark:text-[#eff6ff]">
              Password
            </label>
            <input
              id="login-password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-[#9cb6c2] bg-white px-3 py-2.5 text-sm text-[#102337] outline-none transition focus:border-[#1e5b6f] dark:border-[#2e4a63] dark:bg-[#0d1f35] dark:text-white"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl border border-[#173450] bg-[#173450] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#1e5b6f] hover:text-white dark:border-[#f4cc61] dark:bg-[#f4cc61] dark:text-[#102337] dark:hover:bg-[#e1b232] dark:hover:text-[#102337] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
            {error && <p className="text-sm text-[#8b4513] dark:text-[#f4cc61]">{error}</p>}
            <p className="text-sm text-[#36546f] dark:text-[#dce9f1]">
              New user?{' '}
              <Link className="font-semibold text-[#173450] underline dark:text-[#f4cc61]" to="/register">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
