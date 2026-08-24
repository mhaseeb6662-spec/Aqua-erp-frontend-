import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import KpiCard from '../../components/management/KpiCard';
import DrilldownModal from '../../components/management/DrilldownModal';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  Ship, HardHat, ShieldAlert, CheckCircle2,
  CalendarDays, Wrench, AlertTriangle, Users, Waves, ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export default function OperationsAnalytics() {
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

  const fetchOperations = async () => {
    setIsLoading(true);
    try {
      const res = await managementService.getOperations(filters);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load operations analytics', err);
      toast.error('Failed to load operations analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [filters]);

  const summary = data?.summary;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Operations, Fleet &amp; Logistics Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Field operational delivery, charter vessel readiness, academy fishing tackle inventory, and maritime safety incidents.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <ManagementFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={fetchOperations}
          isLoading={isLoading}
        />

        {/* Top Operations KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Sessions &amp; Charters"
            value={summary?.totalSessions || 0}
            unit="Scheduled"
            kpiId="KPI-SESS-01"
            icon={CalendarDays}
            iconBg="bg-blue-50 text-blue-600"
            details={`Completed: ${summary?.completedSessions || 0}`}
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'sessions', title: 'All Scheduled Sessions' })}
          />

          <KpiCard
            title="Session Completion Rate"
            value={summary?.deliveryRate || 0}
            unit="%"
            kpiId="KPI-DELV-01"
            icon={CheckCircle2}
            iconBg="bg-emerald-50 text-emerald-600"
            details="Operational delivery reliability"
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'sessions', title: 'Completed Sessions' })}
          />

          <KpiCard
            title="Fleet Readiness Rate"
            value={summary?.fleetReadinessRate || 0}
            unit="%"
            kpiId="KPI-FLEET-01"
            icon={Ship}
            iconBg="bg-teal-50 text-teal-600"
            details={`${summary?.readyVessels || 0} of ${summary?.totalVessels || 0} vessels sea-ready`}
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'fleet', title: 'Fleet Vessels Inventory' })}
          />

          <KpiCard
            title="Safety Incidents"
            value={summary?.totalIncidents || 0}
            unit="Cases"
            kpiId="KPI-SAFE-01"
            icon={ShieldAlert}
            iconBg={summary?.openIncidents > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}
            details={`${summary?.openIncidents || 0} pending resolution`}
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'incidents', title: 'Safety & Incident Reports' })}
          />
        </div>

        {/* Middle Row: Fleet Readiness & Equipment Health */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Fleet Status List */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                    <Ship className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-marine">Registered Academy Fleet</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-600">Vessel Status</span>
              </div>

              {isLoading ? (
                <div className="py-12 flex justify-center text-slate-500">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-marine border-t-transparent"></div>
                </div>
              ) : !data?.vesselsList || data.vesselsList.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center font-medium">No fleet vessels registered.</p>
              ) : (
                <div className="space-y-2.5">
                  {data.vesselsList.map((v) => (
                    <div key={v._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-marine">{v.name}</h4>
                        <span className="text-[10px] font-mono text-slate-600 font-medium">
                          {v.registrationNumber} • {v.capacity} pax • {v.branch?.name || 'All'}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                          v.operationalStatus === 'Available'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {v.operationalStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment Inventory Health */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <HardHat className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-marine">Gear &amp; Tackle Stock Health</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-600">Inventory Status</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Total Units</span>
                  <span className="text-xl font-bold text-marine">{summary?.totalEquipment || 0}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Available</span>
                  <span className="text-xl font-bold text-emerald-700">{summary?.availableEquipment || 0}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-900 block">In Repair</span>
                  <span className="text-xl font-bold text-amber-800">{summary?.damagedEquipment || 0}</span>
                </div>
              </div>

              {/* Attendance & Session Type Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700">Charters by Session Type</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(data?.sessionsByType || []).map((t) => (
                    <div key={t.type} className="p-2 bg-slate-50 rounded-lg text-center text-xs border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600 block uppercase">{t.type}</span>
                      <strong className="text-marine font-bold">{t.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
