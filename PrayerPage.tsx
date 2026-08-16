import { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, Loader2 } from 'lucide-react';
import { PageHeader, Card } from '@/core/widgets/ui';
import {
  computePrayerTimes,
  nextPrayer,
  formatTime12h,
  formatRemaining,
  PRAYER_ORDER,
  PRAYER_LABELS,
  type CalculationMethod,
  type PrayerKey,
  type Coordinates,
} from '@/core/utils/prayer';
import { getPrayerSettings, savePrayerSettings, type PrayerSettings } from '@/core/services/userData';

const METHODS: { id: CalculationMethod; label: string }[] = [
  { id: 'MWL', label: 'رابطة العالم الإسلامي' },
  { id: 'Makkah', label: 'أم القرى (مكة)' },
  { id: 'Egypt', label: 'الهيئة المصرية' },
  { id: 'ISNA', label: 'أمريكا الشمالية' },
  { id: 'Karachi', label: 'كراتشي' },
  { id: 'Tehran', label: 'طهران' },
  { id: 'Jafari', label: 'الجعفري (شيعة)' },
];

const CITY_PRESETS = [
  { city: 'مكة المكرمة', lat: 21.4225, lng: 39.8262 },
  { city: 'المدينة المنورة', lat: 24.4709, lng: 39.6121 },
  { city: 'الرياض', lat: 24.7136, lng: 46.6753 },
  { city: 'القاهرة', lat: 30.0444, lng: 31.2357 },
  { city: 'بيروت', lat: 33.8938, lng: 35.5018 },
  { city: 'عمّان', lat: 31.9454, lng: 35.9284 },
  { city: 'دبي', lat: 25.2048, lng: 55.2708 },
  { city: 'إسطنبول', lat: 41.0082, lng: 28.9784 },
];

export function PrayerPage() {
  const [settings, setSettings] = useState<PrayerSettings>(() => getPrayerSettings());
  const [locating, setLocating] = useState(false);

  const coords: Coordinates = useMemo(
    () => ({
      latitude: settings.latitude,
      longitude: settings.longitude,
      timezone: -new Date().getTimezoneOffset() / 60,
    }),
    [settings],
  );

  const times = useMemo(
    () => computePrayerTimes(coords, { method: settings.method, asrFactor: settings.asrFactor }),
    [coords, settings.method, settings.asrFactor],
  );

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const next = useMemo(() => nextPrayer(times, new Date()), [times, tick]);

  const update = (patch: Partial<PrayerSettings>) => {
    const ns = { ...settings, ...patch };
    setSettings(ns);
    savePrayerSettings(ns);
  };

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          city: 'موقعي الحالي',
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="مواقيت الصلاة" subtitle={settings.city} icon={<Clock className="h-6 w-6" />} />

      {/* Next prayer hero */}
      <div className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-night-900 p-6 text-sand-50 shadow-card">
        {next ? (
          <>
            <p className="text-sm text-sand-200/80">الصلاة القادمة</p>
            <p className="font-display text-3xl font-bold">{next.label}</p>
            <p dir="ltr" className="mt-2 text-4xl font-bold tabular-nums text-gold-400">{formatRemaining(next.remainingMs)}</p>
            <p className="mt-1 text-sm text-sand-200/70">وقت الأذان: {formatTime12h(next.time)}</p>
          </>
        ) : (
          <p>تعذّر حساب المواقيت</p>
        )}
      </div>

      {/* Today's times */}
      <Card className="mb-5">
        <p className="mb-3 font-display font-bold text-primary-600 dark:text-sand-100">مواقيت اليوم</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRAYER_ORDER.map((key) => (
            <PrayerTimeCard key={key} k={key as PrayerKey} time={times[key as PrayerKey] as Date} isNext={next?.key === key} />
          ))}
        </div>
      </Card>

      {/* Settings */}
      <Card className="mb-4">
        <p className="mb-3 font-display font-bold text-primary-600 dark:text-sand-100">الموقع</p>
        <button
          onClick={detectLocation}
          disabled={locating}
          className="mb-3 inline-flex items-center gap-2 rounded-xl bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary-600 disabled:opacity-50"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          تحديد موقعي تلقائيًا
        </button>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CITY_PRESETS.map((c) => (
            <button
              key={c.city}
              onClick={() => update({ city: c.city, latitude: c.lat, longitude: c.lng })}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                settings.city === c.city ? 'bg-primary-500 text-white' : 'bg-sand-100 text-primary-600 hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200'
              }`}
            >
              {c.city}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display font-bold text-primary-600 dark:text-sand-100">طريقة الحساب والمذهب</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-primary-500 dark:text-sand-300">طريقة الحساب</label>
            <select
              value={settings.method}
              onChange={(e) => update({ method: e.target.value as CalculationMethod })}
              className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-primary-600 outline-none focus:border-secondary-500 dark:border-white/10 dark:bg-night-900 dark:text-sand-100"
            >
              {METHODS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-primary-500 dark:text-sand-300">مذهب العصر</label>
            <div className="flex gap-2">
              <button
                onClick={() => update({ asrFactor: 1 })}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${settings.asrFactor === 1 ? 'bg-primary-500 text-white' : 'bg-sand-100 text-primary-600 dark:bg-white/5 dark:text-sand-200'}`}
              >
                الشافعي (المتقدم)
              </button>
              <button
                onClick={() => update({ asrFactor: 2 })}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${settings.asrFactor === 2 ? 'bg-primary-500 text-white' : 'bg-sand-100 text-primary-600 dark:bg-white/5 dark:text-sand-200'}`}
              >
                الحنفي (المتأخر)
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PrayerTimeCard({ k, time, isNext }: { k: PrayerKey; time: Date; isNext: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center transition ${isNext ? 'border-secondary-400 bg-secondary-50 dark:border-secondary-500/40 dark:bg-secondary-900/20' : 'border-sand-200 bg-sand-50 dark:border-white/10 dark:bg-white/5'}`}>
      <p className="text-xs text-primary-400 dark:text-sand-400">{PRAYER_LABELS[k]}</p>
      <p dir="ltr" className={`mt-1 text-lg font-bold tabular-nums ${isNext ? 'text-secondary-600 dark:text-secondary-300' : 'text-primary-600 dark:text-sand-100'}`}>
        {formatTime12h(time)}
      </p>
    </div>
  );
}
