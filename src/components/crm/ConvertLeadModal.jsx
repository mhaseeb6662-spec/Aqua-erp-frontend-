import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import leadService from '../../services/leadService';

export default function ConvertLeadModal({ open, onClose, onConverted, lead }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  if (!open) return null;

  const handleConvert = async () => {
    setLoading(true);
    try {
      const { data } = await leadService.convertLead(lead._id, { conversionNote: note });
      toast.success(`${lead.fullName} converted to a student.`);
      onConverted(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-rise rounded-2xl bg-white p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-marine flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Convert to student
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-ink/40 hover:bg-marine/5 hover:text-marine">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-ink/70 mb-5">
          This will move <strong>{lead?.fullName}</strong> out of the sales pipeline into the student list, keeping all activity and interaction history intact.
        </p>

        <div className="mt-4">
          <label className="label-field">Conversion note (optional)</label>
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="e.g. Enrolled in Open Water Diver course, deposit confirmed"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={loading} onClick={handleConvert}>
            {loading ? 'Converting...' : 'Convert lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
