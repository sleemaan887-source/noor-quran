import { useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { PageHeader, Card, toArabicDigits } from '@/core/widgets/ui';
import { toHijri, formatHijriFull, formatGregorianFull } from '@/core/utils/hijri';
import { ISLAMIC_OCCASIONS, HIJRI_MONTHS, HIJRI_DAYS } from '@/data/calendar/occasions';

export function CalendarPage() {
  const [viewDate, setViewDate] = useState(new Date());

  const hijri = useMemo(() => toHijri(viewDate), [viewDate]);

  // Build a month grid: show Gregorian dates for the displayed Hijri month.
  // Approximate by walking days from the 1st of the Hijri month.
  const monthGrid = useMemo(() => {
    // Find Gregorian date corresponding to 1st of current Hijri month.
    // Walk backward from viewDate to the 1st.
    const firstHijri = new Date(viewDate);
    firstHijri.setDate(firstHijri.getDate() - (hijri.day - 1));
    const firstDow = firstHijri.getDay();

    // Determine length of this Hijri month
    const isLeap = (hijri.year * 11 + 14) % 30 < 11;
    const monthLens = [30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29, isLeap ? 30 : 29];
    const monthLen = monthLens[hijri.month - 1];

    const cells: { greg: Date; hDay: number }[] = [];
    for (let i = 0; i < monthLen; i++) {
      const g = new Date(firstHijri);
      g.setDate(firstHijri.getDate() + i);
      cells.push({ greg: g, hDay: i + 1 });
    }
    return { cells, firstDow };
  }, [viewDate, hijri]);

  const occasionsThisMonth = ISLAMIC_OCCASIONS.filter((o) => o.month === hijri.month);

  const changeMonth = (dir: number) => {
    const next = new Date(viewDate);
    // Approx Hijri month ~ 29.5 days
    next.setDate(next.getDate() + dir * 30);
    setViewDate(next);
  };

  const today = new Date();

  return (
    <div className="animate-fade-in">
      <PageHeader title="التقويم الهجري" subtitle={formatHijriFull(viewDate)} icon={<CalendarDays className="h-6 w-6" />} />

      <Card className="mb-5 bg-gradient-to-br from-primary-50 to-white dark:from-night-800 dark:to-night-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-primary-400 dark:text-sand-400">التاريخ الهجري</p>
            <p className="font-display text-xl font-bold text-primary-600 dark:text-sand-100">{formatHijriFull(viewDate)}</p>
          </div>
          <div>
            <p className="text-xs text-primary-400 dark:text-sand-400">التاريخ الميلادي</p>
            <p className="font-display text-xl font-bold text-primary-600 dark:text-sand-100">{formatGregorianFull(viewDate)}</p>
          </div>
        </div>
      </Card>

      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="rounded-lg bg-white p-2 text-primary-500 shadow-soft dark:bg-night-800 dark:text-sand-200">
          <ChevronRight className="h-5 w-5" />
        </button>
        <p className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">
          {HIJRI_MONTHS[hijri.month - 1]} {toArabicDigits(hijri.year)} هـ
        </p>
        <button onClick={() => changeMonth(1)} className="rounded-lg bg-white p-2 text-primary-500 shadow-soft dark:bg-night-800 dark:text-sand-200">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <Card className="mb-5">
        <div className="grid grid-cols-7 gap-1 text-center">
          {HIJRI_DAYS.map((d) => (
            <div key={d} className="py-2 text-xs font-bold text-primary-400 dark:text-sand-400">{d}</div>
          ))}
          {Array.from({ length: monthGrid.firstDow }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {monthGrid.cells.map(({ greg, hDay }) => {
            const isToday = greg.toDateString() === today.toDateString();
            const occasion = ISLAMIC_OCCASIONS.find((o) => o.month === hijri.month && o.day === hDay);
            return (
              <div
                key={hDay}
                className={`relative rounded-lg p-2 text-center transition ${
                  isToday
                    ? 'bg-primary-500 text-white'
                    : occasion
                    ? 'bg-gold-50 dark:bg-gold-500/10'
                    : 'hover:bg-sand-100 dark:hover:bg-white/5'
                }`}
              >
                <p className={`text-xs ${isToday ? 'text-white' : 'text-primary-400 dark:text-sand-400'}`}>
                  {greg.getDate()}
                </p>
                <p className={`font-bold ${isToday ? 'text-white' : 'text-primary-600 dark:text-sand-100'}`}>
                  {toArabicDigits(hDay)}
                </p>
                {occasion && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold-500" />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Occasions this month */}
      {occasionsThisMonth.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-bold text-primary-600 dark:text-sand-100">مناسبات هذا الشهر</h2>
          <div className="space-y-2">
            {occasionsThisMonth.map((o) => (
              <Card key={`${o.month}-${o.day}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-primary-600 dark:text-sand-100">
                      {toArabicDigits(o.day)} {HIJRI_MONTHS[o.month - 1]}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-sand-200">{o.title}</p>
                    <p className="text-xs text-primary-400 dark:text-sand-400">{o.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
