// Quran division data — Juz (30 parts), Hizb (60 parts), and page mapping.
// Standard Madinah Mushaf division: 604 pages, 30 Juz, 60 Hizb, 114 Surahs.

export interface JuzInfo {
  id: number; // 1..30
  name: string;
  startSurah: number;
  startAyah: number;
}

export interface HizbInfo {
  id: number; // 1..60
  juzId: number;
  name: string;
  startSurah: number;
  startAyah: number;
}

// Juz names in Arabic and their starting points (surah:ayah)
export const AJZA: JuzInfo[] = [
  { id: 1, name: 'آلم', startSurah: 1, startAyah: 1 },
  { id: 2, name: 'سيقول السفهاء', startSurah: 2, startAyah: 142 },
  { id: 3, name: 'الله ربنا', startSurah: 2, startAyah: 253 },
  { id: 4, name: 'لن تنالوا البر', startSurah: 3, startAyah: 92 },
  { id: 5, name: 'والمحصنات', startSurah: 4, startAyah: 24 },
  { id: 6, name: 'لا يحب الله', startSurah: 4, startAyah: 148 },
  { id: 7, name: 'وإذا سمعوا', startSurah: 5, startAyah: 83 },
  { id: 8, name: 'ويل لهلك', startSurah: 6, startAyah: 111 },
  { id: 9, name: 'قال الملأ', startSurah: 7, startAyah: 88 },
  { id: 10, name: 'واعلموا', startSurah: 8, startAyah: 41 },
  { id: 11, name: 'يعتذرون', startSurah: 9, startAyah: 93 },
  { id: 12, name: 'وما من دابة', startSurah: 11, startAyah: 6 },
  { id: 13, name: 'وما أبرئ', startSurah: 12, startAyah: 53 },
  { id: 14, name: 'ربما', startSurah: 15, startAyah: 1 },
  { id: 15, name: 'سبحان الذي', startSurah: 17, startAyah: 1 },
  { id: 16, name: 'قال ألم', startSurah: 18, startAyah: 32 },
  { id: 17, name: 'اقترب للناس', startSurah: 21, startAyah: 1 },
  { id: 18, name: 'قد أفلح', startSurah: 23, startAyah: 1 },
  { id: 19, name: 'وقال الذين', startSurah: 25, startAyah: 21 },
  { id: 20, name: 'أمن خلق', startSurah: 27, startAyah: 56 },
  { id: 21, name: 'اتل ما أوحي', startSurah: 29, startAyah: 46 },
  { id: 22, name: 'ومن يقنت', startSurah: 33, startAyah: 31 },
  { id: 23, name: 'وما لي', startSurah: 36, startAyah: 22 },
  { id: 24, name: 'فمن أظلم', startSurah: 39, startAyah: 32 },
  { id: 25, name: 'إليه يرد', startSurah: 41, startAyah: 47 },
  { id: 26, name: 'حم', startSurah: 46, startAyah: 1 },
  { id: 27, name: 'قال فما خطبكم', startSurah: 51, startAyah: 31 },
  { id: 28, name: 'قد سمع الله', startSurah: 58, startAyah: 1 },
  { id: 29, name: 'تبارك الذي', startSurah: 67, startAyah: 1 },
  { id: 30, name: 'عم', startSurah: 78, startAyah: 1 },
];

// Generate 60 Hizb from the 30 Juz (each juz = 2 hizb)
export const AHZAB: HizbInfo[] = AJZA.flatMap((juz) => {
  const hizb1: HizbInfo = {
    id: (juz.id - 1) * 2 + 1,
    juzId: juz.id,
    name: `الحزب ${((juz.id - 1) * 2 + 1)}`,
    startSurah: juz.startSurah,
    startAyah: juz.startAyah,
  };
  // Hizb 2 start is approximately at the middle of the juz — we use known markers
  const midPoints: Record<number, { surah: number; ayah: number }> = {
    1: { surah: 2, ayah: 26 }, 2: { surah: 2, ayah: 200 }, 3: { surah: 3, ayah: 15 },
    4: { surah: 3, ayah: 133 }, 5: { surah: 4, ayah: 58 }, 6: { surah: 5, ayah: 12 },
    7: { surah: 6, ayah: 13 }, 8: { surah: 7, ayah: 31 }, 9: { surah: 7, ayah: 156 },
    10: { surah: 9, ayah: 1 }, 11: { surah: 9, ayah: 122 }, 12: { surah: 11, ayah: 84 },
    13: { surah: 14, ayah: 10 }, 14: { surah: 16, ayah: 51 }, 15: { surah: 18, ayah: 32 },
    16: { surah: 20, ayah: 1 }, 17: { surah: 22, ayah: 19 }, 18: { surah: 24, ayah: 21 },
    19: { surah: 27, ayah: 1 }, 20: { surah: 29, ayah: 26 }, 21: { surah: 35, ayah: 15 },
    22: { surah: 36, ayah: 28 }, 23: { surah: 39, ayah: 53 }, 24: { surah: 45, ayah: 1 },
    25: { surah: 47, ayah: 10 }, 26: { surah: 51, ayah: 31 }, 27: { surah: 58, ayah: 14 },
    28: { surah: 67, ayah: 1 }, 29: { surah: 73, ayah: 20 }, 30: { surah: 87, ayah: 1 },
  };
  const mid = midPoints[juz.id] ?? { surah: juz.startSurah, ayah: juz.startAyah };
  const hizb2: HizbInfo = {
    id: (juz.id - 1) * 2 + 2,
    juzId: juz.id,
    name: `الحزب ${((juz.id - 1) * 2 + 2)}`,
    startSurah: mid.surah,
    startAyah: mid.ayah,
  };
  return [hizb1, hizb2];
});

// Map page number to juz (standard 604-page Mushaf, ~20 pages per juz)
export function pageToJuz(page: number): number {
  return Math.min(30, Math.max(1, Math.ceil(page / 20.2)));
}

// Map page number to hizb
export function pageToHizb(page: number): number {
  return Math.min(60, Math.max(1, Math.ceil(page / 10.1)));
}

export const TOTAL_PAGES = 604;
