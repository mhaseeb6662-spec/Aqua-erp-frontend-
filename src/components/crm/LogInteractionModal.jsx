import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import activityService from '../../services/activityService';

const TYPES = [
  { key: 'note', label: 'Note' },
  { key: 'call', label: 'Call' },
  { key: 'email', label: 'Email' },
  { key: 'meeting', label: 'Meeting' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

export default function LogInteractionModal({ open, onClose, onSaved, entityType, entityId }) {
  const [type, setType] = useState('note');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await activityService.logActivity({ entityType, entityId, type, description });
      toast.success('Interaction logged.');
      setDescription('');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log interaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-rise rounded-2xl bg-white p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-marine">Log interaction</h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors
                    ${type === t.key ? 'border-tide bg-tide/10 text-tide-dark' : 'border-marine/10 text-ink/50 hover:border-tide/40'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-field">What happened?</label>
            <textarea
              required
              rows={4}
              className="input-field resize-none"
              placeholder="Summarize the conversation or interaction..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Logging...' : 'Log interaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
