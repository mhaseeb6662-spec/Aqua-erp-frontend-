import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import KpiCard from '../../components/management/KpiCard';
import DrilldownModal from '../../components/management/DrilldownModal';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  DollarSign, Banknote, CreditCard, TrendingUp,
  Building, Layers, Receipt, ArrowDownRight, ArrowUpRight, BarChart3, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export default function RevenueAnalytics() {
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

  const fetchRevenue = async () => {
    setIsLoading(true);
    try {
      const res = await managementService.getRevenue(filters);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load revenue analytics', err);
      toast.error('Failed to load revenue analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [filters]);

  const summary = data?.summary;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Revenue &amp; Financial Reconciliation
            </h1>
            <p className="text-xs text-slate-500">
              100% reconciled revenue, cash collections, outstanding receivables, discounts, and refunds from central ERP invoices.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <ManagementFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={fetchRevenue}
          isLoading={isLoading}
        />

        {/* Financial Reconciliation KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Gross Revenue Invoiced"
            value={summary?.totalInvoiced || 0}
            unit="AED"
            kpiId="KPI-REV-01"
            icon={DollarSign}
            iconBg="bg-blue-50 text-blue-600"
            details="Total billed from all generated invoices"
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'revenue', title: 'Invoiced Gross Revenue' })}
          />

          <KpiCard
            title="Cash Collected"
            value={summary?.totalCollected || 0}
            unit="AED"
            kpiId="KPI-CASH-01"
            icon={Banknote}
            iconBg="bg-emerald-50 text-emerald-600"
            details={`Collection Efficiency: ${summary?.collectionRate || 0}%`}
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'cash', title: 'Cash Transactions' })}
          />

          <KpiCard
            title="Net Recognized Revenue"
            value={summary?.netRevenue || 0}
            unit="AED"
            kpiId="KPI-NETREV-01"
            icon={TrendingUp}
            iconBg="bg-teal-50 text-teal-600"
            details={`Less AED ${(summary?.totalRefunded || 0) + (summary?.totalDiscounted || 0)} refunds & discounts`}
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'revenue', title: 'Net Recognized Revenue' })}
          />

          <KpiCard
            title="Outstanding Receivables"
            value={summary?.outstandingDues || 0}
            unit="AED"
            kpiId="KPI-OUT-01"
            icon={CreditCard}
            iconBg="bg-rose-50 text-rose-600"
            details="Uncollected invoice balances"
            onDrilldown={() => setDrilldownModal({ isOpen: true, metricType: 'outstanding', title: 'Outstanding Receivables' })}
          />
        </div>

        {/* Breakdown by Branch & Program */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue by Branch */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Building className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-marine">Revenue by Branch</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-600">Reconciled</span>
              </div>

              {isLoading ? (
                <div className="py-12 flex justify-center text-slate-500">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-marine border-t-transparent"></div>
                </div>
              ) : !data?.revenueByBranch || data.revenueByBranch.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center font-medium">No branch transactions in period.</p>
              ) : (
                <div className="space-y-3">
                  {data.revenueByBranch.map((b) => {
                    const percent = summary?.totalInvoiced > 0 ? Math.round((b.totalRevenue / summary.totalInvoiced) * 100) : 0;
                    return (
                      <div key={b.branchId || b.branchName} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-marine">{b.branchName}</span>
                          <span className="font-mono font-bold text-slate-700">AED {b.totalRevenue.toLocaleString()} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-marine h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>{b.invoiceCount} invoices</span>
                          <span>Collected: AED {b.totalCollected.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Program */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                    <Layers className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-marine">Top Revenue Programs</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-600">By Billed Amount</span>
              </div>

              {isLoading ? (
                <div className="py-12 flex justify-center text-slate-500">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-marine border-t-transparent"></div>
                </div>
              ) : !data?.revenueByProgram || data.revenueByProgram.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center font-medium">No program revenue recorded in period.</p>
              ) : (
                <div className="space-y-3">
                  {data.revenueByProgram.slice(0, 5).map((p) => {
                    const percent = summary?.totalInvoiced > 0 ? Math.round((p.totalRevenue / summary.totalInvoiced) * 100) : 0;
                    return (
                      <div key={p.programId || p.programTitle} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-marine">{p.programTitle}</span>
                          <span className="font-mono font-bold text-slate-700">AED {p.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>{p.bookingsCount} bookings</span>
                          <span>Share: {percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reconciled Invoices Audit Table */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-100 text-marine">
                  <Receipt className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-marine">Recent Reconciled Invoices</h3>
              </div>
              <button
                onClick={() => setDrilldownModal({ isOpen: true, metricType: 'invoices', title: 'Complete Invoices Journal' })}
                className="text-xs font-bold text-marine hover:underline flex items-center gap-1"
              >
                View Full Audit Journal →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5 font-bold">Invoice #</th>
                    <th className="pb-2.5 font-bold">Customer</th>
                    <th className="pb-2.5 font-bold">Program</th>
                    <th className="pb-2.5 font-bold">Branch</th>
                    <th className="pb-2.5 font-bold">Status</th>
                    <th className="pb-2.5 font-bold text-right">Total</th>
                    <th className="pb-2.5 font-bold text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.recentInvoices || []).map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 font-mono font-bold text-marine">{inv.invoiceNumber}</td>
                      <td className="py-2.5 font-semibold text-slate-700">{inv.customer?.fullName || '—'}</td>
                      <td className="py-2.5 text-slate-600">{inv.program?.title || '—'}</td>
                      <td className="py-2.5 text-slate-500">{inv.branch?.name || 'All'}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === 'Sent' || inv.status === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-marine">
                        AED {inv.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-rose-600">
                        AED {inv.balanceDue?.toLocaleString()}
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
