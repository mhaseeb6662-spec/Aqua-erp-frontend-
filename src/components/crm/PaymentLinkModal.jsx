import { useState } from 'react';
import { X, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../../services/paymentService';

const emptyForm = { amount: '', description: '', expiresAt: '' };

export default function PaymentLinkModal({ open, onClose, onSaved, customerId }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await paymentService.generatePaymentLink({ ...form, customerId, amount: Number(form.amount) });
      toast.success('Payment link generated.');
      setForm(emptyForm);
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate payment link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm animate-rise rounded-2xl bg-white p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-marine">
            <Link2 className="h-5 w-5 text-tide" />
            Generate payment link
          </h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Amount (PKR)</label>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              className="input-field"
              placeholder="e.g. 25000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Description</label>
            <input
              required
              className="input-field"
              placeholder="e.g. Open Water Diver course — deposit"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Expires on</label>
            <input
              type="date"
              className="input-field"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Generating...' : 'Generate link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
