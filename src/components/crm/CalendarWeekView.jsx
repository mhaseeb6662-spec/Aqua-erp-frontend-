import { CALENDAR_TYPE_STYLES } from '../../constants/crm';

const DAY_START_HOUR = 6; // 6 AM
const DAY_END_HOUR = 22; // 10 PM
const HOUR_HEIGHT = 56; // px per hour row
const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);

const timeToMinutes = (t) => {
  if (!t) return DAY_START_HOUR * 60;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const formatHour = (h) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Time-grid week view — 7 day columns against an hourly ruler, events
 * positioned/sized by their start/end time. Mirrors a standard scheduling
 * calendar's week view.
 */
export default function CalendarWeekView({ weekDays, eventsByDay, onEventClick, onSlotClick }) {
  const today = new Date();
  const gridHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;

  const toKey = (d) => {
    if (!d) return '';
    if (typeof d === 'string') {
      if (d.includes('T')) return d.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    }
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '';
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        {/* ---- Day headers ---- */}
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/50">
          <div />
          {weekDays.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={toKey(day)} className="border-l border-slate-200 px-2 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <span
                  className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    isToday ? 'bg-tide text-white shadow-xs' : 'text-marine'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* ---- Hour grid ---- */}
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]">
          {/* Hour ruler */}
          <div style={{ height: gridHeight }} className="relative">
            {HOURS.slice(0, -1).map((h, i) => (
              <div
                key={h}
                style={{ top: i * HOUR_HEIGHT }}
                className="absolute -translate-y-2 pr-2 text-right text-[10px] font-bold font-mono text-slate-500"
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const key = toKey(day);
            const dayEvents = eventsByDay[key] || [];
            return (
              <div
                key={key}
                style={{ height: gridHeight }}
                className="relative border-l border-marine/[0.06]"
                onClick={() => onSlotClick?.(day)}
              >
                {HOURS.slice(0, -1).map((h, i) => (
                  <div
                    key={h}
                    style={{ top: i * HOUR_HEIGHT }}
                    className="absolute h-px w-full bg-marine/[0.05]"
                  />
                ))}

                {dayEvents.map((ev) => {
                  const startMin = timeToMinutes(ev.startTime) - DAY_START_HOUR * 60;
                  const endMin = ev.endTime ? timeToMinutes(ev.endTime) - DAY_START_HOUR * 60 : startMin + 30;
                  const top = Math.max(0, (startMin / 60) * HOUR_HEIGHT);
                  const height = Math.max(20, ((endMin - startMin) / 60) * HOUR_HEIGHT - 2);

                  return (
                    <button
                      key={ev._id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      style={{ top, height }}
                      className={`absolute left-0.5 right-0.5 overflow-hidden rounded-md border px-1.5 py-1 text-left text-[10px] font-medium leading-tight shadow-sm transition-transform hover:z-10 hover:scale-[1.02] ${CALENDAR_TYPE_STYLES[ev.type]}`}
                    >
                      <p className="truncate font-semibold">{ev.startTime} {ev.title}</p>
                      {height > 32 && ev.teacher && <p className="truncate opacity-70">{ev.teacher.fullName}</p>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
