import { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Square, Bell, BellOff, Clock, Loader2 } from 'lucide-react';
import { PageHeader, Card } from '@/core/widgets/ui';
import {
  VOICE_REMINDERS,
  playReminderAudio,
  stopReminderAudio,
  isAudioSupported,
} from '@/core/services/voiceReminders';
import {
  notificationsSupported,
  requestPermission,
  getPermission,
  showNotification,
} from '@/core/services/notifications';
import { getNotificationSettings } from '@/core/services/userData';

export function VoiceRemindersPage() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [perm, setPerm] = useState<NotificationPermission>(getPermission());
  const [settings, setSettings] = useState(() => getNotificationSettings());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopReminderAudio();
    };
  }, []);

  const handlePlay = async (id: string) => {
    if (playingId === id) {
      stopReminderAudio();
      setPlayingId(null);
      return;
    }
    setLoadingId(id);
    try {
      await playReminderAudio(id);
      setPlayingId(id);
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  const handleStop = () => {
    stopReminderAudio();
    setPlayingId(null);
  };

  const handleRequestPerm = async () => {
    const result = await requestPermission();
    setPerm(result);
    if (result === 'granted') {
      showNotification({
        title: 'تم تفعيل الإشعارات',
        body: 'ستصلك تذكيرات الأذكار والقرآن والصلاة بإذن الله',
        tag: 'perm-granted',
      });
    }
  };

  const testNotification = () => {
    showNotification({
      title: 'تذكير: سبحان الله وبحمده',
      body: 'من قالها مائة مرة حُطّت خطاياه وإن كانت مثل زبد البحر',
      tag: 'test-notif',
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="التذكيرات الصوتية"
        subtitle="تذكيرات بصوت بشري حقيقي — بلا ذكاء اصطناعي"
        icon={<Volume2 className="h-6 w-6" />}
      />

      {/* Note about real voices */}
      <Card className="mb-4 border-secondary-300 bg-secondary-50 dark:border-secondary-500/30 dark:bg-secondary-900/20">
        <p className="text-sm text-secondary-700 dark:text-secondary-300">
          جميع التذكيرات الصوتية بتلاوة بشرية حقيقية من القرّاء، وليست مولّدة بالذكاء الاصطناعي. يتم تحميلها مرة واحدة وتعمل بعدها بدون إنترنت.
        </p>
      </Card>

      {/* Permission status */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {perm === 'granted' ? <Bell className="h-5 w-5 text-secondary-500" /> : <BellOff className="h-5 w-5 text-primary-400" />}
            <div>
              <p className="text-sm font-medium text-primary-600 dark:text-sand-200">
                إشعارات الجهاز
              </p>
              <p className="text-xs text-primary-400 dark:text-sand-400">
                {perm === 'granted'
                  ? 'مفعّلة — ستصلك التذكيرات على الشاشة'
                  : perm === 'denied'
                  ? 'مرفوضة — فعّلها من إعدادات المتصفح'
                  : 'غير مفعّلة بعد'}
              </p>
            </div>
          </div>
          {perm !== 'granted' && perm !== 'denied' && (
            <button
              onClick={handleRequestPerm}
              className="rounded-xl bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary-600"
            >
              السماح
            </button>
          )}
        </div>
        {perm === 'granted' && (
          <button
            onClick={testNotification}
            className="mt-3 rounded-lg bg-sand-100 px-3 py-1.5 text-xs font-medium text-primary-600 transition hover:bg-sand-200 dark:bg-white/5 dark:text-sand-200"
          >
            تجربة إشعار
          </button>
        )}
      </Card>

      {/* Voice reminders */}
      <h2 className="mb-3 font-display text-lg font-bold text-primary-600 dark:text-sand-100">
        التذكيرات الصوتية
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {VOICE_REMINDERS.map((r) => (
          <Card key={r.id} className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold text-primary-600 dark:text-sand-100">
                {r.label}
              </p>
              <p className="mt-1 truncate font-quran text-sm text-primary-500 dark:text-sand-300">
                {r.text}
              </p>
            </div>
            <button
              onClick={() => handlePlay(r.id)}
              disabled={loadingId === r.id}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition active:scale-95 ${
                playingId === r.id
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
              aria-label={playingId === r.id ? `إيقاف ${r.label}` : `تشغيل ${r.label}`}
            >
              {loadingId === r.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : playingId === r.id ? (
                <Square className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
          </Card>
        ))}
      </div>

      {/* Scheduled reminders info */}
      <Card className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-secondary-500" />
          <h2 className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">
            التذكيرات المجدولة
          </h2>
        </div>
        <div className="space-y-3">
          <ScheduleRow time="٥:٣٠ ص" title="أذكار الصباح" enabled={settings.azkarReminder} />
          <ScheduleRow time="٥:٠٠ م" title="أذكار المساء" enabled={settings.azkarReminder} />
          <ScheduleRow time="٩:٠٠ ص" title="تذكير القرآن" enabled={settings.quranReminder} />
        </div>
        <p className="mt-3 text-xs text-primary-400 dark:text-sand-400">
          تُفعّل التذكيرات المجدولة تلقائياً عند السماح بالإشعارات. اضبط الأوقات من صفحة الإعدادات.
        </p>
      </Card>
    </div>
  );
}

function ScheduleRow({ time, title, enabled }: { time: string; title: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-sand-50 px-4 py-3 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm font-bold text-primary-600 dark:text-sand-200">{time}</span>
        <span className="text-sm text-primary-500 dark:text-sand-300">{title}</span>
      </div>
      <span className={`text-xs font-medium ${enabled ? 'text-secondary-500' : 'text-primary-300 dark:text-white/30'}`}>
        {enabled ? 'مفعّل' : 'معطّل'}
      </span>
    </div>
  );
}
