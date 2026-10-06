import { useEffect, useState } from 'react';
import { formatAED } from '../../utils/currency';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import { Download, Printer, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FinancialReports() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllMonths, setShowAllMonths] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await financeService.getDashboardMetrics();
      setMetrics(res.data.data);
    } catch (err) {
      toast.error('Failed to load financial reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const monthlyData = metrics?.monthlyTrend || [];
  const activeRows = monthlyData.filter((r) => r.hasActivity);
  const displayRows = showAllMonths || activeRows.length === 0 ? monthlyData : activeRows;
  
  const ytdSummary = metrics?.ytdSummary || {
    grossRevenue: 0,
    operatingCosts: 0,
    netIncome: 0,
    margin: 0
  };

  const handleExportCSV = () => {
    if (!metrics) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Month,Gross Revenue (AED),Operating Costs (AED),Net Income (AED),Margin (%)"]
        .concat(displayRows.map((m) => `${m.monthName},${m.revenue},${m.expenses},${m.netIncome},${m.margin}%`))
        .concat([`Total YTD ${ytdSummary.year || '2026'},${ytdSummary.grossRevenue},${ytdSummary.operatingCosts},${ytdSummary.netIncome},${ytdSummary.margin}%`])
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Statement_YTD_${ytdSummary.year || '2026'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial CSV report exported successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Financial Reports & Statements</h1>
            <p className="text-sm text-slate-500">
              Generate income statement summaries, export revenue data to CSV, and inspect financial performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-tide" /> Export to CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark"
            >
              <Printer className="h-4 w-4" /> Print Financial Statement
            </button>
          </div>
        </div>

        {/* Statement Summary */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                  <FileText className="h-5 w-5 text-tide" /> Income & Expense Statement Summary (YTD {ytdSummary.year || '2026'})
                </h3>
                
                <button 
                  onClick={() => setShowAllMonths(!showAllMonths)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-marine transition"
                >
                  {showAllMonths ? <ToggleRight className="h-5 w-5 text-tide" /> : <ToggleLeft className="h-5 w-5 text-slate-300" />}
                  Show All YTD Months
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Month</th>
                      <th className="px-6 py-4 text-right">Gross Revenue</th>
                      <th className="px-6 py-4 text-right">Operating Costs</th>
                      <th className="px-6 py-4 text-right">Net Income</th>
                      <th className="px-6 py-4 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">
                          No financial records found for YTD {ytdSummary.year || '2026'}
                        </td>
                      </tr>
                    ) : (
                      displayRows.map((row) => (
                        <tr key={row.period} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 font-semibold text-marine">{row.monthName}</td>
                          <td className="px-6 py-4 font-mono font-bold text-marine text-right">{formatAED(row.revenue)}</td>
                          <td className="px-6 py-4 font-mono text-slate-500 text-right">{formatAED(row.expenses)}</td>
                          <td className={`px-6 py-4 font-mono font-bold text-right ${row.netIncome >= 0 ? 'text-tide' : 'text-rose-600'}`}>
                            {formatAED(row.netIncome)}
                          </td>
                          <td className={`px-6 py-4 font-mono font-bold text-right ${row.margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {row.margin > 0 ? `+${row.margin}%` : `${row.margin}%`}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                    <tr>
                      <td className="px-6 py-5 font-bold text-marine uppercase tracking-wider text-xs">Total YTD {ytdSummary.year || '2026'}</td>
                      <td className="px-6 py-5 font-mono font-bold text-marine text-right text-base">{formatAED(ytdSummary.grossRevenue)}</td>
                      <td className="px-6 py-5 font-mono font-semibold text-slate-600 text-right">{formatAED(ytdSummary.operatingCosts)}</td>
                      <td className={`px-6 py-5 font-mono font-bold text-right text-base ${ytdSummary.netIncome >= 0 ? 'text-tide' : 'text-rose-600'}`}>
                        {formatAED(ytdSummary.netIncome)}
                      </td>
                      <td className={`px-6 py-5 font-mono font-bold text-right text-base ${ytdSummary.margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {ytdSummary.margin > 0 ? `+${ytdSummary.margin}%` : `${ytdSummary.margin}%`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
