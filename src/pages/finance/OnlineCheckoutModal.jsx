import { useState, useEffect } from 'react';
import { formatAED } from '../../utils/currency';
import { X, CreditCard, Lock, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';

export default function OnlineCheckoutModal({ invoice, onClose, onSuccess, customReturnUrl }) {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await paymentService.getAvailableProviders();
        const available = res.data?.data || [];
        // Add manual generic as fallback if testing
        if (available.length === 0) available.push('Tabby', 'PayTabs', 'TotalPay');
        setProviders(available);
        setSelectedProvider(available[0]);
      } catch (err) {
        setProviders(['Tabby', 'PayTabs', 'TotalPay']);
        setSelectedProvider('Tabby');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return toast.error('Please select a provider');
    
    setIsProcessing(true);
    try {
      const res = await paymentService.createCheckoutSession({
        invoiceId: invoice._id,
        providerName: selectedProvider,
        returnUrl: customReturnUrl || window.location.href
      });
      
      const { checkoutUrl } = res.data.data;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error('Provider did not return a checkout URL');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" disabled={isProcessing}>
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

        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-500 font-semibold">Loading gateways...</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Select Payment Gateway</label>
              <div className="mt-1.5 flex flex-col gap-2">
                {providers.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedProvider(method)}
                    className={`rounded-xl p-3 text-sm font-bold border text-left flex items-center justify-between transition ${
                      selectedProvider === method
                        ? 'border-tide bg-tide/10 text-tide shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{method} Secure Checkout</span>
                    {selectedProvider === method && <CheckCircle2 className="h-5 w-5" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-marine py-3 text-sm font-bold text-white shadow-sm hover:bg-marine-light disabled:opacity-70 transition"
            >
              {isProcessing ? (
                <>Redirecting to {selectedProvider}...</>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Pay {formatAED(invoice.balanceDue)} with {selectedProvider}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
