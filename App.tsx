import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/core/theme/ThemeContext';
import { AppShell } from '@/core/widgets/AppShell';
import { SplashScreen } from '@/core/widgets/SplashScreen';
import { PinLockScreen } from '@/core/widgets/PinLockScreen';
import { getPinHash } from '@/core/services/userData';
import { startReminderScheduler, stopReminderScheduler } from '@/core/services/notifications';
import { HomePage } from '@/features/home/HomePage';
import { QuranListPage } from '@/features/quran/QuranListPage';
import { SurahReaderPage } from '@/features/quran/SurahReaderPage';
import { BookmarksPage } from '@/features/quran/BookmarksPage';
import { JuzPage } from '@/features/quran/JuzPage';
import { AudioPage } from '@/features/audio/AudioPage';
import { AzkarListPage, AzkarCategoryPage } from '@/features/azkar/AzkarPages';
import { DuaPage } from '@/features/dua/DuaPage';
import { TajweedPage } from '@/features/tajweed/TajweedPage';
import { MaqamatPage } from '@/features/maqamat/MaqamatPage';
import { HifzPage } from '@/features/hifz/HifzPage';
import { TasmeePage } from '@/features/tasmee/TasmeePage';
import { TasbihPage } from '@/features/tasbih/TasbihPage';
import { VoiceRemindersPage } from '@/features/voice/VoiceRemindersPage';
import { PrayerPage } from '@/features/prayer/PrayerPage';
import { QiblaPage } from '@/features/qibla/QiblaPage';
import { CalendarPage } from '@/features/calendar/CalendarPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { DeveloperPage } from '@/features/developer/DeveloperPage';
import { BackupPage } from '@/features/backup/BackupPage';
import { AccessibilityPage } from '@/features/accessibility/AccessibilityPage';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-6xl font-bold text-primary-300">٤٠٤</p>
      <p className="mt-4 text-lg text-primary-500 dark:text-sand-200">الصفحة غير موجودة</p>
      <a href="#/" className="mt-4 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600">
        العودة للرئيسية
      </a>
    </div>
  );
}

const EXIT_MESSAGES = [
  'لا تنسَ ذكر الله',
  'صلى الله على محمد',
  'الحمد لله رب العالمين',
  'سبحان الله وبحمده',
  'أستغفر الله العظيم',
  'لا إله إلا الله',
  'بسم الله الرحمن الرحيم',
  'حسبنا الله ونعم الوكيل',
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [locked, setLocked] = useState(false);
  const [pinChecked, setPinChecked] = useState(false);

  useEffect(() => {
    if (getPinHash()) setLocked(true);
    setPinChecked(true);
  }, []);

  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }, []);

  // Start notification reminder scheduler
  useEffect(() => {
    startReminderScheduler();
    return () => stopReminderScheduler();
  }, []);

  // Exit message — shows a farewell reminder when the user tries to leave
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const msg = EXIT_MESSAGES[Math.floor(Math.random() * EXIT_MESSAGES.length)];
      e.preventDefault();
      e.returnValue = msg;
      return msg;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  if (!pinChecked) return null;

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {locked && <PinLockScreen onUnlock={() => setLocked(false)} />}
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quran" element={<QuranListPage />} />
          <Route path="/quran/juz" element={<JuzPage />} />
          <Route path="/quran/bookmarks" element={<BookmarksPage />} />
          <Route path="/quran/surah/:id" element={<SurahReaderPage />} />
          <Route path="/audio" element={<AudioPage />} />
          <Route path="/azkar" element={<AzkarListPage />} />
          <Route path="/azkar/:category" element={<AzkarCategoryPage />} />
          <Route path="/dua" element={<DuaPage />} />
          <Route path="/tajweed" element={<TajweedPage />} />
          <Route path="/maqamat" element={<MaqamatPage />} />
          <Route path="/hifz" element={<HifzPage />} />
          <Route path="/tasmee" element={<TasmeePage />} />
          <Route path="/tasbih" element={<TasbihPage />} />
          <Route path="/voice" element={<VoiceRemindersPage />} />
          <Route path="/prayer" element={<PrayerPage />} />
          <Route path="/qibla" element={<QiblaPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/backup" element={<BackupPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </ThemeProvider>
  );
}
