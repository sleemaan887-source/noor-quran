import { useEffect, useMemo, useState, useRef } from 'react';
import { Headphones, Play, Pause, SkipBack, SkipForward, Loader2, Volume2 } from 'lucide-react';
import { PageHeader, Card, toArabicDigits, LoadingSpinner, ErrorState } from '@/core/widgets/ui';
import { SURAHS, getSurah } from '@/data/quran/surahs';
import { RECITERS, audioUrlForSurah, fetchSurah, type Reciter } from '@/data/quran/quranApi';
import { getReadingProgress } from '@/core/services/userData';

export function AudioPage() {
  const [reciterId, setReciterId] = useState<string>('alafasy');
  const [surahId, setSurahId] = useState<number>(() => getReadingProgress()?.surahId ?? 1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const reciter = useMemo(() => RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0], [reciterId]);
  const surah = getSurah(surahId);

  const url = audioUrlForSurah(reciter.edition, surahId);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onEnd = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDur);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDur);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  // When selection changes, load new URL.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = url;
    audio.load();
    setPlaying(false);
    setProgress(0);
    setDuration(0);
  }, [url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (playing) {
        audio.pause();
      } else {
        setLoading(true);
        await audio.play();
      }
    } catch {
      setError('تعذّر تشغيل الصوت. تحقق من الاتصال بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const seek = (frac: number) => {
    const audio = audioRef.current;
    if (audio && duration) audio.currentTime = frac * duration;
  };

  const prevSurah = () => setSurahId((id) => Math.max(1, id - 1));
  const nextSurah = () => setSurahId((id) => Math.min(114, id + 1));

  return (
    <div className="animate-fade-in">
      <PageHeader title="التلاوة" subtitle="استمع للقرآن بصوت قرّاء متعددين" icon={<Headphones className="h-6 w-6" />} />

      {/* Reciter selection */}
      <Card className="mb-4">
        <p className="mb-2 text-xs font-medium text-primary-500 dark:text-sand-300">اختر القارئ</p>
        <div className="flex flex-wrap gap-2">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              onClick={() => setReciterId(r.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                reciterId === r.id ? 'bg-primary-500 text-white shadow-soft' : 'bg-sand-100 text-primary-600 hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200'
              }`}
            >
              {r.arabicName}
            </button>
          ))}
        </div>
      </Card>

      {/* Surah selection */}
      <Card className="mb-4">
        <p className="mb-2 text-xs font-medium text-primary-500 dark:text-sand-300">اختر السورة</p>
        <div className="max-h-48 overflow-y-auto rounded-xl border border-sand-200 bg-white p-2 dark:border-white/10 dark:bg-night-900">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {SURAHS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSurahId(s.id)}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-right text-xs transition ${
                  surahId === s.id ? 'bg-secondary-500 text-white' : 'text-primary-600 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-white/5'
                }`}
              >
                <span className="font-bold">{toArabicDigits(s.id)}</span>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Player */}
      <Card className="mb-4 bg-gradient-to-br from-primary-500 to-night-900 text-sand-50">
        <div className="text-center">
          <p className="text-sm text-sand-200/80">{reciter.arabicName}</p>
          <p className="font-display text-2xl font-bold">{surah?.name}</p>
        </div>

        {/* progress */}
        <div className="mt-4 flex items-center gap-2">
          <span dir="ltr" className="text-xs tabular-nums text-sand-200/70">{fmtTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={duration ? progress / duration : 0}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1 accent-gold-500"
          />
          <span dir="ltr" className="text-xs tabular-nums text-sand-200/70">{fmtTime(duration)}</span>
        </div>

        {/* controls */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button onClick={prevSurah} className="rounded-full bg-white/10 p-3 transition hover:bg-white/20" aria-label="السابقة">
            <SkipForward className="h-5 w-5" />
          </button>
          <button
            onClick={togglePlay}
            disabled={loading}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-primary-900 shadow-glow transition hover:bg-gold-400 disabled:opacity-50"
            aria-label={playing ? 'إيقاف' : 'تشغيل'}
          >
            {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 mr-0.5" />}
          </button>
          <button onClick={nextSurah} className="rounded-full bg-white/10 p-3 transition hover:bg-white/20" aria-label="التالية">
            <SkipBack className="h-5 w-5" />
          </button>
        </div>

        {/* speed */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Volume2 className="h-4 w-4 text-sand-200/70" />
          <span className="text-xs text-sand-200/70">السرعة</span>
          {[0.75, 1, 1.25, 1.5, 2].map((r) => (
            <button
              key={r}
              onClick={() => setRate(r)}
              className={`rounded px-2 py-0.5 text-xs transition ${rate === r ? 'bg-gold-500 text-primary-900' : 'bg-white/10 text-sand-200 hover:bg-white/20'}`}
            >
              {r}x
            </button>
          ))}
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={() => setError(null)} />}

      <Card className="bg-gold-50 dark:bg-gold-500/10">
        <p className="text-xs text-gold-700 dark:text-gold-300">
          التلاوات تُبثّ من مصدر موثق (islamic.network) وتتطلب اتصالًا بالإنترنت. لا يتم توليد أي صوت بالذكاء الاصطناعي.
        </p>
      </Card>
    </div>
  );
}

function fmtTime(sec: number): string {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
