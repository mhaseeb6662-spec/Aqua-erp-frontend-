import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CalendarPlus, Clock, GraduationCap,
  Trash2, Pencil, CheckCircle2, XCircle, CalendarDays, Filter, BookOpen, User, MapPin, SlidersHorizontal,
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
import calendarService from '../../services/calendarService';
import { CALENDAR_STATUS_STYLES, CALENDAR_TYPE_STYLES } from '../../constants/crm';
import { useAuth } from '../../context/AuthContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
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
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);

  const canCreate = hasPermission('crm:calendar:create');
  const canUpdate = hasPermission('crm:calendar:update');
  const canDelete = hasPermission('crm:calendar:delete');

  const gridDays = useMemo(() => {
    const firstOfMonth = new Date(monthAnchor);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(1 - firstOfMonth.getDay());

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
    Object.values(map).forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
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

  const handleStatusToggle = async (event) => {
    const next = event.status === 'completed' ? 'scheduled' : 'completed';
    try {
      await calendarService.updateStatus(event._id, next);
      loadEvents();
    } catch {
      toast.error('Failed to update status.');
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
      {/* Top Header & Main Control Bar */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Date Navigation & Views */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-secondary !px-2.5 !py-2" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="min-w-[11rem] text-center text-lg font-bold text-marine">
            {view === 'month' ? monthLabel : view === 'week' ? weekLabel : view === 'day' ? dayLabel : 'Event List'}
          </h2>
          <button className="btn-secondary !px-2.5 !py-2" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Today Button */}
          <button className="btn-secondary text-xs font-semibold" onClick={goToday}>
            Today
          </button>

          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 rounded-xl border border-marine/10 bg-white px-2.5 py-1.5 shadow-xs">
            <span className="text-xs font-medium text-ink/50">Jump to:</span>
            <input
              type="date"
              className="border-none bg-transparent text-xs font-semibold text-marine focus:ring-0 cursor-pointer"
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

          {/* Views Switcher: Month, Week, Day, List */}
          <div className="flex items-center gap-1 rounded-xl bg-marine/[0.04] p-1 border border-marine/10">
            {['month', 'week', 'day', 'list'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  view === v ? 'bg-white text-marine shadow-xs font-bold' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {v} View
              </button>
            ))}
          </div>
        </div>

        {/* Top Filters & Action Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Staff Filter (Default: All Staff) */}
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-tide hidden sm:inline" />
            <select
              className="input-field !w-auto !py-2 text-xs font-medium"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value="">All Staff</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName}</option>
              ))}
            </select>
          </div>

          {/* Location Filter (Default: All Locations) */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-sandbar-dark hidden sm:inline" />
            <select
              className="input-field !w-auto !py-2 text-xs font-medium"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
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

          {/* Action Button: Add New Event */}
          {canCreate && (
            <button className="btn-primary flex items-center gap-2" onClick={() => openAddModal(selectedDay)}>
              <CalendarPlus className="h-4 w-4" />
              Add New Event
            </button>
          )}
        </div>
      </div>

      {/* Expanded Calendar Filter Panel */}
      {filterPanelOpen && (
        <div className="mb-4 animate-rise rounded-xl border border-marine/10 bg-marine/[0.02] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-marine/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-marine flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-tide" /> Calendar Filter Panel
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {/* Subject Filter */}
            <div>
              <label className="label-field !text-[11px]">Subject</label>
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

            {/* Event Type Filter */}
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

            {/* Published Status Filter */}
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

            {/* Capacity Filter */}
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

      {/* Main Calendar View Area */}
      <div className={`grid gap-6 ${view === 'month' ? 'lg:grid-cols-[1fr_20rem]' : 'lg:grid-cols-1'}`}>
        <div className="card !p-0 overflow-hidden border border-marine/10 shadow-xs">
          {loading && <Loader label="Loading calendar..." />}

          {/* 1. Month View */}
          {!loading && view === 'month' && (
            <>
              <div className="grid grid-cols-7 border-b border-marine/[0.08] bg-marine/[0.02] text-xs font-bold uppercase tracking-wider text-ink/50">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="px-3 py-2.5 text-center">{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {gridDays.map((day) => {
                  const key = toKey(day);
                  const dayEvents = eventsByDay[key] || [];
                  const inMonth = day.getMonth() === monthAnchor.getMonth();
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDay);

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[6rem] border-b border-r border-marine/[0.05] p-2 text-left align-top transition-colors last:border-r-0
                        ${inMonth ? 'bg-white' : 'bg-marine/[0.015]'}
                        ${isSelected ? 'ring-2 ring-inset ring-tide' : 'hover:bg-marine/[0.02]'}`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                          ${isToday ? 'bg-tide text-white' : inMonth ? 'text-marine' : 'text-ink/30'}`}
                      >
                        {day.getDate()}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev._id}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); openDetail(ev); }}
                            className={`truncate rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${CALENDAR_TYPE_STYLES[ev.type] || 'bg-marine/10'}`}
                            title={`${ev.startTime} ${ev.title}`}
                          >
                            {ev.startTime} {ev.subject ? `[${ev.subject}] ` : ''}{ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="px-1 text-[10px] font-bold text-tide-dark">+{dayEvents.length - 3} more</p>
                        )}
                      </div>
                    </button>
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

        {/* Selected Day Side Panel (Month View only) */}
        {view === 'month' && (
          <div className="card flex flex-col gap-4 border border-marine/10">
            <div className="flex items-center justify-between border-b border-marine/10 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-tide" />
                <h3 className="font-bold text-marine text-sm">
                  {selectedDay.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
              </div>
              {canCreate && (
                <button className="text-xs font-bold text-tide hover:text-tide-dark" onClick={() => openAddModal(selectedDay)}>
                  + Add Event
                </button>
              )}
            </div>

            {selectedDayEvents.length === 0 ? (
              <p className="py-8 text-center text-xs text-ink/40">No events or classes scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((ev) => {
                  const staffNames = Array.isArray(ev.teachers) && ev.teachers.length > 0
                    ? ev.teachers.map((t) => t.fullName).join(', ')
                    : ev.teacher?.fullName || '';

                  return (
                    <div key={ev._id} className="rounded-xl border border-marine/10 p-3.5 bg-white shadow-2xs hover:border-tide/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <button className="text-left" onClick={() => openDetail(ev)}>
                          {ev.subject && (
                            <span className="badge mb-1 inline-flex items-center gap-1 border bg-tide/10 text-tide-dark text-[10px] font-bold">
                              <BookOpen className="h-3 w-3" />
                              {ev.subject}
                            </span>
                          )}
                          <p className="text-sm font-bold text-marine hover:underline leading-snug">{ev.title}</p>
                        </button>
                        <span className={`badge shrink-0 text-[10px] ${CALENDAR_STATUS_STYLES[ev.status]}`}>
                          {ev.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-ink/60">
                        <span className="flex items-center gap-1 font-semibold text-marine">
                          <Clock className="h-3.5 w-3.5 text-tide shrink-0" />
                          {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                        </span>
                        {staffNames && (
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <GraduationCap className="h-3.5 w-3.5 text-tide shrink-0" />
                            {staffNames}
                          </span>
                        )}
                      </div>

                      {ev.classDescription && (
                        <p className="mt-2 text-xs text-ink/50 line-clamp-2">{ev.classDescription}</p>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t border-marine/5 pt-2">
                        <span className="text-[11px] font-medium text-ink/40">
                          {ev.seatType === 'limited' ? `${ev.registrations?.length || 0}/${ev.capacity} Seats` : 'Unlimited'}
                        </span>
                        <div className="flex items-center gap-1">
                          {canUpdate && (
                            <>
                              <button
                                className="rounded-lg p-1.5 text-ink/40 hover:bg-marine/5 hover:text-marine"
                                title={ev.status === 'completed' ? 'Mark as scheduled' : 'Mark as completed'}
                                onClick={() => handleStatusToggle(ev)}
                              >
                                {ev.status === 'completed' ? <XCircle className="h-4 w-4 text-coral" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                              </button>
                              <button
                                className="rounded-lg p-1.5 text-ink/40 hover:bg-marine/5 hover:text-marine"
                                title="Edit"
                                onClick={() => openEditModal(ev)}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {canDelete && (
                            <button
                              className="rounded-lg p-1.5 text-ink/40 hover:bg-coral/10 hover:text-coral"
                              title="Remove"
                              onClick={() => setDeleteTarget(ev)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
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
    </DashboardLayout>
  );
}
