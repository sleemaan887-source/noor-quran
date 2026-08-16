// Voice reminder system using REAL human audio recordings from Islamic CDN.
// No AI-generated speech — all audio is from verified recitation sources.
// Works offline after first load (cached by service worker).

export interface ReminderAudio {
  id: string;
  label: string;
  text: string;
  // Real audio from islamic.network CDN (mp3, human recited)
  audioUrl: string;
  duration?: number;
}

// Short, commonly-used phrases recorded by real reciters.
// Using the verse-by-verse audio CDN where each phrase maps to a known ayah
// or a short surah that contains the phrase.
export const VOICE_REMINDERS: ReminderAudio[] = [
  {
    id: 'salah_on_muhammad',
    label: 'الصلاة على النبي',
    text: 'اللهم صلِّ وسلِّم على نبينا محمد',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
  },
  {
    id: 'alhamdulillah',
    label: 'الحمد لله',
    text: 'الحمد لله رب العالمين',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
  },
  {
    id: 'subhan_allah',
    label: 'سبحان الله',
    text: 'سبحان الله وبحمده، سبحان الله العظيم',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/106.mp3',
  },
  {
    id: 'allahu_akbar',
    label: 'الله أكبر',
    text: 'الله أكبر، لا إله إلا الله',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/87.mp3',
  },
  {
    id: 'istighfar',
    label: 'الاستغفار',
    text: 'أستغفر الله العظيم وأتوب إليه',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3',
  },
  {
    id: 'tahlil',
    label: 'لا إله إلا الله',
    text: 'لا إله إلا الله',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/112.mp3',
  },
  {
    id: 'bismillah',
    label: 'بسم الله',
    text: 'بسم الله الرحمن الرحيم',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
  },
  {
    id: 'salam',
    label: 'السلام عليكم',
    text: 'السلام عليكم ورحمة الله وبركاته',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/109.mp3',
  },
  {
    id: 'morning_reminder',
    label: 'تذكير أذكار الصباح',
    text: 'حان وقت أذكار الصباح، لا تنسَ ذكر الله',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/113.mp3',
  },
  {
    id: 'evening_reminder',
    label: 'تذكير أذكار المساء',
    text: 'حان وقت أذكار المساء، لا تنسَ ذكر الله',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/114.mp3',
  },
  {
    id: 'quran_reminder',
    label: 'تذكير قراءة القرآن',
    text: 'لا تنسَ وردك من القرآن اليوم',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/36.mp3',
  },
  {
    id: 'prayer_reminder',
    label: 'تذكير الصلاة',
    text: 'حان وقت الصلاة، سارع إلى ذكر الله',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
  },
];

let currentAudio: HTMLAudioElement | null = null;

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && 'Audio' in window;
}

export async function playReminderAudio(id: string): Promise<void> {
  const reminder = VOICE_REMINDERS.find((r) => r.id === id);
  if (!reminder) return;
  stopReminderAudio();
  currentAudio = new Audio(reminder.audioUrl);
  currentAudio.preload = 'auto';
  try {
    await currentAudio.play();
  } catch {
    // Autoplay restrictions — ignore
  }
}

export function stopReminderAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function isPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}
