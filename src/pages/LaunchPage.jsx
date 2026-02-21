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
    <div className="relative min-h-screen overflow-hidden bg-[#f8f3df] text-[#173450] transition-colors duration-500 dark:bg-[#071425] dark:text-[#e2ecf5]">
      <AnimatePresence>
        {showSplash ? (
          <motion.div
            key="splash"
            className="fixed inset-0 z-50 grid place-items-center bg-[#071425]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="rounded-2xl border border-[#2e4a63] bg-[#0d1f35]/90 px-10 py-8 text-center shadow-glow"
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: [0.9, 1.03, 1], opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              <p className="text-xs uppercase tracking-[0.35em] text-[#dce9f1]">Loading</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#f4cc61] sm:text-5xl">PrepLens</h1>
              <p className="mt-2 text-sm text-[#dce9f1]">Placement Intelligence Platform</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ebbe44]/25 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#3b91a6]/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[#1d3c6a]/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(25,61,95,0.18)_1px,transparent_0)] [background-size:22px_22px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(191,219,254,0.1)_1px,transparent_0)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between rounded-2xl border border-[#bfd4db] bg-[#fffbf0]/85 px-4 py-3 shadow-lg backdrop-blur md:px-6 dark:border-[#2e4a63] dark:bg-[#0d1f35]/85">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#173450] to-[#1e5b6f] text-white shadow-lg shadow-[#173450]/35 dark:from-[#f4cc61] dark:to-[#e1b232] dark:text-[#173450]">
              <span className="text-lg font-black">P</span>
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">PrepLens</p>
              <p className="text-xs text-[#3f607b] dark:text-[#dce9f1]">Turning Preparation Into Placement Readiness</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((prev) => !prev)}
            className="rounded-xl border border-[#9cb6c2] bg-white p-2.5 text-[#234a6a] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1e5b6f] hover:bg-[#1e5b6f] hover:text-white dark:border-[#2e4a63] dark:bg-[#112844] dark:text-[#dce9f1] dark:hover:border-[#3b91a6]"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        <main className="mt-8 flex flex-1 flex-col gap-8">
          <section className="rounded-3xl border border-[#bfd4db] bg-[#fffbf0]/85 p-7 shadow-2xl backdrop-blur-sm sm:p-10 dark:border-[#2e4a63] dark:bg-[#0d1f35]/80">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="mx-auto max-w-3xl text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#3f607b] dark:text-[#dce9f1]">Smart Placement Tracker</p>
              <h1 className="mt-4 bg-gradient-to-r from-[#173450] via-[#1e5b6f] to-[#ebbe44] dark:from-[#f4cc61] dark:via-[#dce9f1] dark:to-[#3b91a6] bg-clip-text text-5xl font-black leading-tight text-transparent sm:text-6xl">
                PrepLens
              </h1>
              <h2 className="mt-4 text-xl font-semibold text-[#173450] sm:text-2xl dark:text-[#eff6ff]">
                Turning Preparation Into Placement Readiness
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#3f607b] sm:text-base dark:text-[#dce9f1]">
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
                  className="flex items-center justify-center gap-3 rounded-2xl border border-[#173450] bg-[#173450] px-6 py-4 text-base font-semibold text-white shadow-xl shadow-[#173450]/35 transition hover:bg-[#1e5b6f] hover:text-white active:bg-[#3b91a6] active:text-white dark:bg-[#f4cc61] dark:border-[#f4cc61] dark:text-[#102337] dark:hover:bg-[#e1b232] dark:hover:text-[#102337] dark:active:bg-[#d29e1d] dark:active:text-[#102337]"
                >
                  <AdminIcon />
                  Admin / Trainer Login
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Link
                  to="/student"
                  className="flex items-center justify-center gap-3 rounded-2xl border border-[#9cb6c2] bg-white px-6 py-4 text-base font-semibold text-[#173450] shadow-xl transition hover:border-[#1e5b6f] hover:bg-[#1e5b6f] hover:text-white dark:border-[#2e4a63] dark:bg-[#112844] dark:text-[#dce9f1] dark:hover:border-[#3b91a6] dark:hover:text-[#f4cc61]"
                >
                  <StudentIcon />
                  Student Login
                </Link>
              </motion.div>
            </motion.div>
          </section>

          <section className="rounded-3xl border border-[#bfd4db] bg-[#fffbf0]/85 p-7 shadow-xl backdrop-blur-sm sm:p-8 dark:border-[#2e4a63] dark:bg-[#0d1f35]/80">
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
                    className="rounded-2xl border border-[#bfd4db] bg-[#f6f2de]/70 p-5 shadow-md transition dark:border-[#2e4a63] dark:bg-[#112844]/70"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-gradient-to-br from-[#173450] to-[#1e5b6f] p-2.5 text-white shadow-lg shadow-[#173450]/35">
                        <Icon />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold">{feature.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-[#3f607b] dark:text-[#dce9f1]">{feature.description}</p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-[#bfd4db] bg-gradient-to-br from-[#fffbf0]/90 to-[#f6f2de]/90 p-7 shadow-xl sm:p-8 dark:border-[#2e4a63] dark:from-[#0d1f35]/80 dark:to-[#112844]/80">
            <h3 className="text-2xl font-bold">About PrepLens</h3>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-[#36546f] sm:text-base dark:text-[#dce9f1]">
              PrepLens helps students track preparation with clarity while enabling trainers to monitor placement readiness using real performance data, making every mentoring decision faster, objective, and impact-focused.
            </p>
          </section>
        </main>

        <footer className="mt-9 text-center">
          <div className="mx-auto mb-4 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-[#3b91a6] to-transparent" />
          <p className="text-sm tracking-wide text-[#36546f] dark:text-[#dce9f1]">
            Built with passion by <span className="font-semibold text-[#173450] dark:text-[#eff6ff]">Team Celestial Voyagers</span>
          </p>
        </footer>
      </div>
    </div>
  );
}






