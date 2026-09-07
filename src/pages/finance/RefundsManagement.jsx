import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import { formatAED } from '../../utils/currency';
import {
  RefreshCw,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RefundsManagement() {
  const { user, hasPermission } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Eligible Transactions for Refund Modal
  const [eligibleTransactions, setEligibleTransactions] = useState([]);
  const [isLoadingEligible, setIsLoadingEligible] = useState(false);
  const [eligibleError, setEligibleError] = useState('');
  const [modalSearch, setModalSearch] = useState('');

  // Issue Refund Form State
  const [selectedPayment, setSelectedPayment] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('Customer requested schedule cancellation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch processed refunds table
  const fetchRefunds = async () => {
    setIsLoading(true);
    try {
      const res = await financeService.getRefunds();
      setRefunds(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load refund records');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch live eligible transactions for refund
  const fetchEligibleTransactions = useCallback(async (query = '') => {
    setIsLoadingEligible(true);
    setEligibleError('');
    try {
      const res = await financeService.getEligibleRefundTransactions({
        search: query.trim() || undefined,
        limit: 100,
      });
      setEligibleTransactions(res.data.data || []);
    } catch (err) {
      console.error('Error loading eligible transactions:', err);
      setEligibleError('Unable to load refundable transactions. Please check your connection or contact an administrator.');
      toast.error('Unable to load refundable transactions');
    } finally {
      setIsLoadingEligible(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleOpenModal = () => {
    setSelectedPayment('');
    setRefundAmount('');
    setReason('Customer requested schedule cancellation');
    setModalSearch('');
    setShowModal(true);
    fetchEligibleTransactions('');
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setModalSearch(val);
    fetchEligibleTransactions(val);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPayment || !reason) {
      return toast.error('Please select an eligible payment transaction and enter a reason');
    }

    const selectedTxn = eligibleTransactions.find(
      (t) => t.id === selectedPayment || t.paymentId === selectedPayment
    );

    if (!selectedTxn) {
      return toast.error('Selected transaction is not eligible for refund');
    }

    const enteredAmount = refundAmount ? Number(refundAmount) : selectedTxn.refundableAmount;

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      return toast.error('Refund amount must be greater than zero');
    }

    if (enteredAmount > selectedTxn.refundableAmount) {
      return toast.error(
        `Refund amount cannot exceed remaining refundable balance of ${formatAED(selectedTxn.refundableAmount)}`
      );
    }

    setIsSubmitting(true);
    try {
      await financeService.processRefund({
        paymentId: selectedTxn.paymentId,
        amount: enteredAmount,
        reason: reason.trim(),
      });
      toast.success('Refund processed successfully!');
      setShowModal(false);
      fetchRefunds();
      fetchEligibleTransactions('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTxn = eligibleTransactions.find(
    (t) => t.id === selectedPayment || t.paymentId === selectedPayment
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Refund Management</h1>
            <p className="text-sm text-slate-500">
              Process partial and full refunds, audit refund logs, and update invoice balance statuses.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchRefunds}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Refresh refund records"
            >
              <RefreshCw className="h-4 w-4 text-tide" /> Refresh
            </button>
            {hasPermission('finance:refunds:manage') && (
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark"
              >
                <Plus className="h-4 w-4" /> Issue Refund
              </button>
            )}
          </div>
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
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {ref.payment?.transactionId || 'Manual Refund'}
                      </td>
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
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-marine">Issue Refund</h2>
                  <p className="text-xs text-slate-500">Select a completed payment transaction to process refund.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRefundSubmit} className="mt-4 space-y-4">
                {/* Search & Refresh Toolbar */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Eligible Transaction / Invoice *
                    </label>
                    <button
                      type="button"
                      onClick={() => fetchEligibleTransactions(modalSearch)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-tide hover:text-tide-dark transition"
                      title="Reload fresh eligible transactions"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoadingEligible ? 'animate-spin' : ''}`} />
                      Refresh List
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={handleSearchChange}
                      placeholder="Search by Invoice #, TXN ID, or Customer name..."
                      className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs focus:border-tide focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  {/* Loading State */}
                  {isLoadingEligible ? (
                    <div className="flex items-center justify-center py-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 text-xs">
                      <RefreshCw className="h-4 w-4 animate-spin text-tide mr-2" />
                      Loading live eligible transactions...
                    </div>
                  ) : eligibleError ? (
                    /* Error State */
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{eligibleError}</p>
                        <button
                          type="button"
                          onClick={() => fetchEligibleTransactions(modalSearch)}
                          className="mt-1 font-bold underline text-rose-800 hover:text-rose-900"
                        >
                          Retry Loading
                        </button>
                      </div>
                    </div>
                  ) : eligibleTransactions.length === 0 ? (
                    /* Empty State */
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                      <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                      <p className="font-semibold text-slate-700">No refundable transactions available.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Only paid or partially paid transactions with refundable balances appear here.
                      </p>
                    </div>
                  ) : (
                    /* Selection Dropdown */
                    <select
                      value={selectedPayment}
                      onChange={(e) => {
                        setSelectedPayment(e.target.value);
                        const match = eligibleTransactions.find(
                          (t) => t.id === e.target.value || t.paymentId === e.target.value
                        );
                        if (match) {
                          setRefundAmount(String(match.refundableAmount));
                        } else {
                          setRefundAmount('');
                        }
                      }}
                      required
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none bg-white font-medium"
                    >
                      <option value="">-- Choose Transaction to Refund ({eligibleTransactions.length} eligible) --</option>
                      {eligibleTransactions.map((t) => (
                        <option key={t.id || t.paymentId} value={t.id || t.paymentId}>
                          {t.invoiceNumber !== 'N/A' ? `[${t.invoiceNumber}] ` : ''}
                          {t.transactionId} - {t.customerName} - {t.paymentMethod} (Paid: AED {t.paidAmount} | Refundable: AED {t.refundableAmount})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Selected Transaction Summary Card */}
                {selectedTxn && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-marine flex items-center gap-1.5">
                        <Receipt className="h-4 w-4 text-tide" />
                        {selectedTxn.invoiceNumber !== 'N/A' ? selectedTxn.invoiceNumber : selectedTxn.transactionId}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-slate-500">
                        {selectedTxn.transactionId}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">Customer / Student:</span>
                        <p className="font-semibold text-slate-700 truncate">{selectedTxn.customerName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Payment Method:</span>
                        <p className="font-semibold text-slate-700">{selectedTxn.paymentMethod}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Paid Amount:</span>
                        <p className="font-semibold text-slate-700">{formatAED(selectedTxn.paidAmount)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Already Refunded:</span>
                        <p className="font-semibold text-rose-600">
                          {selectedTxn.refundedAmount > 0 ? `-${formatAED(selectedTxn.refundedAmount)}` : 'AED 0.00'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Remaining Refundable:</span>
                      <span className="font-display font-bold text-emerald-600 text-sm">
                        {formatAED(selectedTxn.refundableAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Refund Amount */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Refund Amount (AED) *</label>
                    {selectedTxn && (
                      <button
                        type="button"
                        onClick={() => setRefundAmount(String(selectedTxn.refundableAmount))}
                        className="text-[11px] font-semibold text-tide hover:underline"
                      >
                        Set Full Amount ({formatAED(selectedTxn.refundableAmount)})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">AED</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={selectedTxn ? selectedTxn.refundableAmount : undefined}
                      required
                      placeholder={selectedTxn ? `Max ${selectedTxn.refundableAmount}` : 'Enter amount'}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 pl-12 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                  {selectedTxn && Number(refundAmount) > selectedTxn.refundableAmount && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Exceeds maximum refundable balance of {formatAED(selectedTxn.refundableAmount)}
                    </p>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Refund Reason *</label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide detailed justification for this refund audit log..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                  ></textarea>
                </div>

                {/* Action Buttons */}
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
                    disabled={
                      isSubmitting ||
                      !selectedPayment ||
                      !refundAmount ||
                      (selectedTxn && Number(refundAmount) > selectedTxn.refundableAmount)
                    }
                    className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-sm"
                  >
                    {isSubmitting ? 'Processing Refund...' : 'Confirm Refund'}
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
