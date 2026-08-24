import { useMemo, useState } from 'react';
import { User, Clock, MapPin, BookOpen, Sparkles, CalendarDays, ListFilter, LayoutGrid } from 'lucide-react';
import { CALENDAR_TYPE_STYLES, CALENDAR_STATUS_STYLES } from '../../constants/crm';

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

const formatSlotLabel = (slotStr) => {
  const [h] = slotStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:00 ${ampm}`;
};

export default function CalendarDayView({
  selectedDate,
  events = [],
  staffFilter,
  teachers = [],
  onEventClick,
  onSlotClick,
}) {
  const [displayMode, setDisplayMode] = useState('slots'); // 'slots' | 'list'

  const currentStaffName = useMemo(() => {
    if (!staffFilter) return 'All Staff';
    const found = teachers.find((t) => String(t._id) === String(staffFilter));
    return found ? found.fullName : 'Selected Staff';
  }, [staffFilter, teachers]);

  const dateHeading = useMemo(() => {
    if (!selectedDate) return '';
    const d = new Date(selectedDate);
    const y = typeof selectedDate === 'string' && selectedDate.includes('-') ? Number(selectedDate.split('-')[0]) : d.getFullYear();
    const m = typeof selectedDate === 'string' && selectedDate.includes('-') ? Number(selectedDate.split('-')[1]) : d.getMonth() + 1;
    const day = typeof selectedDate === 'string' && selectedDate.includes('-') ? Number(selectedDate.split('-')[2].slice(0, 2)) : d.getDate();
    const localNoon = new Date(y, m - 1, day, 12, 0, 0);
    return localNoon.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Group events by hourly slot
  const { slotMap, unscheduledEvents } = useMemo(() => {
    const map = {};
    TIME_SLOTS.forEach((slot) => { map[slot] = []; });
    const unscheduled = [];

    events.forEach((ev) => {
      const timeStr = ev.startTime || '08:00';
      const [h] = timeStr.split(':').map(Number);
      const slotHour = String(h).padStart(2, '0') + ':00';

      if (map[slotHour]) {
        map[slotHour].push(ev);
      } else {
        unscheduled.push(ev);
      }
    });

    return { slotMap: map, unscheduledEvents: unscheduled };
  }, [events]);

  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden">
      {/* ---- Day View Staff & Mode Header ---- */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Day Schedule</span>
          <h3 className="text-lg font-bold text-marine">{dateHeading}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher: Time Slots vs Day List */}
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
            <button
              onClick={() => setDisplayMode('slots')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                displayMode === 'slots' ? 'bg-marine text-white shadow-xs' : 'text-slate-700 hover:text-marine'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Time Slots
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                displayMode === 'list' ? 'bg-marine text-white shadow-xs' : 'text-slate-700 hover:text-marine'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              Day List ({events.length})
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-2xs">
            <User className="h-4 w-4 text-tide" />
            <span className="text-xs font-bold text-slate-600">Staff:</span>
            <span className="text-xs font-bold text-marine">{currentStaffName}</span>
          </div>
        </div>
      </div>

      {/* ---- Unscheduled / Extra Hours Events (if any) ---- */}
      {unscheduledEvents.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50/60 px-6 py-3">
          <p className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            Events outside standard hours ({unscheduledEvents.length}):
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unscheduledEvents.map((ev) => (
              <div
                key={ev._id}
                onClick={() => onEventClick && onEventClick(ev)}
                className="cursor-pointer rounded-xl border border-amber-200 bg-white p-3 shadow-xs hover:border-amber-400"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-amber-900">{ev.startTime}</span>
                  <span className="badge bg-amber-100 text-amber-900 text-[10px] font-bold">Special Timing</span>
                </div>
                <p className="font-bold text-marine text-sm">{ev.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- 1. Time Slots View ---- */}
      {displayMode === 'slots' ? (
        <div className="divide-y divide-slate-100">
          {TIME_SLOTS.map((slot) => {
            const slotEvents = slotMap[slot] || [];
            return (
              <div
                key={slot}
                className="group flex min-h-[5.5rem] items-start transition-colors hover:bg-slate-50/40"
              >
                {/* Left Column: Chronological Time Slot */}
                <div className="w-28 flex-shrink-0 border-r border-slate-200 px-4 py-3 text-right bg-slate-50/30">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {formatSlotLabel(slot)}
                  </span>
                </div>

                {/* Right Column: Events / Empty Slot */}
                <div
                  className="flex-1 p-2 min-h-[5.5rem] cursor-pointer"
                  onClick={() => onSlotClick && onSlotClick(selectedDate, slot)}
                >
                  {slotEvents.length === 0 ? (
                    <div className="flex h-full min-h-[3.5rem] items-center justify-start rounded-lg border border-dashed border-transparent p-2 text-xs font-semibold text-slate-400 transition-colors group-hover:border-slate-300 group-hover:text-tide">
                      + Click to schedule event at {formatSlotLabel(slot)}
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {slotEvents.map((ev) => {
                        const staffNames = Array.isArray(ev.teachers) && ev.teachers.length > 0
                          ? ev.teachers.map((t) => t.fullName).join(', ')
                          : ev.teacher?.fullName || 'Unassigned';

                        return (
                          <div
                            key={ev._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick && onEventClick(ev);
                            }}
                            className={`group/card relative flex flex-col justify-between rounded-xl border p-3 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${CALENDAR_TYPE_STYLES[ev.type] || 'bg-slate-50 border-slate-300'}`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-marine border border-slate-200">
                                  <Clock className="h-3 w-3 text-tide" />
                                  {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                                </span>
                                {ev.subject && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-tide/10 px-2 py-0.5 text-[10px] font-bold text-tide-dark">
                                    <BookOpen className="h-3 w-3" />
                                    {ev.subject}
                                  </span>
                                )}
                              </div>

                              <p className="font-bold text-marine group-hover/card:underline text-sm leading-snug">
                                {ev.title}
                              </p>

                              {ev.classDescription && (
                                <p className="mt-1 line-clamp-2 text-xs text-slate-700">
                                  {ev.classDescription}
                                </p>
                              )}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2 text-[11px] text-slate-700">
                              <span className="flex items-center gap-1 truncate font-medium">
                                <User className="h-3 w-3 text-tide shrink-0" />
                                {staffNames}
                              </span>
                              {ev.location && (
                                <span className="flex items-center gap-0.5 truncate text-slate-600 font-medium">
                                  <MapPin className="h-3 w-3 text-amber-700 shrink-0" />
                                  {ev.location}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ---- 2. Day List View ---- */
        <div className="p-4">
          {events.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">
              <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              No events scheduled for {dateHeading}.
            </div>
          ) : (
            <div className="space-y-2.5">
              {events.map((ev) => {
                const staffNames = Array.isArray(ev.teachers) && ev.teachers.length > 0
                  ? ev.teachers.map((t) => t.fullName).join(', ')
                  : ev.teacher?.fullName || 'Unassigned';

                return (
                  <div
                    key={ev._id}
                    onClick={() => onEventClick && onEventClick(ev)}
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="badge inline-flex items-center gap-1 border bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-bold">
                          <Clock className="h-3 w-3 text-tide" />
                          {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                        </span>
                        <span className="text-xs font-bold text-slate-600 uppercase">Event</span>
                        <span className="font-bold text-marine">{ev.title}</span>
                      </div>

                      <span className={`badge shrink-0 text-[10px] ${CALENDAR_STATUS_STYLES[ev.status] || 'bg-slate-100'}`}>
                        {ev.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-700">
                      <span className="flex items-center gap-1 font-medium">
                        <User className="h-3.5 w-3.5 text-tide" /> Staff: {staffNames}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-amber-700" /> Location: {ev.location}
                        </span>
                      )}
                      {ev.subject && (
                        <span className="flex items-center gap-1 font-medium">
                          <BookOpen className="h-3.5 w-3.5 text-tide" /> Subject: {ev.subject}
                        </span>
                      )}
                    </div>

                    {ev.classDescription && (
                      <p className="mt-2 text-xs text-slate-600 line-clamp-2">{ev.classDescription}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
