import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import KpiCard from '../../components/management/KpiCard';
import DrilldownModal from '../../components/management/DrilldownModal';
import KpiFormulaModal from '../../components/management/KpiFormulaModal';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  DollarSign, Banknote, Users, TrendingUp, CreditCard,
  CalendarDays, Ship, HardHat, ShieldAlert, CheckCircle2,
  AlertTriangle, ArrowRight, ShieldCheck, Activity, Award
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export default function ManagementDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [kpisList, setKpisList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global Filters state
  const [filters, setFilters] = useState({
    range: 'this_month',
    branchId: '',
    programId: '',
    startDate: '',
    endDate: '',
  });

  // Modal States
  const [drilldownModal, setDrilldownModal] = useState({ isOpen: false, metricType: '', title: '' });
  const [formulaModal, setFormulaModal] = useState({ isOpen: false, kpi: null });

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, kpisRes] = await Promise.all([
        managementService.getOverview(filters),
        managementService.getKpis(),
      ]);
      setData(overviewRes.data.data);
      setKpisList(kpisRes.data.data || []);
    } catch (err) {
      console.error('Failed to load executive overview', err);
      toast.error('Failed to load executive overview');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [filters]);

  const handleOpenFormula = (kpiId) => {
    const found = kpisList.find((k) => k.kpiId === kpiId) || {
      kpiId,
      name: kpiId,
      description: 'Standard management benchmark calculated from operational records.',
      formula: 'Aggregated via central ERP transactions.',
      formulaVersion: '1.0.0',
      category: 'Executive',
      unit: '',
      dataQuality: 'Live',
    };
    setFormulaModal({ isOpen: true, kpi: found });
  };

  const handleOpenDrilldown = (metricType, title) => {
    setDrilldownModal({ isOpen: true, metricType, title });
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await managementService.updateAlert(alertId, { status: 'Acknowledged' });
      toast.success('Alert marked as Acknowledged');
      fetchOverview();
    } catch (err) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const cards = data?.kpiCards;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Top Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600">
                Executive Command Center • Live Telemetry
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine mt-0.5">
              Management Command Center
            </h1>
            <p className="text-xs text-slate-500">
              Live executive decision system across Sales, Finance, Operations, Fleet, Staff, and Branch profitability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/management/reports')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-marine text-white rounded-xl text-xs font-bold hover:bg-marine-dark transition shadow-sm"
            >
              <Activity className="h-4 w-4" /> Reports &amp; Exports
            </button>
          </div>
        </div>

        {/* Global Executive Filter Bar */}
        <ManagementFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={fetchOverview}
          isLoading={isLoading}
        />

        {/* Executive Pulse Alerts Bar (if any) */}
        {data?.alerts && data.alerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Executive Attention Required ({data.alerts.length} Active Alerts)</span>
              </div>
              <button
                onClick={() => navigate('/management/kpis')}
                className="text-[11px] font-bold text-amber-900 hover:underline"
              >
                Configure Thresholds →
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.alerts.map((alt) => (
                <div key={alt._id} className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col justify-between gap-2 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        {alt.alertType}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-marine mt-1">{alt.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{alt.message}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400">Status: {alt.status}</span>
                    {alt.status === 'New' && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alt._id)}
                        className="text-[10px] font-bold text-marine hover:underline"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top KPI Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title={cards?.revenue?.title || 'Gross Revenue Invoiced'}
            value={cards?.revenue?.value || 0}
            unit={cards?.revenue?.unit || 'AED'}
            prevValue={cards?.revenue?.prevValue}
            changePercent={cards?.revenue?.changePercent}
            dataQuality={cards?.revenue?.dataQuality}
            kpiId={cards?.revenue?.kpiId || 'KPI-REV-01'}
            icon={DollarSign}
            iconBg="bg-blue-50 text-blue-600"
            onDrilldown={() => handleOpenDrilldown('revenue', 'Gross Invoices Trace')}
            onInfoClick={() => handleOpenFormula('KPI-REV-01')}
          />

          <KpiCard
            title={cards?.cashCollected?.title || 'Cash Collected'}
            value={cards?.cashCollected?.value || 0}
            unit={cards?.cashCollected?.unit || 'AED'}
            prevValue={cards?.cashCollected?.prevValue}
            changePercent={cards?.cashCollected?.changePercent}
            dataQuality={cards?.cashCollected?.dataQuality}
            kpiId={cards?.cashCollected?.kpiId || 'KPI-CASH-01'}
            icon={Banknote}
            iconBg="bg-emerald-50 text-emerald-600"
            onDrilldown={() => handleOpenDrilldown('cash', 'Cash Transactions Trace')}
            onInfoClick={() => handleOpenFormula('KPI-CASH-01')}
          />

          <KpiCard
            title={cards?.outstanding?.title || 'Outstanding Receivables'}
            value={cards?.outstanding?.value || 0}
            unit={cards?.outstanding?.unit || 'AED'}
            prevValue={cards?.outstanding?.prevValue}
            changePercent={cards?.outstanding?.changePercent}
            dataQuality={cards?.outstanding?.dataQuality}
            kpiId={cards?.outstanding?.kpiId || 'KPI-OUT-01'}
            icon={CreditCard}
            iconBg="bg-amber-50 text-amber-600"
            onDrilldown={() => handleOpenDrilldown('outstanding', 'Unpaid Invoices Trace')}
            onInfoClick={() => handleOpenFormula('KPI-OUT-01')}
          />

          <KpiCard
            title={cards?.netRevenue?.title || 'Net Recognized Revenue'}
            value={cards?.netRevenue?.value || 0}
            unit={cards?.netRevenue?.unit || 'AED'}
            prevValue={cards?.netRevenue?.prevValue}
            changePercent={cards?.netRevenue?.changePercent}
            dataQuality={cards?.netRevenue?.dataQuality}
            kpiId={cards?.netRevenue?.kpiId || 'KPI-NETREV-01'}
            icon={TrendingUp}
            iconBg="bg-teal-50 text-teal-600"
            onDrilldown={() => handleOpenDrilldown('revenue', 'Net Revenue Trace')}
            onInfoClick={() => handleOpenFormula('KPI-NETREV-01')}
          />
        </div>

        {/* Secondary KPI Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title={cards?.leads?.title || 'New Inbound Leads'}
            value={cards?.leads?.value || 0}
            unit={cards?.leads?.unit || 'Count'}
            prevValue={cards?.leads?.prevValue}
            changePercent={cards?.leads?.changePercent}
            dataQuality={cards?.leads?.dataQuality}
            kpiId={cards?.leads?.kpiId || 'KPI-LEAD-01'}
            icon={Users}
            iconBg="bg-indigo-50 text-indigo-600"
            onDrilldown={() => handleOpenDrilldown('leads', 'Inbound Leads Trace')}
            onInfoClick={() => handleOpenFormula('KPI-LEAD-01')}
          />

          <KpiCard
            title={cards?.conversionRate?.title || 'Lead Conversion Rate'}
            value={cards?.conversionRate?.value || 0}
            unit={cards?.conversionRate?.unit || '%'}
            prevValue={cards?.conversionRate?.prevValue}
            changePercent={cards?.conversionRate?.changePercent}
            dataQuality={cards?.conversionRate?.dataQuality}
            kpiId={cards?.conversionRate?.kpiId || 'KPI-CONV-01'}
            icon={TrendingUp}
            iconBg="bg-purple-50 text-purple-600"
            onDrilldown={() => handleOpenDrilldown('conversion', 'Won Leads Conversion Trace')}
            onInfoClick={() => handleOpenFormula('KPI-CONV-01')}
          />

          <KpiCard
            title={cards?.bookings?.title || 'Program Bookings'}
            value={cards?.bookings?.value || 0}
            unit={cards?.bookings?.unit || 'Count'}
            prevValue={cards?.bookings?.prevValue}
            changePercent={cards?.bookings?.changePercent}
            dataQuality={cards?.bookings?.dataQuality}
            kpiId={cards?.bookings?.kpiId || 'KPI-BOOK-01'}
            icon={CalendarDays}
            iconBg="bg-sky-50 text-sky-600"
            onDrilldown={() => handleOpenDrilldown('bookings', 'Student Bookings Trace')}
            onInfoClick={() => handleOpenFormula('KPI-BOOK-01')}
          />

          <KpiCard
            title={cards?.fleetReadiness?.title || 'Fleet Operational Readiness'}
            value={cards?.fleetReadiness?.value || 0}
            unit={cards?.fleetReadiness?.unit || '%'}
            details={cards?.fleetReadiness?.details}
            dataQuality={cards?.fleetReadiness?.dataQuality}
            kpiId={cards?.fleetReadiness?.kpiId || 'KPI-FLEET-01'}
            icon={Ship}
            iconBg="bg-teal-50 text-teal-600"
            onDrilldown={() => handleOpenDrilldown('fleet', 'Fleet Vessels Trace')}
            onInfoClick={() => handleOpenFormula('KPI-FLEET-01')}
          />
        </div>

        {/* Third Row: Operational Integrity & Inventory */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title={cards?.deliveryRate?.title || 'Session Completion Rate'}
            value={cards?.deliveryRate?.value || 0}
            unit={cards?.deliveryRate?.unit || '%'}
            dataQuality={cards?.deliveryRate?.dataQuality}
            kpiId={cards?.deliveryRate?.kpiId || 'KPI-DELV-01'}
            icon={CheckCircle2}
            iconBg="bg-emerald-50 text-emerald-600"
            onDrilldown={() => handleOpenDrilldown('sessions', 'Completed Sessions Trace')}
            onInfoClick={() => handleOpenFormula('KPI-DELV-01')}
          />

          <KpiCard
            title={cards?.inventoryAlerts?.title || 'Low Stock Gear Alerts'}
            value={cards?.inventoryAlerts?.value || 0}
            unit={cards?.inventoryAlerts?.unit || 'Items'}
            dataQuality={cards?.inventoryAlerts?.dataQuality}
            kpiId={cards?.inventoryAlerts?.kpiId || 'KPI-EQUIP-01'}
            icon={HardHat}
            iconBg="bg-amber-50 text-amber-600"
            onDrilldown={() => handleOpenDrilldown('equipment', 'Equipment Inventory Trace')}
            onInfoClick={() => handleOpenFormula('KPI-EQUIP-01')}
          />

          <KpiCard
            title={cards?.openIncidents?.title || 'Open Safety Incidents'}
            value={cards?.openIncidents?.value || 0}
            unit={cards?.openIncidents?.unit || 'Cases'}
            dataQuality={cards?.openIncidents?.dataQuality}
            kpiId={cards?.openIncidents?.kpiId || 'KPI-SAFE-01'}
            icon={ShieldAlert}
            iconBg="bg-rose-50 text-rose-600"
            onDrilldown={() => handleOpenDrilldown('incidents', 'Safety Incidents Trace')}
            onInfoClick={() => handleOpenFormula('KPI-SAFE-01')}
          />
        </div>

        {/* Quick Executive Navigation Center */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 pt-2">
          {[
            { title: 'Revenue & Finance', desc: 'Reconciliation & Aging', path: '/management/revenue', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
            { title: 'Sales Analytics', desc: 'Pipeline & Funnel ROI', path: '/management/sales', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
            { title: 'Operations', desc: 'Charters, Fleet & Gear', path: '/management/operations', icon: Ship, color: 'text-teal-600 bg-teal-50' },
            { title: 'Coach & Staff', desc: 'Scorecards & Licenses', path: '/management/staff', icon: Award, color: 'text-purple-600 bg-purple-50' },
            { title: 'Branch Margin', desc: 'Dubai vs Fujairah', path: '/management/branches', icon: CalendarDays, color: 'text-amber-600 bg-amber-50' },
            { title: 'Audit Explorer', desc: 'Security & Change Trail', path: '/management/audit', icon: ShieldCheck, color: 'text-slate-700 bg-slate-100' },
          ].map((item) => (
            <Card
              key={item.title}
              onClick={() => navigate(item.path)}
              className="bg-white border-slate-200 hover:border-marine/40 hover:shadow-md transition cursor-pointer group"
            >
              <CardContent className="p-4 space-y-2 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${item.color} group-hover:scale-105 transition`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-marine group-hover:translate-x-1 transition" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-marine">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Drill-down Modal */}
      <DrilldownModal
        isOpen={drilldownModal.isOpen}
        onClose={() => setDrilldownModal({ isOpen: false, metricType: '', title: '' })}
        metricType={drilldownModal.metricType}
        title={drilldownModal.title}
        filters={filters}
      />

      {/* KPI Formula Definition Modal */}
      <KpiFormulaModal
        isOpen={formulaModal.isOpen}
        onClose={() => setFormulaModal({ isOpen: false, kpi: null })}
        kpi={formulaModal.kpi}
      />
    </DashboardLayout>
  );
}
