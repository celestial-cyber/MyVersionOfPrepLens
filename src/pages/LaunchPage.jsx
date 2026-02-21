import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const splashDelayMs = 1400;

function AdminIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M7 20V8l5-4 5 4v12M9.5 12h5" />
    </svg>
  );
}

function StudentIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 2 8l10 5 10-5-10-5Zm-6 8v4.5c0 1.4 2.7 3.5 6 3.5s6-2.1 6-3.5V11" />
    </svg>
  );
}

function ChartIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M7 16l3-3 2 2 5-6" />
    </svg>
  );
}

function TargetIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function FireIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.5 3.1 4.7 4.5 4.7 8.1a4.7 4.7 0 0 1-9.4 0c0-1.7.8-3.4 2.1-4.7-.2 2 .8 3 2.6 3.7C12 7.7 12.4 5.8 12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 15.4c.4 2.2 2.4 3.6 4.6 3" />
    </svg>
  );
}

function TeamIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM7.5 9a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm-2.8 9.1c.5-2.2 2.4-3.6 4.7-3.6s4.2 1.4 4.7 3.6M14.4 18c.3-1.7 1.8-2.9 3.6-2.9 1.7 0 3.1 1.1 3.6 2.7" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.2A8.2 8.2 0 1 1 9.8 4c-.1.5-.2 1-.2 1.5a8.6 8.6 0 0 0 8.6 8.7c.6 0 1.2 0 1.8-.1Z" />
    </svg>
  );
}

export default function LaunchPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('preplens-theme');
    setDarkMode(storedTheme === 'dark');

    const splashTimer = window.setTimeout(() => setShowSplash(false), splashDelayMs);
    return () => window.clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('preplens-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const features = useMemo(
    () => [
      {
        title: 'Real-Time Analytics',
        description: 'Live visibility into each student journey with actionable metrics.',
        icon: ChartIcon
      },
      {
        title: 'Readiness Score Tracking',
        description: 'Measure interview and placement readiness through evolving scores.',
        icon: TargetIcon
      },
      {
        title: 'Consistency and Streak Monitoring',
        description: 'Track momentum every day and reward consistent preparation habits.',
        icon: FireIcon
      },
      {
        title: 'Trainer Performance Insights',
        description: 'Understand mentoring impact with trainer-level and cohort-level reports.',
        icon: TeamIcon
      }
    ],
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <AnimatePresence>
        {showSplash ? (
          <motion.div
            key="splash"
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="rounded-2xl border border-sky-400/50 bg-slate-900/80 px-10 py-8 text-center shadow-glow"
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: [0.9, 1.03, 1], opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              <p className="text-xs uppercase tracking-[0.35em] text-sky-300">Loading</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">PrepLens</h1>
              <p className="mt-2 text-sm text-slate-300">Placement Intelligence Platform</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.24)_1px,transparent_0)] [background-size:22px_22px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.14)_1px,transparent_0)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-3 shadow-lg backdrop-blur md:px-6 dark:border-slate-800 dark:bg-slate-900/75">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/40">
              <span className="text-lg font-black">P</span>
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">PrepLens</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">Turning Preparation Into Placement Readiness</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((prev) => !prev)}
            className="rounded-xl border border-slate-300 bg-white/80 p-2.5 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-400"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        <main className="mt-8 flex flex-1 flex-col gap-8">
          <section className="rounded-3xl border border-slate-300/70 bg-white/75 p-7 shadow-2xl backdrop-blur-sm sm:p-10 dark:border-slate-800 dark:bg-slate-900/70">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="mx-auto max-w-3xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600 dark:text-sky-300">Smart Placement Tracker</p>
              <h1 className="mt-4 bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 bg-clip-text text-5xl font-black leading-tight text-transparent sm:text-6xl">
                PrepLens
              </h1>
              <h2 className="mt-4 text-xl font-semibold text-slate-800 sm:text-2xl dark:text-slate-100">
                Turning Preparation Into Placement Readiness
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
                Track progress, measure readiness, and mentor smarter with real-time analytics.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.65, ease: 'easeOut' }}
              className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2"
            >
              <motion.div whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-3 rounded-2xl border border-sky-400/50 bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-sky-500/30 transition"
                >
                  <AdminIcon />
                  Admin / Trainer Login
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Link
                  to="/student"
                  className="flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-900 shadow-xl transition hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
                >
                  <StudentIcon />
                  Student Login
                </Link>
              </motion.div>
            </motion.div>
          </section>

          <section className="rounded-3xl border border-slate-300/70 bg-white/75 p-7 shadow-xl backdrop-blur-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900/70">
            <h3 className="text-center text-2xl font-bold">Features Preview</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-slate-300/80 bg-slate-50/70 p-5 shadow-md transition dark:border-slate-700 dark:bg-slate-800/70"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 p-2.5 text-white shadow-lg shadow-sky-500/30">
                        <Icon />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold">{feature.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-300/70 bg-gradient-to-br from-white/80 to-cyan-50/80 p-7 shadow-xl sm:p-8 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-800/80">
            <h3 className="text-2xl font-bold">About PrepLens</h3>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300">
              PrepLens helps students track preparation with clarity while enabling trainers to monitor placement readiness using real performance data, making every mentoring decision faster, objective, and impact-focused.
            </p>
          </section>
        </main>

        <footer className="mt-9 text-center">
          <div className="mx-auto mb-4 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <p className="text-sm tracking-wide text-slate-700 dark:text-slate-300">
            Built with passion by <span className="font-semibold text-cyan-700 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] dark:text-cyan-300">Team Celestial Voyagers</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
