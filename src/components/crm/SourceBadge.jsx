import { Megaphone, Search, MessageCircle } from 'lucide-react';

// Distinct styling for the auto-captured webhook sources so they stand out
// from manually-entered leads at a glance across the Leads table, Kanban
// cards and Lead/Customer detail pages.
const SOURCE_STYLES = {
  'Facebook Ads': { className: 'bg-blue-50 text-blue-800 border border-blue-200 font-bold', icon: Megaphone },
  'Google Ads': { className: 'bg-amber-50 text-amber-900 border border-amber-200 font-bold', icon: Search },
  WhatsApp: { className: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold', icon: MessageCircle },
};

export default function SourceBadge({ source }) {
  if (!source) return <span className="text-slate-400 font-mono">—</span>;

  const style = SOURCE_STYLES[source];
  const Icon = style?.icon;

  return (
    <span className={`badge inline-flex items-center gap-1 ${style?.className || 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold'}`}>
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.25} />}
      {source}
    </span>
  );
}
