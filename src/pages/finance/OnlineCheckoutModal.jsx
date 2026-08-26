import { useState } from 'react';
import { formatAED } from '../../utils/currency';
import { X, CreditCard, Lock, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';

export default function OnlineCheckoutModal({ invoice, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState(invoice?.customer?.fullName || 'John Doe');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await financeService.processCheckout({
        invoiceId: invoice._id,
        amount: invoice.balanceDue,
        paymentMethod,
        cardDetails: { cardNumber, cardHolder, expiry, cvv },
      });
      toast.success('Payment completed successfully!');
      if (onSuccess) onSuccess(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-tide">Secure Checkout</span>
            <h2 className="font-display text-lg font-bold text-marine">Invoice {invoice.invoiceNumber}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Balance Due Amount</p>
            <p className="font-display text-2xl font-bold text-marine">{formatAED(invoice.balanceDue)}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            <Lock className="h-3.5 w-3.5" /> 256-Bit Encrypted
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Payment Gateway Method</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {['Credit Card', 'Stripe Gateway', 'PayPal'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-xl p-2.5 text-xs font-semibold border text-center transition ${
                    paymentMethod === method
                      ? 'border-tide bg-tide/10 text-tide shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Cardholder Name</label>
            <input
              type="text"
              required
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Card Number</label>
            <div className="relative mt-1">
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm font-mono focus:border-tide focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Expiry (MM/YY)</label>
              <input
                type="text"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-tide focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">CVV</label>
              <input
                type="password"
                required
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-tide focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-tide" /> PCI-DSS Verified Gateway
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-xl bg-tide px-5 py-2 text-sm font-bold text-white hover:bg-tide-dark disabled:opacity-50"
              >
                {isProcessing ? 'Processing Payment...' : `Pay Now (${formatAED(invoice.balanceDue)})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
