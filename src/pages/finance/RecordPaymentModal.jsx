import { useState, useRef } from 'react';
import { X, CreditCard, Upload, Camera, Trash2, CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import financeService from '../../services/financeService';
import { formatAED } from '../../utils/currency';

export default function RecordPaymentModal({ invoice, onClose, onSuccess }) {
  const [amount, setAmount] = useState(invoice?.balanceDue || 0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Physical Card / POS Machine');
  const [approvalCode, setApprovalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt image state
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [evidenceData, setEvidenceData] = useState({
    url: '',
    fileName: '',
    mimeType: '',
    fileSize: 0,
  });

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload a valid image file (JPG, PNG, WebP)');
    }

    if (file.size > 10 * 1024 * 1024) {
      return toast.error('Receipt image must be smaller than 10MB');
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64Str = loadEvent.target.result;
      setEvidencePreview(base64Str);
      setEvidenceData({
        url: base64Str,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setEvidencePreview(null);
    setEvidenceData({ url: '', fileName: '', mimeType: '', fileSize: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return toast.error('Please enter a valid payment amount greater than 0');
    }

    if (numAmount > invoice.balanceDue) {
      return toast.error(`Amount cannot exceed outstanding balance of ${formatAED(invoice.balanceDue)}`);
    }

    if (paymentMethod === 'Physical Card / POS Machine' && !evidencePreview) {
      const proceedWithout = window.confirm(
        'Warning: No card-machine receipt photo uploaded. Proceed with recording this POS transaction anyway?'
      );
      if (!proceedWithout) return;
    }

    setIsSubmitting(true);
    try {
      await financeService.recordPayment({
        invoiceId: invoice._id,
        amount: numAmount,
        paymentMethod,
        paymentDate,
        approvalCode: approvalCode.trim(),
        evidenceUrl: evidenceData.url,
        evidenceMetadata: {
          fileName: evidenceData.fileName,
          mimeType: evidenceData.mimeType,
          fileSize: evidenceData.fileSize,
        },
        notes: notes.trim(),
      });

      toast.success('Payment recorded successfully and receipt issued!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-tide/10 p-2 text-tide">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-marine">Record Payment</h2>
              <p className="text-xs font-mono text-slate-500">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Invoice Summary Box */}
        <div className="my-5 rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-medium">Customer / Payer:</span>
            <span className="font-bold text-slate-800">{invoice.customer?.fullName || 'Customer'}</span>
          </div>
          {invoice.student?.fullName && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Student:</span>
              <span className="font-semibold text-slate-700">{invoice.student.fullName}</span>
            </div>
          )}
          <div className="flex justify-between text-xs pt-1 border-t border-slate-200/60">
            <span className="text-slate-500">Total Invoice Amount:</span>
            <span className="font-medium text-slate-700">{formatAED(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Amount Paid so far:</span>
            <span className="font-medium text-emerald-600">{formatAED(invoice.amountPaid || 0)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200/60">
            <span className="text-marine">Outstanding Balance Due:</span>
            <span className="text-amber-600">{formatAED(invoice.balanceDue)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Received */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Amount Received (AED) *
              </label>
              <button
                type="button"
                onClick={() => setAmount(invoice.balanceDue)}
                className="text-[11px] font-bold text-tide hover:underline"
              >
                Pay Full Balance ({formatAED(invoice.balanceDue)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                AED
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.balanceDue}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:border-tide focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:border-tide focus:outline-none bg-white"
              >
                <option value="Physical Card / POS Machine">Physical Card / POS Machine</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card (Manual)</option>
                <option value="Online Payment">Online Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-tide focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Specific Physical Card / POS Machine Fields */}
          {paymentMethod === 'Physical Card / POS Machine' && (
            <div className="space-y-3 rounded-xl bg-sky-50/50 p-3.5 border border-sky-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  POS Approval Code / Transaction Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. AUTH-882194 or POS Ref #"
                  value={approvalCode}
                  onChange={(e) => setApprovalCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-tide focus:outline-none bg-white"
                />
              </div>

              {/* Card Machine Receipt Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Card Machine Receipt Photo
                </label>
                
                {evidencePreview ? (
                  <div className="relative rounded-xl border border-slate-200 bg-white p-2.5 flex items-center gap-3">
                    <img
                      src={evidencePreview}
                      alt="POS Receipt Preview"
                      className="h-16 w-16 object-cover rounded-lg border border-slate-100"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-slate-800 truncate">{evidenceData.fileName || 'Receipt Photo'}</p>
                      <p className="text-[11px] text-slate-500">{(evidenceData.fileSize / 1024).toFixed(1)} KB</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Ready to save
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-sky-200 rounded-xl bg-white hover:bg-sky-50/50 cursor-pointer transition text-center"
                  >
                    <div className="flex gap-2 text-tide mb-1">
                      <Camera className="h-5 w-5" />
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Take Photo or Upload Slip</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports Camera capture on mobile / JPG, PNG</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes / Terminal Remarks (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Dubai Marina POS Terminal #03"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-tide focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Record Payment ({formatAED(Number(amount) || 0)})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
