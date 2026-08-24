import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, UserCheck, Sparkles, Plus, MessageSquarePlus, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import StageBadge from '../../components/crm/StageBadge';
import SourceBadge from '../../components/crm/SourceBadge';
import LeadFormModal from '../../components/crm/LeadFormModal';
import AssignLeadModal from '../../components/crm/AssignLeadModal';
import ConvertLeadModal from '../../components/crm/ConvertLeadModal';
import FollowUpFormModal from '../../components/crm/FollowUpFormModal';
import FollowUpList from '../../components/crm/FollowUpList';
import ActivityTimeline from '../../components/crm/ActivityTimeline';
import LogInteractionModal from '../../components/crm/LogInteractionModal';
import leadService from '../../services/leadService';
import followUpService from '../../services/followUpService';
import activityService from '../../services/activityService';
import salesTeamService from '../../services/salesTeamService';
import { PIPELINE_STAGES } from '../../constants/crm';
import { useAuth } from '../../context/AuthContext';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [lead, setLead] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [salesTeam, setSalesTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [logOpen, setLogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [leadRes, followUpsRes, activitiesRes] = await Promise.all([
        leadService.getLead(id),
        followUpService.getFollowUps('lead', id),
        activityService.getActivities('lead', id),
      ]);
      setLead(leadRes.data.data);
      setFollowUps(followUpsRes.data.data);
      setActivities(activitiesRes.data.data);
    } catch (err) {
      toast.error('Failed to load lead.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    salesTeamService.getSalesTeam().then(({ data }) => setSalesTeam(data.data)).catch(() => {});
  }, []);

  const handleStageChange = async (newStage) => {
    try {
      await leadService.updateStage(id, newStage);
      toast.success('Pipeline stage updated.');
      load();
    } catch (err) {
      toast.error('Failed to update stage.');
    }
  };

  if (loading) return <DashboardLayout title="Lead"><Loader label="Loading lead..." /></DashboardLayout>;
  if (!lead) return <DashboardLayout title="Lead"><p className="text-sm text-ink/50">Lead not found.</p></DashboardLayout>;

  const isClosed = lead.stage === 'won' || lead.stage === 'lost';

  return (
    <DashboardLayout title="Lead detail">
      <button onClick={() => navigate('/leads')} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-tide">
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: profile + pipeline */}
        <div className="space-y-6 lg:col-span-1">
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-marine">{lead.fullName}</h2>
                <div className="mt-2"><StageBadge stage={lead.stage} /></div>
              </div>
              {hasPermission('crm:leads:update') && (
                <button className="rounded-lg p-2 text-ink/40 hover:bg-tide/10 hover:text-tide" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-5 space-y-2.5 text-sm">
              <p className="flex items-center gap-2 text-ink/70"><Phone className="h-4 w-4 text-ink/40" /> {lead.phone || '—'}</p>
              <p className="flex items-center gap-2 text-ink/70"><Mail className="h-4 w-4 text-ink/40" /> {lead.email || '—'}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">Source</span>
                <SourceBadge source={lead.source} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">Assigned to</span>
                <span className="font-medium text-marine">{lead.assignedTo?.fullName || 'Unassigned'}</span>
              </div>
              {lead.interestedIn && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">Interested in</span>
                  <span className="font-medium text-marine">{lead.interestedIn}</span>
                </div>
              )}
            </div>

            {lead.notes && (
              <div className="mt-4 rounded-lg bg-mist p-3 text-sm text-ink/60">{lead.notes}</div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {hasPermission('crm:leads:assign') && (
                <button className="btn-secondary flex-1" onClick={() => setAssignOpen(true)}>
                  <UserCheck className="h-4 w-4" /> {lead.assignedTo ? 'Reassign' : 'Assign'}
                </button>
              )}
              {hasPermission('crm:leads:convert') && !isClosed && (
                <button className="btn-primary flex-1" onClick={() => setConvertOpen(true)}>
                  <Sparkles className="h-4 w-4" /> Convert
                </button>
              )}
            </div>
          </div>

          {!isClosed && hasPermission('crm:pipeline:update') && (
            <div className="card">
              <h3 className="text-sm font-semibold text-marine">Move stage</h3>
              <p className="mt-1 text-xs text-ink/50">Update where this lead sits in the sales pipeline.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PIPELINE_STAGES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleStageChange(s.key)}
                    disabled={s.key === lead.stage}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed
                      ${s.key === lead.stage ? 'border-tide bg-tide/10 text-tide-dark' : 'border-marine/10 text-ink/60 hover:border-tide/40 hover:text-tide'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: follow-ups + activity/interaction history */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-marine">Follow-ups</h3>
              {hasPermission('crm:followups:create') && (
                <button className="btn-secondary !py-2 !px-3 text-xs" onClick={() => { setEditingFollowUp(null); setFollowUpOpen(true); }}>
                  <Plus className="h-3.5 w-3.5" /> Schedule
                </button>
              )}
            </div>
            <FollowUpList
              followUps={followUps}
              onChange={load}
              onEdit={(f) => { setEditingFollowUp(f); setFollowUpOpen(true); }}
              canManage={hasPermission('crm:followups:update')}
            />
          </div>

          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-marine">Activity timeline</h3>
                <p className="text-xs text-ink/50">Full interaction history for this lead.</p>
              </div>
              {hasPermission('crm:activities:create') && (
                <button className="btn-secondary !py-2 !px-3 text-xs" onClick={() => setLogOpen(true)}>
                  <MessageSquarePlus className="h-3.5 w-3.5" /> Log interaction
                </button>
              )}
            </div>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>

      <LeadFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => { setEditOpen(false); load(); }}
        salesTeam={salesTeam}
        editingLead={lead}
      />
      <AssignLeadModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSaved={() => { setAssignOpen(false); load(); }}
        lead={lead}
        salesTeam={salesTeam}
      />
      <ConvertLeadModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        onConverted={(customer) => { setConvertOpen(false); navigate(`/customers/${customer._id}`); }}
        lead={lead}
      />
      <FollowUpFormModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        onSaved={() => { setFollowUpOpen(false); load(); }}
        entityType="lead"
        entityId={id}
        editingFollowUp={editingFollowUp}
      />
      <LogInteractionModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onSaved={() => { setLogOpen(false); load(); }}
        entityType="lead"
        entityId={id}
      />
    </DashboardLayout>
  );
}
