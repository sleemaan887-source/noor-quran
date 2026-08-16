import { useEffect, useState } from 'react';
import { Moon } from 'lucide-react';

// Elegant splash with fade + scale animation, then reveals the app.
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1900);
    const t2 = setTimeout(onDone, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-night-900 transition-opacity duration-600 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* subtle geometric pattern backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stars" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 10 L48 32 L70 40 L48 48 L40 70 L32 48 L10 40 L32 32 Z" fill="#D4AF37" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars)" />
        </svg>
      </div>

      <div className="relative flex flex-col items-center animate-scale-in">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-[2rem] bg-white/10 shadow-glow ring-1 ring-gold-500/30 backdrop-blur">
          <Moon className="h-16 w-16 text-gold-500" strokeWidth={1.5} />
          <div className="absolute inset-0 rounded-[2rem] bg-gold-500/10 animate-pulse-soft" />
        </div>
        <h1 className="font-display text-4xl font-bold text-sand-50 sm:text-5xl">نور القرآن</h1>
        <p className="mt-4 max-w-xs text-center text-base text-sand-200/80">
          رفيقك اليومي مع القرآن والذكر
        </p>
        <p className="mt-2 font-quran text-lg text-gold-400">اقرأ • تعلّم • اذكر • تدبّر</p>
      </div>

      <div className="absolute bottom-10 flex items-center gap-2 text-sand-300/60">
        <div className="h-1 w-1 animate-pulse-soft rounded-full bg-gold-500" />
        <span className="text-xs">جارٍ التحميل...</span>
      </div>
    </div>
  );
}
