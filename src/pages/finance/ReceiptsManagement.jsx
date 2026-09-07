import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import { formatAED } from '../../utils/currency';
import {
  FileCheck,
  Printer,
  Search,
  Download,
  Eye,
  X,
  CreditCard,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReceiptDocument from '../../components/finance/ReceiptDocument';
import html2pdf from 'html2pdf.js';

export default function ReceiptsManagement() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleOpenReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setShowModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!selectedReceipt) return;
    setIsDownloading(true);
    try {
      const element = document.getElementById('printable-receipt');
      if (!element) {
        toast.error('Receipt content not ready for PDF generation');
        return;
      }

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `receipt-${selectedReceipt.receiptNumber || 'AFA'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('Receipt PDF downloaded successfully');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to generate receipt PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  // Dynamic search filtering
  const filteredReceipts = receipts.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const rNum = (r.receiptNumber || '').toLowerCase();
    const invNum = (r.invoice?.invoiceNumber || '').toLowerCase();
    const custName = (r.customer?.fullName || '').toLowerCase();
    const method = (r.paymentMethod || '').toLowerCase();
    return (
      rNum.includes(term) ||
      invNum.includes(term) ||
      custName.includes(term) ||
      method.includes(term)
    );
  });

  const totalReceiptsCount = receipts.length;
  const totalAmountCollected = receipts.reduce(
    (sum, r) => sum + Number(r.amountPaid || 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Receipt Management
            </h1>
            <p className="text-sm text-slate-500">
              Official payment receipt ledger (`RCT-XXXXXX`), customer proof of payment, PDF generation &amp; printing.
            </p>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Receipts Issued
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-marine">
                {totalReceiptsCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tide/10 text-tide">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Amount Collected
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-600">
                {formatAED(totalAmountCollected)}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Filtered Matches
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-slate-700">
                {filteredReceipts.length}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Dynamic Search & Actions Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by receipt #, invoice ref, customer, or payment method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-10 text-xs focus:border-tide focus:outline-none focus:ring-1 focus:ring-tide"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredReceipts.length} of {receipts.length} receipts
          </div>
        </div>

        {/* Receipts Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center bg-white rounded-2xl border border-slate-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FileCheck className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">
              {receipts.length === 0 ? 'No Receipts Issued Yet' : 'No Receipts Match Your Search'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {receipts.length === 0
                ? 'Payment receipts are automatically generated when payments are completed.'
                : 'Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Receipt #</th>
                    <th className="px-6 py-4">Invoice Ref</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Date Paid</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReceipts.map((r) => {
                    const invRef = r.invoice?.invoiceNumber
                      ? (r.invoice.invoiceNumber.startsWith('AFA-') ? r.invoice.invoiceNumber : `AFA-${r.invoice.invoiceNumber}`)
                      : 'Direct';
                    const paidDate = r.paidAt || r.issuedAt || r.createdAt;
                    return (
                      <tr key={r._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleOpenReceipt(r)}
                            className="font-mono font-bold text-tide hover:underline"
                          >
                            {r.receiptNumber}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                          {invRef}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {r.customer?.fullName || '—'}
                          {r.customer?.phone && (
                            <span className="block text-[11px] font-normal text-slate-400">
                              {r.customer.phone}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 font-mono">
                          {formatAED(r.amountPaid)}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
                            {r.paymentMethod || 'Direct Payment'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {paidDate
                            ? new Date(paidDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenReceipt(r)}
                              className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition"
                              title="View Receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReceipt(r);
                                setShowModal(true);
                                setTimeout(() => window.print(), 300);
                              }}
                              className="rounded-lg bg-tide/10 p-2 text-tide hover:bg-tide/20 transition"
                              title="Print Receipt"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receipt Detail / Print Modal */}
        {showModal && selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[94vh] overflow-y-auto">
              {/* Modal Actions Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg font-bold text-marine">
                    Receipt #{selectedReceipt.receiptNumber}
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    PAID
                  </span>
                </div>

                <div className="flex items-center gap-2 no-print">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-tide px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-tide-dark transition"
                  >
                    <Printer className="h-4 w-4" /> Print
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition ml-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Exact Client-Reference Receipt Document */}
              <div className="mt-6 flex justify-center">
                <ReceiptDocument
                  receipt={selectedReceipt}
                  id="printable-receipt"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
