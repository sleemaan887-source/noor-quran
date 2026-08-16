// Offline-first Quran data layer.
// Religious text is NOT generated here. The app accepts verified Quran data
// downloaded from the configured source and persists it in IndexedDB.
// Once a surah is cached, it can be read and searched without internet.

import { SURAHS } from '@/data/quran/surahs';

const API_BASE = 'https://api.alquran.cloud/v1';
const DB_NAME = 'noor-quran-offline';
const DB_VERSION = 1;
const STORE = 'surahs';

const AUDIO_CDN_BASE = 'https://everyayah.com/data';
const RECITER_FOLDERS: Record<string, string> = {
  'ar.alafasy': 'Alafasy_128kbps',
  'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
  'ar.shaatree': 'Abu_Bakr_Ash-Shaatree_128kbps',
  'ar.husary': 'Husary_128kbps',
  'ar.minshawi': 'Minshawy_Murattal_128kbps',
  'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
};

export interface Ayah {
  numberInSurah: number;
  text: string;
  juz: number;
  page: number;
  surahId: number;
}

export interface SurahText {
  surahId: number;
  ayahs: Ayah[];
}

export interface SearchHit {
  surahId: number;
  surahName: string;
  ayahNumber: number;
  text: string;
}

const memoryCache = new Map<number, SurahText>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('indexeddb_unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'surahId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('indexeddb_error'));
  });
}

async function readLocal(surahId: number): Promise<SurahText | null> {
  if (memoryCache.has(surahId)) return memoryCache.get(surahId)!;
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(surahId);
      req.onsuccess = () => {
        const value = req.result as SurahText | undefined;
        if (value) memoryCache.set(surahId, value);
        resolve(value ?? null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function writeLocal(value: SurahText): Promise<void> {
  memoryCache.set(value.surahId, value);
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Memory cache remains available for the current session.
  }
}

export async function fetchSurah(surahId: number): Promise<SurahText> {
  const local = await readLocal(surahId);
  if (local) return local;

  // Online bootstrap only. After successful download the same data is local.
  if (!navigator.onLine) throw new Error('offline_content_not_downloaded');

  const res = await fetch(`${API_BASE}/surah/${surahId}/quran-uthmani`);
  if (!res.ok) throw new Error('network_error');
  const json = await res.json();
  if (json.code !== 200 || !json.data) throw new Error('parse_error');

  const result: SurahText = {
    surahId,
    ayahs: (json.data.ayahs as any[]).map((a) => ({
      numberInSurah: a.numberInSurah,
      text: a.text,
      juz: a.juz,
      page: a.page,
      surahId,
    })),
  };
  await writeLocal(result);
  return result;
}

export async function isQuranOfflineReady(): Promise<boolean> {
  for (const s of SURAHS) {
    if (!(await readLocal(s.id))) return false;
  }
  return true;
}

export async function getCachedSurahCount(): Promise<number> {
  let count = 0;
  for (const s of SURAHS) {
    if (await readLocal(s.id)) count++;
  }
  return count;
}

/**
 * Downloads all 114 surahs once while online.
 * This is the one-time bootstrap step required for a true Quran-text offline mode.
 */
export async function downloadQuranForOffline(
  onProgress?: (done: number, total: number, surahName: string) => void,
): Promise<void> {
  if (!navigator.onLine) throw new Error('internet_required_for_initial_download');

  for (let i = 0; i < SURAHS.length; i++) {
    const s = SURAHS[i];
    await fetchSurah(s.id);
    onProgress?.(i + 1, SURAHS.length, s.name);
  }
}

export function searchSurahNames(query: string): { id: number; name: string; nameEnglish: string; verses: number }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SURAHS.filter(
    (s) =>
      s.name.includes(query.trim()) ||
      s.nameEnglish.toLowerCase().includes(q) ||
      String(s.id) === query.trim(),
  ).slice(0, 12);
}

/**
 * Searches cached Quran text locally. No API call is made when offline.
 * If the local corpus is not complete and internet exists, it falls back to the API.
 */
export async function searchVerses(query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const localHits: SearchHit[] = [];
  for (const s of SURAHS) {
    const data = await readLocal(s.id);
    if (!data) continue;
    for (const ayah of data.ayahs) {
      if (ayah.text.includes(q)) {
        localHits.push({
          surahId: s.id,
          surahName: s.name,
          ayahNumber: ayah.numberInSurah,
          text: ayah.text,
        });
        if (localHits.length >= 50) return localHits;
      }
    }
  }

  // Offline means local-only. No network attempt.
  if (!navigator.onLine) return localHits;

  try {
    const res = await fetch(`${API_BASE}/search/${encodeURIComponent(q)}/all/ar`);
    if (!res.ok) return localHits;
    const json = await res.json();
    if (json.code !== 200 || !json.data?.matches) return localHits;
    return (json.data.matches as any[]).slice(0, 50).map((m) => ({
      surahId: m.surah.number,
      surahName: m.surah.name,
      ayahNumber: m.numberInSurah,
      text: m.text,
    }));
  } catch {
    return localHits;
  }
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  edition: string;
}

export const RECITERS: Reciter[] = [
  { id: 'alafasy', name: 'Mishary Alafasy', arabicName: 'مشاري راشد العفاسي', edition: 'ar.alafasy' },
  { id: 'sudais', name: 'Abdul Rahman Al-Sudais', arabicName: 'عبد الرحمن السديس', edition: 'ar.abdurrahmaansudais' },
  { id: 'shatri', name: 'Abu Bakr Al-Shatri', arabicName: 'أبو بكر الشاطري', edition: 'ar.shaatree' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', arabicName: 'محمود خليل الحصري', edition: 'ar.husary' },
  { id: 'minshawi', name: 'Mohamed Al-Minshawi', arabicName: 'محمد المنشاوي', edition: 'ar.minshawi' },
  { id: 'abdulbasit', name: 'Abdul Basit Abdus-Samad', arabicName: 'عبد الباسط عبد الصمد', edition: 'ar.abdulbasitmurattal' },
];

export function audioUrlForAyah(edition: string, ayahGlobalNumber: number): string {
  const folder = RECITER_FOLDERS[edition] ?? 'Alafasy_128kbps';
  let remaining = ayahGlobalNumber;
  let sId = 1;
  for (const s of SURAHS) {
    if (remaining <= s.verses) {
      sId = s.id;
      break;
    }
    remaining -= s.verses;
  }
  const sPadded = String(sId).padStart(3, '0');
  const aPadded = String(remaining).padStart(3, '0');
  return `${AUDIO_CDN_BASE}/${folder}/${sPadded}${aPadded}.mp3`;
}

export function audioUrlForSurah(edition: string, surahId: number): string {
  return `https://cdn.islamic.network/quran/audio-surah/${edition}/${surahId}.mp3`;
}
