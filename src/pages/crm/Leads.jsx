import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, UserCheck, ChevronLeft, ChevronRight, Sparkles, ArrowUpDown, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import StageBadge from '../../components/crm/StageBadge';
import SourceBadge from '../../components/crm/SourceBadge';
import LeadFormModal from '../../components/crm/LeadFormModal';
import AssignLeadModal from '../../components/crm/AssignLeadModal';
import ConvertLeadModal from '../../components/crm/ConvertLeadModal';
import LeadImportModal from '../../components/crm/LeadImportModal';
import leadService from '../../services/leadService';
import salesTeamService from '../../services/salesTeamService';
import { LEAD_SOURCES, PIPELINE_STAGES } from '../../constants/crm';
import { useAuth } from '../../context/AuthContext';

export default function Leads() {
  const { hasPermission, user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [salesTeam, setSalesTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [stage, setStage] = useState('');
  const [datePeriod, setDatePeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateSort, setDateSort] = useState('newest'); // 'newest' | 'oldest' | 'recent_update' | 'least_recent_update'
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [convertTarget, setConvertTarget] = useState(null);

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
        stage,
        sortBy,
        sortOrder,
        datePeriod,
        startDate,
        endDate
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
      toast.success('Filtered leads exported to CSV successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export leads CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const loadLeads = useCallback(async () => {
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

      const { data } = await leadService.getLeads({
        search,
        source,
        stage,
        sortBy,
        sortOrder,
        page,
        limit: 10,
        datePeriod,
        startDate,
        endDate
      });
      setLeads(data.data);
      setMeta(data.meta);
    } catch (err) {
      toast.error('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [search, source, stage, dateSort, page, datePeriod, startDate, endDate]);

  const loadSalesTeam = useCallback(async () => {
    if (!hasPermission('crm:leads:assign') && !hasPermission('crm:sales-team:view')) {
      return;
    }
    try {
      const { data } = await salesTeamService.getSalesTeam();
      setSalesTeam(data.data || []);
    } catch (err) {
      console.warn('Could not load sales team list:', err?.message);
    }
  }, [hasPermission]);

  useEffect(() => { loadLeads(); }, [loadLeads]);
  useEffect(() => { loadSalesTeam(); }, [loadSalesTeam]);

  const handleDelete = async () => {
    try {
      await leadService.deleteLead(deleteTarget._id);
      toast.success('Lead deleted.');
      setDeleteTarget(null);
      loadLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead.');
    }
  };

  return (
    <DashboardLayout title="Leads">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
            <input
              className="input-field pl-9"
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input-field w-auto" value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }}>
            <option value="">All sources</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-field w-auto" value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }}>
            <option value="">All stages</option>
            {PIPELINE_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select className="input-field w-auto" value={datePeriod} onChange={(e) => { setDatePeriod(e.target.value); setPage(1); }}>
            <option value="">All Time</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
            <option value="Custom">Custom</option>
          </select>
          {datePeriod === 'Custom' && (
            <div className="flex items-center gap-2">
              <input type="date" className="input-field w-auto text-xs" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
              <span className="text-slate-400">-</span>
              <input type="date" className="input-field w-auto text-xs" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
            </div>
          )}

          {/* Sort by Date Control */}
          <div className="flex items-center gap-1.5 bg-white border border-marine/[0.12] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:border-tide transition-colors">
            <ArrowUpDown className="h-4 w-4 text-tide shrink-0" />
            <select
              className="bg-transparent border-0 outline-none text-xs font-bold text-slate-800 cursor-pointer pr-1"
              value={dateSort}
              onChange={(e) => {
                setDateSort(e.target.value);
                setPage(1);
              }}
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
              onClick={() => { setEditingLead(null); setFormOpen(true); }}
            >
              <Plus className="h-4 w-4" />
              Capture lead
            </button>
          </div>
        )}
      </div>

      <div className="card overflow-hidden !p-0">
        {loading ? (
          <Loader label="Loading leads..." />
        ) : leads.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink/50">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-marine/[0.06] bg-marine/[0.02] text-xs font-semibold uppercase tracking-wide text-ink/50">
                  <th className="px-6 py-3.5">Lead</th>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Stage</th>
                  <th className="px-6 py-3.5">Date Added</th>
                  <th className="px-6 py-3.5">Assigned to</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l._id} className="border-b border-marine/[0.04] last:border-0 hover:bg-marine/[0.015]">
                    <td className="px-6 py-3.5">
                      <Link to={`/leads/${l._id}`} className="font-medium text-marine hover:text-tide">{l.fullName}</Link>
                      <p className="text-xs text-ink/50">{l.phone}{l.email ? ` · ${l.email}` : ''}</p>
                    </td>
                    <td className="px-6 py-3.5"><SourceBadge source={l.source} /></td>
                    <td className="px-6 py-3.5"><StageBadge stage={l.stage} /></td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 block">
                        {l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {l.createdAt ? new Date(l.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-ink/70">{l.assignedTo?.fullName || '—'}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        {hasPermission('crm:leads:assign') && (
                          <button
                            className="rounded-lg p-2 text-ink/40 hover:bg-tide/10 hover:text-tide"
                            title="Assign"
                            onClick={() => setAssignTarget(l)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        {hasPermission('crm:leads:convert') && l.stage !== 'won' && l.stage !== 'lost' && (
                          <button
                            className="rounded-lg p-2 text-ink/40 hover:bg-emerald-50 hover:text-emerald-600"
                            title="Convert to student"
                            onClick={(e) => { e.stopPropagation(); setConvertTarget(l); }}
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>
                        )}
                        {hasPermission('crm:leads:update') && (
                          <button
                            className="rounded-lg p-2 text-ink/40 hover:bg-tide/10 hover:text-tide"
                            title="Edit"
                            onClick={() => { setEditingLead(l); setFormOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {hasPermission('crm:leads:delete') && (
                          <button
                            className="rounded-lg p-2 text-ink/40 hover:bg-coral/10 hover:text-coral"
                            title="Delete"
                            onClick={() => setDeleteTarget(l)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm text-ink/60">
          <p>{meta.total} lead{meta.total === 1 ? '' : 's'} total</p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !px-2.5 !py-2 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-marine">{page} / {meta.totalPages}</span>
            <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary !px-2.5 !py-2 disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <LeadFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); loadLeads(); }}
        salesTeam={salesTeam}
        editingLead={editingLead}
      />

      <AssignLeadModal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        onSaved={() => { setAssignTarget(null); loadLeads(); }}
        lead={assignTarget}
        salesTeam={salesTeam}
      />

      <ConvertLeadModal
        open={!!convertTarget}
        onClose={() => setConvertTarget(null)}
        onConverted={() => { setConvertTarget(null); loadLeads(); }}
        lead={convertTarget}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this lead?"
        message={`This will permanently remove "${deleteTarget?.fullName}" and its history. This cannot be undone.`}
        confirmLabel="Delete lead"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ErrorBoundary title="Unable to open CSV Import modal. Please try again.">
        <LeadImportModal
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
          onImportComplete={loadLeads}
        />
      </ErrorBoundary>
    </DashboardLayout>
  );
}
