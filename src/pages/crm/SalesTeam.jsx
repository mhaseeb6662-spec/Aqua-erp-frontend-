import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users2, Target, TrendingUp, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import salesTeamService from '../../services/salesTeamService';

export default function SalesTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await salesTeamService.getSalesTeam();
      setTeam(data.data);
    } catch (err) {
      toast.error('Failed to load the sales team.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout title="Sales Team">
      <p className="mb-6 text-sm text-ink/50">
        Workload and pipeline ownership across the sales team. New team members are added from Users &amp; Roles.
      </p>

      {loading ? (
        <Loader label="Loading sales team..." />
      ) : team.length === 0 ? (
        <div className="card py-16 text-center text-sm text-ink/50">No sales team members found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <div key={m._id} className="card">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tide/10 font-display text-base font-bold text-tide">
                  {m.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-marine">{m.fullName}</p>
                  <p className="truncate text-xs text-ink/50">{m.role?.name || 'Sales Rep'}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-mist p-2.5">
                  <p className="text-lg font-bold text-marine">{m.stats?.openLeads ?? '—'}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">Open leads</p>
                </div>
                <div className="rounded-lg bg-mist p-2.5">
                  <p className="text-lg font-bold text-marine">{m.stats?.customers ?? '—'}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">Students</p>
                </div>
                <div className="rounded-lg bg-mist p-2.5">
                  <p className="text-lg font-bold text-marine">{m.stats?.conversionRate != null ? `${m.stats.conversionRate}%` : '—'}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">Conversion</p>
                </div>
              </div>

              <Link
                to={`/leads?assignedTo=${m._id}`}
                className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-tide hover:text-tide-dark"
              >
                <Briefcase className="h-3.5 w-3.5" /> View assigned leads
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tide/10 text-tide"><Users2 className="h-5.5 w-5.5" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Team size</p>
            <p className="mt-0.5 text-2xl font-bold text-marine">{team.length || '—'}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sandbar/15 text-sandbar-dark"><Target className="h-5.5 w-5.5" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Total open leads</p>
            <p className="mt-0.5 text-2xl font-bold text-marine">
              {team.reduce((sum, m) => sum + (m.stats?.openLeads || 0), 0) || '—'}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><TrendingUp className="h-5.5 w-5.5" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Total students won</p>
            <p className="mt-0.5 text-2xl font-bold text-marine">
              {team.reduce((sum, m) => sum + (m.stats?.customers || 0), 0) || '—'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
