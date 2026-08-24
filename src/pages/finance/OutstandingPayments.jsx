import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import { AlertCircle, Send, DollarSign, Clock, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function OutstandingPayments() {
  const { user, hasPermission } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOutstanding = async () => {
    setIsLoading(true);
    try {
      const res = await financeService.getInvoices();
      const unpaid = (res.data.data || []).filter((inv) => inv.balanceDue > 0);
      setInvoices(unpaid);
    } catch (err) {
      toast.error('Failed to load outstanding receivables');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutstanding();
  }, []);

  const handleSendAllReminders = async () => {
    try {
      await Promise.all(invoices.map((inv) => financeService.sendInvoiceReminder(inv._id)));
      toast.success(`Payment reminders sent to ${invoices.length} outstanding accounts!`);
    } catch (err) {
      toast.error('Failed to send reminders');
    }
  };

  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Outstanding & Aged Receivables</h1>
            <p className="text-sm text-slate-500">
              Track overdue balances, pending student tuition, and send payment reminders.
            </p>
          </div>
          {invoices.length > 0 && hasPermission('finance:invoices:update') && (
            <button
              onClick={handleSendAllReminders}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
            >
              <Send className="h-4 w-4" /> Send Reminders to All ({invoices.length})
            </button>
          )}
        </div>

        {/* Total Outstanding Banner */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6 text-amber-950">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
              <AlertCircle className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Total Uncollected Receivables</p>
              <h2 className="font-display text-2xl font-bold text-marine">${totalOutstanding.toLocaleString()} USD</h2>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-200/50 px-3 py-1.5 rounded-lg">
            {invoices.length} Unpaid Invoices
          </span>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Outstanding Payments</h3>
            <p className="mt-1 text-sm text-slate-500">All customer invoices have been settled in full!</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Total Billed</th>
                    <th className="px-6 py-4">Balance Due</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-marine">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{inv.customer?.fullName}</td>
                      <td className="px-6 py-4 text-slate-600">${inv.totalAmount} USD</td>
                      <td className="px-6 py-4 font-bold text-amber-600">${inv.balanceDue} USD</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            inv.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <Clock className="h-3 w-3" /> {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => financeService.sendInvoiceReminder(inv._id).then(() => toast.success('Reminder sent'))}
                          className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-200 inline-flex items-center gap-1"
                        >
                          <Send className="h-3.5 w-3.5" /> Send Reminder
                        </button>
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
