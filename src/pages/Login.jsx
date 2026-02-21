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
    <section className="relative min-h-screen overflow-hidden bg-[#f6f0ff] text-[#8f79cf] transition-colors duration-500 dark:bg-[#f0e6ff] dark:text-[#e2ecf5]">
      <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#cdb7ff]/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#bda9f4]/20 blur-3xl dark:bg-[#a992e4]/30" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[#ad98e6]/25 blur-3xl dark:bg-[#ad98e6]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(25,61,95,0.18)_1px,transparent_0)] [background-size:22px_22px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(191,219,254,0.1)_1px,transparent_0)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10 sm:px-8">
        <div className="grid w-full max-w-5xl gap-5 rounded-[2rem] border border-[#d9ccf4] bg-[#fbf8ff]/95 p-4 shadow-2xl backdrop-blur-sm md:grid-cols-[1fr_1.15fr] md:p-6 dark:border-[#a28ccc] dark:bg-[#f4edff]/90">
          <aside className="hidden h-full rounded-[1.5rem] bg-gradient-to-br from-[#cbb8f8] via-[#b9a2ef] to-[#8f79cf] p-6 text-[#2d1f4d] md:grid md:grid-rows-[auto_1fr_auto]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8c7ff]">
              PrepLens Visual Theme
            </p>
            <div className="grid place-items-center">
              <img
                src={illustration}
                alt="Student learning illustration"
                className="w-full max-w-[300px] rounded-2xl border border-white/15 bg-white/80 object-cover p-2 shadow-2xl"
              />
            </div>
            <p className="text-sm leading-6 text-[#4d3f71]">
              Track activity, close weak areas, and stay placement ready with clarity.
            </p>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 rounded-[1.5rem] border border-[#d9ccf4] bg-white p-6 shadow-xl sm:p-8 dark:border-[#a28ccc] dark:bg-[#f2e9ff]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-tight text-[#8f79cf] dark:text-[#2d1f4d]">PrepLens</h2>
              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="rounded-xl border border-[#beaee8] bg-white px-3 py-2 text-xs font-semibold text-[#544777] transition hover:border-[#a992e4] hover:bg-[#a992e4] hover:text-[#2d1f4d] dark:border-[#a28ccc] dark:bg-[#f4edff] dark:text-[#4d3f71] dark:hover:bg-[#a992e4] dark:hover:text-[#2d1f4d]"
              >
                Back to Home
              </button>
            </div>

            <p className="text-sm text-[#5e517f] dark:text-[#4d3f71]">
              Sign in to continue to your learning command center.
            </p>

            <div className="grid gap-2 rounded-2xl border border-[#d9ccf4] bg-[#f1ebff] p-3 dark:border-[#a28ccc] dark:bg-[#132a45]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#544777] dark:text-[#4d3f71]">
                Quick Demo Access
              </p>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemoCredentials(account.email)}
                  className="grid gap-0.5 rounded-xl border border-[#d9ccf4] bg-white px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-[#a992e4] dark:border-[#a28ccc] dark:bg-[#f4edff]"
                >
                  <strong className="text-sm text-[#8f79cf] dark:text-[#2d1f4d]">{account.label}</strong>
                  <span className="text-xs text-[#5e517f] dark:text-[#4d3f71]">{account.destination}</span>
                </button>
              ))}
              <p className="text-xs text-[#5e517f] dark:text-[#4d3f71]">Password for demo: {DEMO_PASSWORD}</p>
            </div>

            <label htmlFor="login-email" className="text-sm font-semibold text-[#8f79cf] dark:text-[#2d1f4d]">
              Email
            </label>
            <input
              id="login-email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-[#beaee8] bg-white px-3 py-2.5 text-sm text-[#2d1f4d] outline-none transition focus:border-[#a992e4] dark:border-[#a28ccc] dark:bg-[#f4edff] dark:text-[#2d1f4d]"
            />
            <label htmlFor="login-password" className="text-sm font-semibold text-[#8f79cf] dark:text-[#2d1f4d]">
              Password
            </label>
            <input
              id="login-password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-[#beaee8] bg-white px-3 py-2.5 text-sm text-[#2d1f4d] outline-none transition focus:border-[#a992e4] dark:border-[#a28ccc] dark:bg-[#f4edff] dark:text-[#2d1f4d]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl border border-[#8f79cf] bg-[#8f79cf] px-4 py-2.5 text-sm font-semibold text-[#2d1f4d] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#a992e4] hover:text-[#2d1f4d] dark:border-[#d8c7ff] dark:bg-[#d8c7ff] dark:text-[#2d1f4d] dark:hover:bg-[#c9b2ff] dark:hover:text-[#2d1f4d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
            {error && <p className="text-sm text-[#7a3f83] dark:text-[#2d1f4d]">{error}</p>}
            <p className="text-sm text-[#5e517f] dark:text-[#4d3f71]">
              New user?{' '}
              <Link className="font-semibold text-[#8f79cf] underline dark:text-[#2d1f4d]" to="/register">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}



