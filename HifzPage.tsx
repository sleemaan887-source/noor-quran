import { useState } from 'react';
import { Brain, Plus, Target, CalendarDays, Trash2, ChevronLeft } from 'lucide-react';
import { PageHeader, Card, toArabicDigits, EmptyState } from '@/core/widgets/ui';
import { SURAHS, getSurah } from '@/data/quran/surahs';
import { getHifzPlans, saveHifzPlans, type HifzPlan } from '@/core/services/userData';

export function HifzPage() {
  const [plans, setPlans] = useState<HifzPlan[]>(() => getHifzPlans());
  const [showForm, setShowForm] = useState(false);

  const removePlan = (id: string) => {
    const next = plans.filter((p) => p.id !== id);
    setPlans(next);
    saveHifzPlans(next);
  };

  const addPlan = (plan: HifzPlan) => {
    const next = [plan, ...plans];
    setPlans(next);
    saveHifzPlans(next);
    setShowForm(false);
  };

  const updateProgress = (id: string, delta: number) => {
    const next = plans.map((p) => {
      if (p.id !== id) return p;
      const np = Math.max(0, Math.min(100, p.progress + delta));
      return { ...p, progress: np, completed: np >= 100 };
    });
    setPlans(next);
    saveHifzPlans(next);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="الحفظ"
        subtitle="خطط حفظ القرآن الكريم ومتابعة التقدّم"
        icon={<Brain className="h-6 w-6" />}
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
          >
            <Plus className="h-4 w-4" /> خطة جديدة
          </button>
        }
      />

      {showForm && <NewPlanForm onAdd={addPlan} onCancel={() => setShowForm(false)} />}

      {plans.length === 0 && !showForm ? (
        <EmptyState
          icon={<Brain className="h-8 w-8" />}
          title="لا توجد خطط حفظ"
          message="أنشئ خطة حفظ جديدة لتبدأ رحلتك مع حفظ كتاب الله"
        />
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const surahNames = plan.goalSurahIds.map((id) => getSurah(id)?.name).filter(Boolean).join('، ');
            return (
              <Card key={plan.id}>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">{plan.title}</p>
                    <p className="text-xs text-primary-400 dark:text-sand-400">{surahNames}</p>
                  </div>
                  <button onClick={() => removePlan(plan.id)} className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="حذف">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                  <Stat icon={<Target className="h-4 w-4" />} label="الهدف اليومي" value={`${toArabicDigits(plan.dailyGoal)} ${plan.unit === 'pages' ? 'صفحة' : 'آية'}`} />
                  <Stat icon={<CalendarDays className="h-4 w-4" />} label="المدة" value={`${toArabicDigits(plan.totalDays)} يوم`} />
                  <Stat icon={<Brain className="h-4 w-4" />} label="التقدّم" value={`${toArabicDigits(Math.round(plan.progress))}%`} />
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-sand-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-l from-secondary-500 to-primary-500 transition-all" style={{ width: `${plan.progress}%` }} />
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => updateProgress(plan.id, 5)} className="flex-1 rounded-lg bg-secondary-500 py-2 text-sm font-medium text-white transition hover:bg-secondary-600">
                    +{toArabicDigits(5)}%
                  </button>
                  <button onClick={() => updateProgress(plan.id, -5)} className="flex-1 rounded-lg bg-sand-100 py-2 text-sm font-medium text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200">
                    −{toArabicDigits(5)}%
                  </button>
                </div>
                {plan.completed && (
                  <p className="mt-3 text-center font-display text-secondary-500">أتممت الخطة — تقبل الله منك</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-sand-50 p-2 dark:bg-white/5">
      <div className="mb-1 flex justify-center text-primary-400">{icon}</div>
      <p className="text-[10px] text-primary-400 dark:text-sand-400">{label}</p>
      <p className="text-xs font-bold text-primary-600 dark:text-sand-200">{value}</p>
    </div>
  );
}

function NewPlanForm({ onAdd, onCancel }: { onAdd: (p: HifzPlan) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2);
  const [unit, setUnit] = useState<'pages' | 'verses'>('pages');
  const [totalDays, setTotalDays] = useState(30);

  const toggleSurah = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = () => {
    if (!title.trim() || selected.length === 0) return;
    onAdd({
      id: `plan-${Date.now()}`,
      title: title.trim(),
      goalSurahIds: selected,
      dailyGoal,
      unit,
      totalDays,
      startDate: new Date().toISOString(),
      progress: 0,
      completed: false,
    });
  };

  return (
    <Card className="mb-5">
      <div className="mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-primary-500" />
        <h2 className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">خطة حفظ جديدة</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-primary-500 dark:text-sand-300">عنوان الخطة</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: جزء عمّ"
            className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-primary-600 outline-none focus:border-secondary-500 dark:border-white/10 dark:bg-night-900 dark:text-sand-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-primary-500 dark:text-sand-300">السور المستهدفة</label>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-sand-200 bg-white p-2 dark:border-white/10 dark:bg-night-900">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {SURAHS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSurah(s.id)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-right text-xs transition ${
                    selected.includes(s.id)
                      ? 'bg-secondary-500 text-white'
                      : 'text-primary-600 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="font-bold">{toArabicDigits(s.id)}</span>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-primary-500 dark:text-sand-300">الهدف اليومي</label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-primary-600 outline-none focus:border-secondary-500 dark:border-white/10 dark:bg-night-900 dark:text-sand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-primary-500 dark:text-sand-300">الوحدة</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'pages' | 'verses')}
              className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-primary-600 outline-none focus:border-secondary-500 dark:border-white/10 dark:bg-night-900 dark:text-sand-100"
            >
              <option value="pages">صفحة</option>
              <option value="verses">آية</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-primary-500 dark:text-sand-300">المدة (يوم)</label>
            <input
              type="number"
              value={totalDays}
              onChange={(e) => setTotalDays(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-primary-600 outline-none focus:border-secondary-500 dark:border-white/10 dark:bg-night-900 dark:text-sand-100"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={submit} disabled={!title.trim() || selected.length === 0} className="flex-1 rounded-xl bg-primary-500 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50">
            إنشاء الخطة
          </button>
          <button onClick={onCancel} className="rounded-xl bg-sand-100 px-4 py-2.5 text-sm font-medium text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200">
            إلغاء
          </button>
        </div>
      </div>
    </Card>
  );
}
