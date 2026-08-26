import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Clock, MapPin, GraduationCap, Search, Trash2, Pencil,
  CheckCircle2, XCircle, MoreVertical, UserPlus, BookOpen, Sparkles, Users, CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendarService';
import leadService from '../../services/leadService';
import customerService from '../../services/customerService';
import StudentFormModal from './StudentFormModal';
import {
  CALENDAR_STATUS_STYLES,
  CALENDAR_REGISTRATION_KINDS,
  CALENDAR_ATTENDANCE_STYLES,
  REGISTRATION_PAYMENT_STATUSES,
  REGISTRATION_PAYMENT_STYLES,
  getProgramTheme,
  FINANCIAL_STATUS_BADGE_STYLES,
} from '../../constants/crm';

export default function CalendarEventDetailPanel({
  event,
  onClose,
  onChanged,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}) {
  const [activeTab, setActiveTab] = useState('enrolled');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [quickStudentModalOpen, setQuickStudentModalOpen] = useState(false);

  useEffect(() => {
    setActiveTab('enrolled');
    setQuery('');
    setResults([]);
    setActionsOpen(false);
  }, [event?._id]);

  const registrations = event?.registrations || [];

  const grouped = useMemo(() => {
    const byKind = { enrolled: [], trial: [], waitlist: [] };
    registrations.forEach((r) => {
      if (byKind[r.kind]) byKind[r.kind].push(r);
    });
    return byKind;
  }, [registrations]);

  if (!event) return null;

  const person = (reg) => reg.student || reg.lead;

  const staffNames = Array.isArray(event.teachers) && event.teachers.length > 0
    ? event.teachers.map((t) => t.fullName).join(', ')
    : event.teacher?.fullName || 'Unassigned';

  const runSearch = async (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const isLeadBucket = activeTab === 'trial' || activeTab === 'waitlist';
      const { data } = isLeadBucket
        ? await leadService.getLeads({ search: q, limit: 8 })
        : await customerService.getCustomers({ search: q, limit: 8 });
      setResults(data.data);
    } catch {
      // silent
    } finally {
      setSearching(false);
    }
  };

  const handleAddPerson = async (person_) => {
    const isLeadBucket = activeTab === 'trial' || activeTab === 'waitlist';
    try {
      await calendarService.addRegistration(event._id, {
        kind: activeTab,
        studentId: isLeadBucket ? undefined : person_._id,
        leadId: isLeadBucket ? person_._id : undefined,
      });
      toast.success(`${person_.fullName} registered.`);
      setQuery('');
      setResults([]);
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register student.');
    }
  };

  const handleRemove = async (regId) => {
    setBusyId(regId);
    try {
      await calendarService.removeRegistration(event._id, regId);
      toast.success('Registration removed.');
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAttendance = async (regId, attendance) => {
    setBusyId(regId);
    try {
      await calendarService.updateAttendance(event._id, regId, attendance);
      onChanged();
    } catch (err) {
      toast.error('Failed to update attendance.');
    } finally {
      setBusyId(null);
    }
  };

  const handlePaymentStatusChange = async (regId, paymentStatus) => {
    setBusyId(regId);
    try {
      await calendarService.updatePaymentStatus(event._id, regId, paymentStatus);
      toast.success(`Payment status updated to ${paymentStatus}`);
      onChanged();
    } catch (err) {
      toast.error('Failed to update payment status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleQuickStudentSaved = async (newStudent) => {
    setQuickStudentModalOpen(false);
    if (!newStudent) return;
    try {
      await calendarService.addRegistration(event._id, {
        kind: activeTab,
        studentId: newStudent._id,
      });
      toast.success(`Quick student "${newStudent.fullName}" created & registered!`);
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Quick student created, but failed to attach to event.');
    }
  };

  const key = typeof event.date === 'string' && event.date.includes('T') ? event.date.split('T')[0] : (typeof event.date === 'string' ? event.date : '');
  const [y, m, day] = key ? key.split('-').map(Number) : [new Date(event.date).getFullYear(), new Date(event.date).getMonth() + 1, new Date(event.date).getDate()];
  const localNoon = new Date(y, m - 1, day, 12, 0, 0);
  const dateLabel = localNoon.toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const capacityLabel = event.seatType === 'limited'
    ? `${registrations.length} / ${event.capacity || '∞'} Seats`
    : 'Unlimited Seats';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-marine-dark/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-xl animate-rise flex-col overflow-hidden bg-white shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-marine px-6 py-4 text-white border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-white">{dateLabel}</p>
              <p className="text-xs text-white/90">
                {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {(canUpdate || canDelete) && (
                <div className="relative">
                  <button
                    className="rounded-lg p-1.5 text-white/90 hover:bg-white/15 hover:text-white"
                    onClick={() => setActionsOpen((v) => !v)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {actionsOpen && (
                    <div className="absolute right-0 top-9 z-10 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm text-slate-800 shadow-pop">
                      {canUpdate && (
                        <button
                          className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                          onClick={() => { setActionsOpen(false); onEdit(event); }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-tide" /> Edit Event Details
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                          onClick={async () => {
                            setActionsOpen(false);
                            const next = event.status === 'completed' ? 'scheduled' : 'completed';
                            try {
                              await calendarService.updateStatus(event._id, next);
                              onChanged();
                            } catch {
                              toast.error('Failed to update status.');
                            }
                          }}
                        >
                          {event.status === 'completed'
                            ? <XCircle className="h-3.5 w-3.5 text-coral" />
                            : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                          {event.status === 'completed' ? 'Mark as Scheduled' : 'Mark as Completed'}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-coral hover:bg-coral/10 font-medium"
                          onClick={() => { setActionsOpen(false); onDelete(event); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove Event
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              <button className="rounded-lg p-1.5 text-white/90 hover:bg-white/15 hover:text-white" onClick={onClose}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Summary Section */}
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${getProgramTheme(event.programDetails?.calendarColor || 'blue').pill}`}>
                    <BookOpen className="h-3 w-3" />
                    {event.programDetails?.category || event.subject || 'Class'}
                    {event.programDetails?.level ? ` • ${event.programDetails.level}` : ''}
                  </span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] uppercase font-extrabold ${FINANCIAL_STATUS_BADGE_STYLES[event.financialSummary?.aggregateStatus] || FINANCIAL_STATUS_BADGE_STYLES.PENDING}`}>
                    {event.financialSummary?.statusLabel || event.financialSummary?.aggregateStatus || 'PENDING'}
                  </span>
                  <span className={`badge border text-[10px] ${CALENDAR_STATUS_STYLES[event.status]}`}>
                    {(event.status || 'scheduled').replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-marine">{event.title || event.programDetails?.title}</h2>
              </div>
            </div>

            {/* Financial Overview Card */}
            {event.financialSummary && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-marine mb-2">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-tide" />
                    Automated Invoicing & Revenue
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {event.financialSummary.paidCount}/{event.financialSummary.totalRegistrations} Paid
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Collected</p>
                    <p className="font-extrabold text-emerald-700 font-mono">${event.financialSummary.totalCollected?.toLocaleString() || 0}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Outstanding</p>
                    <p className="font-extrabold text-rose-700 font-mono">${event.financialSummary.totalOutstanding?.toLocaleString() || 0}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Status</p>
                    <p className="font-extrabold text-marine uppercase text-[11px]">{event.financialSummary.aggregateStatus}</p>
                  </div>
                </div>
              </div>
            )}

            {event.classDescription && (
              <p className="mt-3 text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {event.classDescription}
              </p>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4 text-tide shrink-0" />
                <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <GraduationCap className="h-4 w-4 text-tide shrink-0" />
                <span className="truncate">{staffNames}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                {event.isOnline ? (
                  <>
                    <Sparkles className="h-4 w-4 text-tide shrink-0" />
                    <span className="font-bold text-tide-dark">Online Class</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-amber-700 shrink-0" />
                    <span className="truncate">{event.location || event.branch?.name || 'Branch location'}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Users className="h-4 w-4 text-tide shrink-0" />
                <span>{capacityLabel}</span>
              </div>
            </div>

            {(event.internalNotes || event.notes) && (
              <div className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200">
                <span className="font-bold">Internal Notes: </span>
                {event.internalNotes || event.notes}
              </div>
            )}
          </div>

          {/* Student Registration Section */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-marine flex items-center gap-1.5">
                <Users className="h-4 w-4 text-tide" /> Registered Students
              </h3>
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => setQuickStudentModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg border border-tide/30 bg-tide/10 px-2.5 py-1 text-xs font-bold text-tide-dark hover:bg-tide/20"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Add Quick Student
                </button>
              )}
            </div>

            {/* Roster Tabs */}
            <div className="mb-4 flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
              {CALENDAR_REGISTRATION_KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => { setActiveTab(k.key); setQuery(''); setResults([]); }}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === k.key ? 'bg-white text-marine shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {k.label} ({grouped[k.key]?.length || 0})
                </button>
              ))}
            </div>

            {/* Searchable Student Dropdown */}
            {canUpdate && (
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input-field pl-9"
                  placeholder={
                    activeTab === 'enrolled'
                      ? 'Search existing student by name to register...'
                      : 'Search lead by name...'
                  }
                  value={query}
                  onChange={(e) => runSearch(e.target.value)}
                />
                {query.trim() && (
                  <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-pop">
                    {searching ? (
                      <p className="px-4 py-3 text-xs text-slate-500 font-medium">Searching...</p>
                    ) : results.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-slate-500 font-medium">No matching student found.</p>
                    ) : (
                      results.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-2.5 text-left hover:bg-slate-50 last:border-b-0"
                          onClick={() => handleAddPerson(p)}
                        >
                          <div>
                            <span className="block text-xs font-bold text-marine">{p.fullName}</span>
                            <span className="block text-[11px] text-slate-500">{p.phone}</span>
                          </div>
                          <span className="flex items-center gap-1 rounded-md bg-tide/10 px-2 py-1 text-[10px] font-bold text-tide-dark">
                            <UserPlus className="h-3 w-3" /> Enroll
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Registered Students List */}
            {grouped[activeTab]?.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center bg-slate-50/50">
                <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No students registered under {activeTab} yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {grouped[activeTab].map((reg) => {
                  const p = person(reg);
                  const detailLink = reg.student ? `/customers/${reg.student._id}` : `/leads/${reg.lead?._id}`;
                  const currentPaymentStatus = reg.paymentStatus || 'No Invoice';

                  return (
                    <div
                      key={reg._id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs hover:border-slate-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Student Name & Avatar */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tide/10 font-bold text-tide-dark text-xs">
                            {p?.fullName ? p.fullName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="min-w-0">
                            {p ? (
                              <Link to={detailLink} className="truncate text-xs font-bold text-marine hover:underline">
                                {p.fullName}
                              </Link>
                            ) : (
                              <span className="text-xs font-medium text-slate-500">Unknown</span>
                            )}
                            <p className="truncate text-[11px] text-slate-500">{p?.phone || p?.email}</p>
                          </div>
                        </div>

                        {/* Remove Button */}
                        {canUpdate && (
                          <button
                            disabled={busyId === reg._id}
                            onClick={() => handleRemove(reg._id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Remove Student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Controls Bar: Payment Status & Attendance */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs">
                        {/* Payment Status Dropdown */}
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <select
                            disabled={!canUpdate || busyId === reg._id}
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${REGISTRATION_PAYMENT_STYLES[currentPaymentStatus] || 'bg-slate-100 text-slate-800'}`}
                            value={currentPaymentStatus}
                            onChange={(e) => handlePaymentStatusChange(reg._id, e.target.value)}
                          >
                            {REGISTRATION_PAYMENT_STATUSES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>

                        {/* Attendance Toggle Buttons */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-bold mr-1">Attendance:</span>
                          <button
                            disabled={!canUpdate || busyId === reg._id}
                            onClick={() => handleAttendance(reg._id, 'present')}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                              reg.attendance === 'present'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-800'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            disabled={!canUpdate || busyId === reg._id}
                            onClick={() => handleAttendance(reg._id, 'absent')}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                              reg.attendance === 'absent'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-rose-50 hover:text-rose-800'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <StudentFormModal
        open={quickStudentModalOpen}
        onClose={() => setQuickStudentModalOpen(false)}
        onSaved={handleQuickStudentSaved}
      />
    </div>
  );
}
