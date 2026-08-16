import { useState } from 'react';
import { HandHeart, Heart, Share2, ChevronRight } from 'lucide-react';
import { PageHeader, Card, EmptyState } from '@/core/widgets/ui';
import { DUA_CATEGORIES } from '@/data/dua/duas';
import { getAzkarFavorites, toggleAzkarFavorite } from '@/core/services/userData';

export function DuaPage() {
  const [activeId, setActiveId] = useState<string>(DUA_CATEGORIES[0].id);
  const [favorites, setFavorites] = useState<string[]>(() => getAzkarFavorites());
  const active = DUA_CATEGORIES.find((c) => c.id === activeId) ?? DUA_CATEGORIES[0];

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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="الأدعية"
        subtitle="أدعية من القرآن والسنة"
        icon={<HandHeart className="h-6 w-6" />}
      />

      {/* Category tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {DUA_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveId(cat.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeId === cat.id
                ? 'bg-primary-500 text-white shadow-soft'
                : 'bg-sand-100 text-primary-600 hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200 dark:hover:bg-white/10'
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-primary-400 dark:text-sand-400">{active.description}</p>

      <div className="space-y-4">
        {active.items.map((dua) => {
          const isFav = favorites.includes(dua.id);
          return (
            <Card key={dua.id}>
              <p className="font-quran text-xl leading-loose text-primary-700 dark:text-sand-100">{dua.text}</p>
              <p className="mt-3 text-xs text-primary-400 dark:text-sand-400">
                {dua.source} • {dua.reference}
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleFav(dua.id)} className="flex items-center gap-1.5 rounded-lg bg-sand-100 px-3 py-1.5 text-xs font-medium text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200">
                  <Heart className={`h-4 w-4 ${isFav ? 'fill-gold-500 text-gold-500' : ''}`} />
                  {isFav ? 'في المفضلة' : 'مفضلة'}
                </button>
                <button onClick={() => handleShare(dua.text)} className="flex items-center gap-1.5 rounded-lg bg-sand-100 px-3 py-1.5 text-xs font-medium text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200">
                  <Share2 className="h-4 w-4" /> مشاركة
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
