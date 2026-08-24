import { Phone, Mail, Users, MessageCircle, StickyNote, ArrowRightLeft, UserCheck, Sparkles, Link2 } from 'lucide-react';
import { ACTIVITY_TYPES } from '../../constants/crm';

const ICONS = {
  note: StickyNote,
  call: Phone,
  email: Mail,
  meeting: Users,
  whatsapp: MessageCircle,
  stage_change: ArrowRightLeft,
  assignment: UserCheck,
  conversion: Sparkles,
  payment_link: Link2,
};

export default function ActivityTimeline({ activities }) {
  if (!activities?.length) {
    return <p className="py-6 text-center text-sm text-slate-500 font-medium">No activity logged yet.</p>;
  }

  return (
    <div className="relative space-y-0">
      {activities.map((a, idx) => {
        const Icon = ICONS[a.type] || StickyNote;
        const meta = ACTIVITY_TYPES[a.type] || { label: a.type, color: 'text-slate-700' };
        const isLast = idx === activities.length - 1;
        return (
          <div key={a._id || idx} className="relative flex gap-3 pb-5">
            {!isLast && <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-slate-200" />}
            <span className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white">
              <Icon className={`h-4 w-4 ${meta.color}`} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-bold text-marine">{meta.label}</p>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(a.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              {a.description && <p className="mt-0.5 text-sm text-slate-700">{a.description}</p>}
              {a.performedBy?.fullName && (
                <p className="mt-0.5 text-xs text-slate-500 font-medium">by {a.performedBy.fullName}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
