import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import { CreditCard, Search, Filter, CheckCircle2, RefreshCw, FileText, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PaymentsTracking() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await financeService.getPayments();
      setPayments(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load payment transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(
    (p) =>
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Payment Tracking & History</h1>
            <p className="text-sm text-slate-500">
              Audit log of completed transactions, gateway references, and payment methods.
            </p>
          </div>
          <button
            onClick={fetchPayments}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 text-tide" /> Refresh History
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transaction ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-tide focus:outline-none"
          />
        </div>

        {/* Payments Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Payments Recorded</h3>
            <p className="mt-1 text-sm text-slate-500">Completed payment transactions will be automatically tracked here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((pay) => (
                    <tr key={pay._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-tide">
                        <div className="flex items-center gap-2">
                          <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                          <span>{pay.transactionId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{pay.invoice?.invoiceNumber || 'Direct'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{pay.customer?.fullName || 'User'}</td>
                      <td className="px-6 py-4 text-slate-600">{pay.paymentMethod}</td>
                      <td className="px-6 py-4 font-bold text-marine">${pay.amount} USD</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(pay.paidAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
