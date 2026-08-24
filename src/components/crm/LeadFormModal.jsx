import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import leadService from '../../services/leadService';
import { LEAD_SOURCES } from '../../constants/crm';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  source: LEAD_SOURCES[0],
  interestedIn: '',
  assignedTo: '',
  notes: '',
};

export default function LeadFormModal({ open, onClose, onSaved, salesTeam = [], editingLead }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingLead) {
      setForm({
        fullName: editingLead.fullName || '',
        email: editingLead.email || '',
        phone: editingLead.phone || '',
        source: editingLead.source || LEAD_SOURCES[0],
        interestedIn: editingLead.interestedIn || '',
        assignedTo: editingLead.assignedTo?._id || editingLead.assignedTo || '',
        notes: editingLead.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [editingLead, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingLead) {
        await leadService.updateLead(editingLead._id, form);
        toast.success('Lead updated successfully.');
      } else {
        await leadService.createLead(form);
        toast.success('Lead captured successfully.');
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md animate-rise overflow-y-auto rounded-2xl bg-white p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-marine">
            {editingLead ? 'Edit lead' : 'Capture new lead'}
          </h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-coral/20 bg-coral/5 px-4 py-2.5 text-sm text-coral">
              {error}
            </div>
          )}

          <div>
            <label className="label-field">Full name</label>
            <input
              required
              className="input-field"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">Phone</label>
              <input
                required
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Lead source</label>
              <select
                className="input-field"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Assign to</label>
              <select
                className="input-field"
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              >
                <option value="">Unassigned</option>
                {salesTeam.map((m) => (
                  <option key={m._id} value={m._id}>{m.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">Interested in</label>
            <input
              className="input-field"
              placeholder="e.g. Open Water Diver course"
              value={form.interestedIn}
              onChange={(e) => setForm({ ...form, interestedIn: e.target.value })}
            />
          </div>

          <div>
            <label className="label-field">Notes</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : editingLead ? 'Save changes' : 'Capture lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
