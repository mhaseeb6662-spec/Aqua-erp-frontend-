import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import customerService from '../../services/customerService';
import { LEAD_SOURCES } from '../../constants/crm';

const emptyForm = { fullName: '', phone: '', email: '', source: LEAD_SOURCES[0], interestedIn: '', notes: '' };

/**
 * Quick "add a new student" form — creates a Customer record directly,
 * bypassing the Lead -> Convert flow. Used from the Customers page and
 * from the Calendar's "add class" flow (so a brand-new student/child can
 * be added on the spot while scheduling their first class).
 */
export default function StudentFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim() || !form.phone.trim()) {
      setError('Full name and phone number are required.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await customerService.createCustomer(form);
      toast.success(`${form.fullName} added as a student.`);
      setForm(emptyForm);
      onSaved(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-marine-dark/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-rise rounded-2xl bg-white p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-marine">
            <UserPlus className="h-5 w-5 text-tide" />
            Add new student
          </h3>
          <button type="button" onClick={onClose} className="text-ink/40 hover:text-ink">
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
            <label className="label-field">Student / child's name</label>
            <input
              required
              autoFocus
              className="input-field"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Phone</label>
              <input
                required
                className="input-field"
                placeholder="Parent / contact number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label-field">Interested in / course</label>
            <input
              className="input-field"
              placeholder="e.g. Beginner swimming class"
              value={form.interestedIn}
              onChange={(e) => setForm({ ...form, interestedIn: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
