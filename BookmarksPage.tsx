import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, StickyNote, Trash2, ChevronLeft } from 'lucide-react';
import { PageHeader, Card, toArabicDigits, EmptyState } from '@/core/widgets/ui';
import {
  getBookmarks,
  saveBookmarks,
  getNotes,
  deleteNote,
  type Bookmark as Bm,
  type Note,
} from '@/core/services/userData';
import { getSurah } from '@/data/quran/surahs';

type Tab = 'bookmarks' | 'notes';

export function BookmarksPage() {
  const [tab, setTab] = useState<Tab>('bookmarks');
  const [bookmarks, setBookmarks] = useState<Bm[]>(() => getBookmarks());
  const [notes, setNotes] = useState<Note[]>(() => getNotes());

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
    saveBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const removeNote = (id: string) => {
    deleteNote(id);
    setNotes(getNotes());
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="العلامات والملاحظات"
        subtitle="مراجعك القرآنية المحفوظة"
        icon={<Bookmark className="h-6 w-6" />}
      />

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        <TabBtn active={tab === 'bookmarks'} onClick={() => setTab('bookmarks')}>
          العلامات ({toArabicDigits(bookmarks.length)})
        </TabBtn>
        <TabBtn active={tab === 'notes'} onClick={() => setTab('notes')}>
          الملاحظات ({toArabicDigits(notes.length)})
        </TabBtn>
      </div>

      {tab === 'bookmarks' ? (
        bookmarks.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-8 w-8" />}
            title="لا توجد علامات"
            message="اضغط على أي آية في المصحف لإضافة علامة"
          />
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => {
              const surah = getSurah(bm.surahId);
              return (
                <Card key={bm.id} className="flex items-start gap-3">
                  <Link to={`/quran/surah/${bm.surahId}`} className="flex-1">
                    <p className="font-quran text-lg leading-loose text-primary-700 dark:text-sand-100">
                      {bm.ayahText}
                    </p>
                    <p className="mt-2 text-xs text-primary-400 dark:text-sand-400">
                      {surah?.name} • الآية {toArabicDigits(bm.ayahNumber)}
                    </p>
                  </Link>
                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/quran/surah/${bm.surahId}`}
                      className="rounded-lg bg-sand-100 p-2 text-primary-500 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200"
                      aria-label="انتقال"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="rounded-lg bg-sand-100 p-2 text-red-400 transition hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-950/30"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="h-8 w-8" />}
          title="لا توجد ملاحظات"
          message="اضغط على أي آية وأضف ملاحظة لتظهر هنا"
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const surah = getSurah(note.surahId);
            return (
              <Card key={note.id} className="flex items-start gap-3">
                <Link to={`/quran/surah/${note.surahId}`} className="flex-1">
                  <p className="text-sm leading-relaxed text-primary-600 dark:text-sand-200">
                    {note.text}
                  </p>
                  <p className="mt-2 text-xs text-primary-400 dark:text-sand-400">
                    {surah?.name} • الآية {toArabicDigits(note.ayahNumber)}
                  </p>
                </Link>
                <button
                  onClick={() => removeNote(note.id)}
                  className="rounded-lg bg-sand-100 p-2 text-red-400 transition hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-950/30"
                  aria-label="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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
