import { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import leadService from '../../services/leadService';

export default function AssignLeadModal({ open, onClose, onSaved, lead, salesTeam = [] }) {
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAssignedTo(lead?.assignedTo?._id || lead?.assignedTo || '');
  }, [lead, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leadService.assignLead(lead._id, assignedTo);
      toast.success('Lead assignment updated.');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-rise rounded-2xl bg-white p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-marine">
            <UserCheck className="h-5 w-5 text-tide" />
            Assign lead
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-700">
            Distributing <span className="font-bold text-marine">{lead?.fullName}</span> to a sales rep.
          </p>

          {salesTeam.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900">
              No sales team members yet, so this lead can't be assigned. Create a user with the "Sales Agent" or "Sales Manager" role first.
            </div>
          )}

          <div>
            <label className="label-field">Sales representative</label>
            <select
              required
              disabled={salesTeam.length === 0}
              className="input-field disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="" disabled>Select a rep</option>
              {salesTeam.map((m) => (
                <option key={m._id} value={m._id}>{m.fullName}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading || salesTeam.length === 0} className="btn-primary">
              {loading ? 'Assigning...' : 'Assign lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
