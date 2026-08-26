import { useEffect, useState } from 'react';
import { formatAED } from '../../utils/currency';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import {
  DollarSign, TrendingUp, AlertCircle, FileText, RefreshCw, BarChart3, PieChart, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FinanceDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await financeService.getDashboardMetrics();
      setMetrics(res.data.data);
    } catch (err) {
      toast.error('Failed to load financial dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Revenue & Financial Analytics</h1>
            <p className="text-sm text-slate-500">
              Overview of academy revenue streams, outstanding receivables, monthly trends, and net income.
            </p>
          </div>
          <button
            onClick={fetchMetrics}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 text-tide" /> Refresh Financial Data
          </button>
        </div>

        {/* KPI Metric Cards */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Net Revenue</p>
                  <p className="mt-1 font-display text-2xl font-bold text-marine">
                    {formatAED(metrics?.totalRevenue)}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <ArrowUpRight className="h-3.5 w-3.5" /> +14.8% vs last month
                  </span>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <DollarSign className="h-6 w-6" />
                </span>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Outstanding Receivables</p>
                  <p className="mt-1 font-display text-2xl font-bold text-amber-600">
                    {formatAED(metrics?.outstandingReceivables)}
                  </p>
                  <span className="mt-1 text-xs text-slate-400">{metrics?.overdueCount || 0} Overdue Invoices</span>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <AlertCircle className="h-6 w-6" />
                </span>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Recurring (MRR)</p>
                  <p className="mt-1 font-display text-2xl font-bold text-tide">
                    {formatAED(metrics?.mrr)}
                  </p>
                  <span className="mt-1 text-xs text-slate-400">Active Memberships</span>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tide/10 text-tide">
                  <TrendingUp className="h-6 w-6" />
                </span>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Invoices & Receipts</p>
                  <p className="mt-1 font-display text-2xl font-bold text-marine">
                    {metrics?.invoicesCount || 0} / {metrics?.paymentsCount || 0}
                  </p>
                  <span className="mt-1 text-xs text-slate-400">Completed Transactions</span>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <FileText className="h-6 w-6" />
                </span>
              </div>
            </div>

            {/* Charts & Breakdown */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Revenue Monthly Trend Chart Simulation */}
              <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-tide" /> Monthly Revenue Trend (2026)
                  </h3>
                  <span className="text-xs text-slate-400">Gross Income vs Operating Costs</span>
                </div>

                <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-2">
                  {metrics?.monthlyTrend?.map((item) => {
                    const heightPercent = Math.min(100, Math.round((item.revenue / 16000) * 100));
                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="text-[10px] font-bold text-marine opacity-0 group-hover:opacity-100 transition">
                          AED {item.revenue?.toLocaleString()}
                        </div>
                        <div className="w-full bg-slate-100 rounded-t-lg relative flex items-end h-48 overflow-hidden">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-tide transition-all duration-500 rounded-t-lg group-hover:bg-tide-dark"
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-tide" /> Revenue by Program Category
                </h3>

                <div className="space-y-4 pt-2">
                  {metrics?.categoryBreakdown?.map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{cat.name}</span>
                        <span className="text-marine">AED {cat.amount?.toLocaleString()} ({cat.percentage}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className="h-full rounded-full bg-tide"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
