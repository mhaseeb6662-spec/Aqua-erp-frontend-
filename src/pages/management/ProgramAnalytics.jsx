import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import KpiCard from '../../components/management/KpiCard';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  Layers, DollarSign, CalendarDays, Users,
  BarChart3, Award, TrendingUp, CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export default function ProgramAnalytics() {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    range: 'this_month',
    branchId: '',
  });

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const res = await managementService.getPrograms(filters);
      setPrograms(res.data.data || []);
    } catch (err) {
      console.error('Failed to load program analytics', err);
      toast.error('Failed to load program analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [filters]);

  const totalRevenue = programs.reduce((acc, p) => acc + (p.totalRevenue || 0), 0);
  const totalBookings = programs.reduce((acc, p) => acc + (p.totalBookings || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Program Rankings &amp; Occupancy Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Curriculum performance, revenue contribution, course capacity occupancy rates, and student retention.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <ManagementFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={fetchPrograms}
          isLoading={isLoading}
        />

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Total Curriculum Revenue"
            value={totalRevenue}
            unit="AED"
            kpiId="KPI-PRGREV-01"
            icon={DollarSign}
            iconBg="bg-blue-50 text-blue-600"
            details="All enrolled programs"
          />

          <KpiCard
            title="Total Program Bookings"
            value={totalBookings}
            unit="Enrolments"
            kpiId="KPI-PRGBOOK-01"
            icon={Users}
            iconBg="bg-emerald-50 text-emerald-600"
            details="Active student participants"
          />

          <KpiCard
            title="Active Programs"
            value={programs.length}
            unit="Courses"
            kpiId="KPI-PRGCOUNT-01"
            icon={Layers}
            iconBg="bg-purple-50 text-purple-600"
            details="Curriculum catalog"
          />
        </div>

        {/* Program Performance Table */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-marine">Program Performance Rankings</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-600">By Billed Revenue</span>
            </div>

            {isLoading ? (
              <div className="py-16 flex justify-center text-slate-500">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-marine border-t-transparent"></div>
              </div>
            ) : programs.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center font-medium">No program analytics found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-bold">Program Title</th>
                      <th className="pb-3 font-bold">Category</th>
                      <th className="pb-3 font-bold">Level</th>
                      <th className="pb-3 font-bold text-center">Bookings</th>
                      <th className="pb-3 font-bold text-center">Sessions</th>
                      <th className="pb-3 font-bold text-center">Occupancy Rate</th>
                      <th className="pb-3 font-bold text-right">Revenue (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {programs.map((p, idx) => (
                      <tr key={p.programId || idx} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 font-bold text-marine flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                            {idx + 1}
                          </span>
                          <span>{p.title}</span>
                        </td>
                        <td className="py-3 text-slate-600 font-medium">{p.category || 'General'}</td>
                        <td className="py-3 text-slate-600 font-medium">{p.level || 'All Levels'}</td>
                        <td className="py-3 text-center font-mono font-bold text-slate-800">{p.totalBookings}</td>
                        <td className="py-3 text-center font-mono text-slate-600 font-medium">{p.totalSessions}</td>
                        <td className="py-3 text-center font-mono font-bold text-marine">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                            {p.occupancyRate}%
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-marine">
                          AED {p.totalRevenue?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
