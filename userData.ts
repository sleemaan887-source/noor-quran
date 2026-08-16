import { loadJSON, saveJSON } from '@/core/utils/storage';
import type { ThemeMode } from '@/core/theme/ThemeContext';

export interface ReadingProgress {
  surahId: number;
  ayahNumber: number; // numberInSurah of last read ayah
  page: number;
  updatedAt: number; // epoch ms
}

const KEY = 'noor.readingProgress';

export function getReadingProgress(): ReadingProgress | null {
  return loadJSON<ReadingProgress | null>(KEY, null);
}

export function saveReadingProgress(p: ReadingProgress): void {
  saveJSON(KEY, p);
}

export function clearReadingProgress(): void {
  saveJSON<ReadingProgress | null>(KEY, null);
}

// Bookmarks — verse-level
export interface Bookmark {
  id: string; // `${surahId}:${ayahNumber}`
  surahId: number;
  ayahNumber: number;
  ayahText: string;
  createdAt: number;
}

const BK_KEY = 'noor.bookmarks';

export function getBookmarks(): Bookmark[] {
  return loadJSON<Bookmark[]>(BK_KEY, []);
}

export function saveBookmarks(list: Bookmark[]): void {
  saveJSON(BK_KEY, list);
}

export function toggleBookmark(b: Bookmark): boolean {
  const list = getBookmarks();
  const idx = list.findIndex((x) => x.id === b.id);
  let added: boolean;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    list.unshift(b);
    added = true;
  }
  saveBookmarks(list);
  return added;
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().some((x) => x.id === id);
}

// Favorites — surah-level
const FAV_KEY = 'noor.favorites';
export function getFavoriteSurahs(): number[] {
  return loadJSON<number[]>(FAV_KEY, []);
}
export function toggleFavoriteSurah(surahId: number): boolean {
  const list = getFavoriteSurahs();
  const idx = list.indexOf(surahId);
  let added: boolean;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    list.unshift(surahId);
    added = true;
  }
  saveJSON(FAV_KEY, list);
  return added;
}

// Notes — verse-level
export interface Note {
  id: string; // `${surahId}:${ayahNumber}`
  surahId: number;
  ayahNumber: number;
  text: string;
  createdAt: number;
}

const NOTE_KEY = 'noor.notes';
export function getNotes(): Note[] {
  return loadJSON<Note[]>(NOTE_KEY, []);
}
export function saveNotes(list: Note[]): void {
  saveJSON(NOTE_KEY, list);
}
export function upsertNote(n: Note): void {
  const list = getNotes();
  const idx = list.findIndex((x) => x.id === n.id);
  if (idx >= 0) list[idx] = n;
  else list.unshift(n);
  saveNotes(list);
}
export function deleteNote(id: string): void {
  saveNotes(getNotes().filter((x) => x.id !== id));
}

// Azkar counters — track completed repetitions per zikr per day.
export interface AzkarCounterState {
  [zikrId: string]: { count: number; date: string };
}

const AZKAR_KEY = 'noor.azkarCounters';
export function getAzkarCounters(): AzkarCounterState {
  return loadJSON<AzkarCounterState>(AZKAR_KEY, {});
}
export function saveAzkarCounters(state: AzkarCounterState): void {
  saveJSON(AZKAR_KEY, state);
}

// Favorites for azkar/dua
const AZKAR_FAV_KEY = 'noor.azkarFavorites';
export function getAzkarFavorites(): string[] {
  return loadJSON<string[]>(AZKAR_FAV_KEY, []);
}
export function toggleAzkarFavorite(id: string): boolean {
  const list = getAzkarFavorites();
  const idx = list.indexOf(id);
  let added: boolean;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    list.unshift(id);
    added = true;
  }
  saveJSON(AZKAR_FAV_KEY, list);
  return added;
}

// Hifz plans
export interface HifzPlan {
  id: string;
  title: string;
  goalSurahIds: number[];
  dailyGoal: number; // pages or verses per day
  unit: 'pages' | 'verses';
  totalDays: number;
  startDate: string; // ISO
  progress: number; // 0..100
  completed: boolean;
}

const HIFZ_KEY = 'noor.hifzPlans';
export function getHifzPlans(): HifzPlan[] {
  return loadJSON<HifzPlan[]>(HIFZ_KEY, []);
}
export function saveHifzPlans(list: HifzPlan[]): void {
  saveJSON(HIFZ_KEY, list);
}

// Prayer location + method settings
export interface PrayerSettings {
  latitude: number;
  longitude: number;
  city: string;
  method: import('@/core/utils/prayer').CalculationMethod;
  asrFactor: 1 | 2;
}

const PRAYER_KEY = 'noor.prayerSettings';
const DEFAULT_PRAYER: PrayerSettings = {
  latitude: 21.4225,
  longitude: 39.8262,
  city: 'مكة المكرمة',
  method: 'Makkah',
  asrFactor: 1,
};
export function getPrayerSettings(): PrayerSettings {
  return loadJSON<PrayerSettings>(PRAYER_KEY, DEFAULT_PRAYER);
}
export function savePrayerSettings(s: PrayerSettings): void {
  saveJSON(PRAYER_KEY, s);
}

// Notification toggles
export interface NotificationSettings {
  enabled: boolean;
  quranReminder: boolean;
  azkarReminder: boolean;
  prayerReminder: boolean;
  startHour: number;
  endHour: number;
}
const NOTIF_KEY = 'noor.notifications';
const DEFAULT_NOTIF: NotificationSettings = {
  enabled: true,
  quranReminder: true,
  azkarReminder: true,
  prayerReminder: true,
  startHour: 6,
  endHour: 22,
};
export function getNotificationSettings(): NotificationSettings {
  return loadJSON<NotificationSettings>(NOTIF_KEY, DEFAULT_NOTIF);
}
export function saveNotificationSettings(s: NotificationSettings): void {
  saveJSON(NOTIF_KEY, s);
}

// App lock (PIN stored as SHA-256 hash — never plaintext)
const PIN_KEY = 'noor.pinHash';
export function getPinHash(): string | null {
  return loadJSON<string | null>(PIN_KEY, null);
}
export async function setPinHash(pin: string): Promise<void> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pin));
  const hash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  saveJSON(PIN_KEY, hash);
}
export async function verifyPin(pin: string): Promise<boolean> {
  const stored = getPinHash();
  if (!stored) return true;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pin));
  const hash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return hash === stored;
}
export function clearPin(): void {
  saveJSON<string | null>(PIN_KEY, null);
}

// Everything exportable for backup
export interface BackupPayload {
  readingProgress: ReadingProgress | null;
  bookmarks: Bookmark[];
  favorites: number[];
  notes: Note[];
  hifzPlans: HifzPlan[];
  azkarCounters: AzkarCounterState;
  azkarFavorites: string[];
  theme: { mode: ThemeMode; quranFontSize: number };
  prayer: PrayerSettings;
  notifications: NotificationSettings;
  exportedAt: number;
  version: string;
}

export function buildBackup(): BackupPayload {
  const themeRaw = loadJSON<{ mode: ThemeMode; quranFontSize: number }>('noor.theme', { mode: 'light', quranFontSize: 28 });
  return {
    readingProgress: getReadingProgress(),
    bookmarks: getBookmarks(),
    favorites: getFavoriteSurahs(),
    notes: getNotes(),
    hifzPlans: getHifzPlans(),
    azkarCounters: getAzkarCounters(),
    azkarFavorites: getAzkarFavorites(),
    theme: themeRaw,
    notifications: getNotificationSettings(),
    prayer: getPrayerSettings(),
    exportedAt: Date.now(),
    version: '1.0.0',
  };
}

export function restoreBackup(payload: BackupPayload): void {
  if (payload.readingProgress) saveReadingProgress(payload.readingProgress);
  if (payload.bookmarks) saveBookmarks(payload.bookmarks);
  if (payload.favorites) saveJSON('noor.favorites', payload.favorites);
  if (payload.notes) saveNotes(payload.notes);
  if (payload.hifzPlans) saveHifzPlans(payload.hifzPlans);
  if (payload.azkarCounters) saveAzkarCounters(payload.azkarCounters);
  if (payload.azkarFavorites) saveJSON('noor.azkarFavorites', payload.azkarFavorites);
  if (payload.prayer) savePrayerSettings(payload.prayer);
  if (payload.notifications) saveNotificationSettings(payload.notifications);
  if (payload.theme) saveJSON('noor.theme', payload.theme);
}
