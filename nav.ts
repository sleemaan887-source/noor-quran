import {
  Home,
  BookOpen,
  Headphones,
  Sparkles,
  HandHeart,
  Type,
  Music,
  Brain,
  Mic,
  Clock,
  Compass,
  CalendarDays,
  Settings,
  User,
  DatabaseBackup,
  Accessibility,
  Bookmark,
  Layers,
  Hand,
  Volume2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  group: 'main' | 'tools' | 'system';
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'الرئيسية', icon: Home, group: 'main' },
  { path: '/quran', label: 'القرآن', icon: BookOpen, group: 'main' },
  { path: '/quran/juz', label: 'الأجزاء', icon: Layers, group: 'main' },
  { path: '/quran/bookmarks', label: 'العلامات', icon: Bookmark, group: 'main' },
  { path: '/audio', label: 'التلاوة', icon: Headphones, group: 'main' },
  { path: '/azkar', label: 'الأذكار', icon: Sparkles, group: 'main' },
  { path: '/dua', label: 'الأدعية', icon: HandHeart, group: 'main' },
  { path: '/tasbih', label: 'المسبحة', icon: Hand, group: 'main' },
  { path: '/tajweed', label: 'التجويد', icon: Type, group: 'main' },
  { path: '/maqamat', label: 'المقامات', icon: Music, group: 'main' },
  { path: '/hifz', label: 'الحفظ', icon: Brain, group: 'main' },
  { path: '/tasmee', label: 'التسميع', icon: Mic, group: 'main' },
  { path: '/voice', label: 'التذكيرات', icon: Volume2, group: 'main' },
  { path: '/prayer', label: 'الصلاة', icon: Clock, group: 'tools' },
  { path: '/qibla', label: 'القبلة', icon: Compass, group: 'tools' },
  { path: '/calendar', label: 'التقويم', icon: CalendarDays, group: 'tools' },
  { path: '/settings', label: 'الإعدادات', icon: Settings, group: 'system' },
  { path: '/accessibility', label: 'الإتاحة', icon: Accessibility, group: 'system' },
  { path: '/backup', label: 'النسخ الاحتياطي', icon: DatabaseBackup, group: 'system' },
  { path: '/developer', label: 'عن المطور', icon: User, group: 'system' },
];

export const MAIN_NAV = NAV_ITEMS.filter((n) => n.group === 'main');
export const TOOLS_NAV = NAV_ITEMS.filter((n) => n.group === 'tools');
export const SYSTEM_NAV = NAV_ITEMS.filter((n) => n.group === 'system');

// Bottom nav for mobile — the 5 most-used destinations.
export const BOTTOM_NAV: NavItem[] = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[5],
  NAV_ITEMS[7],
  NAV_ITEMS[13],
];
