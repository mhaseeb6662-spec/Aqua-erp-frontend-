import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import KpiCard from '../../components/management/KpiCard';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  Building, DollarSign, CalendarDays, Ship,
  TrendingUp, CheckCircle2, Layers, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export default function BranchPerformance() {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    range: 'this_month',
    startDate: '',
    endDate: '',
  });

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const res = await managementService.getBranches(filters);
      setBranches(res.data.data.branches || []);
    } catch (err) {
      console.error('Failed to load branch performance', err);
      toast.error('Failed to load branch performance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [filters]);

  const totalRevenue = branches.reduce((acc, b) => acc + (b.revenue || 0), 0);
  const totalCollected = branches.reduce((acc, b) => acc + (b.collected || 0), 0);
  const totalBookings = branches.reduce((acc, b) => acc + (b.bookingsCount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Multi-Branch Performance &amp; Margins
            </h1>
            <p className="text-xs text-slate-500">
              Comparative commercial and operational benchmarks across Dubai, Fujairah, and future regional academy branches.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <ManagementFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={fetchBranches}
          isLoading={isLoading}
        />

        {/* Top Branch Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Total Network Revenue"
            value={totalRevenue}
            unit="AED"
            kpiId="KPI-NET-01"
            icon={DollarSign}
            iconBg="bg-blue-50 text-blue-600"
            details="All branches combined"
          />

          <KpiCard
            title="Cash Collections"
            value={totalCollected}
            unit="AED"
            kpiId="KPI-NETCASH-01"
            icon={TrendingUp}
            iconBg="bg-emerald-50 text-emerald-600"
            details="Total funds settled"
          />

          <KpiCard
            title="Network Bookings"
            value={totalBookings}
            unit="Students"
            kpiId="KPI-NETBOOK-01"
            icon={Building}
            iconBg="bg-purple-50 text-purple-600"
            details="Active branch enrollments"
          />
        </div>

        {/* Dynamic Branch Comparison Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {isLoading ? (
            <div className="col-span-full py-16 flex justify-center text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent"></div>
            </div>
          ) : branches.length === 0 ? (
            <p className="col-span-full text-xs text-slate-400 py-12 text-center">No branches registered.</p>
          ) : (
            branches.map((b) => (
              <Card key={b.branchId} className="bg-white border-slate-200 shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-marine text-white">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-marine">{b.name}</h3>
                        <span className="text-xs text-slate-400 font-mono">{b.city} • Code: {b.code}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                      {b.marginPercent}% Estimated Margin
                    </span>
                  </div>

                  {/* Branch Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Gross Billed</span>
                      <p className="text-sm font-bold font-mono text-marine">AED {b.revenue.toLocaleString()}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Cash Collected</span>
                      <p className="text-sm font-bold font-mono text-emerald-600">AED {b.collected.toLocaleString()}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Student Bookings</span>
                      <p className="text-sm font-bold font-mono text-slate-700">{b.bookingsCount} bookings</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Sessions &amp; Trips</span>
                      <p className="text-sm font-bold font-mono text-slate-700">{b.sessionsCount} sessions</p>
                    </div>
                  </div>

                  {/* Cost & Estimated Margin Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Direct Costs (35%):</span>
                      <span className="font-mono text-slate-700">AED {b.estimatedDirectCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-marine">Operating Gross Margin:</span>
                      <span className="font-mono font-bold text-emerald-600">AED {b.estimatedMargin.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
