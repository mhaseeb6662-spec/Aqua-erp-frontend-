import { useEffect, useState } from 'react';
import { X, CalendarPlus, Search, UserPlus, Check, Sparkles, MapPin, Users, BookOpen, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendarService';
import leadService from '../../services/leadService';
import customerService from '../../services/customerService';
import portalService from '../../services/portalService';
import StudentFormModal from './StudentFormModal';
import { CALENDAR_SUBJECT_OPTIONS } from '../../constants/crm';

const emptyForm = {
  type: 'class',
  eventType: 'one-time',
  program: '',
  branch: '',
  subject: '',
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

  const [leadQuery, setLeadQuery] = useState('');
  const [leadResults, setLeadResults] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadSearching, setLeadSearching] = useState(false);

  const [studentQuery, setStudentQuery] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearching, setStudentSearching] = useState(false);

  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  const allSubjectOptions = Array.from(new Set([...CALENDAR_SUBJECT_OPTIONS, ...subjects])).sort();

  useEffect(() => {
    portalService.getPrograms().then(({ data }) => setProgramsList(data.data || [])).catch(() => {});
    portalService.getBranches().then(({ data }) => setBranchesList(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;

    if (editingEvent) {
      const assignedTeacherIds = Array.isArray(editingEvent.teachers) && editingEvent.teachers.length > 0
        ? editingEvent.teachers.map((t) => (t._id ? t._id : t))
        : editingEvent.teacher
        ? [editingEvent.teacher._id ? editingEvent.teacher._id : editingEvent.teacher]
        : [];

      setForm({
        type: editingEvent.type || 'class',
        eventType: editingEvent.eventType || 'one-time',
        program: editingEvent.program?._id || editingEvent.program || '',
        branch: editingEvent.branch?._id || editingEvent.branch || '',
        subject: editingEvent.subject || '',
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

  const searchLeads = async (q) => {
    setLeadQuery(q);
    if (!q.trim()) { setLeadResults([]); return; }
    setLeadSearching(true);
    try {
      const { data } = await leadService.getLeads({ search: q, limit: 8 });
      setLeadResults(data.data);
    } catch {
      // silent
    } finally {
      setLeadSearching(false);
    }
  };

  const searchStudents = async (q) => {
    setStudentQuery(q);
    if (!q.trim()) { setStudentResults([]); return; }
    setStudentSearching(true);
    try {
      const { data } = await customerService.getCustomers({ search: q, limit: 8 });
      setStudentResults(data.data);
    } catch {
      // silent
    } finally {
      setStudentSearching(false);
    }
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
        subject: form.subject || customSubjectInput || '',
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
              <BookOpen className="h-4 w-4" /> 1. Program & Event Type
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
              {/* Subject / Category */}
              <div>
                <label className="label-field">Category / Subject</label>
                <select
                  className="input-field"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  <option value="">Select Category...</option>
                  {allSubjectOptions.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
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
                placeholder="e.g. Organic Chemistry Masterclass"
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

          {/* Section 4: Date & Time */}
          <div className="space-y-4 rounded-xl border border-marine/10 bg-marine/[0.015] p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-tide-dark">
              4. Date & Time
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label-field">Event Date</label>
                <input
                  required
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="label-field">Start Time</label>
                <input
                  required
                  type="time"
                  className="input-field"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="label-field">End Time</label>
                <input
                  type="time"
                  className="input-field"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Location & Mode */}
          <div className="space-y-4 rounded-xl border border-marine/10 bg-marine/[0.015] p-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tide-dark">
                <MapPin className="h-4 w-4" /> 5. Location & Event Mode
              </h4>

              {/* Offline vs Online Mode Switcher */}
              <div className="flex rounded-lg bg-marine/5 p-1 border border-marine/10">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isOnline: false })}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    !form.isOnline
                      ? 'bg-white text-marine shadow-xs'
                      : 'text-ink/60 hover:text-ink'
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
                      : 'text-ink/60 hover:text-ink'
                  }`}
                >
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Online
                </button>
              </div>
            </div>

            {!form.isOnline ? (
              <div>
                <label className="label-field">Branch Location</label>
                <select
                  className="input-field"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                >
                  <option value="">Select Branch Location...</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="rounded-lg bg-tide/10 p-3 text-xs font-medium text-tide-dark">
                ✓ Online event selected. Branch location field is hidden.
              </div>
            )}
          </div>

          {/* Section 6: Seats / Capacity */}
          <div className="space-y-4 rounded-xl border border-marine/10 bg-marine/[0.015] p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tide-dark">
              <Users className="h-4 w-4" /> 6. Seat Capacity
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Seat Type</label>
                <div className="flex rounded-lg bg-marine/5 p-1 border border-marine/10">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, seatType: 'unlimited', capacity: '' })}
                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      form.seatType === 'unlimited'
                        ? 'bg-white text-marine shadow-xs'
                        : 'text-ink/60 hover:text-ink'
                    }`}
                  >
                    Unlimited
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, seatType: 'limited' })}
                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      form.seatType === 'limited'
                        ? 'bg-white text-marine shadow-xs'
                        : 'text-ink/60 hover:text-ink'
                    }`}
                  >
                    Limited
                  </button>
                </div>
              </div>

              {form.seatType === 'limited' && (
                <div>
                  <label className="label-field">Maximum Seats</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="input-field"
                    placeholder="e.g. 25"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Lead / Student Initial Picker */}
          <div className="space-y-3 rounded-xl border border-marine/10 bg-marine/[0.015] p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-tide-dark">
              7. Optional Initial Participant
            </h4>

            {form.type === 'class' ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="label-field !mb-0">Select Student</label>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-semibold text-tide hover:text-tide-dark"
                    onClick={() => setAddStudentOpen(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Quick Student
                  </button>
                </div>
                {selectedStudent ? (
                  <div className="flex items-center justify-between rounded-lg border border-tide/30 bg-tide/5 px-3.5 py-2">
                    <span className="text-xs font-semibold text-marine">{selectedStudent.fullName} ({selectedStudent.phone})</span>
                    <button type="button" className="text-xs font-semibold text-coral" onClick={() => setSelectedStudent(null)}>Remove</button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                    <input
                      className="input-field pl-9"
                      placeholder="Search student name..."
                      value={studentQuery}
                      onChange={(e) => searchStudents(e.target.value)}
                    />
                    {studentQuery.trim() && (
                      <div className="mt-1 max-h-36 overflow-y-auto rounded-lg border border-marine/10 bg-white shadow-md">
                        {studentSearching ? (
                          <p className="p-2 text-xs text-ink/40">Searching...</p>
                        ) : studentResults.map((s) => (
                          <button
                            key={s._id}
                            type="button"
                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-marine/5"
                            onClick={() => { setSelectedStudent(s); setStudentQuery(''); setStudentResults([]); }}
                          >
                            <span className="font-semibold text-marine">{s.fullName}</span> ({s.phone})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="label-field">Select Lead</label>
                {selectedLead ? (
                  <div className="flex items-center justify-between rounded-lg border border-tide/30 bg-tide/5 px-3.5 py-2">
                    <span className="text-xs font-semibold text-marine">{selectedLead.fullName} ({selectedLead.phone})</span>
                    <button type="button" className="text-xs font-semibold text-coral" onClick={() => setSelectedLead(null)}>Remove</button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                    <input
                      className="input-field pl-9"
                      placeholder="Search lead name..."
                      value={leadQuery}
                      onChange={(e) => searchLeads(e.target.value)}
                    />
                    {leadQuery.trim() && (
                      <div className="mt-1 max-h-36 overflow-y-auto rounded-lg border border-marine/10 bg-white shadow-md">
                        {leadSearching ? (
                          <p className="p-2 text-xs text-ink/40">Searching...</p>
                        ) : leadResults.map((l) => (
                          <button
                            key={l._id}
                            type="button"
                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-marine/5"
                            onClick={() => { setSelectedLead(l); setLeadQuery(''); setLeadResults([]); }}
                          >
                            <span className="font-semibold text-marine">{l.fullName}</span> ({l.phone})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-marine/10">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : editingEvent ? 'Save Event Changes' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>

      <StudentFormModal
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        onSaved={(newStudent) => {
          setSelectedStudent(newStudent);
          setAddStudentOpen(false);
          toast.success('Quick student created and selected.');
        }}
      />
    </div>
  );
}
