import { useCallback, useEffect, useState } from 'react';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import salesPerformanceService from '../../services/salesPerformanceService';
import { formatAED } from '../../utils/currency';
import { PIPELINE_STAGES, STAGE_STYLES } from '../../constants/crm';

const BAR_COLORS = ['bg-tide', 'bg-sandbar', 'bg-marine', 'bg-tide-light', 'bg-sandbar-dark', 'bg-coral'];

function BarRow({ label, value, max, colorClass, suffix = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-marine">{label}</span>
        <span className="text-ink/50">{value}{suffix}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-marine/[0.06]">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SalesPerformance() {
  const [overview, setOverview] = useState(null);
  const [byRep, setByRep] = useState([]);
  const [bySource, setBySource] = useState([]);
  const [byStage, setByStage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [filters, setFilters] = useState({
    range: 'all',
    startDate: '',
    endDate: ''
  });

  const load = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const [ov, rep, src, stage] = await Promise.all([
        salesPerformanceService.getOverview(filters),
        salesPerformanceService.getByRep(filters),
        salesPerformanceService.getBySource(filters),
        salesPerformanceService.getByStage(filters),
      ]);
      setOverview(ov.data.data);
      setByRep(rep.data.data);
      setBySource(src.data.data);
      setByStage(stage.data.data);
    } catch (err) {
      setHasError(true);
      toast.error('Unable to load pipeline analytics.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const maxRepRevenue = Math.max(1, ...byRep.map((r) => r.revenue || 0));
  const maxSourceLeads = Math.max(1, ...bySource.map((s) => s.leadCount || 0));
  const totalStageCount = byStage.reduce((sum, s) => sum + (s.count || 0), 0);
  const maxStageCount = Math.max(1, ...byStage.map((s) => s.count || 0));

  return (
    <DashboardLayout title="Sales Performance">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/50">Conversion, revenue and active pipeline health across the sales team.</p>
      </div>

      <div className="mb-6">
        <ManagementFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={load}
          isLoading={loading}
          showBranch={false}
          showProgram={false}
        />
      </div>

      {hasError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center justify-between">
          <span>Unable to load sales performance telemetry.</span>
          <button
            onClick={load}
            className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <Loader label="Crunching the numbers..." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tide/10 text-tide"><Users className="h-5.5 w-5.5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Total Leads</p>
                <p className="mt-0.5 text-2xl font-bold text-marine">{overview?.newLeads ?? 0}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Target className="h-5.5 w-5.5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Conversion rate</p>
                <p className="mt-0.5 text-2xl font-bold text-marine">{overview?.conversionRate != null ? `${overview.conversionRate}%` : '0%'}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sandbar/15 text-sandbar-dark"><DollarSign className="h-5.5 w-5.5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Revenue closed</p>
                <p className="mt-0.5 text-2xl font-bold text-marine">
                  {overview?.revenue != null ? formatAED(overview.revenue) : 'AED 0.00'}
                </p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-marine/10 text-marine"><TrendingUp className="h-5.5 w-5.5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Avg. deal size</p>
                <p className="mt-0.5 text-2xl font-bold text-marine">
                  {overview?.avgDealSize != null ? formatAED(overview.avgDealSize) : 'AED 0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="mb-4 text-base font-semibold text-marine">Revenue by sales rep</h3>
              <div className="space-y-4">
                {byRep.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink/40">No closed deals in this range.</p>
                ) : byRep.map((r, i) => (
                  <BarRow
                    key={r._id}
                    label={r.fullName}
                    value={r.revenue}
                    max={maxRepRevenue}
                    colorClass={BAR_COLORS[i % BAR_COLORS.length]}
                    suffix=" AED"
                  />
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="mb-4 text-base font-semibold text-marine">Leads by source</h3>
              <div className="space-y-4">
                {bySource.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink/40">No lead data in this range.</p>
                ) : bySource.map((s, i) => (
                  <BarRow
                    key={s.source}
                    label={s.source}
                    value={s.leadCount}
                    max={maxSourceLeads}
                    colorClass={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-marine">Pipeline Distribution</h3>
              <span className="text-xs font-bold text-slate-500">
                {totalStageCount} Active Leads Across All Stages
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {(byStage.length > 0 ? byStage : PIPELINE_STAGES).map((st) => {
                const stageKey = st.stage || st.key;
                const stageLabel = st.stageName || st.label || stageKey;
                const count = st.count ?? 0;
                const pct = totalStageCount > 0 ? Math.round((count / totalStageCount) * 100) : 0;
                const stageStyle = STAGE_STYLES[stageKey] || 'badge-neutral';
                return (
                  <div key={stageKey} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-center flex flex-col justify-between">
                    <div>
                      <span className={`badge ${stageStyle}`}>{stageLabel}</span>
                      <p className="mt-3 text-2xl font-bold text-marine font-mono">{count}</p>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-teal-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 mt-1 block">{pct}% of pipeline</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
