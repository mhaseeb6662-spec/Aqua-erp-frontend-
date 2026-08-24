import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import LeadCard from '../../components/crm/LeadCard';
import leadService from '../../services/leadService';
import { PIPELINE_STAGES, STAGE_STYLES } from '../../constants/crm';
import { useAuth } from '../../context/AuthContext';

export default function Pipeline() {
  const { hasPermission } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragOverStage, setDragOverStage] = useState(null);
  const canUpdateStage = hasPermission('crm:pipeline:update');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await leadService.getPipeline();
      setLeads(data.data);
    } catch (err) {
      toast.error('Failed to load the pipeline.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDrop = async (stageKey, e) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain');
    const lead = leads.find((l) => l._id === leadId);
    if (!lead || lead.stage === stageKey || !canUpdateStage) return;

    const prevLeads = leads;
    setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, stage: stageKey } : l)));
    try {
      await leadService.updateStage(leadId, stageKey);
    } catch (err) {
      setLeads(prevLeads);
      toast.error('Failed to move lead.');
    }
  };

  const onDragStart = (e, lead) => {
    e.dataTransfer.setData('text/plain', lead._id);
  };

  if (loading) return <DashboardLayout title="Sales Pipeline"><Loader label="Loading pipeline..." /></DashboardLayout>;

  return (
    <DashboardLayout title="Sales Pipeline">
      <p className="mb-5 text-sm text-ink/50">
        {canUpdateStage ? 'Drag a lead card between columns to update its sales stage.' : 'Visual overview of every open lead across the sales pipeline.'}
      </p>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.key);
          return (
            <div
              key={stage.key}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.key); }}
              onDragLeave={() => setDragOverStage((s) => (s === stage.key ? null : s))}
              onDrop={(e) => handleDrop(stage.key, e)}
              className={`flex w-72 flex-shrink-0 flex-col rounded-2xl border p-3 transition-colors
                ${dragOverStage === stage.key ? 'border-tide bg-tide/[0.04]' : 'border-marine/[0.06] bg-marine/[0.015]'}`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <span className={`badge ${STAGE_STYLES[stage.key]}`}>{stage.label}</span>
                <span className="text-xs font-semibold text-ink/40">{stageLeads.length}</span>
              </div>
              <div className="flex min-h-[80px] flex-1 flex-col gap-2.5">
                {stageLeads.length === 0 ? (
                  <p className="py-6 text-center text-xs text-ink/30">No leads here</p>
                ) : (
                  stageLeads.map((lead) => (
                    <LeadCard key={lead._id} lead={lead} onDragStart={onDragStart} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
