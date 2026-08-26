import { useCallback, useEffect, useState } from 'react';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
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
  const [range, setRange] = useState('30d');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, rep, src, stage] = await Promise.all([
        salesPerformanceService.getOverview({ range }),
        salesPerformanceService.getByRep({ range }),
        salesPerformanceService.getBySource({ range }),
        salesPerformanceService.getByStage({ range }),
      ]);
      setOverview(ov.data.data);
      setByRep(rep.data.data);
      setBySource(src.data.data);
      setByStage(stage.data.data);
    } catch (err) {
      toast.error('Failed to load sales performance data.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const maxRepRevenue = Math.max(1, ...byRep.map((r) => r.revenue || 0));
  const maxSourceLeads = Math.max(1, ...bySource.map((s) => s.leadCount || 0));
  const maxStageCount = Math.max(1, ...byStage.map((s) => s.count || 0));

  return (
    <DashboardLayout title="Sales Performance">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink/50">Conversion, revenue and pipeline health across the sales team.</p>
        <select className="input-field w-auto" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last quarter</option>
          <option value="year">This year</option>
        </select>
      </div>

      {loading ? (
        <Loader label="Crunching the numbers..." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tide/10 text-tide"><Users className="h-5.5 w-5.5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">New leads</p>
                <p className="mt-0.5 text-2xl font-bold text-marine">{overview?.newLeads ?? '—'}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Target className="h-5.5 w-5.5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Conversion rate</p>
                <p className="mt-0.5 text-2xl font-bold text-marine">{overview?.conversionRate != null ? `${overview.conversionRate}%` : '—'}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sandbar/15 text-sandbar-dark"><DollarSign className="h-5.5 w-5.5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Revenue closed</p>
                <p className="mt-0.5 text-2xl font-bold text-marine">
                  {overview?.revenue != null ? formatAED(overview.revenue) : '—'}
                </p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-marine/10 text-marine"><TrendingUp className="h-5.5 w-5.5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Avg. deal size</p>
                <p className="mt-0.5 text-2xl font-bold text-marine">
                  {overview?.avgDealSize != null ? formatAED(overview.avgDealSize) : '—'}
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
            <h3 className="mb-4 text-base font-semibold text-marine">Pipeline distribution</h3>
            <div className="flex flex-wrap gap-3">
              {PIPELINE_STAGES.map((stage) => {
                const found = byStage.find((s) => s.stage === stage.key);
                const count = found?.count ?? 0;
                const pct = maxStageCount > 0 ? Math.round((count / maxStageCount) * 100) : 0;
                return (
                  <div key={stage.key} className="flex-1 min-w-[120px] rounded-xl border border-marine/[0.06] p-3.5 text-center">
                    <span className={`badge ${STAGE_STYLES[stage.key]}`}>{stage.label}</span>
                    <p className="mt-3 text-xl font-bold text-marine">{count}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-marine/[0.06]">
                      <div className="h-full rounded-full bg-tide" style={{ width: `${pct}%` }} />
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
