import { useState, useMemo } from 'react';
import { HDate, months, Locale } from '@hebcal/core';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';

// Register Hebrew locale strings
const HEB_MONTHS: Record<number, string> = {
  [months.TISHREI]: 'תשרי',
  [months.CHESHVAN]: 'חשוון',
  [months.KISLEV]: 'כסלו',
  [months.TEVET]: 'טבת',
  [months.SHVAT]: 'שבט',
  [months.ADAR_I]: 'אדר א׳',
  [months.ADAR_II]: 'אדר ב׳',
  [months.NISAN]: 'ניסן',
  [months.IYYAR]: 'אייר',
  [months.SIVAN]: 'סיוון',
  [months.TAMUZ]: 'תמוז',
  [months.AV]: 'אב',
  [months.ELUL]: 'אלול',
};

const HEB_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const GREG_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const GREG_DAYS = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'];

function gematriya(num: number): string {
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  if (num <= 0) return '';
  if (num === 15) return 'ט״ו';
  if (num === 16) return 'ט״ז';
  if (num < 10) return ones[num] + '׳';
  if (num < 30) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    if (o === 0) return tens[t] + '׳';
    return tens[t] + '״' + ones[o];
  }
  return String(num);
}

interface Props {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableSlots?: Record<string, boolean>; // date string -> has availability
}

export default function HebrewCalendar({ selectedDate, onSelectDate, availableSlots }: Props) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    const days: { date: Date; gregDay: number; hebDay: number; hebMonth: string; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Previous month padding
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const hd = new HDate(d);
      days.push({
        date: d,
        gregDay: d.getDate(),
        hebDay: hd.getDate(),
        hebMonth: HEB_MONTHS[hd.getMonth()] || '',
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const hd = new HDate(d);
      days.push({
        date: d,
        gregDay: i,
        hebDay: hd.getDate(),
        hebMonth: HEB_MONTHS[hd.getMonth()] || '',
        isCurrentMonth: true,
        isToday: d.toDateString() === today.toDateString(),
      });
    }

    // Next month padding
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        const hd = new HDate(d);
        days.push({
          date: d,
          gregDay: i,
          hebDay: hd.getDate(),
          hebMonth: HEB_MONTHS[hd.getMonth()] || '',
          isCurrentMonth: false,
          isToday: false,
        });
      }
    }

    return days;
  }, [year, month]);

  const hebDateForView = new HDate(new Date(year, month, 15));
  const hebMonthName = HEB_MONTHS[hebDateForView.getMonth()] || '';
  const hebYear = hebDateForView.getFullYear();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date());

  const isSelected = (d: Date) => selectedDate && d.toDateString() === selectedDate.toDateString();
  const isPast = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const dateKey = (d: Date) => d.toISOString().split('T')[0];
  const hasSlots = (d: Date) => availableSlots ? availableSlots[dateKey(d)] : true;

  // Selected date Hebrew info
  const selectedHeb = selectedDate ? new HDate(selectedDate) : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between mb-1">
          <button onClick={nextMonth} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <ChevronRight size={20} />
          </button>
          <div className="text-center">
            <div className="font-bold text-lg">{GREG_MONTHS[month]} {year}</div>
            <div className="text-sm opacity-90">{hebMonthName} {hebYear}</div>
          </div>
          <button onClick={prevMonth} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <ChevronLeft size={20} />
          </button>
        </div>
        <button onClick={goToday} className="text-xs opacity-75 hover:opacity-100 transition mx-auto block">
          חזרה להיום
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {HEB_DAYS.map((day, i) => (
          <div key={i} className={`text-center py-2 text-xs font-bold ${i === 6 ? 'text-blue-600' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const past = isPast(day.date);
          const selected = isSelected(day.date);
          const available = !past && day.isCurrentMonth && hasSlots(day.date);
          const isFriday = day.date.getDay() === 5;
          const isShabbat = day.date.getDay() === 6;
          const showHebMonth = day.hebDay === 1;

          return (
            <button
              key={i}
              onClick={() => available && onSelectDate(day.date)}
              disabled={!available}
              className={`relative p-1 min-h-[52px] border-b border-l transition flex flex-col items-center justify-center ${
                selected
                  ? 'bg-blue-600 text-white'
                  : day.isToday
                    ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset'
                    : !day.isCurrentMonth
                      ? 'bg-gray-50 text-gray-300'
                      : past
                        ? 'text-gray-300'
                        : available
                          ? 'hover:bg-blue-50 cursor-pointer'
                          : 'text-gray-300'
              } ${isShabbat ? 'bg-amber-50/50' : ''}`}
            >
              {/* Gregorian date */}
              <span className={`text-sm font-bold leading-none ${
                selected ? 'text-white' : day.isToday ? 'text-blue-600' : ''
              }`}>
                {day.gregDay}
              </span>

              {/* Hebrew date */}
              <span className={`text-[10px] leading-tight mt-0.5 ${
                selected ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {showHebMonth ? day.hebMonth : gematriya(day.hebDay)}
              </span>

              {/* Availability dot */}
              {day.isCurrentMonth && !past && availableSlots && (
                <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                  hasSlots(day.date) ? 'bg-green-400' : 'bg-red-300'
                }`} />
              )}

              {/* Shabbat/Friday indicator */}
              {(isFriday || isShabbat) && day.isCurrentMonth && (
                <span className={`absolute top-0.5 left-0.5 w-1 h-1 rounded-full ${
                  selected ? 'bg-white/50' : 'bg-amber-400'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date details */}
      {selectedDate && selectedHeb && (
        <div className="bg-blue-50 p-3 border-t">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            <div>
              <div className="text-sm font-bold text-blue-900">
                {GREG_DAYS[selectedDate.getDay()]}, {selectedDate.getDate()} ב{GREG_MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </div>
              <div className="text-xs text-blue-600">
                {gematriya(selectedHeb.getDate())} {HEB_MONTHS[selectedHeb.getMonth()]} {selectedHeb.getFullYear()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
