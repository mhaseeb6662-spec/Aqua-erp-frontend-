import { useEffect, useState } from 'react';
import { 
  X, CalendarPlus, Search, UserPlus, Check, Sparkles, MapPin, 
  Users, BookOpen, Layers, Clock, Settings2, Ship, School, Bus
} from 'lucide-react';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendarService';
import leadService from '../../services/leadService';
import customerService from '../../services/customerService';
import portalService from '../../services/portalService';
import StudentFormModal from './StudentFormModal';

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
  venue: 'Classroom', // 'Classroom' | 'Boat'
  boat: '', // Vessel ObjectId if venue === 'Boat'
  transportationRequired: false,
  title: '',
  classDescription: '',
  internalNotes: '',
  date: '',
  startTime: '',
  endTime: '',
  teacher: '',
  teachers: [],
  isOnline: false,
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
}) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [programsList, setProgramsList] = useState([]);
  const [branchesList, setBranchesList] = useState([]);
  const [boatsList, setBoatsList] = useState([]);

  const [leadQuery, setLeadQuery] = useState('');
  const [leadResults, setLeadResults] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadSearching, setLeadSearching] = useState(false);

  const [studentQuery, setStudentQuery] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearching, setStudentSearching] = useState(false);

  const [addStudentOpen, setAddStudentOpen] = useState(false);

  // Load programs, branches, and boats
  useEffect(() => {
    portalService.getPrograms({ activeOnly: 'true' })
      .then(({ data }) => setProgramsList(data.data || []))
      .catch(() => {});
    portalService.getBranches()
      .then(({ data }) => setBranchesList(data.data || []))
      .catch(() => {});
    calendarService.getBoats()
      .then(({ data }) => setBoatsList(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;

    if (editingEvent) {
      const assignedTeacherIds = Array.isArray(editingEvent.teachers) && editingEvent.teachers.length > 0
        ? editingEvent.teachers.map((t) => (t._id ? t._id : t))
        : editingEvent.teacher
        ? [editingEvent.teacher._id ? editingEvent.teacher._id : editingEvent.teacher]
        : [];

      const primaryTeacherId = assignedTeacherIds[0] || (editingEvent.teacher?._id || editingEvent.teacher || '');

      setForm({
        type: editingEvent.type || 'class',
        eventType: editingEvent.eventType || 'one-time',
        program: editingEvent.program?._id || editingEvent.program || '',
        branch: editingEvent.branch?._id || editingEvent.branch || '',
        venue: editingEvent.venue === 'Boat' || editingEvent.vessel || editingEvent.boat ? 'Boat' : 'Classroom',
        boat: editingEvent.boat?._id || editingEvent.boat || editingEvent.vessel?._id || editingEvent.vessel || '',
        transportationRequired: Boolean(editingEvent.transportationRequired || editingEvent.transportation),
        title: editingEvent.title || '',
        classDescription: editingEvent.classDescription || '',
        internalNotes: editingEvent.internalNotes || editingEvent.notes || '',
        date: editingEvent.date?.slice(0, 10) || '',
        startTime: editingEvent.startTime || '',
        endTime: editingEvent.endTime || '',
        teacher: primaryTeacherId,
        teachers: assignedTeacherIds,
        isOnline: Boolean(editingEvent.isOnline),
        seatType: editingEvent.seatType || 'limited',
        capacity: editingEvent.capacity || '10',
        publishedStatus: editingEvent.publishedStatus || 'published',
      });

      if (editingEvent.program && typeof editingEvent.program === 'object') {
        setProgramsList((prev) => {
          if (!prev.find((p) => String(p._id) === String(editingEvent.program._id))) {
            return [...prev, editingEvent.program];
          }
          return prev;
        });
      }
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

  // Handle Start Time Change (auto pre-fills End Time if empty)
  const handleStartTimeChange = (newStartTime) => {
    let newEndTime = form.endTime;
    if (newStartTime && !newEndTime) {
      // Find default duration from selected program or default to 60 mins
      const prog = programsList.find((p) => String(p._id) === String(form.program));
      const progDuration = prog ? (prog.durationHours || 0) * 60 + (prog.durationMinutes || 0) : 60;
      newEndTime = addMinutesToTime(newStartTime, progDuration || 60);
    }
    setForm((prev) => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime,
    }));
  };

  // Handle End Time Change
  const handleEndTimeChange = (newEndTime) => {
    setForm((prev) => ({
      ...prev,
      endTime: newEndTime,
    }));
  };

  // Filter boats by selected Branch
  const availableBoats = boatsList.filter((b) => {
    // If branch is selected, match boat branch
    if (form.branch && b.branch) {
      const bBranchId = typeof b.branch === 'object' ? b.branch._id : b.branch;
      if (String(bBranchId) !== String(form.branch)) return false;
    }
    // Filter out out-of-service boats
    return b.operationalStatus !== 'Out of Service';
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.date) return setError('Please select an event date.');
    if (!form.startTime) return setError('Please select an event start time.');
    if (!form.endTime) return setError('Please select an event end time.');

    // Validate End Time > Start Time
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      return setError('End Time must be after Start Time.');
    }

    // Validate Venue & Boat
    if (form.venue === 'Boat' && !form.boat) {
      return setError('Please select a Boat for this boat-based session.');
    }

    if (form.seatType === 'limited' && (!form.capacity || Number(form.capacity) <= 0)) {
      return setError('Please specify a valid numeric seat capacity for limited seat events.');
    }

    // Compute duration automatically from End Time - Start Time
    const calculatedDuration = calculateMinutesDiff(form.startTime, form.endTime);

    setLoading(true);
    try {
      const staffList = form.teacher ? [form.teacher] : (form.teachers || []);

      const payload = {
        ...form,
        durationMinutes: calculatedDuration,
        venue: form.venue,
        boat: form.venue === 'Boat' ? form.boat : null,
        vessel: form.venue === 'Boat' ? form.boat : null,
        transportationRequired: Boolean(form.transportationRequired),
        transportation: Boolean(form.transportationRequired),
        lead: form.type === 'demo' ? selectedLead?._id : undefined,
        student: form.type === 'class' ? selectedStudent?._id : undefined,
        teacher: form.teacher || staffList[0] || null,
        teachers: staffList,
        location: form.venue === 'Boat' 
          ? (boatsList.find((b) => String(b._id) === String(form.boat))?.name || 'Boat')
          : (branchesList.find((b) => String(b._id) === String(form.branch))?.name || 'Classroom'),
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

            {/* Section 1: Program & Event Type */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tide-dark">
                <BookOpen className="h-4 w-4" /> 1. Program &amp; Event Type
              </h4>

              {/* Select Academy Program */}
              {programsList.length > 0 && (
                <div>
                  <label className="label-field">Link Academy Program (Optional)</label>
                  <select
                    className="input-field font-semibold text-marine bg-white"
                    value={form.program}
                    onChange={(e) => {
                      const progId = e.target.value;
                      const picked = programsList.find((p) => String(p._id) === String(progId));
                      if (picked) {
                        const progDur = (picked.durationHours || 0) * 60 + (picked.durationMinutes || 0) || 60;
                        const newEnd = form.startTime ? addMinutesToTime(form.startTime, progDur) : form.endTime;
                        setForm((prev) => ({
                          ...prev,
                          program: picked._id,
                          title: prev.title && prev.title !== 'New Class' ? prev.title : picked.title,
                          endTime: newEnd,
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
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
                <label className="label-field">Event Title *</label>
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

            {/* Section 3: Staff Assignment (Dropdown Box) */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tide-dark">
                  3. Staff Assignment
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">Assigned Coach / Instructor</span>
              </div>

              <div>
                <label className="label-field">Select Staff *</label>
                <select
                  required
                  className="input-field bg-white"
                  value={form.teacher || (form.teachers && form.teachers[0]) || ''}
                  onChange={(e) => {
                    const staffId = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      teacher: staffId,
                      teachers: staffId ? [staffId] : [],
                    }));
                  }}
                >
                  <option value="">Select Staff...</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} {t.role?.name ? `(${t.role.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 4: Date & Time Range (Session Duration Removed) */}
            <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/40 p-4">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tide-dark">
                  <Clock className="h-4 w-4 text-tide" /> 4. Date &amp; Time
                </h4>
                {form.startTime && form.endTime && (
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md">
                    {form.startTime} – {form.endTime}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label-field">Event Date *</label>
                  <input
                    required
                    type="date"
                    className="input-field bg-white"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">Start Time *</label>
                  <input
                    required
                    type="time"
                    className="input-field bg-white font-bold"
                    value={form.startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-field">End Time *</label>
                  <input
                    required
                    type="time"
                    className="input-field bg-white font-bold"
                    value={form.endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Branch, Venue & Transportation */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tide-dark">
                <MapPin className="h-4 w-4" /> 5. Location &amp; Venue
              </h4>

              {/* Branch Selection */}
              <div>
                <label className="label-field">Branch *</label>
                <select
                  required
                  className="input-field bg-white"
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                >
                  <option value="">Select Branch...</option>
                  {branchesList.map((b) => (
                    <option key={b._id} value={b._id}>{b.name} ({b.city})</option>
                  ))}
                </select>
              </div>

              {/* Venue Options: Classroom / Boat */}
              <div>
                <label className="label-field">Venue *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition select-none ${
                      form.venue === 'Classroom'
                        ? 'border-tide bg-tide/5 text-marine font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="venue"
                      value="Classroom"
                      checked={form.venue === 'Classroom'}
                      onChange={() => {
                        setForm((prev) => ({ ...prev, venue: 'Classroom', boat: '' }));
                      }}
                      className="text-tide focus:ring-tide"
                    />
                    <School className="h-4 w-4 text-tide shrink-0" />
                    <span className="text-xs">Classroom</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition select-none ${
                      form.venue === 'Boat'
                        ? 'border-tide bg-tide/5 text-marine font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="venue"
                      value="Boat"
                      checked={form.venue === 'Boat'}
                      onChange={() => {
                        setForm((prev) => ({ ...prev, venue: 'Boat' }));
                      }}
                      className="text-tide focus:ring-tide"
                    />
                    <Ship className="h-4 w-4 text-tide shrink-0" />
                    <span className="text-xs">Boat</span>
                  </label>
                </div>
              </div>

              {/* Boat Selection (Conditionally shown when Venue = Boat) */}
              {form.venue === 'Boat' && (
                <div className="space-y-1.5 rounded-xl bg-sky-50/60 p-3.5 border border-sky-200">
                  <label className="label-field flex items-center justify-between">
                    <span>Select Boat *</span>
                    {form.branch && (
                      <span className="text-[10px] text-slate-500 font-normal">Filtered by Branch</span>
                    )}
                  </label>
                  <select
                    required
                    className="input-field bg-white font-semibold"
                    value={form.boat}
                    onChange={(e) => setForm({ ...form, boat: e.target.value })}
                  >
                    <option value="">Select Boat...</option>
                    {availableBoats.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.vesselType || 'Boat'}) – Capacity: {b.capacity} | Status: {b.operationalStatus}
                      </option>
                    ))}
                  </select>
                  {availableBoats.length === 0 && (
                    <p className="text-[11px] text-amber-700">
                      No operational boats available for the selected branch.
                    </p>
                  )}
                </div>
              )}

              {/* Transportation Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    checked={Boolean(form.transportationRequired)}
                    onChange={(e) => setForm({ ...form, transportationRequired: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-tide focus:ring-tide"
                  />
                  <Bus className="h-4 w-4 text-tide shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Transportation Required</span>
                    <p className="text-[11px] text-slate-400">Enable if academy student shuttle service is needed</p>
                  </div>
                </label>
              </div>
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
                    className="input-field bg-white"
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
                      className="input-field font-bold bg-white"
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
    </>
  );
}
