import { useEffect, useState, useRef } from 'react';
import { Compass, AlertCircle, MapPin, Loader2 } from 'lucide-react';
import { PageHeader, Card } from '@/core/widgets/ui';
import { qiblaDirection } from '@/core/utils/prayer';
import { getPrayerSettings, savePrayerSettings, type PrayerSettings } from '@/core/services/userData';

export function QiblaPage() {
  const [settings, setSettings] = useState<PrayerSettings>(() => getPrayerSettings());
  const [heading, setHeading] = useState<number | null>(null);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const qibla = qiblaDirection(settings.latitude, settings.longitude);

  useEffect(() => {
    const startSensor = async () => {
      try {
        // Prefer the absolute-orientation sensor (gives compass heading directly).
        if ('AbsoluteOrientationSensor' in window) {
          const sensor = new (window as any).AbsoluteOrientationSensor({ frequency: 10 });
          sensor.addEventListener('reading', () => {
            const quat = sensor.quaternion;
            if (!quat) return;
            // Convert quaternion to heading (yaw about Z)
            const [x, y, z, w] = quat;
            const yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
            setHeading(((yaw * 180) / Math.PI + 360) % 360);
          });
          sensor.addEventListener('error', () => {
            setSensorError('تعذّر قراءة مستشعر الاتجاه. قد لا يكون متوفرًا على هذا الجهاز.');
          });
          sensor.start();
          cleanupRef.current = () => sensor.stop();
        } else if ('DeviceOrientation' in window || 'ondeviceorientationabsolute' in window) {
          const handler = (e: DeviceOrientationEvent) => {
            if (e.alpha !== null) {
              setHeading(360 - e.alpha);
            }
          };
          window.addEventListener('deviceorientationabsolute', handler as EventListener);
          window.addEventListener('deviceorientation', handler);
          cleanupRef.current = () => {
            window.removeEventListener('deviceorientationabsolute', handler as EventListener);
            window.removeEventListener('deviceorientation', handler);
          };
        } else {
          setSensorError('مستشعر الاتجاه غير متوفر على هذا الجهاز أو المتصفح.');
        }
      } catch {
        setSensorError('تعذّر الوصول إلى مستشعر الاتجاه.');
      }
    };
    startSensor();
    return () => cleanupRef.current?.();
  }, []);

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ns: PrayerSettings = { ...settings, latitude: pos.coords.latitude, longitude: pos.coords.longitude, city: 'موقعي الحالي' };
        setSettings(ns);
        savePrayerSettings(ns);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  // The dial rotates so that the Qibla marker points toward the real Qibla,
  // compensating for the device's current heading.
  const dialRotation = heading !== null ? qibla - heading : 0;

  return (
    <div className="animate-fade-in">
      <PageHeader title="اتجاه القبلة" subtitle={settings.city} icon={<Compass className="h-6 w-6" />} />

      <div className="flex flex-col items-center">
        {/* Compass */}
        <div className="relative mb-6 flex h-72 w-72 items-center justify-center">
          {/* outer dial */}
          <div
            className="absolute inset-0 rounded-full border-4 border-sand-200 bg-white shadow-card transition-transform duration-300 dark:border-white/10 dark:bg-night-800"
            style={{ transform: `rotate(${dialRotation}deg)` }}
          >
            {/* cardinal letters */}
            <span className="absolute left-1/2 top-3 -translate-x-1/2 font-display text-sm font-bold text-primary-500 dark:text-sand-200">ش</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-sm font-bold text-primary-500 dark:text-sand-200">ق</span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-display text-sm font-bold text-primary-500 dark:text-sand-200">ج</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-display text-sm font-bold text-primary-500 dark:text-sand-200">غ</span>

            {/* Qibla marker (Kaaba) — at top, rotates with dial */}
            <div className="absolute left-1/2 top-6 -translate-x-1/2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-gold-700 text-white shadow-glow">
                <span className="text-lg">۞</span>
              </div>
            </div>
          </div>

          {/* fixed needle pointing up (device forward) */}
          <div className="absolute left-1/2 top-1/2 h-1 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500" />
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-600 shadow" />
        </div>

        {/* Info */}
        <Card className="w-full max-w-sm text-center">
          <p className="text-sm text-primary-400 dark:text-sand-400">زاوية القبلة من الشمال</p>
          <p dir="ltr" className="font-display text-3xl font-bold text-primary-600 dark:text-sand-100">
            {qibla.toFixed(1)}°
          </p>
          {heading !== null ? (
            <p className="mt-1 text-xs text-secondary-500">اتجاه الجهاز: {heading.toFixed(0)}°</p>
          ) : (
            <p className="mt-1 text-xs text-primary-400">لا يوجد مستشعر — يظهر اتجاه القبلة فقط</p>
          )}
        </Card>

        {sensorError && (
          <div className="mt-4 flex max-w-sm items-start gap-2 rounded-xl bg-gold-50 p-4 dark:bg-gold-500/10">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600 dark:text-gold-400" />
            <p className="text-xs text-gold-700 dark:text-gold-300">{sensorError} يمكنك الاعتماد على زاوية القبلة أعلاه باستخدام بوصلة يدوية.</p>
          </div>
        )}

        <button
          onClick={detectLocation}
          disabled={locating}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary-600 disabled:opacity-50"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          تحديد موقعي
        </button>
      </div>
    </div>
  );
}
