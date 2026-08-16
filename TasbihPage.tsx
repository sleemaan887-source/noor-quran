import { useState, useEffect, useCallback } from 'react';
import { PageHeader, Card, toArabicDigits } from '@/core/widgets/ui';
import { RotateCcw, Vibrate, Volume2, VolumeX, Award, Hand } from 'lucide-react';
import { loadJSON, saveJSON } from '@/core/utils/storage';
import { playReminderAudio, stopReminderAudio, isAudioSupported } from '@/core/services/voiceReminders';

interface TasbihPreset {
  id: string;
  text: string;
  label: string;
  target: number;
  color: string;
}

const PRESETS: TasbihPreset[] = [
  { id: 'subhan', text: 'سُبْحَانَ اللَّهِ', label: 'تسبيح', target: 33, color: 'from-primary-500 to-primary-700' },
  { id: 'hamd', text: 'الْحَمْدُ لِلَّهِ', label: 'تحميد', target: 33, color: 'from-secondary-500 to-secondary-700' },
  { id: 'takbir', text: 'اللَّهُ أَكْبَرُ', label: 'تكبير', target: 34, color: 'from-gold-500 to-gold-700' },
  { id: 'istighfar', text: 'أَسْتَغْفِرُ اللَّهَ', label: 'استغفار', target: 100, color: 'from-primary-600 to-secondary-600' },
  { id: 'salah', text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', label: 'صلاة على النبي', target: 100, color: 'from-gold-600 to-primary-700' },
  { id: 'tahlil', text: 'لَا إِلَهَ إِلَّا اللَّهُ', label: 'تهليل', target: 100, color: 'from-secondary-600 to-gold-600' },
  { id: 'hawqala', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', label: 'حوقلة', target: 100, color: 'from-primary-500 to-gold-600' },
  { id: 'takathur', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', label: 'تسبيح وحمد', target: 100, color: 'from-gold-500 to-secondary-600' },
];

interface TasbihRecord {
  [presetId: string]: { count: number; date: string; totalCompleted: number };
}

const RECORD_KEY = 'noor.tasbihRecords';

function loadRecords(): TasbihRecord {
  return loadJSON<TasbihRecord>(RECORD_KEY, {});
}

function saveRecords(r: TasbihRecord): void {
  saveJSON(RECORD_KEY, r);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TasbihPage() {
  const [activePreset, setActivePreset] = useState<TasbihPreset>(PRESETS[0]);
  const [count, setCount] = useState(0);
  const [records, setRecords] = useState<TasbihRecord>(() => loadRecords());
  const [vibrate, setVibrate] = useState(true);
  const [voiceOn, setVoiceOn] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [pulse, setPulse] = useState(false);

  const today = todayStr();

  useEffect(() => {
    const rec = records[activePreset.id];
    if (rec && rec.date === today) {
      setCount(rec.count % activePreset.target);
      setRounds(Math.floor(rec.count / activePreset.target));
    } else {
      setCount(0);
      setRounds(0);
    }
  }, [activePreset]); // eslint-disable-line react-hooks/exhaustive-deps

  const doCount = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      if (vibrate && 'vibrate' in navigator) navigator.vibrate(30);

      if (next >= activePreset.target) {
        if (vibrate && 'vibrate' in navigator) navigator.vibrate([50, 30, 50]);
        setRounds((r) => r + 1);
        if (voiceOn) playReminderAudio(activePreset.id === 'salah' ? 'salah_on_muhammad' : activePreset.id === 'istighfar' ? 'istighfar' : 'subhan_allah');
        const newRecords = {
          ...records,
          [activePreset.id]: {
            count: (records[activePreset.id]?.date === today ? records[activePreset.id]?.count ?? 0 : 0) + next,
            date: today,
            totalCompleted: (records[activePreset.id]?.totalCompleted ?? 0) + 1,
          },
        };
        setRecords(newRecords);
        saveRecords(newRecords);
        setPulse(true);
        setTimeout(() => setPulse(false), 400);
        return 0;
      }

      const newRecords = {
        ...records,
        [activePreset.id]: {
          count: (records[activePreset.id]?.date === today ? records[activePreset.id]?.count ?? 0 : 0) + 1,
          date: today,
          totalCompleted: records[activePreset.id]?.totalCompleted ?? 0,
        },
      };
      setRecords(newRecords);
      saveRecords(newRecords);
      return next;
    });
  }, [activePreset, vibrate, voiceOn, records, today]);

  const reset = () => {
    setCount(0);
    setRounds(0);
    const newRecords = {
      ...records,
      [activePreset.id]: { count: 0, date: today, totalCompleted: records[activePreset.id]?.totalCompleted ?? 0 },
    };
    setRecords(newRecords);
    saveRecords(newRecords);
  };

  const progress = (count / activePreset.target) * 100;
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference - (progress / 100) * circumference;

  const todayTotal = Object.values(records)
    .filter((r) => r.date === today)
    .reduce((sum, r) => sum + r.count, 0);

  const allTimeTotal = Object.values(records).reduce((sum, r) => sum + (r.totalCompleted ?? 0), 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="المسبحة الإلكترونية"
        subtitle="سبّح واستغفر واحفظ عدّتك"
        icon={<Hand className="h-6 w-6" />}
      />

      {/* Preset selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePreset(p)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activePreset.id === p.id
                ? `bg-gradient-to-br ${p.color} text-white shadow-soft`
                : 'bg-white text-primary-600 shadow-soft hover:bg-sand-50 dark:bg-night-800 dark:text-sand-200 dark:hover:bg-night-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Counter circle */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col items-center justify-center py-12">
            <p className="mb-2 font-quran text-2xl text-primary-600 dark:text-sand-100">
              {activePreset.text}
            </p>
            <p className="mb-6 text-sm text-primary-400 dark:text-sand-400">
              الهدف: {toArabicDigits(activePreset.target)} مرة
            </p>

            {/* Progress ring + tap area */}
            <div className="relative">
              <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
                <circle
                  cx="140" cy="140" r="120"
                  fill="none"
                  strokeWidth="12"
                  className="stroke-sand-200 dark:stroke-white/10"
                />
                <circle
                  cx="140" cy="140" r="120"
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className={`stroke-current ${pulse ? 'transition-none' : 'transition-all duration-300'} text-secondary-500`}
                  style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }}
                />
              </svg>
              <button
                onClick={doCount}
                className={`absolute inset-0 flex flex-col items-center justify-center rounded-full transition active:scale-95 ${pulse ? 'scale-110' : ''}`}
                aria-label="تسبيح"
              >
                <span className="font-display text-6xl font-bold text-primary-600 dark:text-sand-50 tabular-nums">
                  {toArabicDigits(count)}
                </span>
                <span className="mt-1 text-sm text-primary-400 dark:text-sand-400">
                  / {toArabicDigits(activePreset.target)}
                </span>
                <span className="mt-2 rounded-full bg-gold-500/15 px-3 py-0.5 text-xs text-gold-600 dark:text-gold-400">
                  الجولات: {toArabicDigits(rounds)}
                </span>
              </button>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-xl bg-sand-100 px-4 py-2.5 text-sm font-medium text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200 dark:hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" /> تصفير
              </button>
              <button
                onClick={() => { setVibrate(!vibrate); if (vibrate && 'vibrate' in navigator) navigator.vibrate(0); }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  vibrate
                    ? 'bg-secondary-500 text-white hover:bg-secondary-600'
                    : 'bg-sand-100 text-primary-600 hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200'
                }`}
              >
                <Vibrate className="h-4 w-4" /> اهتزاز
              </button>
              {isAudioSupported() && (
                <button
                  onClick={() => {
                    if (voiceOn) { stopReminderAudio(); setVoiceOn(false); }
                    else setVoiceOn(true);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    voiceOn
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-sand-100 text-primary-600 hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200'
                  }`}
                >
                  {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  صوت
                </button>
              )}
            </div>

            <p className="mt-4 text-xs text-primary-400 dark:text-sand-400">
              اضغط على الدائرة للتسبيح
            </p>
          </Card>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-gold-500" />
              <h2 className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">إحصائيات اليوم</h2>
            </div>
            <div className="space-y-3">
              <StatRow label="مجموع التسبيح اليوم" value={toArabicDigits(todayTotal)} />
              <StatRow label="الجولات المكتملة" value={toArabicDigits(
                Object.entries(records).filter(([, r]) => r.date === today).reduce((s, [k, r]) => {
                  const target = PRESETS.find((p) => p.id === k)?.target ?? 1;
                  return s + Math.floor(r.count / target);
                }, 0)
              )} />
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-lg font-bold text-primary-600 dark:text-sand-100">تفصيل العدّات</h2>
            <div className="space-y-2">
              {PRESETS.map((p) => {
                const rec = records[p.id];
                const dayCount = rec && rec.date === today ? rec.count : 0;
                if (dayCount === 0) return null;
                return (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-sand-50 px-3 py-2 dark:bg-white/5">
                    <span className="text-sm text-primary-600 dark:text-sand-200">{p.label}</span>
                    <span className="font-display text-sm font-bold text-secondary-500 tabular-nums">{toArabicDigits(dayCount)}</span>
                  </div>
                );
              })}
              {Object.values(records).filter((r) => r.date === today).length === 0 && (
                <p className="text-center text-sm text-primary-400 dark:text-sand-400">ابدأ التسبيح الآن</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-primary-500 dark:text-sand-300">{label}</span>
      <span className="font-display text-lg font-bold text-secondary-500 tabular-nums">{value}</span>
    </div>
  );
}
