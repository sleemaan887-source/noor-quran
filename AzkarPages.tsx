import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, Heart, RotateCcw, Share2, ChevronRight, Check } from 'lucide-react';
import { PageHeader, Card, toArabicDigits, EmptyState } from '@/core/widgets/ui';
import { AZKAR_CATEGORIES } from '@/data/azkar/azkar';
import {
  getAzkarCounters,
  saveAzkarCounters,
  getAzkarFavorites,
  toggleAzkarFavorite,
} from '@/core/services/userData';

export function AzkarListPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="الأذكار"
        subtitle="أذكار الصباح والمساء والمناسبات"
        icon={<Sparkles className="h-6 w-6" />}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {AZKAR_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={`/azkar/${cat.id}`}
            className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-card dark:border-white/10 dark:bg-night-800"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 text-white">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">{cat.title}</p>
              <p className="text-xs text-primary-400 dark:text-sand-400">{cat.description}</p>
              <p className="mt-1 text-xs text-secondary-500">{toArabicDigits(cat.items.length)} ذكر</p>
            </div>
            <ChevronRight className="h-5 w-5 text-primary-300 transition group-hover:-translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AzkarCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const cat = AZKAR_CATEGORIES.find((c) => c.id === category);
  const [counters, setCounters] = useState(() => getAzkarCounters());
  const [favorites, setFavorites] = useState<string[]>(() => getAzkarFavorites());
  const today = new Date().toISOString().slice(0, 10);

  if (!cat) {
    return <EmptyState icon={<Sparkles className="h-8 w-8" />} title="القسم غير وجود" message="عُد إلى قائمة الأذكار" />;
  }

  const getCount = (id: string): number => {
    const entry = counters[id];
    if (!entry || entry.date !== today) return 0;
    return entry.count;
  };

  const increment = (id: string, max: number) => {
    const current = getCount(id);
    if (current >= max) return;
    const next = { ...counters, [id]: { count: current + 1, date: today } };
    setCounters(next);
    saveAzkarCounters(next);
  };

  const reset = (id: string) => {
    const next = { ...counters, [id]: { count: 0, date: today } };
    setCounters(next);
    saveAzkarCounters(next);
  };

  const handleFav = (id: string) => {
    toggleAzkarFavorite(id);
    setFavorites(getAzkarFavorites());
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  const totalProgress = cat.items.reduce((sum, z) => sum + Math.min(1, getCount(z.id) / z.repeatCount), 0) / cat.items.length;

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/azkar" className="flex items-center gap-1 text-sm text-primary-500 hover:underline">
          <ChevronRight className="h-4 w-4" /> الأذكار
        </Link>
      </div>
      <PageHeader title={cat.title} subtitle={cat.description} icon={<Sparkles className="h-6 w-6" />} />

      {/* Overall progress */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-500 dark:text-sand-200">التقدم الكلي</span>
          <span className="font-display text-lg font-bold text-secondary-500">{toArabicDigits(Math.round(totalProgress * 100))}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-l from-secondary-500 to-primary-500 transition-all" style={{ width: `${totalProgress * 100}%` }} />
        </div>
      </Card>

      <div className="space-y-4">
        {cat.items.map((zikr) => {
          const count = getCount(zikr.id);
          const done = count >= zikr.repeatCount;
          const isFav = favorites.includes(zikr.id);
          return (
            <Card key={zikr.id} className={done ? 'border-secondary-400 bg-secondary-50 dark:border-secondary-500/40 dark:bg-secondary-900/20' : ''}>
              <p className="font-quran text-xl leading-loose text-primary-700 dark:text-sand-100">{zikr.text}</p>
              <p className="mt-3 text-xs text-primary-400 dark:text-sand-400">
                {zikr.source} • {zikr.reference}
              </p>

              {/* Counter */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => increment(zikr.id, zikr.repeatCount)}
                  disabled={done}
                  className={`relative flex h-16 flex-1 items-center justify-center rounded-2xl text-lg font-bold transition ${
                    done
                      ? 'bg-secondary-500 text-white'
                      : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                  }`}
                >
                  {done ? (
                    <span className="flex items-center gap-2"><Check className="h-6 w-6" /> تم</span>
                  ) : (
                    <span>{toArabicDigits(count)} / {toArabicDigits(zikr.repeatCount)}</span>
                  )}
                </button>
                <button onClick={() => reset(zikr.id)} className="rounded-xl bg-sand-100 p-3 text-primary-500 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200" aria-label="إعادة">
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button onClick={() => handleFav(zikr.id)} className="rounded-xl bg-sand-100 p-3 transition hover:bg-sand-200 dark:bg-white/5" aria-label="مفضلة">
                  <Heart className={`h-5 w-5 ${isFav ? 'fill-gold-500 text-gold-500' : 'text-primary-400 dark:text-sand-300'}`} />
                </button>
                <button onClick={() => handleShare(zikr.text)} className="rounded-xl bg-sand-100 p-3 text-primary-500 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200" aria-label="مشاركة">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* progress bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${Math.min(100, (count / zikr.repeatCount) * 100)}%` }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
