// Reusable presentational helpers used across feature screens.

import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 dark:bg-primary-400/15 dark:text-primary-300">
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-600 dark:text-sand-50 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-primary-400 dark:text-sand-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-sand-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-night-800 ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand-300 bg-white/50 px-6 py-16 text-center dark:border-white/10 dark:bg-night-800/50">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sand-100 text-primary-400 dark:bg-white/5 dark:text-sand-400">
        {icon}
      </div>
      <p className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-primary-400 dark:text-sand-400">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900/40 dark:bg-red-950/30">
      <p className="font-medium text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          حاول مرة أخرى
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-sand-200 border-t-secondary-500 dark:border-white/10 dark:border-t-secondary-400" />
      {label && <p className="mt-3 text-sm text-primary-400 dark:text-sand-400">{label}</p>}
    </div>
  );
}

// Format an integer into Arabic-Indic digits for a more native feel.
export function toArabicDigits(n: number | string): string {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n).replace(/[0-9]/g, (d) => map[Number(d)]);
}

// Decorative section divider with a small ornamental mark.
export function OrnamentalDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-gold-500/40">
      <div className="h-px flex-1 bg-gradient-to-l from-gold-500/30 to-transparent" />
      <span className="text-lg">۞</span>
      <div className="h-px flex-1 bg-gradient-to-r from-gold-500/30 to-transparent" />
    </div>
  );
}
