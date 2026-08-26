import { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Clock, Search, Layers, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import subjectService from '../../services/subjectService';

export default function SubjectManagementModal({ open, onClose, onSubjectsChanged }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const { data } = await subjectService.getSubjects({ includeArchived: 'true' });
      setSubjects(data.data || []);
    } catch (err) {
      toast.error('Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSubjects();
      setShowAddForm(false);
      setEditingSubject(null);
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleStartAdd = () => {
    setEditingSubject(null);
    setName('');
    setDefaultDuration(60);
    setDescription('');
    setStatus('active');
    setError('');
    setShowAddForm(true);
  };

  const handleStartEdit = (subj) => {
    setEditingSubject(subj);
    setName(subj.name);
    setDefaultDuration(subj.defaultDuration || 60);
    setDescription(subj.description || '');
    setStatus(subj.status || 'active');
    setError('');
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingSubject(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Subject name is required.');
      return;
    }

    const dur = Number(defaultDuration);
    if (isNaN(dur) || dur <= 0) {
      setError('Please enter a valid positive duration in minutes.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, {
          name: name.trim(),
          defaultDuration: dur,
          description: description.trim(),
          status,
        });
        toast.success(`Subject "${name}" updated successfully.`);
      } else {
        await subjectService.createSubject({
          name: name.trim(),
          defaultDuration: dur,
          description: description.trim(),
          status,
        });
        toast.success(`Subject "${name}" created with default duration ${dur} mins.`);
      }

      setShowAddForm(false);
      setEditingSubject(null);
      await loadSubjects();
      if (onSubjectsChanged) onSubjectsChanged();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (subj) => {
    if (!window.confirm(`Archive subject "${subj.name}"? It will be hidden from new scheduling but existing calendar events remain intact.`)) {
      return;
    }
    try {
      await subjectService.deleteSubject(subj._id);
      toast.success(`Subject "${subj.name}" archived.`);
      await loadSubjects();
      if (onSubjectsChanged) onSubjectsChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive subject.');
    }
  };

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-marine-dark/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-tide/10 p-2.5 text-tide">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-marine">Manage Subjects &amp; Durations</h3>
              <p className="text-xs text-slate-500">Configure academic &amp; training subjects and their default session lengths</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add / Edit Form Card */}
        {showAddForm ? (
          <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tide-dark">
                {editingSubject ? `Edit Subject: ${editingSubject.name}` : 'Add New Subject'}
              </h4>
              <button type="button" onClick={handleCancelForm} className="text-xs text-slate-500 hover:text-slate-800">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Marine Science"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Duration (Minutes) *</label>
                <div className="flex items-center gap-1.5">
                  <input
                    required
                    type="number"
                    min="5"
                    max="1440"
                    step="5"
                    value={defaultDuration}
                    onChange={(e) => setDefaultDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white font-bold"
                  />
                  <div className="flex gap-1">
                    {[45, 60, 75, 90, 120].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDefaultDuration(dur)}
                        className={`rounded-lg px-2 py-1.5 text-[10px] font-bold border transition ${
                          Number(defaultDuration) === dur
                            ? 'bg-tide text-white border-tide'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {dur}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short outline of subject curriculum"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                >
                  <option value="active">Active (Available for scheduling)</option>
                  <option value="inactive">Inactive (Hidden from new events)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-sky-100">
              <button
                type="button"
                onClick={handleCancelForm}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-tide px-5 py-2 text-xs font-bold text-white hover:bg-tide-dark transition shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Add Subject'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs focus:border-tide focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleStartAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-tide px-4 py-2 text-xs font-bold text-white hover:bg-tide-dark shadow-xs transition shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Subject</span>
            </button>
          </div>
        )}

        {/* Subjects List */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading subjects...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No subjects found. Click "Add Subject" to create one.</div>
          ) : (
            filteredSubjects.map((subj) => (
              <div
                key={subj._id}
                className={`flex items-center justify-between rounded-xl border p-3 transition ${
                  subj.status === 'archived'
                    ? 'border-slate-100 bg-slate-50/60 opacity-60'
                    : subj.status === 'inactive'
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200 bg-white hover:border-sky-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-tide font-bold text-xs shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{subj.name}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        subj.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : subj.status === 'inactive'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {subj.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-marine">
                        <Clock className="h-3 w-3 text-tide" />
                        Default: {subj.defaultDuration || 60} mins ({Math.floor((subj.defaultDuration || 60)/60)}h {(subj.defaultDuration || 60)%60}m)
                      </span>
                      {subj.description && (
                        <span className="truncate max-w-xs text-slate-400">• {subj.description}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(subj)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                    title="Edit Subject & Duration"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {subj.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => handleArchive(subj)}
                      className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Archive Subject"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
          <span className="text-[11px] text-slate-400">
            Total {subjects.length} subjects ({subjects.filter(s => s.status === 'active').length} active)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
