import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import KpiCard from '../../components/management/KpiCard';
import DrilldownModal from '../../components/management/DrilldownModal';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  Users, TrendingUp, UserCheck, Target,
  Share2, Award, ArrowUpRight, BarChart2, Filter
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export default function SalesAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    range: 'this_month',
    branchId: '',
    programId: '',
    startDate: '',
    endDate: '',
  });

  const [drilldownModal, setDrilldownModal] = useState({ isOpen: false, metricType: '', title: '' });

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await managementService.getSales(filters);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load sales analytics', err);
      toast.error('Failed to load sales analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const summary = data?.summary;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Sales Pipeline &amp; Commercial Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Commercial performance, inbound lead acquisition channels, conversion rates, and sales team league tables.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <ManagementFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={fetchSales}
          isLoading={isLoading}
        />

        {/* Top Funnel KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Inbound Leads"
            value={summary?.totalLeads || 0}
            unit="Inquiries"
            kpiId="KPI-LEAD-01"
            icon={Users}
            iconBg="bg-blue-50 text-blue-600"
            details="All acquisition channels"
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'leads', title: 'All Inbound Leads' })}
          />

          <KpiCard
            title="Won Conversions"
            value={summary?.wonLeads || 0}
            unit="Enrolled"
            kpiId="KPI-CONV-01"
            icon={UserCheck}
            iconBg="bg-emerald-50 text-emerald-600"
            details="Successfully enrolled students"
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'conversion', title: 'Won Leads Conversion' })}
          />

          <KpiCard
            title="Overall Conversion Rate"
            value={summary?.conversionRate || 0}
            unit="%"
            kpiId="KPI-CONVRATE-01"
            icon={TrendingUp}
            iconBg="bg-purple-50 text-purple-600"
            details="Lead-to-Booking conversion"
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'conversion', title: 'Converted Inquiries' })}
          />

          <KpiCard
            title="Active In Pipeline"
            value={summary?.inPipeline || 0}
            unit="In Negotiation"
            kpiId="KPI-PIPE-01"
            icon={Target}
            iconBg="bg-amber-50 text-amber-600"
            details="Currently in sales follow-up"
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'leads', title: 'Active Pipeline Leads' })}
          />
        </div>

        {/* Middle Section: Channel Attribution & Pipeline Distribution */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Marketing Source Attribution */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-marine">Marketing Channel Attribution</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-600">By Channel</span>
              </div>

              {isLoading ? (
                <div className="py-12 flex justify-center text-slate-500">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-marine border-t-transparent"></div>
                </div>
              ) : !data?.leadsBySource || data.leadsBySource.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center font-medium">No source attribution data in period.</p>
              ) : (
                <div className="space-y-3">
                  {data.leadsBySource.map((s) => {
                    const percent = summary?.totalLeads > 0 ? Math.round((s.count / summary.totalLeads) * 100) : 0;
                    return (
                      <div key={s.source} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-marine">{s.source}</span>
                          <span className="font-mono font-bold text-slate-700">{s.count} leads ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>Won: {s.wonCount}</span>
                          <span>Channel Conversion: <strong>{s.conversionRate}%</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline Stage Distribution */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-marine">Pipeline Stage Distribution</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-600">CRM Stages</span>
              </div>

              {isLoading ? (
                <div className="py-12 flex justify-center text-slate-500">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-marine border-t-transparent"></div>
                </div>
              ) : !data?.leadsByStage || data.leadsByStage.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center font-medium">No stage distribution recorded.</p>
              ) : (
                <div className="space-y-3">
                  {data.leadsByStage.map((st) => {
                    const percent = summary?.totalLeads > 0 ? Math.round((st.count / summary.totalLeads) * 100) : 0;
                    return (
                      <div key={st.stage} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-marine capitalize">{st.stage}</span>
                          <span className="font-mono font-bold text-slate-700">{st.count} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sales Team League Table */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Award className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-marine">Sales Representative League Table</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-600">Conversion Leaderboard</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5 font-bold">Representative</th>
                    <th className="pb-2.5 font-bold">Email</th>
                    <th className="pb-2.5 font-bold text-center">Assigned Leads</th>
                    <th className="pb-2.5 font-bold text-center">Won Enrolments</th>
                    <th className="pb-2.5 font-bold text-right">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.salesReps || []).map((rep, idx) => (
                    <tr key={rep.repId || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 font-bold text-marine flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-marine text-[10px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <span>{rep.name}</span>
                      </td>
                      <td className="py-2.5 text-slate-500">{rep.email}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-slate-700">{rep.totalAssigned}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-emerald-600">{rep.wonCount}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-marine">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          {rep.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drilldown Modal */}
      <DrilldownModal
        isOpen={drilldownModal.isOpen}
        onClose={() => setDrilldownModal({ isOpen: false, metricType: '', title: '' })}
        metricType={drilldownModal.metricType}
        title={drilldownModal.title}
        filters={filters}
      />
    </DashboardLayout>
  );
}
