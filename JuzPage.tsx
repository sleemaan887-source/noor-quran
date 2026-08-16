import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Layers } from 'lucide-react';
import { PageHeader, Card, toArabicDigits } from '@/core/widgets/ui';
import { AJZA, AHZAB } from '@/data/quran/juz';
import { SURAHS } from '@/data/quran/surahs';

export function JuzPage() {
  const [view, setView] = useState<'juz' | 'hizb'>('juz');

  const surahName = (id: number) => SURAHS.find((s) => s.id === id)?.name ?? '';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="الأجزاء والأحزاب"
        subtitle="تقسيم المصحف إلى 30 جزءاً و60 حزباً"
        icon={<Layers className="h-6 w-6" />}
      />

      {/* View toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView('juz')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            view === 'juz'
              ? 'bg-primary-500 text-white shadow-soft'
              : 'bg-white text-primary-600 shadow-soft hover:bg-sand-50 dark:bg-night-800 dark:text-sand-200'
          }`}
        >
          الأجزاء (30)
        </button>
        <button
          onClick={() => setView('hizb')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            view === 'hizb'
              ? 'bg-primary-500 text-white shadow-soft'
              : 'bg-white text-primary-600 shadow-soft hover:bg-sand-50 dark:bg-night-800 dark:text-sand-200'
          }`}
        >
          الأحزاب (60)
        </button>
      </div>

      {view === 'juz' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AJZA.map((juz) => (
            <Link
              key={juz.id}
              to={`/quran/surah/${juz.startSurah}`}
              className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-card dark:border-white/10 dark:bg-night-800"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <span className="font-display text-xl font-bold">{toArabicDigits(juz.id)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-bold text-primary-600 dark:text-sand-100">
                  جزء {toArabicDigits(juz.id)}
                </p>
                <p className="truncate text-sm text-primary-400 dark:text-sand-400">{juz.name}</p>
                <p className="mt-0.5 text-xs text-secondary-500">
                  {surahName(juz.startSurah)} • آية {toArabicDigits(juz.startAyah)}
                </p>
              </div>
              <BookOpen className="h-5 w-5 text-primary-300 transition group-hover:text-secondary-500" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AHZAB.map((hizb) => (
            <Link
              key={hizb.id}
              to={`/quran/surah/${hizb.startSurah}`}
              className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-card dark:border-white/10 dark:bg-night-800"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 text-white">
                <span className="font-display text-sm font-bold">{toArabicDigits(hizb.id)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-primary-600 dark:text-sand-100">
                  {hizb.name}
                </p>
                <p className="text-xs text-primary-400 dark:text-sand-400">
                  الجزء {toArabicDigits(hizb.juzId)} • {surahName(hizb.startSurah)}: {toArabicDigits(hizb.startAyah)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
