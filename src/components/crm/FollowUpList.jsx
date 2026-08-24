import { CalendarClock, CheckCircle2, Pencil, Trash2, Phone, Mail, Users, MessageCircle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import followUpService from '../../services/followUpService';

const TYPE_ICONS = {
  Call: Phone,
  Email: Mail,
  Meeting: Users,
  WhatsApp: MessageCircle,
  'Site Visit': MapPin,
};

export default function FollowUpList({ followUps, onChange, onEdit, canManage }) {
  const handleComplete = async (id) => {
    try {
      await followUpService.completeFollowUp(id);
      toast.success('Follow-up marked complete.');
      onChange();
    } catch (err) {
      toast.error('Failed to update follow-up.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await followUpService.deleteFollowUp(id);
      toast.success('Follow-up removed.');
      onChange();
    } catch (err) {
      toast.error('Failed to delete follow-up.');
    }
  };

  if (!followUps?.length) {
    return <p className="py-6 text-center text-sm text-ink/40">No follow-ups scheduled yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {followUps.map((f) => {
        const Icon = TYPE_ICONS[f.type] || CalendarClock;
        const overdue = f.status === 'pending' && new Date(f.dueDate) < new Date();
        return (
          <div
            key={f._id}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3
              ${f.status === 'completed' ? 'border-marine/[0.06] bg-marine/[0.02] opacity-60' :
                overdue ? 'border-coral/20 bg-coral/[0.03]' : 'border-marine/[0.06] bg-white'}`}
          >
            <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg
              ${overdue ? 'bg-coral/10 text-coral' : 'bg-tide/10 text-tide'}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-marine">{f.type}</p>
                <span className={`text-xs font-medium ${overdue ? 'text-coral' : 'text-ink/50'}`}>
                  {new Date(f.dueDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              {f.notes && <p className="mt-0.5 text-sm text-ink/60">{f.notes}</p>}
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink/40">
                {f.status === 'completed' ? 'Completed' : overdue ? 'Overdue' : 'Pending'}
              </p>
            </div>
            {canManage && (
              <div className="flex flex-shrink-0 items-center gap-1">
                {f.status !== 'completed' && (
                  <button
                    className="rounded-lg p-1.5 text-ink/40 hover:bg-tide/10 hover:text-tide"
                    title="Mark complete"
                    onClick={() => handleComplete(f._id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  className="rounded-lg p-1.5 text-ink/40 hover:bg-tide/10 hover:text-tide"
                  title="Edit"
                  onClick={() => onEdit(f)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="rounded-lg p-1.5 text-ink/40 hover:bg-coral/10 hover:text-coral"
                  title="Delete"
                  onClick={() => handleDelete(f._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
