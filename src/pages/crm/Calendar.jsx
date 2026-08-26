import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CalendarPlus, Clock, GraduationCap,
  Trash2, Pencil, CheckCircle2, XCircle, CalendarDays, Filter, BookOpen, User, MapPin, SlidersHorizontal,
  CreditCard, Users, Sparkles, AlertCircle, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import CalendarEventFormModal from '../../components/crm/CalendarEventFormModal';
import CalendarWeekView from '../../components/crm/CalendarWeekView';
import CalendarDayView from '../../components/crm/CalendarDayView';
import CalendarListView from '../../components/crm/CalendarListView';
import CalendarEventDetailPanel from '../../components/crm/CalendarEventDetailPanel';
import SubjectManagementModal from '../../components/crm/SubjectManagementModal';
import calendarService from '../../services/calendarService';
import subjectService from '../../services/subjectService';
import {
  CALENDAR_STATUS_STYLES,
  CALENDAR_TYPE_STYLES,
  PROGRAM_COLOR_THEMES,
  getProgramTheme,
  FINANCIAL_STATUS_BADGE_STYLES,
} from '../../constants/crm';
import { useAuth } from '../../context/AuthContext';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toKey = (d) => {
  if (!d) return '';
  if (typeof d === 'string') {
    if (d.includes('T')) return d.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  }
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatLocalDateLabel = (d, options) => {
  if (!d) return '';
  const key = toKey(d);
  const [y, m, day] = key.split('-').map(Number);
  const localNoon = new Date(y, m - 1, day, 12, 0, 0);
  return localNoon.toLocaleDateString(undefined, options);
};

const isSameDay = (a, b) => toKey(a) === toKey(b);

const startOfWeek = (d) => {
  const start = new Date(d);
  const day = start.getDay(); // 0 is Sun, 1 is Mon...
  const diff = (day === 0 ? -6 : 1) - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const format12Hour = (timeStr) => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const m = mStr || '00';
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
};

export default function CalendarPage() {
  const { hasPermission } = useAuth();
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day' | 'list'
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const [events, setEvents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Top Filters
  const [staffFilter, setStaffFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Extended Filter Panel State
  const [subjectFilter, setSubjectFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [manageSubjectsOpen, setManageSubjectsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);

  const canCreate = hasPermission('crm:calendar:create');
  const canUpdate = hasPermission('crm:calendar:update');
  const canDelete = hasPermission('crm:calendar:delete');

  const gridDays = useMemo(() => {
    const firstOfMonth = new Date(monthAnchor);
    const dayOfWeek = firstOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as 0
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - offset);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [monthAnchor]);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAnchor);
      d.setDate(weekAnchor.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekAnchor]);

  const rangeStart = useMemo(() => {
    if (view === 'month') return gridDays[0];
    if (view === 'week') return weekDays[0];
    if (view === 'day') return selectedDay;
    // list view: 30 days before selected day
    const d = new Date(selectedDay);
    d.setDate(d.getDate() - 15);
    return d;
  }, [view, gridDays, weekDays, selectedDay]);

  const rangeEnd = useMemo(() => {
    if (view === 'month') return gridDays[gridDays.length - 1];
    if (view === 'week') return weekDays[6];
    if (view === 'day') return selectedDay;
    // list view: 60 days after selected day
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + 45);
    return d;
  }, [view, gridDays, weekDays, selectedDay]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await calendarService.getEvents({
        start: toKey(rangeStart),
        end: toKey(rangeEnd),
        ...(staffFilter ? { staff: staffFilter } : {}),
        ...(locationFilter ? { location: locationFilter } : {}),
        ...(subjectFilter ? { subject: subjectFilter } : {}),
        ...(eventTypeFilter ? { eventType: eventTypeFilter } : {}),
        ...(publishedFilter ? { publishedStatus: publishedFilter } : {}),
        ...(capacityFilter ? { capacity: capacityFilter } : {}),
      });
      setEvents(data.data);
    } catch {
      toast.error('Failed to load calendar events.');
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd, staffFilter, locationFilter, subjectFilter, eventTypeFilter, publishedFilter, capacityFilter]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    calendarService.getTeacherOptions().then(({ data }) => setTeachers(data.data)).catch(() => {});
    calendarService.getLocationOptions().then(({ data }) => setLocations(data.data)).catch(() => {});
    calendarService.getSubjectOptions().then(({ data }) => setSubjects(data.data)).catch(() => {});
  }, []);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const key = toKey(new Date(ev.date));
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')));
    return map;
  }, [events]);

  const selectedDayEvents = eventsByDay[toKey(selectedDay)] || [];
  const today = new Date();

  const openAddModal = (day, defaultTime) => {
    setEditingEvent(null);
    setSelectedDay(day ? new Date(day) : new Date());
    setFormOpen(true);
  };

  const openEditModal = (event) => {
    setDetailEvent(null);
    setEditingEvent(event);
    setFormOpen(true);
  };

  const openDetail = (event) => setDetailEvent(event);

  useEffect(() => {
    if (!detailEvent) return;
    const fresh = events.find((e) => e._id === detailEvent._id);
    if (fresh) setDetailEvent(fresh);
  }, [events]);

  const handleDelete = async () => {
    try {
      await calendarService.deleteEvent(deleteTarget._id);
      toast.success('Event removed from calendar.');
      setDeleteTarget(null);
      setDetailEvent(null);
      loadEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove this event.');
    }
  };

  const monthLabel = monthAnchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const weekLabel = `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const dayLabel = selectedDay.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const goPrev = () => {
    if (view === 'month') {
      setMonthAnchor((m) => { const d = new Date(m); d.setMonth(d.getMonth() - 1); return d; });
    } else if (view === 'week') {
      setWeekAnchor((w) => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; });
    } else {
      setSelectedDay((prev) => { const d = new Date(prev); d.setDate(d.getDate() - 1); return d; });
    }
  };

  const goNext = () => {
    if (view === 'month') {
      setMonthAnchor((m) => { const d = new Date(m); d.setMonth(d.getMonth() + 1); return d; });
    } else if (view === 'week') {
      setWeekAnchor((w) => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; });
    } else {
      setSelectedDay((prev) => { const d = new Date(prev); d.setDate(d.getDate() + 1); return d; });
    }
  };

  const goToday = () => {
    const now = new Date();
    const d = new Date(now); d.setDate(1);
    setMonthAnchor(d);
    setWeekAnchor(startOfWeek(now));
    setSelectedDay(now);
  };

  const activeFilterCount = [subjectFilter, eventTypeFilter, publishedFilter, capacityFilter].filter(Boolean).length;

  return (
    <DashboardLayout title="Calendar & Class Schedule">
      {/* Top Header & Main Control Bar (Reference Image Style) */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Staff & Location Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Filter (Default: All Staff) */}
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-tide hidden sm:inline" />
            <select
              className="input-field !w-auto !py-2 text-xs font-semibold"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value="">All staff</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
          </div>

          {/* Location Filter (Default: All Locations) */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-sandbar-dark hidden sm:inline" />
            <select
              className="input-field !w-auto !py-2 text-xs font-semibold"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Filter Panel Toggle */}
          <button
            onClick={() => setFilterPanelOpen((v) => !v)}
            className={`btn-secondary !px-3 !py-2 text-xs font-semibold flex items-center gap-1.5 ${
              activeFilterCount > 0 ? 'bg-tide/10 text-tide-dark border-tide/30' : ''
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        {/* Center: Navigation Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button className="btn-secondary !px-2.5 !py-2" onClick={goPrev} title="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button className="btn-secondary text-xs font-bold !px-3 !py-2" onClick={goToday}>
            Today
          </button>

          <h2 className="min-w-[12rem] text-center text-base font-display font-bold text-marine">
            {view === 'month' ? monthLabel : view === 'week' ? weekLabel : view === 'day' ? dayLabel : 'Event List'}
          </h2>

          <button className="btn-secondary !px-2.5 !py-2" onClick={goNext} title="Next">
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Jump to Date Picker Input */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-marine/10 bg-white px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs font-medium text-ink/50">Jump:</span>
            <input
              type="date"
              className="border-none bg-transparent text-xs font-semibold text-marine focus:ring-0 cursor-pointer p-0"
              value={toKey(selectedDay)}
              onChange={(e) => {
                if (!e.target.value) return;
                const picked = new Date(e.target.value);
                setSelectedDay(picked);
                setMonthAnchor(new Date(picked.getFullYear(), picked.getMonth(), 1));
                setWeekAnchor(startOfWeek(picked));
              }}
            />
          </div>
        </div>

        {/* Right Side: View Switcher & Add New Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Views Switcher: Month, Week, Day, List */}
          <div className="flex items-center gap-1 rounded-xl bg-marine/[0.04] p-1 border border-marine/10">
            {['month', 'week', 'day', 'list'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs capitalize transition-all ${
                  view === v ? 'bg-white text-marine shadow-xs font-bold' : 'text-ink/60 hover:text-ink font-semibold'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Manage Subjects Button */}
          {canCreate && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-marine shadow-xs transition"
              onClick={() => setManageSubjectsOpen(true)}
              title="Manage Subjects and Default Durations"
            >
              <BookOpen className="h-3.5 w-3.5 text-tide" />
              Subjects
            </button>
          )}

          {/* Action Button: Add New Event */}
          {canCreate && (
            <button className="btn-primary flex items-center gap-1.5 !py-2 !px-3 text-xs font-bold shadow-sm" onClick={() => openAddModal(selectedDay)}>
              <Plus className="h-4 w-4" />
              Add new
            </button>
          )}
        </div>
      </div>

      {/* Expanded Calendar Filter Panel */}
      {filterPanelOpen && (
        <div className="mb-4 animate-rise rounded-xl border border-marine/10 bg-marine/[0.02] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-marine/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-marine flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-tide" /> Extended Filters
            </span>
            {activeFilterCount > 0 && (
              <button
                className="text-xs font-semibold text-tide hover:text-tide-dark"
                onClick={() => {
                  setSubjectFilter('');
                  setEventTypeFilter('');
                  setPublishedFilter('');
                  setCapacityFilter('');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            <div>
              <label className="label-field !text-[11px]">Subject / Category</label>
              <select
                className="input-field !py-1.5 text-xs"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field !text-[11px]">Event Type</label>
              <select
                className="input-field !py-1.5 text-xs"
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
              >
                <option value="">All Event Types</option>
                <option value="one-time">One-Time Event</option>
                <option value="repeating">Repeating Event</option>
              </select>
            </div>

            <div>
              <label className="label-field !text-[11px]">Published Status</label>
              <select
                className="input-field !py-1.5 text-xs"
                value={publishedFilter}
                onChange={(e) => setPublishedFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="label-field !text-[11px]">Capacity</label>
              <select
                className="input-field !py-1.5 text-xs"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
              >
                <option value="">All Capacities</option>
                <option value="limited">Limited Seats</option>
                <option value="unlimited">Unlimited Seats</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Full-Width Calendar View Area */}
      <div className="w-full">
        <div className="card !p-0 overflow-hidden border border-slate-200 shadow-sm bg-white rounded-2xl">
          {loading && <Loader label="Loading academy schedule..." />}

          {/* 1. Month View (Full Width, 7 Columns, Rich Event Cards) */}
          {!loading && view === 'month' && (
            <>
              {/* Day Header Row (Mon - Sun) */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="px-3 py-3 text-center border-r border-slate-200 last:border-r-0">
                    {w}
                  </div>
                ))}
              </div>

              {/* 42 Date Grid Cells */}
              <div className="grid grid-cols-7 divide-y divide-slate-200">
                {gridDays.map((day) => {
                  const key = toKey(day);
                  const dayEvents = eventsByDay[key] || [];
                  const inMonth = day.getMonth() === monthAnchor.getMonth();
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDay);

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[10.5rem] border-r border-slate-200 p-2 text-left align-top transition-colors last:border-r-0 flex flex-col justify-between
                        ${inMonth ? 'bg-white' : 'bg-slate-50/50'}
                        ${isSelected ? 'ring-2 ring-inset ring-tide/80' : 'hover:bg-slate-50/80'}`}
                    >
                      {/* Date Top Header */}
                      <div className="flex items-center justify-between pb-1">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold
                            ${isToday ? 'bg-tide text-white shadow-xs' : inMonth ? 'text-marine' : 'text-slate-400'}`}
                        >
                          {day.getDate()}
                        </span>

                        {canCreate && inMonth && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openAddModal(day); }}
                            className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-tide hover:bg-slate-100 transition"
                            title="Add event on this date"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Event Cards inside Date Cell */}
                      <div className="space-y-1.5 flex-1 mt-1">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const theme = getProgramTheme(ev.programDetails?.calendarColor || 'blue');
                          const staffNames = Array.isArray(ev.teachers) && ev.teachers.length > 0
                            ? ev.teachers.map((t) => t.fullName).join(', ')
                            : ev.teacher?.fullName || '';

                          const regCount = ev.registrations?.length || 0;
                          const capacityLimit = ev.capacity || (ev.seatType === 'limited' ? 10 : null);
                          const seatLabel = capacityLimit ? `(${regCount}/${capacityLimit})` : `(${regCount})`;

                          const participantNames = Array.isArray(ev.registrations) && ev.registrations.length > 0
                            ? ev.registrations
                                .map((r) => r.student?.fullName || r.lead?.fullName)
                                .filter(Boolean)
                                .slice(0, 2)
                                .join(', ') + (ev.registrations.length > 2 ? ` +${ev.registrations.length - 2} more` : '')
                            : '';

                          const financialStatus = ev.financialSummary?.aggregateStatus || 'PENDING';
                          const financialBadgeStyle = FINANCIAL_STATUS_BADGE_STYLES[financialStatus] || FINANCIAL_STATUS_BADGE_STYLES.PENDING;
                          const financialLabel = ev.financialSummary?.statusLabel || financialStatus;

                          return (
                            <div
                              key={ev._id}
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); openDetail(ev); }}
                              className={`group relative rounded-xl p-2 text-left transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:scale-[1.01] ${theme.card}`}
                            >
                              {/* Row 1: Time & Seat Capacity */}
                              <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-bold">
                                <span className="truncate tracking-tight font-extrabold text-marine">
                                  {format12Hour(ev.startTime)}{ev.endTime ? ` – ${format12Hour(ev.endTime)}` : ''}
                                </span>
                                <span className="shrink-0 font-bold opacity-80 text-marine">
                                  {seatLabel}
                                </span>
                              </div>

                              {/* Row 2: Program Title */}
                              <p className="font-display text-[11.5px] font-bold leading-snug mt-1 text-marine line-clamp-2">
                                {ev.title || ev.programDetails?.title}
                              </p>

                              {/* Row 3: Program Category & Level */}
                              <p className="text-[10px] font-semibold text-slate-700 opacity-90 leading-tight mt-0.5 truncate">
                                {ev.programDetails?.category || ev.subject || 'Class'}
                                {ev.programDetails?.level ? ` • ${ev.programDetails.level}` : ''}
                              </p>

                              {/* Row 4: Coach & Location */}
                              <div className="mt-1 space-y-0.5 text-[10px] text-slate-700">
                                {staffNames && (
                                  <div className="flex items-center gap-1 font-semibold truncate">
                                    <User className="h-3 w-3 text-tide shrink-0" />
                                    <span className="truncate">{staffNames}</span>
                                  </div>
                                )}
                                {(ev.location || ev.branch?.name) && (
                                  <div className="flex items-center gap-1 font-medium opacity-85 truncate">
                                    <MapPin className="h-3 w-3 text-sandbar-dark shrink-0" />
                                    <span className="truncate">{ev.location || ev.branch?.name}</span>
                                  </div>
                                )}
                              </div>

                              {/* Row 5: Automated Invoice Badge & Participant Preview */}
                              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 border-t border-slate-900/10 pt-1">
                                <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] uppercase tracking-wide font-extrabold ${financialBadgeStyle}`}>
                                  {financialLabel}
                                </span>

                                {participantNames && (
                                  <span className="text-[9.5px] font-medium text-slate-600 truncate max-w-[110px]" title={participantNames}>
                                    {participantNames}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Overflow "+N more" Button */}
                        {dayEvents.length > 3 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDay(day);
                              setView('day');
                            }}
                            className="w-full text-center py-1 rounded-lg bg-marine/[0.04] hover:bg-marine/[0.08] text-[11px] font-bold text-tide transition-colors"
                          >
                            +{dayEvents.length - 3} more events
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* 2. Week View */}
          {!loading && view === 'week' && (
            <CalendarWeekView
              weekDays={weekDays}
              eventsByDay={eventsByDay}
              onEventClick={openDetail}
              onSlotClick={(day) => canCreate && openAddModal(day)}
            />
          )}

          {/* 3. Day View */}
          {!loading && view === 'day' && (
            <CalendarDayView
              selectedDate={selectedDay}
              events={selectedDayEvents}
              staffFilter={staffFilter}
              teachers={teachers}
              onEventClick={openDetail}
              onSlotClick={(day, slot) => canCreate && openAddModal(day, slot)}
            />
          )}

          {/* 4. List View */}
          {!loading && view === 'list' && (
            <CalendarListView
              events={events}
              onEventClick={openDetail}
            />
          )}
        </div>
      </div>

      {/* Right-Side Slide Drawer for Add/Edit Event */}
      <CalendarEventFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); loadEvents(); }}
        defaultDate={toKey(selectedDay)}
        editingEvent={editingEvent}
        teachers={teachers}
        locations={locations}
        subjects={subjects}
      />

      {/* Right-Side Slide Drawer for Event Detail & Student Registration */}
      {detailEvent && (
        <CalendarEventDetailPanel
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onChanged={loadEvents}
          onEdit={openEditModal}
          onDelete={(ev) => { setDetailEvent(null); setDeleteTarget(ev); }}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Remove this calendar entry?"
        message={`This will remove "${deleteTarget?.title}" from the calendar. This cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Subject & Duration Management Modal */}
      <SubjectManagementModal
        open={manageSubjectsOpen}
        onClose={() => setManageSubjectsOpen(false)}
        onSubjectsChanged={() => {
          calendarService.getSubjectOptions().then(({ data }) => setSubjects(data.data || [])).catch(() => {});
        }}
      />
    </DashboardLayout>
  );
}
