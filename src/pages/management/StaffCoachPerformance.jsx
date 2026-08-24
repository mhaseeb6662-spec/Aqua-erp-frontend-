import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import KpiCard from '../../components/management/KpiCard';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  Award, ShieldCheck, CheckSquare, Users,
  AlertTriangle, CheckCircle2, UserCheck, Activity
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export default function StaffCoachPerformance() {
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    range: 'this_month',
    branchId: '',
    programId: '',
  });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await managementService.getStaffCoaches(filters);
      setCoaches(res.data.data.coaches || []);
    } catch (err) {
      console.error('Failed to load coach scorecards', err);
      toast.error('Failed to load coach performance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [filters]);

  const totalAssigned = coaches.reduce((acc, c) => acc + (c.totalAssigned || 0), 0);
  const totalCompleted = coaches.reduce((acc, c) => acc + (c.completed || 0), 0);
  const compliantCount = coaches.filter((c) => c.complianceStatus === 'Compliant').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Coach &amp; Staff Balanced Scorecards
            </h1>
            <p className="text-xs text-slate-500">
              Instructor session delivery, roll-call attendance completion rates, maritime license compliance, and quality metrics.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <ManagementFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={fetchStaff}
          isLoading={isLoading}
        />

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Total Active Coaches"
            value={coaches.length}
            unit="Instructors"
            kpiId="KPI-COACH-01"
            icon={Users}
            iconBg="bg-blue-50 text-blue-600"
            details="Registered field staff"
          />

          <KpiCard
            title="Total Sessions Delivered"
            value={totalCompleted}
            unit="Completed"
            kpiId="KPI-COACHSESS-01"
            icon={Award}
            iconBg="bg-emerald-50 text-emerald-600"
            details={`Out of ${totalAssigned} assigned sessions`}
          />

          <KpiCard
            title="License &amp; CPR Compliance"
            value={compliantCount}
            unit={`/ ${coaches.length}`}
            kpiId="KPI-COMPLY-01"
            icon={ShieldCheck}
            iconBg="bg-purple-50 text-purple-600"
            details="Maritime & first-aid certifications"
          />
        </div>

        {/* Coach Balanced Scorecard Table */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-marine/10 text-marine">
                  <Award className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-marine">Coach Balanced Scorecard</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-600">Field Performance</span>
            </div>

            {isLoading ? (
              <div className="py-16 flex justify-center text-slate-500">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-marine border-t-transparent"></div>
              </div>
            ) : coaches.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center font-medium">No coach records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-bold">Coach Name</th>
                      <th className="pb-3 font-bold">Email</th>
                      <th className="pb-3 font-bold text-center">Assigned Sessions</th>
                      <th className="pb-3 font-bold text-center">Completed</th>
                      <th className="pb-3 font-bold text-center">Attendance Marked</th>
                      <th className="pb-3 font-bold text-center">Licenses</th>
                      <th className="pb-3 font-bold text-right">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coaches.map((coach) => (
                      <tr key={coach.coachId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 font-bold text-marine">{coach.fullName}</td>
                        <td className="py-3 text-slate-600 font-medium">{coach.email}</td>
                        <td className="py-3 text-center font-mono font-bold text-slate-800">{coach.totalAssigned}</td>
                        <td className="py-3 text-center font-mono font-bold text-emerald-700">{coach.completed}</td>
                        <td className="py-3 text-center font-mono font-bold text-slate-800">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                            {coach.attendanceRate}%
                          </span>
                        </td>
                        <td className="py-3 text-center font-mono text-slate-600">
                          {coach.activeCertifications} active
                          {coach.expiringSoonCount > 0 && (
                            <span className="text-amber-600 font-bold ml-1">({coach.expiringSoonCount} expiring)</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                              coach.complianceStatus === 'Compliant'
                                ? 'bg-emerald-100 text-emerald-700'
                                : coach.complianceStatus === 'Warning'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {coach.complianceStatus}
                          </span>
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
