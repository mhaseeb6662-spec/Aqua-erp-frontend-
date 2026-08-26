import { X, ExternalLink, Calendar, User, CreditCard, ShieldCheck } from 'lucide-react';
import { formatAED } from '../../utils/currency';

export default function PaymentEvidenceModal({ payment, onClose }) {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-tide/10 p-2 text-tide">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-marine">POS Payment Evidence</h2>
              <p className="text-xs font-mono text-slate-500">{payment.transactionId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Evidence Image */}
        <div className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-center">
          {payment.evidenceUrl ? (
            <img
              src={payment.evidenceUrl}
              alt="Card Machine Slip"
              className="max-h-80 w-full object-contain mx-auto bg-slate-900/5 p-2 rounded-lg"
            />
          ) : (
            <div className="p-8 text-slate-400 text-xs font-medium">No receipt image attached</div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Amount Received:</span>
            <span className="font-bold text-emerald-600 text-sm">{formatAED(payment.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Method:</span>
            <span className="font-semibold text-slate-800">{payment.paymentMethod}</span>
          </div>
          {payment.approvalCode && (
            <div className="flex justify-between">
              <span className="text-slate-500">Approval Code / Ref:</span>
              <span className="font-mono font-bold text-tide">{payment.approvalCode}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Date:</span>
            <span className="text-slate-700">{new Date(payment.paidAt || Date.now()).toLocaleDateString()}</span>
          </div>
          {payment.recordedBy && (
            <div className="flex justify-between">
              <span className="text-slate-500">Recorded By:</span>
              <span className="text-slate-700 font-medium">{payment.recordedBy.fullName || 'Staff / Crew'}</span>
            </div>
          )}
          {payment.notes && (
            <div className="pt-2 border-t border-slate-200/60 text-slate-600">
              <span className="font-semibold text-slate-700">Remarks: </span>
              {payment.notes}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
