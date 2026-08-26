import { Clock, MapPin, User, BookOpen, Users, Sparkles, CreditCard } from 'lucide-react';
import { CALENDAR_STATUS_STYLES, CALENDAR_TYPE_STYLES, getProgramTheme, FINANCIAL_STATUS_BADGE_STYLES } from '../../constants/crm';

export default function CalendarListView({ events = [], onEventClick }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white">
        <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
        <p className="text-base font-semibold text-marine">No classes or events scheduled</p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          No matching calendar entries found for the selected filters or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
          <tr>
            <th className="px-5 py-3.5">Date & Time</th>
            <th className="px-5 py-3.5">Program / Class Title</th>
            <th className="px-5 py-3.5">Category & Level</th>
            <th className="px-5 py-3.5">Coach / Staff</th>
            <th className="px-5 py-3.5">Branch / Location</th>
            <th className="px-5 py-3.5">Seats / Capacity</th>
            <th className="px-5 py-3.5">Payment Status</th>
            <th className="px-5 py-3.5">Session Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((ev) => {
            const key = typeof ev.date === 'string' && ev.date.includes('T') ? ev.date.split('T')[0] : (typeof ev.date === 'string' ? ev.date : '');
            const [y, m, day] = key ? key.split('-').map(Number) : [new Date(ev.date).getFullYear(), new Date(ev.date).getMonth() + 1, new Date(ev.date).getDate()];
            const localNoon = new Date(y, m - 1, day, 12, 0, 0);
            const dateStr = localNoon.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            const staffNames = Array.isArray(ev.teachers) && ev.teachers.length > 0
              ? ev.teachers.map((t) => t.fullName).join(', ')
              : ev.teacher?.fullName || 'Unassigned';

            const capacityText = ev.seatType === 'limited'
              ? `${ev.registrations?.length || 0} / ${ev.capacity || '10'} Seats`
              : 'Unlimited';

            const theme = getProgramTheme(ev.programDetails?.calendarColor || 'blue');
            const financialStatus = ev.financialSummary?.aggregateStatus || 'PENDING';
            const financialBadgeStyle = FINANCIAL_STATUS_BADGE_STYLES[financialStatus] || FINANCIAL_STATUS_BADGE_STYLES.PENDING;
            const financialLabel = ev.financialSummary?.statusLabel || financialStatus;

            return (
              <tr
                key={ev._id}
                onClick={() => onEventClick && onEventClick(ev)}
                className="cursor-pointer transition-colors hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="font-bold text-marine">{dateStr}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono mt-0.5 font-semibold">
                    <Clock className="h-3 w-3 text-tide shrink-0" />
                    {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-marine hover:underline text-sm">
                      {ev.title || ev.programDetails?.title}
                    </span>
                  </div>
                  {ev.classDescription && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ev.classDescription}</p>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs ${theme.pill}`}>
                    {ev.programDetails?.category || ev.subject || 'Class'}
                    {ev.programDetails?.level ? ` • ${ev.programDetails.level}` : ''}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <User className="h-3.5 w-3.5 text-tide shrink-0" />
                    <span className="font-semibold">{staffNames}</span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  {ev.isOnline ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-tide-dark">
                      <Sparkles className="h-3.5 w-3.5 text-tide" /> Online
                    </span>
                  ) : (ev.location || ev.branch?.name) ? (
                    <div className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-sandbar-dark shrink-0" />
                      <span>{ev.location || ev.branch?.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                    <Users className="h-3.5 w-3.5 text-tide shrink-0" />
                    {capacityText}
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] uppercase font-extrabold ${financialBadgeStyle}`}>
                    {financialLabel}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className={`badge border text-[11px] ${CALENDAR_STATUS_STYLES[ev.status] || 'bg-slate-100'}`}>
                    {(ev.status || 'scheduled').replace('_', ' ')}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
