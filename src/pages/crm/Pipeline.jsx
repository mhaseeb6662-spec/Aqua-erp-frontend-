import { useCallback, useEffect, useState } from 'react';
import { Search, ArrowUpDown, Plus, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import LeadCard from '../../components/crm/LeadCard';
import LeadFormModal from '../../components/crm/LeadFormModal';
import LeadImportModal from '../../components/crm/LeadImportModal';
import leadService from '../../services/leadService';
import salesTeamService from '../../services/salesTeamService';
import { PIPELINE_STAGES, STAGE_STYLES, LEAD_SOURCES } from '../../constants/crm';
import { useAuth } from '../../context/AuthContext';

export default function Pipeline() {
  const { hasPermission, user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [salesTeam, setSalesTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [dateSort, setDateSort] = useState('newest'); // 'newest' | 'oldest' | 'recent_update' | 'least_recent_update'
  const [dragOverStage, setDragOverStage] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const canUpdateStage = hasPermission('crm:pipeline:update');

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      let sortBy = 'createdAt';
      let sortOrder = 'desc';
      if (dateSort === 'oldest') {
        sortBy = 'createdAt';
        sortOrder = 'asc';
      } else if (dateSort === 'recent_update') {
        sortBy = 'updatedAt';
        sortOrder = 'desc';
      } else if (dateSort === 'least_recent_update') {
        sortBy = 'updatedAt';
        sortOrder = 'asc';
      }

      const res = await leadService.exportLeadsCsv({
        search,
        source,
        sortBy,
        sortOrder,
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `aqua-fishing-leads-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Pipeline leads exported to CSV successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export pipeline leads CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let sortBy = 'createdAt';
      let sortOrder = 'desc';
      if (dateSort === 'oldest') {
        sortBy = 'createdAt';
        sortOrder = 'asc';
      } else if (dateSort === 'recent_update') {
        sortBy = 'updatedAt';
        sortOrder = 'desc';
      } else if (dateSort === 'least_recent_update') {
        sortBy = 'updatedAt';
        sortOrder = 'asc';
      }

      const { data } = await leadService.getPipeline({
        search,
        source,
        sortBy,
        sortOrder,
      });
      setLeads(data.data || []);
    } catch (err) {
      toast.error('Failed to load the pipeline.');
    } finally {
      setLoading(false);
    }
  }, [search, source, dateSort]);

  const loadSalesTeam = useCallback(async () => {
    if (!hasPermission('crm:leads:create')) return;
    try {
      const { data } = await salesTeamService.getSalesTeam();
      setSalesTeam(data.data || []);
    } catch (err) {
      // silent fallback
    }
  }, [hasPermission]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadSalesTeam(); }, [loadSalesTeam]);

  // Client-side comparator to keep column cards strictly sorted by date (e.g. during local drag-and-drop)
  const sortLeadsComparator = (a, b) => {
    if (dateSort === 'oldest') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    if (dateSort === 'recent_update') {
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    }
    if (dateSort === 'least_recent_update') {
      return new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0);
    }
    // Default 'newest'
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  };

  const handleDrop = async (stageKey, e) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain');
    const lead = leads.find((l) => l._id === leadId);
    if (!lead || lead.stage === stageKey || !canUpdateStage) return;

    const prevLeads = leads;
    const updatedLead = { ...lead, stage: stageKey, updatedAt: new Date().toISOString() };
    setLeads((prev) => prev.map((l) => (l._id === leadId ? updatedLead : l)));
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

  if (loading && leads.length === 0) {
    return (
      <DashboardLayout title="Sales Pipeline">
        <Loader label="Loading pipeline..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sales Pipeline">
      {/* Top Filter & Sorting Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
            <input
              className="input-field pl-9"
              placeholder="Search pipeline leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Source Filter */}
          <select className="input-field w-auto" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">All sources</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Sort by Date Control */}
          <div className="flex items-center gap-1.5 bg-white border border-marine/[0.12] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:border-tide transition-colors">
            <ArrowUpDown className="h-4 w-4 text-tide shrink-0" />
            <select
              className="bg-transparent border-0 outline-none text-xs font-bold text-slate-800 cursor-pointer pr-1"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              title="Sort by Date"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="recent_update">Sort: Recently Updated</option>
              <option value="least_recent_update">Sort: Least Recently Updated</option>
            </select>
          </div>
        </div>

        {(hasPermission('crm:leads:create') || hasPermission('crm:leads:import') || hasPermission('crm:leads:view') || user?.role?.slug === 'super-admin' || user?.role?.slug === 'admin') && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExport}
              disabled={isExporting}
              title="Export filtered leads to CSV"
            >
              <Download className={`h-4 w-4 text-tide ${isExporting ? 'animate-bounce' : ''}`} />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setImportOpen(true)}
              title="Import Leads from CSV"
            >
              <Upload className="h-4 w-4 text-tide" />
              Import CSV
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Capture lead
            </button>
          </div>
        )}
      </div>

      <p className="mb-4 text-xs font-medium text-slate-500">
        {canUpdateStage ? 'Drag a lead card between columns to update its sales stage.' : 'Visual overview of every open lead across the sales pipeline.'}
      </p>

      {/* Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads
            .filter((l) => l.stage === stage.key)
            .sort(sortLeadsComparator);

          return (
            <div
              key={stage.key}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.key); }}
              onDragLeave={() => setDragOverStage((s) => (s === stage.key ? null : s))}
              onDrop={(e) => handleDrop(stage.key, e)}
              className={`flex w-72 flex-shrink-0 flex-col rounded-2xl border p-3 transition-colors shadow-2xs
                ${dragOverStage === stage.key ? 'border-tide bg-tide/[0.05] ring-2 ring-tide/20' : 'border-marine/[0.08] bg-slate-50/70'}`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <span className={`badge ${STAGE_STYLES[stage.key]}`}>{stage.label}</span>
                <span className="text-xs font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  {stageLeads.length}
                </span>
              </div>
              <div className="flex min-h-[80px] flex-1 flex-col gap-2.5">
                {stageLeads.length === 0 ? (
                  <div className="py-8 text-center text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/40">
                    No leads here
                  </div>
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

      {/* Lead Capture Modal */}
      <LeadFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); load(); }}
        salesTeam={salesTeam}
        editingLead={null}
      />

      {/* CSV Lead Import Wizard */}
      <ErrorBoundary title="Unable to open CSV Import modal. Please try again.">
        <LeadImportModal
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
          onImportComplete={load}
        />
      </ErrorBoundary>
    </DashboardLayout>
  );
}

