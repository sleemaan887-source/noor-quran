import { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, ChevronRight } from 'lucide-react';
import { PageHeader, Card, toArabicDigits, EmptyState } from '@/core/widgets/ui';
import { SURAHS } from '@/data/quran/surahs';

interface TasmeeSession {
  id: string;
  surahId: number;
  fromAyah: number;
  toAyah: number;
  createdAt: number;
  blobUrl: string;
  durationSec: number;
}

export function TasmeePage() {
  const [surahId, setSurahId] = useState<number | null>(null);
  const [fromAyah, setFromAyah] = useState(1);
  const [toAyah, setToAyah] = useState(5);
  const [recording, setRecording] = useState(false);
  const [sessions, setSessions] = useState<TasmeeSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const surah = surahId ? SURAHS[surahId - 1] : null;

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (surahId) {
          setSessions((prev) => [
            {
              id: `s-${Date.now()}`,
              surahId,
              fromAyah,
              toAyah,
              createdAt: Date.now(),
              blobUrl: url,
              durationSec: duration,
            },
            ...prev,
          ]);
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start();
      setRecording(true);
    } catch {
      setError('تعذّر الوصول إلى الميكروفون. تأكد من منح الإذن ثم حاول مرة أخرى.');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const removeSession = (id: string) => {
    setSessions((prev) => {
      const s = prev.find((x) => x.id === id);
      if (s) URL.revokeObjectURL(s.blobUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="التسميع"
        subtitle="سجّل تلاوتك وراجعها — يُحفظ التسجيل محليًا فقط"
        icon={<Mic className="h-6 w-6" />}
      />

      <Card className="mb-5 bg-gradient-to-br from-secondary-50 to-white dark:from-night-800 dark:to-night-900">
        <p className="text-sm text-primary-600 dark:text-sand-100">
          يمكنك تسجيل تلاوتك وحفظها على جهازك للمراجعة. لا يتم تحليل النطق آليًا — التسميع يُراجع من قبل معلم أو من قِبلك.
        </p>
      </Card>

      {/* Step 1: choose surah */}
      <Card className="mb-4">
        <p className="mb-3 font-display font-bold text-primary-600 dark:text-sand-100">١. اختر السورة</p>
        <div className="max-h-56 overflow-y-auto rounded-xl border border-sand-200 bg-white p-2 dark:border-white/10 dark:bg-night-900">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {SURAHS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSurahId(s.id)}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-right text-xs transition ${
                  surahId === s.id ? 'bg-primary-500 text-white' : 'text-primary-600 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-white/5'
                }`}
              >
                <span className="font-bold">{toArabicDigits(s.id)}</span>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Step 2: choose range */}
      {surah && (
        <Card className="mb-4">
          <p className="mb-3 font-display font-bold text-primary-600 dark:text-sand-100">٢. حدد نطاق الآيات</p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-primary-500 dark:text-sand-300">من الآية</label>
              <input type="number" min={1} max={surah.verses} value={fromAyah} onChange={(e) => setFromAyah(Math.max(1, Math.min(surah.verses, Number(e.target.value))))} className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-primary-600 outline-none focus:border-secondary-500 dark:border-white/10 dark:bg-night-900 dark:text-sand-100" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-primary-500 dark:text-sand-300">إلى الآية</label>
              <input type="number" min={1} max={surah.verses} value={toAyah} onChange={(e) => setToAyah(Math.max(1, Math.min(surah.verses, Number(e.target.value))))} className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-primary-600 outline-none focus:border-secondary-500 dark:border-white/10 dark:bg-night-900 dark:text-sand-100" />
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: record */}
      {surah && (
        <Card className="mb-6 text-center">
          <p className="mb-3 font-display font-bold text-primary-600 dark:text-sand-100">٣. ابدأ التسميع</p>
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
          {!recording ? (
            <button onClick={startRecording} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-4 text-white shadow-soft transition hover:bg-red-600">
              <Mic className="h-6 w-6" /> ابدأ التسجيل
            </button>
          ) : (
            <button onClick={stopRecording} className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-4 text-white shadow-soft transition hover:bg-primary-600">
              <Square className="h-6 w-6" /> إيقاف التسجيل
            </button>
          )}
          {recording && <p className="mt-3 text-sm text-red-500">جارٍ التسجيل...</p>}
        </Card>
      )}

      {/* Sessions */}
      <h2 className="mb-3 font-display text-lg font-bold text-primary-600 dark:text-sand-100">التسجيلات المحفوظة</h2>
      {sessions.length === 0 ? (
        <EmptyState icon={<Mic className="h-8 w-8" />} title="لا توجد تسجيلات" message="سجّل تلاوتك لتظهر هنا" />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const sname = SURAHS[s.surahId - 1]?.name ?? '';
            return (
              <Card key={s.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-primary-600 dark:text-sand-100">{sname}</p>
                    <p className="text-xs text-primary-400 dark:text-sand-400">
                      الآيات {toArabicDigits(s.fromAyah)}-{toArabicDigits(s.toAyah)} • {toArabicDigits(s.durationSec)} ثانية
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <audio controls src={s.blobUrl} className="h-9 w-48" />
                    <button onClick={() => removeSession(s.id)} className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="حذف">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
