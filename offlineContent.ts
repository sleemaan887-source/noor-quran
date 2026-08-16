import {
  downloadQuranForOffline,
  getCachedSurahCount,
  isQuranOfflineReady,
} from '@/data/quran/quranApi';

export interface OfflineStatus {
  online: boolean;
  cachedSurahs: number;
  totalSurahs: number;
  quranReady: boolean;
  serviceWorkerReady: boolean;
}

export async function getOfflineStatus(): Promise<OfflineStatus> {
  let serviceWorkerReady = false;
  try {
    serviceWorkerReady =
      'serviceWorker' in navigator && Boolean(await navigator.serviceWorker.ready);
  } catch {
    serviceWorkerReady = false;
  }

  const cachedSurahs = await getCachedSurahCount();
  return {
    online: navigator.onLine,
    cachedSurahs,
    totalSurahs: 114,
    quranReady: await isQuranOfflineReady(),
    serviceWorkerReady,
  };
}

export async function prepareQuranOffline(
  onProgress?: (done: number, total: number, name: string) => void,
): Promise<void> {
  await downloadQuranForOffline(onProgress);
}
