import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Plus, MessageSquarePlus, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import SourceBadge from '../../components/crm/SourceBadge';
import FollowUpFormModal from '../../components/crm/FollowUpFormModal';
import FollowUpList from '../../components/crm/FollowUpList';
import ActivityTimeline from '../../components/crm/ActivityTimeline';
import LogInteractionModal from '../../components/crm/LogInteractionModal';
import PaymentLinkModal from '../../components/crm/PaymentLinkModal';
import PaymentLinksList from '../../components/crm/PaymentLinksList';
import customerService from '../../services/customerService';
import followUpService from '../../services/followUpService';
import activityService from '../../services/activityService';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [logOpen, setLogOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, followUpsRes, activitiesRes, paymentsRes] = await Promise.all([
        customerService.getCustomer(id),
        followUpService.getFollowUps('customer', id),
        activityService.getActivities('customer', id),
        paymentService.getPaymentLinks(id),
      ]);
      setCustomer(custRes.data.data);
      setFollowUps(followUpsRes.data.data);
      setActivities(activitiesRes.data.data);
      setPaymentLinks(paymentsRes.data.data);
    } catch (err) {
      toast.error('Failed to load customer.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <DashboardLayout title="Customer"><Loader label="Loading customer..." /></DashboardLayout>;
  if (!customer) return <DashboardLayout title="Customer"><p className="text-sm text-ink/50">Customer not found.</p></DashboardLayout>;

  return (
    <DashboardLayout title="Customer detail">
      <button onClick={() => navigate('/customers')} className="mb-5 flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-tide">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="card">
            <h2 className="font-display text-xl font-bold text-marine">{customer.fullName}</h2>
            <div className="mt-3 space-y-2.5 text-sm">
              <p className="flex items-center gap-2 text-ink/70"><Phone className="h-4 w-4 text-ink/40" /> {customer.phone || '—'}</p>
              <p className="flex items-center gap-2 text-ink/70"><Mail className="h-4 w-4 text-ink/40" /> {customer.email || '—'}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">Original source</span>
                <SourceBadge source={customer.source} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">Sales rep</span>
                <span className="font-medium text-marine">{customer.assignedTo?.fullName || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">Customer since</span>
                <span className="font-medium text-marine">
                  {customer.convertedAt ? new Date(customer.convertedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-marine">
                <Link2 className="h-4 w-4 text-tide" /> Payment links
              </h3>
              {hasPermission('crm:payments:create') && (
                <button className="btn-secondary !py-2 !px-3 text-xs" onClick={() => setPaymentOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Generate
                </button>
              )}
            </div>
            <PaymentLinksList links={paymentLinks} onChange={load} canManage={hasPermission('crm:payments:create')} />
          </div>
        </div>

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
                <p className="text-xs text-ink/50">Complete interaction history for this customer.</p>
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

      <FollowUpFormModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        onSaved={() => { setFollowUpOpen(false); load(); }}
        entityType="customer"
        entityId={id}
        editingFollowUp={editingFollowUp}
      />
      <LogInteractionModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onSaved={() => { setLogOpen(false); load(); }}
        entityType="customer"
        entityId={id}
      />
      <PaymentLinkModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSaved={() => { setPaymentOpen(false); load(); }}
        customerId={id}
      />
    </DashboardLayout>
  );
}
