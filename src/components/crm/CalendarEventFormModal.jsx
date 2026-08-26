import { useEffect, useState } from 'react';
import { X, CalendarPlus, Search, UserPlus, Check, Sparkles, MapPin, Users, BookOpen, Layers, Clock, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendarService';
import leadService from '../../services/leadService';
import customerService from '../../services/customerService';
import portalService from '../../services/portalService';
import subjectService from '../../services/subjectService';
import StudentFormModal from './StudentFormModal';
import SubjectManagementModal from './SubjectManagementModal';
import { CALENDAR_SUBJECT_OPTIONS } from '../../constants/crm';

function addMinutesToTime(timeStr, minutes) {
  if (!timeStr || !timeStr.includes(':')) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = (h * 60 + m + Number(minutes)) % (24 * 60);
  const newH = Math.floor(totalMins / 60);
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function calculateMinutesDiff(startTime, endTime) {
  if (!startTime || !endTime || !startTime.includes(':') || !endTime.includes(':')) return 60;
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60; // overnight
  return diff > 0 ? diff : 60;
}

const emptyForm = {
  type: 'class',
  eventType: 'one-time',
  program: '',
  branch: '',
  subject: '',
  durationMinutes: 60,
  title: '',
  classDescription: '',
  internalNotes: '',
  date: '',
  startTime: '',
  endTime: '',
  teachers: [],
  isOnline: false,
  location: '',
  seatType: 'limited',
  capacity: '10',
  publishedStatus: 'published',
};

export default function CalendarEventFormModal({
  open,
  onClose,
  onSaved,
  defaultDate,
  editingEvent,
  teachers = [],
  locations = [],
  subjects = [],
}) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [programsList, setProgramsList] = useState([]);
  const [branchesList, setBranchesList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [manageSubjectsOpen, setManageSubjectsOpen] = useState(false);

  const [leadQuery, setLeadQuery] = useState('');
  const [leadResults, setLeadResults] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadSearching, setLeadSearching] = useState(false);

  const [studentQuery, setStudentQuery] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearching, setStudentSearching] = useState(false);

  const [addStudentOpen, setAddStudentOpen] = useState(false);

  const fetchSubjects = async () => {
    try {
      const { data } = await subjectService.getSubjects();
      setSubjectList(data.data || []);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    portalService.getPrograms().then(({ data }) => setProgramsList(data.data || [])).catch(() => {});
    portalService.getBranches().then(({ data }) => setBranchesList(data.data || [])).catch(() => {});
    fetchSubjects();
  }, []);

  // Compute all available subject names
  const dynamicSubjectNames = subjectList.map(s => s.name);
  const allSubjectOptions = Array.from(new Set([...dynamicSubjectNames, ...CALENDAR_SUBJECT_OPTIONS, ...subjects]))
    .filter(Boolean)
    .sort();

  useEffect(() => {
    if (!open) return;
    fetchSubjects();

    if (editingEvent) {
      const assignedTeacherIds = Array.isArray(editingEvent.teachers) && editingEvent.teachers.length > 0
        ? editingEvent.teachers.map((t) => (t._id ? t._id : t))
        : editingEvent.teacher
        ? [editingEvent.teacher._id ? editingEvent.teacher._id : editingEvent.teacher]
        : [];

      let calcDur = editingEvent.durationMinutes;
      if (!calcDur && editingEvent.startTime && editingEvent.endTime) {
        calcDur = calculateMinutesDiff(editingEvent.startTime, editingEvent.endTime);
      }

      setForm({
        type: editingEvent.type || 'class',
        eventType: editingEvent.eventType || 'one-time',
        program: editingEvent.program?._id || editingEvent.program || '',
        branch: editingEvent.branch?._id || editingEvent.branch || '',
        subject: editingEvent.subject || '',
        durationMinutes: calcDur || 60,
        title: editingEvent.title || '',
        classDescription: editingEvent.classDescription || '',
        internalNotes: editingEvent.internalNotes || editingEvent.notes || '',
        date: editingEvent.date?.slice(0, 10) || '',
        startTime: editingEvent.startTime || '',
        endTime: editingEvent.endTime || '',
        teachers: assignedTeacherIds,
        isOnline: Boolean(editingEvent.isOnline),
        location: editingEvent.location || '',
        seatType: editingEvent.seatType || 'limited',
        capacity: editingEvent.capacity || '10',
        publishedStatus: editingEvent.publishedStatus || 'published',
      });
      setSelectedLead(editingEvent.lead || null);
      setSelectedStudent(editingEvent.student || null);
    } else {
      setForm({ ...emptyForm, date: defaultDate || '' });
      setSelectedLead(null);
      setSelectedStudent(null);
    }
    setLeadQuery('');
    setLeadResults([]);
    setStudentQuery('');
    setStudentResults([]);
    setError('');
  }, [editingEvent, open, defaultDate]);

  if (!open) return null;

  // Handle Subject selection and auto-populate default duration
  const handleSubjectChange = (newSubject) => {
    const matchedSubject = subjectList.find(
      (s) => s.name.toLowerCase() === newSubject.toLowerCase()
    );
    const defDuration = matchedSubject?.defaultDuration || form.durationMinutes || 60;

    let newEndTime = form.endTime;
    if (form.startTime) {
      newEndTime = addMinutesToTime(form.startTime, defDuration);
    }

    setForm((prev) => ({
      ...prev,
      subject: newSubject,
      durationMinutes: defDuration,
      endTime: newEndTime,
    }));
  };

  // Handle Start Time Change
  const handleStartTimeChange = (newStartTime) => {
    let newEndTime = form.endTime;
    if (newStartTime && form.durationMinutes) {
      newEndTime = addMinutesToTime(newStartTime, form.durationMinutes);
    }
    setForm((prev) => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime,
    }));
  };

  // Handle Duration Change
  const handleDurationChange = (newDuration) => {
    const durNum = Number(newDuration);
    let newEndTime = form.endTime;
    if (form.startTime && durNum > 0) {
      newEndTime = addMinutesToTime(form.startTime, durNum);
    }
    setForm((prev) => ({
      ...prev,
      durationMinutes: durNum,
      endTime: newEndTime,
    }));
  };

  // Handle End Time Change
  const handleEndTimeChange = (newEndTime) => {
    let newDuration = form.durationMinutes;
    if (form.startTime && newEndTime) {
      newDuration = calculateMinutesDiff(form.startTime, newEndTime);
    }
    setForm((prev) => ({
      ...prev,
      endTime: newEndTime,
      durationMinutes: newDuration,
    }));
  };

  const toggleStaffSelection = (staffId) => {
    setForm((f) => {
      const exists = f.teachers.includes(staffId);
      const updated = exists ? f.teachers.filter((id) => id !== staffId) : [...f.teachers, staffId];
      return { ...f, teachers: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.date) return setError('Please select an event date.');
    if (!form.startTime) return setError('Please select an event start time.');
    if (form.seatType === 'limited' && (!form.capacity || Number(form.capacity) <= 0)) {
      return setError('Please specify a valid numeric seat capacity for limited seat events.');
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        subject: form.subject || '',
        durationMinutes: Number(form.durationMinutes) || 60,
        endTime: form.endTime || (form.startTime ? addMinutesToTime(form.startTime, form.durationMinutes || 60) : ''),
        lead: form.type === 'demo' ? selectedLead?._id : undefined,
        student: form.type === 'class' ? selectedStudent?._id : undefined,
        teacher: form.teachers[0] || null,
        teachers: form.teachers,
        location: form.isOnline ? '' : form.location || '',
        capacity: form.seatType === 'limited' ? Number(form.capacity) : null,
      };

      if (editingEvent) {
        await calendarService.updateEvent(editingEvent._id, payload);
        toast.success('Event updated successfully.');
      } else {
        await calendarService.createEvent(payload);
        toast.success('Event added to calendar successfully.');
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-marine-dark/40 backdrop-blur-sm" onClick={onClose}>
        <div
          className="flex h-full w-full max-w-xl animate-rise flex-col overflow-hidden bg-white shadow-pop"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-marine/10 bg-marine px-6 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                <CalendarPlus className="h-5 w-5 text-tide-light" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingEvent ? 'Edit Calendar Event' : 'Add New Event'}
                </h3>
                <p className="text-xs text-white/90">Fill in event details to schedule on calendar</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/90 hover:bg-white/15 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
            {error && (
              <div className="rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 text-xs font-bold text-coral">
                {error}
              </div>
            )}

            {/* Section 1: Event Information */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tide-dark">
                <BookOpen className="h-4 w-4" /> 1. Program &amp; Event Type
              </h4>

              {/* Select Academy Program */}
              {programsList.length > 0 && (
                <div>
                  <label className="label-field">Link Academy Program (Optional)</label>
                  <select
                    className="input-field font-semibold text-marine"
                    value={form.program}
                    onChange={(e) => {
                      const progId = e.target.value;
                      const picked = programsList.find((p) => String(p._id) === String(progId));
                      if (picked) {
                        setForm((prev) => ({
                          ...prev,
                          program: picked._id,
                          title: prev.title && prev.title !== 'New Class' ? prev.title : picked.title,
                          subject: picked.category || picked.title,
                          capacity: String(picked.maxCapacity || 10),
                          seatType: 'limited',
                          classDescription: prev.classDescription || picked.description || '',
                        }));
                      } else {
                        setForm((prev) => ({ ...prev, program: '' }));
                      }
                    }}
                  >
                    <option value="">Custom / No Program Linked</option>
                    {programsList.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title} — {p.category} ({p.level || 'All Levels'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Subject / Category Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-field !mb-0">Subject / Category</label>
                    <button
                      type="button"
                      onClick={() => setManageSubjectsOpen(true)}
                      className="text-[11px] font-bold text-tide hover:text-tide-dark flex items-center gap-1"
                    >
                      <Settings2 className="h-3 w-3" /> Manage
                    </button>
                  </div>
                  <select
                    className="input-field font-semibold"
                    value={form.subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                  >
                    <option value="">Select Subject...</option>
                    {allSubjectOptions.map((subj) => {
                      const matched = subjectList.find(s => s.name === subj);
                      const durLabel = matched ? ` (${matched.defaultDuration}m)` : '';
                      return (
                        <option key={subj} value={subj}>
                          {subj}{durLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Event Type */}
                <div>
                  <label className="label-field">Event Type</label>
                  <div className="flex rounded-lg bg-slate-200/70 p-1 border border-slate-300">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, eventType: 'one-time' })}
                      className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all ${
                        form.eventType === 'one-time'
                          ? 'bg-white text-marine shadow-xs'
                          : 'text-slate-700 hover:text-marine'
                      }`}
                    >
                      One-Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, eventType: 'repeating' })}
                      className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all ${
                        form.eventType === 'repeating'
                          ? 'bg-white text-marine shadow-xs'
                          : 'text-slate-700 hover:text-marine'
                      }`}
                    >
                      Repeating
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Event Details */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tide-dark">
                2. Event Details
              </h4>

              <div>
                <label className="label-field">Event Title</label>
                <input
                  required
                  className="input-field"
                  placeholder="e.g. Inshore Casting & Rigging Session"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">Class Description</label>
                <textarea
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Brief summary of class agenda or course outline"
                  value={form.classDescription}
                  onChange={(e) => setForm({ ...form, classDescription: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">Internal Notes</label>
                <textarea
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Internal notes for teaching staff/coaches"
                  value={form.internalNotes}
                  onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                />
              </div>
            </div>

            {/* Section 3: Staff Assignment */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tide-dark">
                  3. Staff / Coaches Assignment
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">Assign 1 or multiple staff</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {teachers.map((t) => {
                  const isChecked = form.teachers.includes(t._id);
                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => toggleStaffSelection(t._id)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                        isChecked
                          ? 'border-tide bg-tide/10 text-tide-dark font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{t.fullName}</span>
                      {isChecked && <Check className="h-4 w-4 text-tide shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Date, Time & Duration */}
            <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/40 p-4">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tide-dark">
                  <Clock className="h-4 w-4 text-tide" /> 4. Date, Time &amp; Duration
                </h4>
                {form.startTime && form.endTime && (
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md">
                    {form.startTime} – {form.endTime} ({form.durationMinutes} mins)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label-field">Event Date</label>
                  <input
                    required
                    type="date"
                    className="input-field bg-white"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">Start Time</label>
                  <input
                    required
                    type="time"
                    className="input-field bg-white font-bold"
                    value={form.startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-field">End Time</label>
                  <input
                    type="time"
                    className="input-field bg-white font-bold"
                    value={form.endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration Customization & Presets */}
              <div className="pt-2 border-t border-sky-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Session Duration: <span className="text-tide-dark font-extrabold">{form.durationMinutes} minutes</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Auto-calculated or custom override</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 flex gap-1 overflow-x-auto pb-1">
                    {[30, 45, 60, 75, 90, 120, 180].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => handleDurationChange(dur)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold border transition shrink-0 ${
                          Number(form.durationMinutes) === dur
                            ? 'bg-tide text-white border-tide shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {dur >= 60 ? `${Math.floor(dur/60)}h${dur%60 ? ` ${dur%60}m` : ''}` : `${dur}m`}
                      </button>
                    ))}
                  </div>

                  <div className="w-24 shrink-0">
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      step="5"
                      value={form.durationMinutes}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      placeholder="Mins"
                      className="w-full rounded-xl border border-slate-200 p-1.5 text-xs text-center font-bold text-slate-800 bg-white focus:border-tide focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Location & Mode */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tide-dark">
                  <MapPin className="h-4 w-4" /> 5. Location &amp; Event Mode
                </h4>

                <div className="flex rounded-lg bg-slate-200/70 p-1 border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isOnline: false })}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                      !form.isOnline
                        ? 'bg-white text-marine shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Offline
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isOnline: true })}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                      form.isOnline
                        ? 'bg-white text-tide-dark shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="inline h-3 w-3 mr-1" />
                    Online
                  </button>
                </div>
              </div>

              {!form.isOnline && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Branch / Facility</label>
                    <select
                      className="input-field"
                      value={form.branch}
                      onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    >
                      <option value="">Select Branch...</option>
                      {branchesList.map((b) => (
                        <option key={b._id} value={b._id}>{b.name} ({b.city})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-field">Specific Location / Bay</label>
                    <input
                      className="input-field"
                      placeholder="e.g. Marina Dock Bay 3"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 6: Capacity & Status */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tide-dark">
                <Users className="h-4 w-4" /> 6. Seat Capacity &amp; Status
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Seat Type</label>
                  <select
                    className="input-field"
                    value={form.seatType}
                    onChange={(e) => setForm({ ...form, seatType: e.target.value })}
                  >
                    <option value="limited">Limited Seats</option>
                    <option value="unlimited">Unlimited Capacity</option>
                  </select>
                </div>

                {form.seatType === 'limited' && (
                  <div>
                    <label className="label-field">Max Capacity (Students)</label>
                    <input
                      type="number"
                      min="1"
                      className="input-field font-bold"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-tide px-6 py-2.5 text-xs font-bold text-white hover:bg-tide-dark shadow-sm transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-4 w-4" />
                    <span>{editingEvent ? 'Update Event' : 'Add Event'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Subject Management Modal */}
      <SubjectManagementModal
        open={manageSubjectsOpen}
        onClose={() => setManageSubjectsOpen(false)}
        onSubjectsChanged={() => {
          fetchSubjects();
          if (subjects) {
            calendarService.getSubjectOptions().catch(() => {});
          }
        }}
      />
    </>
  );
}
