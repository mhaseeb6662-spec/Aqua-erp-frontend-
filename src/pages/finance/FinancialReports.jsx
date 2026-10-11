import { useEffect, useState } from 'react';
import { formatAED } from '../../utils/currency';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Download, Printer, FileText, ToggleLeft, ToggleRight,
  DollarSign, TrendingUp, AlertCircle, Percent, Receipt,
  Layers, CreditCard, Building, ShieldCheck, CheckCircle2,
  Calendar, RefreshCw, BarChart3, PieChart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FinancialReports() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('statement'); // 'statement' | 'programs' | 'payments' | 'vat'

  // Filters
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('all'); // 'all' | 'q1' | 'q2' | 'q3' | 'q4'
  const [showAllMonths, setShowAllMonths] = useState(true);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data.data || []);
    } catch (e) {
      console.error('Failed to load branches', e);
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = {
        year: selectedYear,
        fullYear: 'true',
      };
      if (selectedBranch) params.branch = selectedBranch;
      const res = await financeService.getDashboardMetrics(params);
      setMetrics(res.data.data);
    } catch (err) {
      console.error('Failed to load financial reports', err);
      toast.error('Failed to load financial reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedYear, selectedBranch]);

  // Process Monthly Statement Data based on Quarter Filter
  const allMonthlyData = metrics?.monthlyTrend || [];
  const filteredQuarterData = allMonthlyData.filter((m) => {
    if (selectedQuarter === 'q1') return m.monthIndex >= 1 && m.monthIndex <= 3;
    if (selectedQuarter === 'q2') return m.monthIndex >= 4 && m.monthIndex <= 6;
    if (selectedQuarter === 'q3') return m.monthIndex >= 7 && m.monthIndex <= 9;
    if (selectedQuarter === 'q4') return m.monthIndex >= 10 && m.monthIndex <= 12;
    return true;
  });

  const activeRows = filteredQuarterData.filter((r) => r.hasActivity);
  const displayRows = showAllMonths || activeRows.length === 0 ? filteredQuarterData : activeRows;

  // Computed Totals for filtered view
  const summaryGross = displayRows.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const summaryCosts = displayRows.reduce((acc, r) => acc + (r.operatingCosts || 0), 0);
  const summaryFuel = displayRows.reduce((acc, r) => acc + (r.fuelCost || 0), 0);
  const summaryMaint = displayRows.reduce((acc, r) => acc + (r.maintenanceCost || 0), 0);
  const summaryRefunds = displayRows.reduce((acc, r) => acc + (r.refunds || 0), 0);
  const summaryNet = summaryGross - summaryCosts;
  const summaryMargin = summaryGross > 0 ? Math.round((summaryNet / summaryGross) * 100) : 0;
  const summaryVat = displayRows.reduce((acc, r) => acc + (r.vatAmount || 0), 0);

  const ytdSummary = metrics?.ytdSummary || {
    grossRevenue: summaryGross,
    operatingCosts: summaryCosts,
    netIncome: summaryNet,
    margin: summaryMargin,
    vatCollected: summaryVat,
    year: selectedYear,
  };

  const programBreakdown = metrics?.programRevenueBreakdown || [];
  const paymentBreakdown = metrics?.paymentMethodBreakdown || [];
  const vatSummary = metrics?.vatSummary || {
    grossRevenue: ytdSummary.grossRevenue,
    taxableSubtotal: Math.round(ytdSummary.grossRevenue * 0.95238 * 100) / 100,
    vatCollected: ytdSummary.vatCollected || 0,
    invoicesCount: metrics?.invoicesCount || 0,
    standardRate: '5.0%',
    country: 'United Arab Emirates',
  };

  const handleExportCSV = () => {
    if (!metrics) return;
    let csvRows = [];

    if (activeTab === 'statement') {
      csvRows = [
        `Aqua Fishing Academy — Income & Expense Statement (${selectedYear})`,
        `Generated: ${new Date().toLocaleDateString('en-AE')} | Currency: AED`,
        '',
        'Month,Gross Revenue (AED),Operating Costs (AED),Fuel Cost (AED),Maintenance (AED),Refunds (AED),Net Income (AED),Margin (%)',
      ]
        .concat(displayRows.map((m) =>
          `"${m.monthName}",${m.revenue},${m.operatingCosts},${m.fuelCost || 0},${m.maintenanceCost || 0},${m.refunds || 0},${m.netIncome},${m.margin}%`
        ))
        .concat([
          `"Total (${selectedYear})",${summaryGross},${summaryCosts},${summaryFuel},${summaryMaint},${summaryRefunds},${summaryNet},${summaryMargin}%`,
        ]);
    } else if (activeTab === 'programs') {
      csvRows = [
        `Aqua Fishing Academy — Program Revenue Breakdown (${selectedYear})`,
        `Generated: ${new Date().toLocaleDateString('en-AE')} | Currency: AED`,
        '',
        'Program Name,Program Code,Price (AED),Invoices Count,Invoiced Amount (AED),Collected (AED),Share (%)',
      ].concat(programBreakdown.map((p) =>
        `"${p.name}","${p.code}",${p.price},${p.invoicesCount},${p.invoicedAmount},${p.collectedAmount},${p.percentage}%`
      ));
    } else if (activeTab === 'payments') {
      csvRows = [
        `Aqua Fishing Academy — Payment Methods & Collections (${selectedYear})`,
        `Generated: ${new Date().toLocaleDateString('en-AE')} | Currency: AED`,
        '',
        'Payment Method,Transaction Count,Collected Amount (AED),Share (%)',
      ].concat(paymentBreakdown.map((pm) =>
        `"${pm.method}",${pm.count},${pm.amount},${pm.percentage}%`
      ));
    } else {
      csvRows = [
        `Aqua Fishing Academy — UAE VAT Compliance Report (${selectedYear})`,
        `Standard UAE VAT Rate: 5.0% | Authority: FTA`,
        '',
        'Item,Amount (AED)',
        `Gross Total Supplies (Including VAT),${vatSummary.grossRevenue}`,
        `Net Taxable Subtotal (Excluding VAT),${vatSummary.taxableSubtotal}`,
        `Output VAT (5%),${vatSummary.vatCollected}`,
        `Total Tax Invoices Issued,${vatSummary.invoicesCount}`,
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AFA_Financial_Report_${activeTab}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial CSV report exported successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header - Hidden on Print */}
        <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600">
                Official Financial Accounting &amp; Executive Reporting
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine mt-0.5">
              Financial Reports &amp; Statements
            </h1>
            <p className="text-xs text-slate-500">
              Audited Income Statements, Program Revenue Analysis, Payment Collections, and UAE FTA 5% VAT Summaries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-tide" /> Export CSV / Excel
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-marine px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-marine-dark"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Printable Letterhead Header - Visible ONLY on Print */}
        <div className="hidden print:block border-b-2 border-slate-300 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 uppercase tracking-wider">
                Aqua Fishing Academy
              </h1>
              <p className="text-xs text-slate-500">Official Financial Accounting &amp; Management Report</p>
              <p className="text-[11px] text-slate-400 mt-1">Country: United Arab Emirates • Currency: AED • VAT Rate: 5%</p>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <p><strong>Reporting Year:</strong> {selectedYear}</p>
              <p><strong>Generated On:</strong> {new Date().toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p><strong>Status:</strong> Management Audited</p>
            </div>
          </div>
        </div>

        {/* Filters Bar - Hidden on Print */}
        <div className="print:hidden rounded-2xl bg-white p-4 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="font-bold text-slate-600">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-marine focus:border-tide focus:outline-none"
              >
                <option value="2026">2026 (Current)</option>
                <option value="2025">2025 (Previous)</option>
                <option value="2024">2024</option>
              </select>
            </div>

            {/* Quarter Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Period:</span>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-marine focus:border-tide focus:outline-none"
              >
                <option value="all">Full Year (Jan – Dec)</option>
                <option value="q1">Q1 (Jan – Mar)</option>
                <option value="q2">Q2 (Apr – Jun)</option>
                <option value="q3">Q3 (Jul – Sep)</option>
                <option value="q4">Q4 (Oct – Dec)</option>
              </select>
            </div>

            {/* Branch Selector */}
            {branches.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Building className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-slate-600">Branch:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-marine focus:border-tide focus:outline-none"
                >
                  <option value="">All Academy Branches</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReports}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-tide ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* 6 Executive KPI Summary Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Revenue</span>
              <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
                <DollarSign className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 font-display text-lg font-bold text-marine">
              {formatAED(summaryGross)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Collections &amp; Sales</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct &amp; Operating</span>
              <span className="rounded-lg bg-rose-50 p-1.5 text-rose-600">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 font-display text-lg font-bold text-slate-700">
              {formatAED(summaryCosts)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Fuel, Maint &amp; Ops</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Profit</span>
              <span className={`rounded-lg p-1.5 ${summaryNet >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <p className={`mt-2 font-display text-lg font-bold ${summaryNet >= 0 ? 'text-tide' : 'text-rose-600'}`}>
              {formatAED(summaryNet)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Net Academy Income</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operating Margin</span>
              <span className="rounded-lg bg-sky-50 p-1.5 text-sky-600">
                <Percent className="h-4 w-4" />
              </span>
            </div>
            <p className={`mt-2 font-display text-lg font-bold ${summaryMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summaryMargin}%
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Profit Efficiency</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UAE VAT (5%)</span>
              <span className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 font-display text-lg font-bold text-marine">
              {formatAED(summaryVat)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">FTA Output Tax</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Receivables</span>
              <span className="rounded-lg bg-orange-50 p-1.5 text-orange-600">
                <AlertCircle className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 font-display text-lg font-bold text-amber-600">
              {formatAED(metrics?.outstandingReceivables || 0)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{metrics?.overdueCount || 0} Invoices Pending</p>
          </div>
        </div>

        {/* Navigation Tabs - Hidden on Print */}
        <div className="print:hidden border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('statement')}
            className={`pb-3 px-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'statement'
                ? 'border-tide text-tide'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="h-4 w-4" /> 1. Income &amp; Expense Statement
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`pb-3 px-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'programs'
                ? 'border-tide text-tide'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="h-4 w-4" /> 2. Revenue by Program
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'payments'
                ? 'border-tide text-tide'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CreditCard className="h-4 w-4" /> 3. Collections &amp; Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('vat')}
            className={`pb-3 px-3 transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'vat'
                ? 'border-tide text-tide'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> 4. UAE VAT Return (FTA 5%)
          </button>
        </div>

        {/* TAB 1: Income & Expense Statement Summary */}
        {(activeTab === 'statement' || window.matchMedia('print').matches) && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white shadow-xs border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="font-display text-sm font-bold text-marine flex items-center gap-2">
                    <FileText className="h-4 w-4 text-tide" />
                    Income &amp; Expense Statement Summary (YTD {selectedYear})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Monthly breakdown of academy gross revenue, operating costs, boat maintenance, vessel fuel logs, and net profit.
                  </p>
                </div>

                <div className="print:hidden flex items-center gap-3">
                  <button
                    onClick={() => setShowAllMonths(!showAllMonths)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-marine transition"
                  >
                    {showAllMonths ? <ToggleRight className="h-5 w-5 text-tide" /> : <ToggleLeft className="h-5 w-5 text-slate-300" />}
                    {showAllMonths ? 'Showing all 12 months' : 'Showing active months only'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">Month</th>
                      <th className="px-4 py-3.5 text-right">Gross Revenue</th>
                      <th className="px-4 py-3.5 text-right">Operating Costs</th>
                      <th className="px-4 py-3.5 text-right">Vessel Fuel</th>
                      <th className="px-4 py-3.5 text-right">Boat Maint.</th>
                      <th className="px-4 py-3.5 text-right">Refunds</th>
                      <th className="px-4 py-3.5 text-right">Net Income</th>
                      <th className="px-4 py-3.5 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {displayRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-slate-400 font-sans font-medium">
                          No transaction records recorded for this period.
                        </td>
                      </tr>
                    ) : (
                      displayRows.map((row) => (
                        <tr key={row.period} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="px-4 py-3 font-sans font-bold text-marine">{row.monthName}</td>
                          <td className="px-4 py-3 font-bold text-marine text-right">{formatAED(row.revenue)}</td>
                          <td className="px-4 py-3 text-slate-600 text-right">{formatAED(row.operatingCosts)}</td>
                          <td className="px-4 py-3 text-slate-400 text-right">{formatAED(row.fuelCost || 0)}</td>
                          <td className="px-4 py-3 text-slate-400 text-right">{formatAED(row.maintenanceCost || 0)}</td>
                          <td className="px-4 py-3 text-rose-500 text-right">{formatAED(row.refunds || 0)}</td>
                          <td className={`px-4 py-3 font-bold text-right ${row.netIncome >= 0 ? 'text-tide' : 'text-rose-600'}`}>
                            {formatAED(row.netIncome)}
                          </td>
                          <td className={`px-4 py-3 font-bold text-right ${row.margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {row.margin > 0 ? `+${row.margin}%` : `${row.margin}%`}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-mono">
                    <tr className="font-bold text-xs">
                      <td className="px-4 py-4 font-sans uppercase tracking-wider text-marine">
                        Total ({selectedQuarter === 'all' ? `YTD ${selectedYear}` : `${selectedQuarter.toUpperCase()} ${selectedYear}`})
                      </td>
                      <td className="px-4 py-4 text-marine text-right text-sm">{formatAED(summaryGross)}</td>
                      <td className="px-4 py-4 text-slate-700 text-right">{formatAED(summaryCosts)}</td>
                      <td className="px-4 py-4 text-slate-600 text-right">{formatAED(summaryFuel)}</td>
                      <td className="px-4 py-4 text-slate-600 text-right">{formatAED(summaryMaint)}</td>
                      <td className="px-4 py-4 text-rose-600 text-right">{formatAED(summaryRefunds)}</td>
                      <td className={`px-4 py-4 text-right text-sm ${summaryNet >= 0 ? 'text-tide' : 'text-rose-600'}`}>
                        {formatAED(summaryNet)}
                      </td>
                      <td className={`px-4 py-4 text-right text-sm ${summaryMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {summaryMargin > 0 ? `+${summaryMargin}%` : `${summaryMargin}%`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Revenue by Program */}
        {activeTab === 'programs' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white shadow-xs border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-display text-sm font-bold text-marine flex items-center gap-2">
                    <Layers className="h-4 w-4 text-tide" />
                    Revenue Breakdown by Academy Program ({selectedYear})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Performance per fishing course, invoiced amounts, collections, and proportion of total sales.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">Program Title</th>
                      <th className="px-4 py-3.5">Code</th>
                      <th className="px-4 py-3.5 text-right">Standard Tuition</th>
                      <th className="px-4 py-3.5 text-right">Invoices Issued</th>
                      <th className="px-4 py-3.5 text-right">Invoiced Amount</th>
                      <th className="px-4 py-3.5 text-right">Total Collected</th>
                      <th className="px-4 py-3.5 text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {programBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-medium">
                          No active academy programs found.
                        </td>
                      </tr>
                    ) : (
                      programBreakdown.map((prog) => (
                        <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-bold text-marine">{prog.name}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">{prog.code || '—'}</td>
                          <td className="px-4 py-3 font-mono text-right text-slate-600">{formatAED(prog.price)}</td>
                          <td className="px-4 py-3 font-mono text-right font-semibold text-slate-800">{prog.invoicesCount || 0}</td>
                          <td className="px-4 py-3 font-mono text-right font-bold text-marine">{formatAED(prog.invoicedAmount)}</td>
                          <td className="px-4 py-3 font-mono text-right font-bold text-emerald-600">{formatAED(prog.collectedAmount)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-mono font-bold text-slate-700">{prog.percentage}%</span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  style={{ width: `${Math.min(100, prog.percentage)}%` }}
                                  className="h-full bg-tide rounded-full"
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Collections by Payment Method */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white shadow-xs border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-display text-sm font-bold text-marine flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-tide" />
                    Payment Gateway &amp; Collections Breakdown ({selectedYear})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Collections across POS Card Machines, Cash, Bank Wire Transfers, and Online Payment Links.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">Payment Method</th>
                      <th className="px-4 py-3.5 text-right">Transactions</th>
                      <th className="px-4 py-3.5 text-right">Total Amount Collected</th>
                      <th className="px-4 py-3.5 text-right">Share of Collections</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">
                          No payment transactions recorded for {selectedYear}. Ready for fresh collections!
                        </td>
                      </tr>
                    ) : (
                      paymentBreakdown.map((pm, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-bold text-marine flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-tide" />
                            {pm.method}
                          </td>
                          <td className="px-4 py-3 font-mono text-right font-semibold text-slate-800">{pm.count}</td>
                          <td className="px-4 py-3 font-mono text-right font-bold text-emerald-600 text-sm">
                            {formatAED(pm.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-mono font-bold text-slate-700">{pm.percentage}%</span>
                              <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  style={{ width: `${Math.min(100, pm.percentage)}%` }}
                                  className="h-full bg-emerald-500 rounded-full"
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: UAE VAT Statement */}
        {activeTab === 'vat' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white shadow-xs border border-slate-200 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    Federal Tax Authority (FTA) UAE — 5% VAT Statement
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tax period summary for official reporting under UAE Federal Decree-Law No. (8) of 2017 on Value Added Tax.
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  Standard Rate: 5.0%
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Standard Rated Supplies</p>
                  <p className="mt-2 font-display text-xl font-bold text-marine">{formatAED(vatSummary.taxableSubtotal)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Net Taxable Revenue</p>
                </div>

                <div className="rounded-xl bg-emerald-50/50 p-4 border border-emerald-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Output VAT Due (5%)</p>
                  <p className="mt-2 font-display text-xl font-bold text-emerald-600">{formatAED(vatSummary.vatCollected)}</p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Payable to Federal Tax Authority</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Invoiced Gross Value</p>
                  <p className="mt-2 font-display text-xl font-bold text-slate-900">{formatAED(vatSummary.grossRevenue)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{vatSummary.invoicesCount} Tax Invoices</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Tax Declaration Box</th>
                      <th className="px-4 py-3 text-right">Taxable Amount (AED)</th>
                      <th className="px-4 py-3 text-right">Output VAT Due (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="px-4 py-3 font-sans font-medium text-slate-800">
                        Box 1: Standard rated supplies in the UAE (5%)
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">{formatAED(vatSummary.taxableSubtotal)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatAED(vatSummary.vatCollected)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-sans font-medium text-slate-800">
                        Box 2: Zero-rated / Exempt supplies
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">{formatAED(0)}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{formatAED(0)}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="px-4 py-3 font-sans uppercase text-marine">
                        Total Net VAT Payable (FTA Box 4)
                      </td>
                      <td className="px-4 py-3 text-right">{formatAED(vatSummary.taxableSubtotal)}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">{formatAED(vatSummary.vatCollected)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Official Sign-off block for Print */}
        <div className="hidden print:block pt-12 text-xs">
          <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-800">Prepared By:</p>
              <div className="h-12 border-b border-slate-300"></div>
              <p className="mt-1 text-slate-500">Finance &amp; Accounts Officer</p>
              <p className="text-[10px] text-slate-400">Aqua Fishing Academy</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">Approved &amp; Certified By:</p>
              <div className="h-12 border-b border-slate-300"></div>
              <p className="mt-1 text-slate-500">Managing Director / CEO</p>
              <p className="text-[10px] text-slate-400">Aqua Fishing Academy</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
