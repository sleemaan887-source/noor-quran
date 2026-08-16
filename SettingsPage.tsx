import { prepareQuranOffline, getOfflineStatus } from '@/core/services/offlineContent';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Settings, Sun, Moon, Monitor, Type, Bell, Lock, ShieldCheck, Trash2, Volume2, Wifi, Download } from 'lucide-react';
import { PageHeader, Card } from '@/core/widgets/ui';
import { useTheme, type ThemeMode } from '@/core/theme/ThemeContext';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getPinHash,
  setPinHash,
  clearPin,
  type NotificationSettings,
} from '@/core/services/userData';
import {
  notificationsSupported,
  requestPermission,
  getPermission,
} from '@/core/services/notifications';
import { isAudioSupported } from '@/core/services/voiceReminders';

export function SettingsPage() {
  const [offlineState, setOfflineState] = useState<{online:boolean; cachedSurahs:number; totalSurahs:number; quranReady:boolean} | null>(null);
  const [offlineBusy, setOfflineBusy] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState('');

  useEffect(() => {
    getOfflineStatus().then(setOfflineState).catch(() => {});
  }, []);

  const handleQuranOffline = async () => {
    if (!navigator.onLine) {
      setOfflineMessage('يجب الاتصال بالإنترنت مرة واحدة لتنزيل القرآن على الجهاز.');
      return;
    }
    setOfflineBusy(true);
    setOfflineMessage('');
    try {
      await prepareQuranOffline((done, total, name) => {
        setOfflineMessage(`جاري حفظ ${name} — ${done}/${total}`);
      });
      setOfflineMessage('تم حفظ القرآن كاملًا على الجهاز. يمكنك قراءته والبحث فيه دون إنترنت.');
      setOfflineState(await getOfflineStatus());
    } catch {
      setOfflineMessage('تعذر إكمال التنزيل. تحقق من الاتصال وحاول مرة أخرى.');
    } finally {
      setOfflineBusy(false);
    }
  };

  const { mode, setMode, quranFontSize, setQuranFontSize } = useTheme();
  const [notifs, setNotifs] = useState<NotificationSettings>(() => getNotificationSettings());
  const [pinEnabled, setPinEnabled] = useState<boolean>(() => !!getPinHash());
  const [pinInput, setPinInput] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  const updateNotifs = (patch: Partial<NotificationSettings>) => {
    const ns = { ...notifs, ...patch };
    setNotifs(ns);
    saveNotificationSettings(ns);
  };

  const togglePin = async () => {
    setPinMsg('');
    if (pinEnabled) {
      clearPin();
      setPinEnabled(false);
      setPinMsg('تم إلغاء قفل التطبيق');
      return;
    }
    if (pinInput.length < 4) {
      setPinMsg('الرمز يجب أن يكون 4 أرقام على الأقل');
      return;
    }
    await setPinHash(pinInput);
    setPinEnabled(true);
    setPinInput('');
    setPinMsg('تم تفعيل قفل التطبيق');
  };

  return (


    <div className="animate-fade-in">
      <section className="mb-6 rounded-2xl border border-sand-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-night-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-primary-700 dark:text-sand-100">وضع العمل دون اتصال</h2>
            <p className="mt-1 text-sm text-primary-400 dark:text-sand-400">
              احفظ القرآن على الجهاز مرة واحدة ليصبح متاحًا دون إنترنت.
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${offlineState?.quranReady ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {offlineState?.quranReady ? 'جاهز Offline' : `${offlineState?.cachedSurahs ?? 0}/114`}
          </span>
        </div>
        <button
          type="button"
          onClick={handleQuranOffline}
          disabled={offlineBusy || !navigator.onLine}
          className="mt-4 w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {offlineBusy ? 'جاري تنزيل القرآن...' : 'حفظ القرآن للاستخدام دون إنترنت'}
        </button>
        {offlineMessage && <p className="mt-3 text-xs text-primary-500 dark:text-sand-300">{offlineMessage}</p>}
      </section>

      <PageHeader title="الإعدادات" subtitle="تخصيص التطبيق" icon={<Settings className="h-6 w-6" />} />

      {/* Appearance */}
      <Card className="mb-4">
        <SectionTitle icon={<Sun className="h-5 w-5" />} title="المظهر" />
        <div className="flex gap-2">
          <ThemeOption active={mode === 'light'} onClick={() => setMode('light')} icon={<Sun className="h-5 w-5" />} label="فاتح" />
          <ThemeOption active={mode === 'dark'} onClick={() => setMode('dark')} icon={<Moon className="h-5 w-5" />} label="داكن" />
          <ThemeOption active={mode === 'auto'} onClick={() => setMode('auto')} icon={<Monitor className="h-5 w-5" />} label="تلقائي" />
        </div>
      </Card>

      {/* Reading */}
      <Card className="mb-4">
        <SectionTitle icon={<Type className="h-5 w-5" />} title="القراءة" />
        <p className="mb-2 text-xs text-primary-400 dark:text-sand-400">حجم خط القرآن</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setQuranFontSize(Math.max(20, quranFontSize - 4))} className="rounded-lg bg-sand-100 px-4 py-2 text-lg font-bold text-primary-600 dark:bg-white/5 dark:text-sand-200">−</button>
          <div className="flex-1 text-center">
            <span className="font-quran text-2xl text-primary-600 dark:text-sand-100" style={{ fontSize: `${quranFontSize}px` }}>
              نَصٌّ تَجْرِيبِيٌّ
            </span>
          </div>
          <button onClick={() => setQuranFontSize(Math.min(48, quranFontSize + 4))} className="rounded-lg bg-sand-100 px-4 py-2 text-lg font-bold text-primary-600 dark:bg-white/5 dark:text-sand-200">+</button>
        </div>
        <p className="mt-1 text-center text-xs text-primary-400">{quranFontSize}px</p>
      </Card>

      {/* Notifications */}
      <Card className="mb-4">
        <SectionTitle icon={<Bell className="h-5 w-5" />} title="الإشعارات" />
        <ToggleRow label="تفعيل الإشعارات" checked={notifs.enabled} onChange={(v) => updateNotifs({ enabled: v })} />
        <ToggleRow label="تذكير القرآن" checked={notifs.quranReminder} onChange={(v) => updateNotifs({ quranReminder: v })} disabled={!notifs.enabled} />
        <ToggleRow label="تذكير الأذكار" checked={notifs.azkarReminder} onChange={(v) => updateNotifs({ azkarReminder: v })} disabled={!notifs.enabled} />
        <ToggleRow label="تذكير الصلاة" checked={notifs.prayerReminder} onChange={(v) => updateNotifs({ prayerReminder: v })} disabled={!notifs.enabled} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-primary-500 dark:text-sand-300">من الساعة</label>
            <input type="number" min={0} max={23} value={notifs.startHour} onChange={(e) => updateNotifs({ startHour: Number(e.target.value) })} className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-night-900 dark:text-sand-100" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-primary-500 dark:text-sand-300">إلى الساعة</label>
            <input type="number" min={0} max={23} value={notifs.endHour} onChange={(e) => updateNotifs({ endHour: Number(e.target.value) })} className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-night-900 dark:text-sand-100" />
          </div>
        </div>
        <p className="mt-2 text-xs text-primary-400 dark:text-sand-400">
          ملاحظة: تُحفظ الإعدادات محليًا. لتفعيل الإشعارات الفعلية على المتصفح يجب السماح بالإشعارات من إعدادات الموقع.
        </p>
      </Card>

      {/* Offline & Voice info */}
      <Card className="mb-4">
        <SectionTitle icon={<Wifi className="h-5 w-5" />} title="العمل بدون إنترنت" />
        <p className="text-sm text-primary-500 dark:text-sand-300">
          التطبيق يعمل بالكامل بدون إنترنت بعد التحميل الأول. يتم حفظ القرآن والأذكار والأدعية على جهازك تلقائياً.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary-50 px-3 py-2 dark:bg-secondary-900/20">
          <Download className="h-4 w-4 text-secondary-500" />
          <span className="text-xs text-secondary-600 dark:text-secondary-300">
            يمكنك إضافة التطبيق إلى شاشتك الرئيسية من قائمة المتصفح للوصول السريع
          </span>
        </div>
      </Card>

      {/* Voice reminders */}
      <Card className="mb-4">
        <SectionTitle icon={<Volume2 className="h-5 w-5" />} title="التذكيرات الصوتية" />
        <p className="text-sm text-primary-500 dark:text-sand-300">
          {isAudioSupported()
            ? 'جهازك يدعم تشغيل التذكيرات الصوتية بتلاوة بشرية حقيقية. يمكنك تفعيلها من صفحة التذكيرات.'
            : 'جهازك لا يدعم تشغيل الصوت حالياً. ستعمل الإشعارات النصية فقط.'}
        </p>
        <Link to="/voice" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600">
          <Volume2 className="h-4 w-4" /> إدارة التذكيرات الصوتية
        </Link>
      </Card>

      {/* Privacy / Lock */}
      <Card className="mb-4">
        <SectionTitle icon={<Lock className="h-5 w-5" />} title="الخصوصية وقفل التطبيق" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-600 dark:text-sand-200">قفل التطبيق برمز PIN</p>
            <p className="text-xs text-primary-400 dark:text-sand-400">يُحفظ الرمز بصيغة مشفّرة (SHA-256) وليس كنص صريح</p>
          </div>
          <ShieldCheck className={`h-8 w-8 ${pinEnabled ? 'text-secondary-500' : 'text-sand-300 dark:text-white/20'}`} />
        </div>
        {!pinEnabled && (
          <input
            type="password"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="أدخل رمزًا (4 أرقام+)"
            className="mt-3 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-primary-600 outline-none focus:border-secondary-500 dark:border-white/10 dark:bg-night-900 dark:text-sand-100"
          />
        )}
        <button onClick={togglePin} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600">
          {pinEnabled ? <><Trash2 className="h-4 w-4" /> إلغاء القفل</> : 'تفعيل القفل'}
        </button>
        {pinMsg && <p className="mt-2 text-xs text-secondary-500">{pinMsg}</p>}
      </Card>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-primary-600 dark:text-sand-100">
      {icon}
      <h2 className="font-display text-lg font-bold">{title}</h2>
    </div>
  );
}

function ThemeOption({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3 transition ${
        active ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-sand-100' : 'border-sand-200 text-primary-400 hover:border-sand-300 dark:border-white/10 dark:text-sand-400'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function ToggleRow({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-sm text-primary-600 dark:text-sand-200">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-secondary-500' : 'bg-sand-200 dark:bg-white/10'}`}
        aria-pressed={checked}
        aria-label={label}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'right-0.5' : 'right-5'}`} />
      </button>
    </div>
  );
}
