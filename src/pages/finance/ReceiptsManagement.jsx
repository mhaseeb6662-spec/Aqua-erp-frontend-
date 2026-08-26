import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import { formatAED } from '../../utils/currency';
import { FileCheck, Printer, Search, Download, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AcademyLogo from '../../components/common/AcademyLogo';

export default function ReceiptsManagement() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const res = await financeService.getReceipts();
      setReceipts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load payment receipts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Receipt Management</h1>
            <p className="text-sm text-slate-500">
              Official payment receipt ledger (`RCT-XXXXXX`), download/print receipts, and customer proof of payment.
            </p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : receipts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FileCheck className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Receipts Issued Yet</h3>
            <p className="mt-1 text-sm text-slate-500">Payment receipts are automatically generated when payments are completed.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Receipt #</th>
                    <th className="px-6 py-4">Invoice Ref</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Issued Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipts.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-tide">{r.receiptNumber}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{r.invoice?.invoiceNumber || 'Direct'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{r.customer?.fullName}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{formatAED(r.amountPaid)}</td>
                      <td className="px-6 py-4 text-slate-600">{r.paymentMethod}</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(r.issuedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReceipt(r);
                            setShowModal(true);
                          }}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                          title="View / Print Receipt"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receipt Printable Modal */}
        {showModal && selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print">
                <h2 className="font-display text-lg font-bold text-marine">Payment Receipt</h2>
                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-tide px-3.5 py-1.5 text-xs font-bold text-white hover:bg-tide-dark no-print"
                  >
                    <Printer className="h-4 w-4" /> Print Receipt
                  </button>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 no-print">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Printable Receipt Card */}
              <div className="printable-document mt-6 space-y-6 text-slate-700 bg-white p-6">
                <div className="text-center border-b border-slate-100 pb-4 flex flex-col items-center">
                  <AcademyLogo variant="receipt" className="mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Official Payment Receipt</p>
                  <p className="font-mono text-sm font-bold text-tide mt-1">{selectedReceipt.receiptNumber}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Received From:</span>
                    <span className="font-semibold text-marine">{selectedReceipt.customer?.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Invoice Number:</span>
                    <span className="font-mono font-semibold">{selectedReceipt.invoice?.invoiceNumber || 'Direct Payment'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Payment Method:</span>
                    <span className="font-semibold">{selectedReceipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Date Issued:</span>
                    <span className="font-semibold">{new Date(selectedReceipt.issuedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-100 mt-4">
                    <span className="text-emerald-800 font-bold">Total Amount Paid:</span>
                    <span className="font-display text-xl font-bold text-emerald-700">{formatAED(selectedReceipt.amountPaid)}</span>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                  <p>Thank you for your payment! Keep this receipt for your records.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
