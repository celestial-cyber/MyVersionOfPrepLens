import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent } from '../services/authService';
import '../styles/global.css';
import illustration from '../../images/Illustration.jpg';

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
    <section className="relative min-h-screen overflow-hidden bg-[#f8f3df] text-[#173450] transition-colors duration-500 dark:bg-[#071425] dark:text-[#e2ecf5]">
      <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ebbe44]/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#3b91a6]/20 blur-3xl dark:bg-[#1e5b6f]/30" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[#1d3c6a]/25 blur-3xl dark:bg-[#1d3c6a]/40" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10 sm:px-8">
        <div className="grid w-full max-w-5xl gap-5 rounded-[2rem] border border-[#bfd4db] bg-[#fffbf0]/95 p-4 shadow-2xl backdrop-blur-sm md:grid-cols-[1fr_1.15fr] md:p-6 dark:border-[#2e4a63] dark:bg-[#0d1f35]/90">
          <aside className="hidden h-full rounded-[1.5rem] bg-gradient-to-br from-[#1c3154] via-[#2f5978] to-[#173450] p-6 text-white md:grid md:grid-rows-[auto_1fr_auto]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4cc61]">Welcome to PrepLens</p>
            <div className="grid place-items-center">
              <img
                src={illustration}
                alt="Student learning illustration"
                className="w-full max-w-[300px] rounded-2xl border border-white/15 bg-white/80 object-cover p-2 shadow-2xl"
              />
            </div>
            <p className="text-sm leading-6 text-[#dce9f1]">
              Build your preparation rhythm with focused tracking and clear next steps.
            </p>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 rounded-[1.5rem] border border-[#bfd4db] bg-white p-6 shadow-xl sm:p-8 dark:border-[#2e4a63] dark:bg-[#0b1a2d]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-tight text-[#173450] dark:text-white">Join PrepLens</h2>
              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                className="rounded-xl border border-[#9cb6c2] bg-white px-3 py-2 text-xs font-semibold text-[#234a6a] transition hover:border-[#1e5b6f] hover:bg-[#1e5b6f] hover:text-white dark:border-[#2e4a63] dark:bg-[#0d1f35] dark:text-[#dce9f1] dark:hover:bg-[#1e5b6f] dark:hover:text-white"
              >
                Back to Home
              </button>
            </div>

            <p className="text-sm text-[#36546f] dark:text-[#dce9f1]">
              Create your account and start tracking preparation progress.
            </p>

            <label htmlFor="register-name" className="text-sm font-semibold text-[#173450] dark:text-[#eff6ff]">
              Full Name
            </label>
            <input
              id="register-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-[#9cb6c2] bg-white px-3 py-2.5 text-sm text-[#102337] outline-none transition focus:border-[#1e5b6f] dark:border-[#2e4a63] dark:bg-[#0d1f35] dark:text-white"
            />

            <label htmlFor="register-email" className="text-sm font-semibold text-[#173450] dark:text-[#eff6ff]">
              Email
            </label>
            <input
              id="register-email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-[#9cb6c2] bg-white px-3 py-2.5 text-sm text-[#102337] outline-none transition focus:border-[#1e5b6f] dark:border-[#2e4a63] dark:bg-[#0d1f35] dark:text-white"
            />

            <label htmlFor="register-password" className="text-sm font-semibold text-[#173450] dark:text-[#eff6ff]">
              Password
            </label>
            <input
              id="register-password"
              placeholder="Create a strong password"
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
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
            {error && <p className="text-sm text-[#8b4513] dark:text-[#f4cc61]">{error}</p>}

            <p className="text-sm text-[#36546f] dark:text-[#dce9f1]">
              Already registered?{' '}
              <Link className="font-semibold text-[#173450] underline dark:text-[#f4cc61]" to="/login">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
