import { Clock, MapPin, User, BookOpen, Users, Sparkles } from 'lucide-react';
import { CALENDAR_STATUS_STYLES, CALENDAR_TYPE_STYLES } from '../../constants/crm';

export default function CalendarListView({ events = [], onEventClick }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white">
        <BookOpen className="h-10 w-10 text-ink/20 mb-3" />
        <p className="text-base font-semibold text-marine">No classes or events scheduled</p>
        <p className="text-sm text-ink/50 mt-1 max-w-sm">
          No matching calendar entries found for the selected filters or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-marine/[0.08] bg-marine/[0.02] text-xs font-semibold uppercase tracking-wider text-ink/50">
          <tr>
            <th className="px-5 py-3.5">Date & Time</th>
            <th className="px-5 py-3.5">Event / Class Title</th>
            <th className="px-5 py-3.5">Subject</th>
            <th className="px-5 py-3.5">Staff</th>
            <th className="px-5 py-3.5">Location</th>
            <th className="px-5 py-3.5">Seats / Capacity</th>
            <th className="px-5 py-3.5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-marine/[0.06]">
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
              ? `${ev.registrations?.length || 0} / ${ev.capacity || '∞'} Seats`
              : 'Unlimited';

            return (
              <tr
                key={ev._id}
                onClick={() => onEventClick && onEventClick(ev)}
                className="cursor-pointer transition-colors hover:bg-marine/[0.02]"
              >
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="font-semibold text-marine">{dateStr}</div>
                  <div className="flex items-center gap-1 text-xs text-ink/50 mt-0.5">
                    <Clock className="h-3 w-3 text-tide shrink-0" />
                    {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`badge inline-block border text-[10px] ${CALENDAR_TYPE_STYLES[ev.type] || 'bg-marine/10'}`}>
                      {ev.eventType === 'repeating' ? 'Repeating' : 'One-Time'}
                    </span>
                    <span className="font-semibold text-marine hover:underline">{ev.title}</span>
                  </div>
                  {ev.classDescription && (
                    <p className="text-xs text-ink/50 mt-0.5 line-clamp-1">{ev.classDescription}</p>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  {ev.subject ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-tide/10 px-2.5 py-1 text-xs font-semibold text-tide-dark border border-tide/20">
                      <BookOpen className="h-3.5 w-3.5" />
                      {ev.subject}
                    </span>
                  ) : (
                    <span className="text-xs text-ink/40">—</span>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-ink/70">
                    <User className="h-3.5 w-3.5 text-tide shrink-0" />
                    <span className="font-medium">{staffNames}</span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  {ev.isOnline ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-tide-dark">
                      <Sparkles className="h-3.5 w-3.5 text-tide" /> Online
                    </span>
                  ) : ev.location ? (
                    <div className="flex items-center gap-1 text-xs text-ink/70">
                      <MapPin className="h-3.5 w-3.5 text-sandbar-dark shrink-0" />
                      <span>{ev.location}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-ink/40">—</span>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-ink/60">
                    <Users className="h-3.5 w-3.5 text-tide shrink-0" />
                    {capacityText}
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className={`badge border text-[11px] ${CALENDAR_STATUS_STYLES[ev.status] || 'bg-marine/10'}`}>
                    {ev.status.replace('_', ' ')}
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
