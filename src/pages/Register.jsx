import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent } from '../services/authService';
import '../styles/global.css';

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
    <section className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.24)_1px,transparent_0)] [background-size:22px_22px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.14)_1px,transparent_0)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10 sm:px-8">
        <form
          onSubmit={handleSubmit}
          className="grid w-full max-w-lg gap-4 rounded-3xl border border-slate-300/70 bg-white/85 p-6 shadow-2xl backdrop-blur-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900/75"
        >
          <div className="flex items-center justify-between">
            <h2 className="bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Join PrepLens
            </h2>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Back to Home
            </button>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create your account and start tracking preparation progress.
          </p>

          <label htmlFor="register-name" className="text-sm font-semibold text-slate-800 dark:text-slate-100">Full Name</label>
          <input
            id="register-name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <label htmlFor="register-email" className="text-sm font-semibold text-slate-800 dark:text-slate-100">Email</label>
          <input
            id="register-email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <label htmlFor="register-password" className="text-sm font-semibold text-slate-800 dark:text-slate-100">Password</label>
          <input
            id="register-password"
            placeholder="Create a strong password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl border border-sky-400/60 bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
          {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Already registered? <Link className="font-semibold text-cyan-700 dark:text-cyan-300" to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
