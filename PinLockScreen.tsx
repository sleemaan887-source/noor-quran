import { useState } from 'react';
import { Moon, Lock, Delete } from 'lucide-react';
import { toArabicDigits } from '@/core/widgets/ui';
import { verifyPin } from '@/core/services/userData';

export function PinLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [entry, setEntry] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const append = (d: string) => {
    if (entry.length >= 8) return;
    setEntry(entry + d);
    setError(false);
  };

  const backspace = () => {
    setEntry(entry.slice(0, -1));
    setError(false);
  };

  const submit = async () => {
    if (entry.length < 4) return;
    setChecking(true);
    const ok = await verifyPin(entry);
    setChecking(false);
    if (ok) {
      onUnlock();
    } else {
      setError(true);
      setEntry('');
    }
  };

  // Allow pressing Enter on a physical keyboard via a hidden input.
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-night-900 text-sand-50">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pinstars" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 8 L36 24 L52 30 L36 36 L30 52 L24 36 L8 30 L24 24 Z" fill="#D4AF37" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pinstars)" />
        </svg>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500/20 ring-1 ring-gold-500/30">
          <Moon className="h-8 w-8 text-gold-400" />
        </div>
        <p className="font-display text-xl font-bold">نور القرآن</p>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-sand-200/70">
          <Lock className="h-3.5 w-3.5" />
          أدخل رمز القفل
        </div>

        {/* Dots */}
        <div className="mt-6 flex gap-3">
          {Array.from({ length: Math.max(4, entry.length) }).map((_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full transition ${
                i < entry.length ? 'bg-gold-400' : 'bg-sand-200/30'
              } ${error ? 'animate-pulse bg-red-400' : ''}`}
            />
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-300">الرمز غير صحيح</p>}

        {/* Keypad */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => append(d)}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 font-display text-2xl font-bold text-sand-50 transition hover:bg-white/20 active:scale-95"
            >
              {toArabicDigits(d)}
            </button>
          ))}
          <button
            onClick={backspace}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-sand-200/70 transition hover:bg-white/15 active:scale-95"
            aria-label="حذف"
          >
            <Delete className="h-6 w-6" />
          </button>
          <button
            onClick={() => append('0')}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 font-display text-2xl font-bold text-sand-50 transition hover:bg-white/20 active:scale-95"
          >
            {toArabicDigits('0')}
          </button>
          <button
            onClick={submit}
            disabled={entry.length < 4 || checking}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 text-primary-900 font-display text-lg font-bold transition hover:bg-gold-400 active:scale-95 disabled:opacity-40"
          >
            ﺗﻢ
          </button>
        </div>
      </div>
    </div>
  );
}
