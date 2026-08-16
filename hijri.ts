// Hijri date conversion using the Umm al-Qura-style tabular algorithm.
// This is an astronomical approximation (Kuwaiti algorithm) accurate to within
// ~1 day for civil purposes — not for determining religious observances which
// require moon-sighting. Good enough for a dashboard display.

const HIJRI_EPOCH = 227014; // Julian day number of 1 Muharram AH 1 (16 July 622 CE)

function gregorianToJulianDay(year: number, month: number, day: number): number {
  // Gregorian calendar → Julian Day Number
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function isHijriLeap(year: number): boolean {
  return (14 + 11 * year) % 30 < 11;
}

function hijriMonthLength(year: number, month: number): number {
  // month is 0..11
  if (month === 0) return 30;
  if (month === 1) return 29;
  if (month === 2) return 30;
  if (month === 3) return 30;
  if (month === 4) return 29;
  if (month === 5) return 30;
  if (month === 6) return 29;
  if (month === 7) return 30;
  if (month === 8) return 29;
  if (month === 9) return 30;
  if (month === 10) return 29;
  // Dhul-Hijjah
  return isHijriLeap(year) ? 30 : 29;
}

export interface HijriDate {
  year: number;
  month: number; // 1..12
  day: number; // 1..30
  dayOfWeek: number; // 0=Sunday..6=Saturday
}

export function toHijri(date: Date): HijriDate {
  const jd = gregorianToJulianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
  let days = jd - HIJRI_EPOCH;
  let year = 1;
  let month = 0;

  // Advance years
  while (true) {
    const yearLen = isHijriLeap(year) ? 355 : 354;
    if (days < yearLen) break;
    days -= yearLen;
    year++;
  }

  // Advance months
  while (days >= hijriMonthLength(year, month)) {
    days -= hijriMonthLength(year, month);
    month++;
    if (month === 12) {
      month = 0;
      year++;
    }
  }

  return {
    year,
    month: month + 1,
    day: days + 1,
    dayOfWeek: date.getDay(),
  };
}

export function formatHijriFull(date: Date): string {
  const h = toHijri(date);
  return `${h.day} ${['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الثانية','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'][h.month-1]} ${h.year} هـ`;
}

export function formatGregorianFull(date: Date): string {
  const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} م`;
}
