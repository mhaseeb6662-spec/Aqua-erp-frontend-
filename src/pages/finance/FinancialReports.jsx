import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import { BarChart3, Download, Printer, RefreshCw, DollarSign, PieChart, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FinancialReports() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleExportCSV = () => {
    if (!metrics) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Month,Revenue,Expenses,Net"]
        .concat(metrics.monthlyTrend.map((m) => `${m.month},${m.revenue},${m.expenses},${m.revenue - m.expenses}`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Financial_Report_2026.csv");
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
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                <FileText className="h-5 w-5 text-tide" /> Income & Expense Statement Summary (YTD 2026)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Month</th>
                      <th className="px-6 py-4">Gross Revenue</th>
                      <th className="px-6 py-4">Operating Costs</th>
                      <th className="px-6 py-4">Net Income</th>
                      <th className="px-6 py-4">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics?.monthlyTrend?.map((row) => {
                      const net = row.revenue - row.expenses;
                      const margin = Math.round((net / row.revenue) * 100);
                      return (
                        <tr key={row.month} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-marine">{row.month} 2026</td>
                          <td className="px-6 py-4 font-bold text-emerald-600">${row.revenue.toLocaleString()} USD</td>
                          <td className="px-6 py-4 text-slate-500">${row.expenses.toLocaleString()} USD</td>
                          <td className="px-6 py-4 font-bold text-tide">${net.toLocaleString()} USD</td>
                          <td className="px-6 py-4 font-semibold text-emerald-600">+{margin}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
