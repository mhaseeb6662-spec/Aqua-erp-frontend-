import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import { formatAED } from '../../utils/currency';
import { RefreshCw, ArrowUpRight, Search, Plus, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RefundsManagement() {
  const { user, hasPermission } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Issue Refund Form
  const [selectedPayment, setSelectedPayment] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('Customer requested schedule cancellation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRefunds = async () => {
    setIsLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        financeService.getRefunds(),
        financeService.getPayments(),
      ]);
      setRefunds(rRes.data.data || []);
      setPayments(pRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load refund records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPayment || !reason) return toast.error('Please select payment transaction and reason');
    setIsSubmitting(true);
    try {
      await financeService.processRefund({
        paymentId: selectedPayment,
        amount: Number(refundAmount) || undefined,
        reason,
      });
      toast.success('Refund processed successfully!');
      setShowModal(false);
      fetchRefunds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Refund Management</h1>
            <p className="text-sm text-slate-500">
              Process partial/full refunds, audit refund logs, and update invoice balance statuses.
            </p>
          </div>
          {hasPermission('finance:refunds:manage') && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark"
            >
              <Plus className="h-4 w-4" /> Issue Refund
            </button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : refunds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <RefreshCw className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Refunds Processed</h3>
            <p className="mt-1 text-sm text-slate-500">Issued refund transactions will be listed here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Refund ID</th>
                    <th className="px-6 py-4">Original Transaction</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Refund Amount</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Processed Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {refunds.map((ref) => (
                    <tr key={ref._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-rose-600">{ref.refundId}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{ref.payment?.transactionId}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{ref.customer?.fullName || 'User'}</td>
                      <td className="px-6 py-4 font-bold text-rose-600">-{formatAED(ref.amount)}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{ref.reason}</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(ref.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> {ref.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Issue Refund Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-lg font-bold text-marine">Issue Refund</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRefundSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Select Completed Transaction *</label>
                  <select
                    value={selectedPayment}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  >
                    <option value="">Select Transaction</option>
                    {payments.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.transactionId} - AED {p.amount} ({p.customer?.fullName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Refund Amount ($)</label>
                  <input
                    type="number"
                    placeholder="Leave empty for full refund"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Refund Reason *</label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  ></textarea>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Refund'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
