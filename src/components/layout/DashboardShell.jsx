import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useThemePreference from '../../hooks/useThemePreference';
import illustration from '../../../images/Illustration.jpg';

function MenuIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function BellIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17H5l1.2-1.3c.5-.5.8-1.2.8-1.9v-2.2a5 5 0 0 1 10 0v2.2c0 .7.3 1.4.8 1.9L19 17h-4Zm-1 3a2 2 0 0 1-4 0" />
    </svg>
  );
}

function SunIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </svg>
  );
}

function MoonIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.2A8.2 8.2 0 1 1 9.8 4c-.1.5-.2 1-.2 1.5a8.6 8.6 0 0 0 8.6 8.7c.6 0 1.2 0 1.8-.1Z" />
    </svg>
  );
}

function LogoutIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l-5-5 5-5M5 12h12M14 5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}

function getInitials(name) {
  const tokens = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length) return 'PL';
  const initials = tokens
    .slice(0, 2)
    .map((token) => token[0].toUpperCase())
    .join('');
  return initials || 'PL';
}

export default function DashboardShell({
  roleTitle,
  roleTagline,
  navItems,
  onLogout,
  streakText,
  userName,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, setIsDarkMode } = useThemePreference();

  const initials = useMemo(() => getInitials(userName), [userName]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f0ff] text-[#8f79cf] transition-colors duration-300 dark:bg-[#f0e6ff] dark:text-[#e2ecf5]">
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-100">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#cdb7ff]/35 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#bda9f4]/20 blur-3xl dark:bg-[#a992e4]/30" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#ad98e6]/20 blur-3xl dark:bg-[#ad98e6]/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(23,52,80,0.14)_1px,transparent_0)] [background-size:20px_20px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-30 mb-6 flex items-center justify-between rounded-2xl border border-[#d9ccf4] bg-[#fbf8ff]/95 px-3 py-3 shadow-lg backdrop-blur-xl dark:border-[#a28ccc] dark:bg-[#f4edff]/90 sm:px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex rounded-xl border border-[#beaee8] bg-white p-2 text-[#544777] transition hover:bg-[#f1ebff] lg:hidden dark:border-[#a28ccc] dark:bg-[#f1eaff] dark:text-[#4d3f71]"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#8f79cf] text-sm font-bold text-[#2d1f4d] shadow-lg dark:bg-[#d8c7ff] dark:text-[#8f79cf]">
              PL
            </div>
            <div>
              <p className="text-lg font-black text-[#8f79cf] dark:text-[#2d1f4d]">{roleTitle}</p>
              <p className="text-xs text-[#5b4f7a] dark:text-[#6a5b8e]">{roleTagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden rounded-xl border border-[#d9ccf4] bg-[#f1ebff] px-3 py-2 text-xs font-medium text-[#8f79cf] sm:block dark:border-[#a28ccc] dark:bg-[#f1eaff] dark:text-[#4d3f71]">
              {streakText}
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="rounded-xl border border-[#beaee8] bg-white p-2 text-[#544777] transition hover:-translate-y-0.5 hover:border-[#a992e4] hover:text-[#8f79cf] dark:border-[#a28ccc] dark:bg-[#f1eaff] dark:text-[#4d3f71]"
            >
              <BellIcon />
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              aria-label="Toggle theme"
              className="rounded-xl border border-[#beaee8] bg-white p-2 text-[#544777] transition hover:-translate-y-0.5 hover:border-[#a992e4] hover:text-[#8f79cf] dark:border-[#a28ccc] dark:bg-[#f1eaff] dark:text-[#4d3f71]"
            >
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#a992e4] text-sm font-semibold text-[#2d1f4d] shadow-lg dark:bg-[#cdb7ff] dark:text-[#8f79cf]">
              {initials}
            </div>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
          <aside
            className={[
              'fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] transform overflow-y-auto border-r border-[#d9ccf4] bg-[#fbf8ff]/95 p-5 shadow-xl backdrop-blur-xl transition-transform duration-300 dark:border-[#a28ccc] dark:bg-[#f4edff]/95 lg:static lg:w-auto lg:max-w-none lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-lg',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            ].join(' ')}
            aria-label="Sidebar"
          >
            <div className="mb-4 hidden overflow-hidden rounded-xl border border-[#d9ccf4] bg-white/80 p-2 shadow md:block dark:border-[#a28ccc] dark:bg-[#f1eaff] lg:block">
              <img src={illustration} alt="PrepLens illustration" className="h-24 w-full rounded-lg object-cover" />
            </div>

            <div className="flex items-center justify-between lg:hidden">
              <p className="text-sm font-semibold text-[#5b4f7a] dark:text-[#4d3f71]">Navigation</p>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg border border-[#beaee8] px-2 py-1 text-xs text-[#544777] dark:border-[#a28ccc] dark:text-[#4d3f71]"
              >
                Close
              </button>
            </div>

            <nav className="mt-4 grid gap-2 lg:mt-0">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={[
                      'rounded-xl px-4 py-3 text-sm font-medium transition duration-200',
                      isActive
                        ? 'bg-[#d8c7ff] text-[#2d1f4d] shadow-lg dark:bg-[#d8c7ff] dark:text-[#2d1f4d]'
                        : 'text-[#5b4f7a] hover:-translate-y-0.5 hover:bg-[#f1ebff] hover:text-[#2d1f4d] dark:text-[#5b4f7a] dark:hover:bg-[#f1ebff] dark:hover:text-[#2d1f4d]',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={onLogout}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#beaee8] bg-[#f1ebff] px-4 py-2.5 text-sm font-semibold text-[#8f79cf] transition hover:bg-[#cdb7ff] dark:border-[#a28ccc] dark:bg-[#f1eaff] dark:text-[#4d3f71] dark:hover:bg-[#e5d8ff]"
            >
              <LogoutIcon />
              Logout
            </button>
          </aside>

          {sidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 z-30 bg-[#f0e6ff]/45 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            />
          )}

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}



