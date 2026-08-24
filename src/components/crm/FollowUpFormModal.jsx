import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import followUpService from '../../services/followUpService';
import { FOLLOW_UP_TYPES } from '../../constants/crm';

const emptyForm = { type: FOLLOW_UP_TYPES[0], dueDate: '', notes: '' };

export default function FollowUpFormModal({ open, onClose, onSaved, entityType, entityId, editingFollowUp }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingFollowUp) {
      setForm({
        type: editingFollowUp.type,
        dueDate: editingFollowUp.dueDate?.slice(0, 16) || '',
        notes: editingFollowUp.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingFollowUp, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingFollowUp) {
        await followUpService.updateFollowUp(editingFollowUp._id, form);
        toast.success('Follow-up updated.');
      } else {
        await followUpService.createFollowUp({ ...form, entityType, entityId });
        toast.success('Follow-up scheduled.');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save follow-up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-rise rounded-2xl bg-white p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-marine">
            {editingFollowUp ? 'Edit follow-up' : 'Schedule follow-up'}
          </h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Type</label>
              <select
                className="input-field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {FOLLOW_UP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Due date &amp; time</label>
              <input
                required
                type="datetime-local"
                className="input-field"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label-field">Notes</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="What needs to happen in this follow-up?"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : editingFollowUp ? 'Save changes' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
