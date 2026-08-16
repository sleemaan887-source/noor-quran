import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Star,
  StickyNote,
  Share2,
  Copy,
  Check,
  Headphones,
} from 'lucide-react';
import { getSurah, SURAHS } from '@/data/quran/surahs';
import { fetchSurah, type Ayah } from '@/data/quran/quranApi';
import { pageToJuz, pageToHizb } from '@/data/quran/juz';
import { useTheme } from '@/core/theme/ThemeContext';
import {
  saveReadingProgress,
  toggleBookmark,
  isBookmarked,
  getNotes,
  upsertNote,
  toggleFavoriteSurah,
  getFavoriteSurahs,
  type Note,
} from '@/core/services/userData';
import { toArabicDigits, OrnamentalDivider, ErrorState, LoadingSpinner } from '@/core/widgets/ui';

export function SurahReaderPage() {
  const { id } = useParams<{ id: string }>();
  const surahId = Number(id);
  const surah = getSurah(surahId);
  const { quranFontSize, setQuranFontSize } = useTheme();

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<number[]>(() => getFavoriteSurahs());
  const [activeSheet, setActiveSheet] = useState<{ ayah: Ayah; open: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<Note[]>(() => getNotes());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSurah(surahId);
      setAyahs(data.ayahs);
      // refresh bookmark state
      const bset = new Set<string>();
      data.ayahs.forEach((a) => {
        const bid = `${surahId}:${a.numberInSurah}`;
        if (isBookmarked(bid)) bset.add(bid);
      });
      setBookmarks(bset);
    } catch {
      setError('هذه السورة لم تُحفظ على الجهاز بعد. افتحها مرة واحدة أثناء الاتصال بالإنترنت أو نزّل حزمة القرآن للاستخدام دون اتصال.');
    } finally {
      setLoading(false);
    }
  }, [surahId]);

  useEffect(() => {
    load();
  }, [load]);

  // Save reading progress when ayahs load.
  useEffect(() => {
    if (ayahs.length > 0) {
      const last = ayahs[ayahs.length - 1];
      saveReadingProgress({
        surahId,
        ayahNumber: last.numberInSurah,
        page: last.page,
        updatedAt: Date.now(),
      });
    }
  }, [ayahs, surahId]);

  if (!surah) {
    return <ErrorState message="السورة غير موجودة" />;
  }

  const handleBookmark = (ayah: Ayah) => {
    const bid = `${surahId}:${ayah.numberInSurah}`;
    const added = toggleBookmark({
      id: bid,
      surahId,
      ayahNumber: ayah.numberInSurah,
      ayahText: ayah.text,
      createdAt: Date.now(),
    });
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (added) next.add(bid);
      else next.delete(bid);
      return next;
    });
  };

  const handleFavSurah = () => {
    toggleFavoriteSurah(surahId);
    setFavorites(getFavoriteSurahs());
  };

  const openSheet = (ayah: Ayah) => {
    setActiveSheet({ ayah, open: true });
    const existing = getNotes().find((n) => n.id === `${surahId}:${ayah.numberInSurah}`);
    setNoteText(existing?.text ?? '');
    setCopied(false);
  };

  const closeSheet = () => setActiveSheet(null);

  const handleCopy = (ayah: Ayah) => {
    const text = `${ayah.text} ﴿${surah?.name}:${toArabicDigits(ayah.numberInSurah)}﴾`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (ayah: Ayah) => {
    const text = `${ayah.text} ﴿${surah?.name}:${toArabicDigits(ayah.numberInSurah)}﴾`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveNote = () => {
    if (!activeSheet) return;
    const ayah = activeSheet.ayah;
    const nid = `${surahId}:${ayah.numberInSurah}`;
    upsertNote({
      id: nid,
      surahId,
      ayahNumber: ayah.numberInSurah,
      text: noteText,
      createdAt: Date.now(),
    });
    setNotes(getNotes());
    closeSheet();
  };

  const isFav = favorites.includes(surahId);
  const prevSurah = surahId > 1 ? SURAHS[surahId - 2] : null;
  const nextSurah = surahId < 114 ? SURAHS[surahId] : null;

  return (
    <div className="animate-fade-in">
      {/* Reader header */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-sand-200 bg-sand-50/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-night-900/90 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex items-center justify-between gap-2">
          <Link to="/quran" className="flex items-center gap-1 text-sm text-primary-500 hover:underline">
            <ChevronRight className="h-4 w-4" /> السور
          </Link>
          <div className="text-center">
            <p className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">سورة {surah.name}</p>
            <p className="text-xs text-primary-400 dark:text-sand-400">
              {surah.verses} آية • {surah.revelation === 'meccan' ? 'مكية' : 'مدنية'}
            </p>
            {ayahs.length > 0 && (
              <p className="mt-1 text-[10px] text-gold-600 dark:text-gold-400">
                الجزء {toArabicDigits(pageToJuz(ayahs[0].page))} • الحزب {toArabicDigits(pageToHizb(ayahs[0].page))}
              </p>
            )}
          </div>
          <button
            onClick={handleFavSurah}
            className="rounded-lg p-2 text-primary-400 transition hover:text-gold-500"
            aria-label="إضافة السورة للمفضلة"
          >
            <Star className={`h-5 w-5 ${isFav ? 'fill-gold-500 text-gold-500' : ''}`} />
          </button>
        </div>

        {/* Font size controls */}
        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => setQuranFontSize(Math.max(20, quranFontSize - 4))}
            className="rounded-lg bg-white px-3 py-1 text-sm text-primary-600 shadow-soft dark:bg-night-800 dark:text-sand-200"
            aria-label="تصغير الخط"
          >
            −
          </button>
          <span className="text-xs text-primary-400">حجم الخط</span>
          <button
            onClick={() => setQuranFontSize(Math.min(48, quranFontSize + 4))}
            className="rounded-lg bg-white px-3 py-1 text-sm text-primary-600 shadow-soft dark:bg-night-800 dark:text-sand-200"
            aria-label="تكبير الخط"
          >
            +
          </button>
        </div>
      </div>

      {/* Basmala (except Tawbah #9) */}
      {surahId !== 1 && surahId !== 9 && (
        <p className="mb-6 text-center font-quran text-3xl text-gold-600 dark:text-gold-400">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="جارٍ تحميل السورة..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-night-800 sm:p-8">
          {/* Surah header ornament */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-gold-500/30 bg-gold-50 px-6 py-2 dark:bg-gold-500/10">
              <span className="text-gold-600 dark:text-gold-400">۞</span>
              <span className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">سورة {surah.name}</span>
              <span className="text-gold-600 dark:text-gold-400">۞</span>
            </div>
          </div>

          <p
            className="font-quran leading-loose text-primary-700 dark:text-sand-100"
            style={{ fontSize: `${quranFontSize}px`, lineHeight: 2.1, textAlign: 'justify' }}
            dir="rtl"
          >
            {ayahs.map((ayah) => {
              const bid = `${surahId}:${ayah.numberInSurah}`;
              const isBm = bookmarks.has(bid);
              const hasNote = notes.some((n) => n.id === bid);
              return (
                <span key={ayah.numberInSurah}>
                  <span
                    onClick={() => openSheet(ayah)}
                    className="cursor-pointer rounded transition hover:bg-gold-500/10"
                    title="اضغط للخيارات"
                  >
                    {ayah.text}
                  </span>
                  <span
                    className="mx-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-gold-500/40 bg-gold-50 align-middle text-xs font-semibold text-gold-700 dark:bg-gold-500/15 dark:text-gold-300"
                    onClick={() => openSheet(ayah)}
                  >
                    {toArabicDigits(ayah.numberInSurah)}
                  </span>
                  {isBm && <Bookmark className="mx-0.5 inline h-3 w-3 fill-gold-500 text-gold-500" />}
                  {hasNote && <StickyNote className="mx-0.5 inline h-3 w-3 text-secondary-500" />}
                  {' '}
                </span>
              );
            })}
          </p>

          <OrnamentalDivider />

          <div className="text-center text-sm text-primary-400 dark:text-sand-400">
            صدق الله العظيم
          </div>
        </div>
      )}

      {/* Prev / Next navigation */}
      <div className="mt-6 flex items-center justify-between">
        {prevSurah ? (
          <Link
            to={`/quran/surah/${prevSurah.id}`}
            className="inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-soft transition hover:bg-sand-50 dark:bg-night-800 dark:text-sand-200"
          >
            <ChevronRight className="h-4 w-4" />
            السابقة: {prevSurah.name}
          </Link>
        ) : (
          <span />
        )}
        {nextSurah ? (
          <Link
            to={`/quran/surah/${nextSurah.id}`}
            className="inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-soft transition hover:bg-sand-50 dark:bg-night-800 dark:text-sand-200"
          >
            التالية: {nextSurah.name}
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>

      {/* Bottom sheet */}
      {activeSheet?.open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm animate-fade-in" onClick={closeSheet} />
          <div className="relative w-full max-w-lg rounded-t-3xl border border-sand-200 bg-white p-6 shadow-2xl animate-fade-in-up dark:border-white/10 dark:bg-night-800 sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-primary-400 dark:text-sand-400">
                {surah.name} • الآية {toArabicDigits(activeSheet.ayah.numberInSurah)}
              </p>
              <button onClick={closeSheet} className="rounded-lg p-1 text-primary-400 hover:bg-sand-100 dark:hover:bg-white/10">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 font-quran text-2xl leading-loose text-primary-700 dark:text-sand-100">
              {activeSheet.ayah.text}
            </p>

            {/* Action grid */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              <SheetAction
                icon={bookmarks.has(`${surahId}:${activeSheet.ayah.numberInSurah}`) ? <Bookmark className="h-5 w-5 fill-gold-500 text-gold-500" /> : <Bookmark className="h-5 w-5" />}
                label="علامة"
                onClick={() => handleBookmark(activeSheet.ayah)}
              />
              <SheetAction icon={<Star className="h-5 w-5" />} label="مفضلة" onClick={handleFavSurah} />
              <SheetAction icon={<StickyNote className="h-5 w-5" />} label="ملاحظة" onClick={() => document.getElementById('note-area')?.focus()} />
              <SheetAction icon={copied ? <Check className="h-5 w-5 text-secondary-500" /> : <Copy className="h-5 w-5" />} label="نسخ" onClick={() => handleCopy(activeSheet.ayah)} />
              <SheetAction icon={<Share2 className="h-5 w-5" />} label="مشاركة" onClick={() => handleShare(activeSheet.ayah)} />
              <Link
                to="/audio"
                className="flex flex-col items-center gap-1.5 rounded-xl bg-sand-100 p-3 text-xs font-medium text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200 dark:hover:bg-white/10"
              >
                <Headphones className="h-5 w-5" />
                تلاوة
              </Link>
            </div>

            {/* Note area */}
            <div className="mt-4">
              <textarea
                id="note-area"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="أضف ملاحظة لهذه الآية..."
                className="h-24 w-full resize-none rounded-xl border border-sand-200 bg-sand-50 p-3 text-sm text-primary-600 outline-none focus:border-secondary-500 dark:border-white/10 dark:bg-night-900 dark:text-sand-100"
              />
              <button
                onClick={saveNote}
                className="mt-2 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600"
              >
                حفظ الملاحظة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SheetAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl bg-sand-100 p-3 text-xs font-medium text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200 dark:hover:bg-white/10"
    >
      {icon}
      {label}
    </button>
  );
}
