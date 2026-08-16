// Self-contained prayer time calculator (PrayTimes-style algorithm, v2.3).
// Astronomical computation from coordinates — works fully offline.
// Reference: PrayTimes.org algorithm by Hamid Zarrabi-Zadeh (open source, GPL).

export type CalculationMethod =
  | 'MWL' // Muslim World League
  | 'ISNA' // Islamic Society of North America
  | 'Egypt' // Egyptian General Authority of Survey
  | 'Makkah' // Umm al-Qura, Makkah
  | 'Karachi' // University of Islamic Sciences, Karachi
  | 'Tehran' // Institute of Geophysics, Tehran
  | 'Jafari'; // Shia Ithna-Ashari (Jafari)

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  timezone: number; // hours offset from UTC
}

const METHODS: Record<CalculationMethod, { fajr: number; isha: number; maghrib: number; midnight: 'standard' | 'jafari'; ishaInterval?: number }> = {
  MWL: { fajr: 18, isha: 17, maghrib: 0, midnight: 'standard' },
  ISNA: { fajr: 15, isha: 15, maghrib: 0, midnight: 'standard' },
  Egypt: { fajr: 19.5, isha: 17.5, maghrib: 0, midnight: 'standard' },
  Makkah: { fajr: 18.5, isha: 90, maghrib: 0, midnight: 'standard', ishaInterval: 90 },
  Karachi: { fajr: 18, isha: 18, maghrib: 0, midnight: 'standard' },
  Tehran: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'jafari' },
  Jafari: { fajr: 16, isha: 14, maghrib: 0, midnight: 'jafari' },
};

const dtr = (d: number) => (d * Math.PI) / 180;
const rtd = (r: number) => (r * 180) / Math.PI;
const fixHour = (h: number) => fix(h, 24);
function fix(a: number, b: number): number {
  const r = a % b;
  return r < 0 ? r + b : r;
}

// Julian day number for a given date
function julianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

// Sun position (declination & equation of time) — from PrayTimes
function sunPosition(jd: number): { declination: number; equation: number } {
  const D = jd - 2451545.0;
  const g = fix((357.529 + 0.98560028 * D), 360);
  const q = fix((280.459 + 0.98564736 * D), 360);
  const L = fix((q + 1.915 * dtr(g) + 0.020 * dtr(2 * g)), 360);
  const e = 23.439 - 0.00000036 * D;
  const RA = rtd(Math.atan2(Math.cos(dtr(e)) * Math.sin(dtr(L)), Math.cos(dtr(L)))) / 15;
  const decl = rtd(Math.asin(Math.sin(dtr(e)) * Math.sin(dtr(L))));
  const eqt = q / 15 - fixHour(RA);
  return { declination: decl, equation: eqt };
}

// Time for an angle (for fajr, isha, maghrib adjustments)
function sunAngleTime(angle: number, decl: number, lat: number, noon: number, direction: 'ccw' | 'cw'): number {
  const t = (1 / 15) * rtd(Math.acos(
    (-Math.sin(dtr(angle)) - Math.sin(dtr(lat)) * Math.sin(dtr(decl))) /
    (Math.cos(dtr(lat)) * Math.cos(dtr(decl))),
  ));
  return noon + (direction === 'ccw' ? -t : t);
}

// Asr time (Shafi`i factor=1; Hanafi factor=2)
function asrTime(factor: number, decl: number, lat: number, noon: number): number {
  const angle = -rtd(Math.atan(1 / (factor + Math.tan(dtr(Math.abs(lat - decl))))));
  return sunAngleTime(angle, decl, lat, noon, 'cw');
}

export interface PrayerOptions {
  method?: CalculationMethod;
  asrFactor?: 1 | 2; // 1 = Shafi`i, 2 = Hanafi
  date?: Date;
}

export function computePrayerTimes(coords: Coordinates, opts: PrayerOptions = {}): PrayerTimes {
  const method = opts.method ?? 'MWL';
  const asrFactor = opts.asrFactor ?? 1;
  const date = opts.date ?? new Date();
  const cfg = METHODS[method];

  const jd = julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) - coords.longitude / (15 * 24);
  const sun = sunPosition(jd);
  const decl = sun.declination;
  const eqt = sun.equation;

  const noon = 12 - eqt - coords.longitude / 15 + coords.timezone;
  const sunriseT = noon - (1 / 15) * rtd(Math.acos(
    (-Math.sin(dtr(0.833)) - Math.sin(dtr(coords.latitude)) * Math.sin(dtr(decl))) /
    (Math.cos(dtr(coords.latitude)) * Math.cos(dtr(decl))),
  ));

  const fajrT = sunAngleTime(cfg.fajr, decl, coords.latitude, noon, 'ccw');
  const maghribT = noon + (1 / 15) * rtd(Math.acos(
    (-Math.sin(dtr(0.833 + (cfg.maghrib || 0))) - Math.sin(dtr(coords.latitude)) * Math.sin(dtr(decl))) /
    (Math.cos(dtr(coords.latitude)) * Math.cos(dtr(decl))),
  ));

  let ishaT: number;
  if (cfg.ishaInterval) {
    ishaT = maghribT + cfg.ishaInterval / 60;
  } else {
    ishaT = sunAngleTime(cfg.isha, decl, coords.latitude, noon, 'cw');
  }

  const asrT = asrTime(asrFactor, decl, coords.latitude, noon);

  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mk = (frac: number) => {
    const hours = fixHour(frac);
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return new Date(base.getTime() + h * 3600000 + m * 60000 + s * 1000);
  };

  return {
    fajr: mk(fajrT),
    sunrise: mk(sunriseT),
    dhuhr: mk(noon),
    asr: mk(asrT),
    maghrib: mk(maghribT),
    isha: mk(ishaT),
  };
}

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export const PRAYER_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function nextPrayer(times: PrayerTimes, now: Date = new Date()): { key: PrayerKey; time: Date; label: string; remainingMs: number } | null {
  const order: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (const key of order) {
    const t = times[key];
    if (t.getTime() > now.getTime()) {
      return { key, time: t, label: PRAYER_LABELS[key], remainingMs: t.getTime() - now.getTime() };
    }
  }
  // After isha → next prayer is fajr tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = computePrayerTimes(coordsFromLast(coordsSnapshot), { ...optsSnapshot, date: tomorrow });
  return { key: 'fajr', time: tomorrowTimes.fajr, label: PRAYER_LABELS.fajr, remainingMs: tomorrowTimes.fajr.getTime() - now.getTime() };
}

// Tiny module-level cache so nextPrayer can compute tomorrow without re-passing coords.
let coordsSnapshot: Coordinates = { latitude: 21.4225, longitude: 39.8262, timezone: 3 };
let optsSnapshot: PrayerOptions = {};
export function setPrayerSnapshot(coords: Coordinates, opts: PrayerOptions) {
  coordsSnapshot = coords;
  optsSnapshot = opts;
}
function coordsFromLast(c: Coordinates): Coordinates {
  return c;
}

export function formatTime12h(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function formatRemaining(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function qiblaDirection(lat: number, _lng: number): number {
  // Direction from North to the Kaaba (21.4225N, 39.8262E), great-circle bearing.
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  const phiK = dtr(kaabaLat);
  const lambdaK = dtr(kaabaLng);
  const phi = dtr(lat);
  const lambda = dtr(_lng);
  const y = Math.sin(lambdaK - lambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
  return fix(rtd(Math.atan2(y, x)), 360);
}
