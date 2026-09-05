import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  ShieldCheck, Search, Filter, Calendar, User,
  Activity, ArrowRight, RefreshCw, Layers
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export default function AuditExplorer() {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [entityType, setEntityType] = useState('');
  const [actionType, setActionType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const res = await managementService.getAuditExplorer({
        entityType,
        type: actionType,
        page,
        limit: 20,
      });
      setActivities(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs', err);
      toast.error('Failed to load audit explorer logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [entityType, actionType, page]);

  const entityOptions = [
    { label: 'All Entities', value: 'All Entities' },
    { label: 'Lead', value: 'Lead' },
    { label: 'Student', value: 'Customer' },
    { label: 'Booking', value: 'Booking' },
    { label: 'Invoice', value: 'Invoice' },
    { label: 'Schedule', value: 'Schedule' },
    { label: 'User', value: 'User' },
  ];
  const actionOptions = ['All Actions', 'created', 'stage_change', 'assignment', 'note', 'call', 'payment_link'];

  const filteredActivities = activities.filter((a) => {
    const term = searchTerm.toLowerCase();
    const str = JSON.stringify(a).toLowerCase();
    return str.includes(term);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Activity &amp; Audit Trail Explorer
            </h1>
            <p className="text-xs text-slate-500">
              Immutable audit history of CRM stage changes, financial events, staff assignments, and operational updates.
            </p>
          </div>
          <button
            onClick={fetchAudit}
            className="p-2 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Audit"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Entity Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value === 'All Entities' ? '' : e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
            >
              {entityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value === 'All Actions' ? '' : e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
            >
              {actionOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search description, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Audit Log Stream */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-marine">System Activity Records ({total} Total)</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Page {page}</span>
            </div>

            {isLoading ? (
              <div className="py-16 flex justify-center text-slate-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-marine border-t-transparent"></div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No matching activity log events found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredActivities.map((act) => (
                  <div key={act._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-marine/5 text-marine shrink-0 mt-0.5">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                            {act.entityType}
                          </span>
                          <span className="text-xs font-bold text-marine">{act.type}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.description || 'System state update recorded.'}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-mono">
                          <span>By: <strong>{act.performedBy?.fullName || 'System Event'}</strong></span>
                          <span>•</span>
                          <span>{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-500 font-medium">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={filteredActivities.length < 20}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
