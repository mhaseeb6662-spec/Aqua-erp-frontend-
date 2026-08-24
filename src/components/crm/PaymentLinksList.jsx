import { Copy, ExternalLink, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../../services/paymentService';
import PaymentStatusBadge from './PaymentStatusBadge';

export default function PaymentLinksList({ links, onChange, canManage }) {
  const copyLink = (url) => {
    navigator.clipboard?.writeText(url);
    toast.success('Link copied to clipboard.');
  };

  const cancelLink = async (id) => {
    try {
      await paymentService.cancelPaymentLink(id);
      toast.success('Payment link cancelled.');
      onChange();
    } catch (err) {
      toast.error('Failed to cancel payment link.');
    }
  };

  if (!links?.length) {
    return <p className="py-6 text-center text-sm text-ink/40">No payment links generated yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {links.map((l) => (
        <div key={l._id} className="flex items-center justify-between gap-3 rounded-xl border border-marine/[0.06] px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-marine">Rs. {Number(l.amount).toLocaleString()}</p>
              <PaymentStatusBadge status={l.status} />
            </div>
            <p className="mt-0.5 truncate text-sm text-ink/60">{l.description}</p>
            <p className="mt-0.5 truncate font-mono text-xs text-tide">{l.url}</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              className="rounded-lg p-2 text-ink/40 hover:bg-tide/10 hover:text-tide"
              title="Copy link"
              onClick={() => copyLink(l.url)}
            >
              <Copy className="h-4 w-4" />
            </button>
            <a
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-ink/40 hover:bg-tide/10 hover:text-tide"
              title="Open link"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            {canManage && l.status === 'pending' && (
              <button
                className="rounded-lg p-2 text-ink/40 hover:bg-coral/10 hover:text-coral"
                title="Cancel link"
                onClick={() => cancelLink(l._id)}
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
