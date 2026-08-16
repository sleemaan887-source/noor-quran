import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Headphones,
  Sparkles,
  HandHeart,
  Type,
  Music,
  Brain,
  Mic,
  Clock,
  Compass,
  ChevronLeft,
  Sunrise,
  Bookmark,
  Layers,
  Hand,
  Volume2,
} from 'lucide-react';
import { PageHeader, Card, toArabicDigits } from '@/core/widgets/ui';
import { formatHijriFull, formatGregorianFull } from '@/core/utils/hijri';
import {
  computePrayerTimes,
  nextPrayer,
  formatTime12h,
  formatRemaining,
  setPrayerSnapshot,
  PRAYER_ORDER,
  PRAYER_LABELS,
  type Coordinates,
} from '@/core/utils/prayer';
import { getPrayerSettings, getReadingProgress } from '@/core/services/userData';
import { getSurah, SURAHS } from '@/data/quran/surahs';
import { AZKAR_CATEGORIES } from '@/data/azkar/azkar';
import { toHijri } from '@/core/utils/hijri';
import { ISLAMIC_OCCASIONS } from '@/data/calendar/occasions';

const FEATURE_CARDS = [
  { path: '/quran', label: 'القرآن', icon: BookOpen, color: 'from-primary-500 to-primary-700' },
  { path: '/quran/juz', label: 'الأجزاء', icon: Layers, color: 'from-primary-600 to-secondary-600' },
  { path: '/audio', label: 'التلاوة', icon: Headphones, color: 'from-secondary-500 to-secondary-700' },
  { path: '/azkar', label: 'الأذكار', icon: Sparkles, color: 'from-gold-500 to-gold-700' },
  { path: '/dua', label: 'الأدعية', icon: HandHeart, color: 'from-secondary-600 to-primary-600' },
  { path: '/tasbih', label: 'المسبحة', icon: Hand, color: 'from-gold-600 to-secondary-600' },
  { path: '/voice', label: 'التذكيرات', icon: Volume2, color: 'from-secondary-500 to-gold-600' },
  { path: '/tajweed', label: 'التجويد', icon: Type, color: 'from-primary-600 to-secondary-600' },
  { path: '/maqamat', label: 'المقامات', icon: Music, color: 'from-gold-600 to-primary-700' },
  { path: '/hifz', label: 'الحفظ', icon: Brain, color: 'from-primary-500 to-secondary-600' },
  { path: '/tasmee', label: 'التسميع', icon: Mic, color: 'from-secondary-500 to-gold-600' },
  { path: '/prayer', label: 'الصلاة', icon: Clock, color: 'from-primary-600 to-night-800' },
  { path: '/qibla', label: 'القبلة', icon: Compass, color: 'from-gold-500 to-secondary-600' },
];

export function HomePage() {
  const now = new Date();
  const hijri = useMemo(() => toHijri(now), []); // eslint-disable-line react-hooks/exhaustive-deps
  const settings = useMemo(() => getPrayerSettings(), []);

  const coords: Coordinates = {
    latitude: settings.latitude,
    longitude: settings.longitude,
    timezone: -new Date().getTimezoneOffset() / 60,
  };
  const times = useMemo(() => computePrayerTimes(coords, { method: settings.method, asrFactor: settings.asrFactor, date: now }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPrayerSnapshot(coords, { method: settings.method, asrFactor: settings.asrFactor });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const next = useMemo(() => nextPrayer(times, new Date()), [times, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = useMemo(() => getReadingProgress(), []);
  const lastSurah = progress ? getSurah(progress.surahId) : null;

  // Daily ayah & zikr — rotate deterministically by day-of-year so it's stable per day.
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const dailySurah = SURAHS[(dayOfYear * 7) % SURAHS.length];
  const dailyZikrCat = AZKAR_CATEGORIES[dayOfYear % AZKAR_CATEGORIES.length];
  const dailyZikr = dailyZikrCat.items[dayOfYear % dailyZikrCat.items.length];

  const occasion = ISLAMIC_OCCASIONS.find((o) => o.month === hijri.month && o.day === hijri.day);

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'طاب يومك';
    if (h < 20) return 'طاب مساؤك';
    return 'مساء الخير';
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="animate-fade-in">
      {/* Hero header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-night-900 p-6 text-sand-50 shadow-card sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hstars" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 8 L36 24 L52 30 L36 36 L30 52 L24 36 L8 30 L24 24 Z" fill="#D4AF37" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hstars)" />
          </svg>
        </div>
        <div className="relative">
          <p className="text-sm text-sand-200/80">{greeting} — السلام عليكم ورحمة الله وبركاته</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">نور القرآن</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className="text-gold-400">{formatHijriFull(now)}</span>
            <span className="text-sand-200/70">• {formatGregorianFull(now)}</span>
          </div>
          {occasion && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-3 py-1 text-xs text-gold-300 ring-1 ring-gold-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              {occasion.title}
            </div>
          )}
        </div>
      </div>

      {/* Next prayer + reading progress */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {/* Next prayer */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary-500" />
              <h2 className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">الصلاة القادمة</h2>
            </div>
            <Link to="/prayer" className="text-xs text-secondary-500 hover:underline">جميع المواقيت</Link>
          </div>
          {next ? (
            <>
              <p className="text-sm text-primary-400 dark:text-sand-400">
                تبقّى على صلاة
              </p>
              <p className="font-display text-2xl font-bold text-primary-600 dark:text-sand-50">{next.label}</p>
              <p dir="ltr" className="mt-1 text-3xl font-bold tabular-nums text-secondary-500 dark:text-secondary-300">
                {formatRemaining(next.remainingMs)}
              </p>
              <p className="mt-1 text-sm text-primary-400 dark:text-sand-400">
                وقت الأذان: {formatTime12h(next.time)}
              </p>
            </>
          ) : (
            <p className="text-sm text-primary-400">تعذّر حساب المواقيت</p>
          )}

          {/* Today's prayer strip */}
          <div className="mt-4 grid grid-cols-5 gap-1 border-t border-sand-200 pt-3 dark:border-white/10">
            {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((k) => (
              <div key={k} className="text-center">
                <p className="text-[10px] text-primary-400 dark:text-sand-400">{PRAYER_LABELS[k]}</p>
                <p dir="ltr" className="text-[11px] font-semibold text-primary-600 dark:text-sand-200">
                  {formatTime12h(times[k])}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Reading progress */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-500" />
              <h2 className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">ورد اليوم</h2>
            </div>
            <Link to="/quran" className="text-xs text-secondary-500 hover:underline">تصفّح المصحف</Link>
          </div>
          {lastSurah ? (
            <>
              <p className="text-sm text-primary-400 dark:text-sand-400">آخر قراءة</p>
              <p className="font-display text-2xl font-bold text-primary-600 dark:text-sand-50">
                {lastSurah.name}
              </p>
              <p className="text-sm text-primary-400 dark:text-sand-400">
                الآية {toArabicDigits(progress?.ayahNumber ?? 0)} • الصفحة {toArabicDigits(progress?.page ?? 0)}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-secondary-500 to-primary-500 transition-all"
                  style={{ width: `${Math.min(100, ((progress?.ayahNumber ?? 0) / lastSurah.verses) * 100)}%` }}
                />
              </div>
              <Link
                to={`/quran/surah/${lastSurah.id}`}
                className="mt-4 inline-flex items-center gap-1 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
              >
                متابعة القراءة
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-primary-400 dark:text-sand-400">لم تبدأ القراءة بعد</p>
              <p className="mt-1 font-display text-lg text-primary-500 dark:text-sand-100">ابدأ رحلتك مع القرآن</p>
              <Link
                to="/quran"
                className="mt-4 inline-flex items-center gap-1 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
              >
                ابدأ القراءة
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </>
          )}
        </Card>
      </div>

      {/* Daily cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-gold-50 to-white dark:from-night-800 dark:to-night-900">
          <div className="mb-2 flex items-center gap-2 text-gold-600 dark:text-gold-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold">سورة اليوم</span>
          </div>
          <p className="font-quran text-2xl font-bold text-primary-600 dark:text-sand-100">{dailySurah.name}</p>
          <p className="mt-1 text-sm text-primary-400 dark:text-sand-400">
            {dailySurah.verses} آية • {dailySurah.revelation === 'meccan' ? 'مكية' : 'مدنية'}
          </p>
          <Link to={`/quran/surah/${dailySurah.id}`} className="mt-3 inline-flex items-center gap-1 text-sm text-secondary-500 hover:underline">
            اقرأ الآن <ChevronLeft className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-white dark:from-night-800 dark:to-night-900">
          <div className="mb-2 flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <Sunrise className="h-4 w-4" />
            <span className="text-xs font-semibold">ذكر اليوم — {dailyZikrCat.title}</span>
          </div>
          <p className="line-clamp-2 font-quran text-lg text-primary-600 dark:text-sand-100">{dailyZikr.text}</p>
          <p className="mt-2 text-xs text-primary-400 dark:text-sand-400">{dailyZikr.source}</p>
          <Link to="/azkar" className="mt-3 inline-flex items-center gap-1 text-sm text-secondary-500 hover:underline">
            أكمل الأذكار <ChevronLeft className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* Feature grid */}
      <h2 className="mb-3 font-display text-xl font-bold text-primary-600 dark:text-sand-100">الأقسام</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FEATURE_CARDS.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.path}
              to={f.path}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-sand-200 bg-white p-4 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-card dark:border-white/10 dark:bg-night-800"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-soft transition group-hover:scale-110`}>
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-semibold text-primary-600 dark:text-sand-100">{f.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/calendar" className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-sm text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200 dark:hover:bg-white/10">
          <Clock className="h-4 w-4" /> التقويم الهجري
        </Link>
        <Link to="/hifz" className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-sm text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200 dark:hover:bg-white/10">
          <Brain className="h-4 w-4" /> خطة الحفظ
        </Link>
        <Link to="/backup" className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-sm text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200 dark:hover:bg-white/10">
          <Bookmark className="h-4 w-4" /> النسخ الاحتياطي
        </Link>
      </div>
    </div>
  );
}
