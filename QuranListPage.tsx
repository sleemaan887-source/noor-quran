import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Star, X } from 'lucide-react';
import { PageHeader, Card, toArabicDigits, EmptyState } from '@/core/widgets/ui';
import { SURAHS } from '@/data/quran/surahs';
import { searchSurahNames, searchVerses, type SearchHit } from '@/data/quran/quranApi';
import { getFavoriteSurahs, toggleFavoriteSurah } from '@/core/services/userData';

type Tab = 'all' | 'favorites';

export function QuranListPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [verseHits, setVerseHits] = useState<SearchHit[]>([]);
  const [verseSearching, setVerseSearching] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => getFavoriteSurahs());

  const filteredSurahs = useMemo(() => {
    let list = SURAHS;
    if (tab === 'favorites') list = list.filter((s) => favorites.includes(s.id));
    if (query.trim()) {
      const ids = new Set(searchSurahNames(query).map((s) => s.id));
      list = list.filter((s) => ids.has(s.id));
    }
    return list;
  }, [query, tab, favorites]);

  // Debounced verse search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setVerseHits([]);
      return;
    }
    let cancelled = false;
    setVerseSearching(true);
    const t = setTimeout(async () => {
      const hits = await searchVerses(q);
      if (!cancelled) {
        setVerseHits(hits);
        setVerseSearching(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const handleFav = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavoriteSurah(id);
    setFavorites(getFavoriteSurahs());
    return added;
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="القرآن الكريم"
        subtitle="المصحف كامل — الرسم العثماني"
        icon={<BookOpen className="h-6 w-6" />}
      />

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن سورة أو آية..."
          className="w-full rounded-xl border border-sand-200 bg-white py-3 pr-11 pl-10 text-primary-600 outline-none transition focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 dark:border-white/10 dark:bg-night-800 dark:text-sand-100"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded p-1 text-primary-400 hover:bg-sand-100 dark:hover:bg-white/10"
            aria-label="مسح البحث"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <TabButton active={tab === 'all'} onClick={() => setTab('all')}>كل السور</TabButton>
        <TabButton active={tab === 'favorites'} onClick={() => setTab('favorites')}>
          المفضلة ({favorites.length})
        </TabButton>
      </div>

      {/* Verse search results */}
      {query.trim().length >= 3 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-primary-500 dark:text-sand-200">
            نتائج البحث في الآيات {verseSearching && '...'}
          </p>
          {verseHits.length > 0 ? (
            <div className="space-y-2">
              {verseHits.slice(0, 8).map((hit, i) => (
                <Link
                  key={i}
                  to={`/quran/surah/${hit.surahId}`}
                  className="block rounded-xl border border-sand-200 bg-white p-4 transition hover:border-secondary-400 dark:border-white/10 dark:bg-night-800"
                >
                  <p className="font-quran text-lg text-primary-600 dark:text-sand-100">{hit.text}</p>
                  <p className="mt-2 text-xs text-primary-400 dark:text-sand-400">
                    {hit.surahName} • الآية {toArabicDigits(hit.ayahNumber)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            !verseSearching && <p className="text-sm text-primary-400">لا توجد نتائج</p>
          )}
        </div>
      )}

      {/* Surah list */}
      {filteredSurahs.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="لا توجد سور"
          message={tab === 'favorites' ? 'أضف سورًا إلى المفضلة لتظهر هنا' : 'جرّب بحثًا آخر'}
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filteredSurahs.map((s) => {
            const fav = favorites.includes(s.id);
            return (
              <Link
                key={s.id}
                to={`/quran/surah/${s.id}`}
                className="group flex items-center gap-4 rounded-xl border border-sand-200 bg-white p-4 transition hover:border-secondary-400 hover:shadow-soft dark:border-white/10 dark:bg-night-800"
              >
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full text-primary-200 dark:text-white/10">
                    <path d="M24 2 L30 18 L46 24 L30 30 L24 46 L18 30 L2 24 L18 18 Z" fill="currentColor" />
                  </svg>
                  <span className="relative font-display text-sm font-bold text-primary-600 dark:text-sand-100">
                    {toArabicDigits(s.id)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">{s.name}</p>
                  <p className="text-xs text-primary-400 dark:text-sand-400">
                    {s.verses} آية • {s.revelation === 'meccan' ? 'مكية' : 'مدنية'}
                  </p>
                </div>
                <button
                  onClick={(e) => handleFav(s.id, e)}
                  className="rounded-lg p-2 text-primary-300 transition hover:text-gold-500"
                  aria-label={fav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                >
                  <Star className={`h-5 w-5 ${fav ? 'fill-gold-500 text-gold-500' : ''}`} />
                </button>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-primary-500 text-white shadow-soft'
          : 'bg-sand-100 text-primary-600 hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200 dark:hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}
