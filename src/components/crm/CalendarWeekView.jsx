import { getProgramTheme, FINANCIAL_STATUS_BADGE_STYLES } from '../../constants/crm';
import { User, MapPin } from 'lucide-react';

const DAY_START_HOUR = 6; // 6 AM
const DAY_END_HOUR = 22; // 10 PM
const HOUR_HEIGHT = 64; // px per hour row
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
      <div className="min-w-[840px]">
        {/* ---- Day headers ---- */}
        <div className="grid grid-cols-[4rem_repeat(7,1fr)] border-b border-slate-200 bg-slate-50">
          <div className="py-2.5 px-2 text-center text-[10px] font-extrabold uppercase text-slate-400">Time</div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={toKey(day)} className="border-l border-slate-200 px-2 py-2.5 text-center">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-600">
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <span
                  className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${
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
        <div className="grid grid-cols-[4rem_repeat(7,1fr)]">
          {/* Hour ruler */}
          <div style={{ height: gridHeight }} className="relative bg-slate-50/30">
            {HOURS.slice(0, -1).map((h, i) => (
              <div
                key={h}
                style={{ top: i * HOUR_HEIGHT }}
                className="absolute -translate-y-2.5 w-full pr-2 text-right text-[10px] font-bold font-mono text-slate-500"
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
                className="relative border-l border-slate-200 hover:bg-slate-50/40 transition-colors cursor-pointer"
                onClick={() => onSlotClick?.(day)}
              >
                {HOURS.slice(0, -1).map((h, i) => (
                  <div
                    key={h}
                    style={{ top: i * HOUR_HEIGHT }}
                    className="absolute h-px w-full border-t border-slate-100"
                  />
                ))}

                {dayEvents.map((ev) => {
                  const startMin = timeToMinutes(ev.startTime) - DAY_START_HOUR * 60;
                  const endMin = ev.endTime ? timeToMinutes(ev.endTime) - DAY_START_HOUR * 60 : startMin + 60;
                  const top = Math.max(0, (startMin / 60) * HOUR_HEIGHT);
                  const height = Math.max(28, ((endMin - startMin) / 60) * HOUR_HEIGHT - 3);

                  const theme = getProgramTheme(ev.programDetails?.calendarColor || 'blue');
                  const staffName = Array.isArray(ev.teachers) && ev.teachers.length > 0
                    ? ev.teachers[0].fullName
                    : ev.teacher?.fullName || '';

                  const financialStatus = ev.financialSummary?.aggregateStatus || 'PENDING';
                  const financialBadgeStyle = FINANCIAL_STATUS_BADGE_STYLES[financialStatus] || FINANCIAL_STATUS_BADGE_STYLES.PENDING;
                  const financialLabel = ev.financialSummary?.statusLabel || financialStatus;

                  return (
                    <button
                      key={ev._id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      style={{ top, height }}
                      className={`absolute left-1 right-1 overflow-hidden rounded-lg p-1.5 text-left text-[10px] font-medium leading-tight shadow-xs transition-transform hover:z-20 hover:scale-[1.02] cursor-pointer ${theme.card}`}
                    >
                      <div className="flex items-center justify-between gap-1 font-mono font-bold text-[9.5px]">
                        <span className="truncate text-marine">{ev.startTime}{ev.endTime ? `–${ev.endTime}` : ''}</span>
                        <span className={`rounded px-1 text-[8.5px] uppercase font-extrabold shrink-0 ${financialBadgeStyle}`}>
                          {financialLabel}
                        </span>
                      </div>
                      <p className="truncate font-bold text-marine mt-0.5 text-[10.5px]">{ev.title || ev.programDetails?.title}</p>
                      {height > 44 && staffName && (
                        <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-700 opacity-90 truncate mt-0.5">
                          <User className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{staffName}</span>
                        </div>
                      )}
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
