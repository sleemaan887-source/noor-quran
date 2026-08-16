import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Menu, X } from 'lucide-react';
import { MAIN_NAV, TOOLS_NAV, SYSTEM_NAV, BOTTOM_NAV } from '@/core/router/nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const SidebarContent = (
    <nav className="flex h-full flex-col" aria-label="القائمة الرئيسية">
      <Link to="/" className="flex items-center gap-3 border-b border-sand-200 px-6 py-6 dark:border-white/10">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-gold-500 shadow-glow">
          <Moon className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-primary-500 dark:text-sand-50">نور القرآن</p>
          <p className="text-[11px] text-primary-400 dark:text-sand-300">اقرأ • تعلّم • اذكر • تدبّر</p>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavSection title="الأقسام الرئيسية" items={MAIN_NAV} isActive={isActive} />
        <NavSection title="الأدوات" items={TOOLS_NAV} isActive={isActive} />
        <NavSection title="النظام" items={SYSTEM_NAV} isActive={isActive} />
      </div>

      <div className="border-t border-sand-200 px-6 py-4 dark:border-white/10">
        <p className="text-xs text-primary-400 dark:text-sand-400">إصدار 1.0.0 • محمد نايف فرحان</p>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-sand-50 text-primary-500 dark:bg-night-900 dark:text-sand-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-72 border-l border-sand-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-night-800/80 lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sand-200 bg-white/85 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-night-800/85 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 text-gold-500">
            <Moon className="h-5 w-5" />
          </div>
          <span className="font-display text-base font-bold text-primary-500 dark:text-sand-50">نور القرآن</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-primary-500 transition hover:bg-sand-100 dark:text-sand-100 dark:hover:bg-white/10"
          aria-label="فتح القائمة"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-primary-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] animate-fade-in-up bg-white shadow-2xl dark:bg-night-800">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute left-3 top-3 z-10 rounded-lg p-2 text-primary-400 hover:bg-sand-100 dark:hover:bg-white/10"
              aria-label="إغلاق القائمة"
            >
              <X className="h-6 w-6" />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Main content — offset for desktop sidebar */}
      <main className="lg:mr-72">
        <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-sand-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-night-800/95 lg:hidden">
        <ul className="flex items-stretch justify-around">
          {BOTTOM_NAV.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-3 py-2.5 text-[11px] transition ${
                    active ? 'text-secondary-500 dark:text-secondary-300' : 'text-primary-400 dark:text-sand-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function NavSection({
  title,
  items,
  isActive,
}: {
  title: string;
  items: typeof MAIN_NAV;
  isActive: (p: string) => boolean;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-primary-300 dark:text-sand-400">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-primary-500 text-white shadow-soft dark:bg-primary-400'
                    : 'text-primary-600 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
