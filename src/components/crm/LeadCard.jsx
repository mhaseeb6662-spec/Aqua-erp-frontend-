import { Link } from 'react-router-dom';
import { Phone, User } from 'lucide-react';
import SourceBadge from './SourceBadge';

export default function LeadCard({ lead, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      className="cursor-grab rounded-xl border border-marine/[0.07] bg-white p-3.5 shadow-sm transition-shadow hover:shadow-card active:cursor-grabbing"
    >
      <Link to={`/leads/${lead._id}`} className="block">
        <p className="truncate text-sm font-semibold text-marine hover:text-tide">{lead.fullName}</p>
      </Link>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/50">
        <Phone className="h-3 w-3" /> {lead.phone || '—'}
      </p>
      <div className="mt-2.5 flex items-center justify-between">
        <SourceBadge source={lead.source} />
        {lead.assignedTo?.fullName ? (
          <span className="flex items-center gap-1 text-xs font-medium text-ink/50" title={lead.assignedTo.fullName}>
            <User className="h-3 w-3" />
            {lead.assignedTo.fullName.split(' ')[0]}
          </span>
        ) : (
          <span className="text-xs font-medium text-coral/70">Unassigned</span>
        )}
      </div>
    </div>
  );
}
