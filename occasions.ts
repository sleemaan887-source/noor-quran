// Verified Islamic occasions (Hijri calendar). Dates are fixed by Hijri month/day.
// Source: standard Islamic calendar reference.

export interface IslamicOccasion {
  month: number; // Hijri month 1..12
  day: number; // Hijri day
  title: string;
  description: string;
}

export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  { month: 1, day: 1, title: 'رأس السنة الهجرية', description: 'بداية العام الهجري' },
  { month: 1, day: 10, title: 'يوم عاشوراء', description: 'صيام مستحب في العاشر من محرم' },
  { month: 3, day: 12, title: 'المولد النبوي', description: 'ذكرى مولد النبي محمد ﷺ' },
  { month: 7, day: 27, title: 'ليلة الإسراء والمعراج', description: 'ذكرى الإسراء والمعراج' },
  { month: 8, day: 15, title: 'ليلة النصف من شعبان', description: 'مناسبة دينية' },
  { month: 9, day: 1, title: 'بداية شهر رمضان', description: 'أول أيام شهر الصيام' },
  { month: 9, day: 27, title: 'ليلة القدر', description: 'من أعظم ليالي رمضان' },
  { month: 10, day: 1, title: 'عيد الفطر', description: 'أول أيام عيد الفطر المبارك' },
  { month: 12, day: 9, title: 'يوم عرفة', description: 'يوم الحج الأكبر' },
  { month: 12, day: 10, title: 'عيد الأضحى', description: 'أول أيام عيد الأضحى المبارك' },
];

export const HIJRI_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الثانية',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const HIJRI_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];
