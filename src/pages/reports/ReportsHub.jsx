import { useState, useEffect } from 'react';
import {
  FileText, Download, Printer, Calendar, DollarSign,
  Users, CheckCircle2, Ship, ShieldCheck, Activity, Award, Filter, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import reportService from '../../services/reportService';
import AcademyLogo from '../../components/common/AcademyLogo';

export default function ReportsHub() {
  const [reportType, setReportType] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    range: 'this_month',
    branchId: '',
    programId: '',
    startDate: '',
    endDate: '',
  });

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      let res;
      if (reportType === 'daily') {
        res = await reportService.getDailyReport(filters);
      } else if (reportType === 'weekly') {
        res = await reportService.getWeeklyReport(filters);
      } else {
        res = await reportService.getMonthlyReport(filters);
      }
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to generate report', err);
      toast.error('Failed to fetch reporting data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, filters]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const url = reportService.downloadCsvUrl(reportType, filters);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AFA_${reportType}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Executive report CSV downloaded');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header - Hidden on Print */}
        <div className="print:hidden flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600">
                Management Information System • Live Reports
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine mt-0.5">
              Official Executive Reports &amp; Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Daily Operational Snapshots, Weekly Performance Summaries, and Monthly CEO Reviews with exportable PDF &amp; CSV formats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-xs"
            >
              <Printer className="h-4 w-4" /> Print / Save as PDF
            </button>
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-marine text-white rounded-xl text-xs font-bold hover:bg-marine-dark transition shadow-sm"
            >
              <Download className="h-4 w-4" /> Export CSV / Excel
            </button>
          </div>
        </div>

        {/* Report Rhythm Tabs - Hidden on Print */}
        <div className="print:hidden flex gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          {[
            { key: 'daily', label: '1. Daily Operational Snapshot' },
            { key: 'weekly', label: '2. Weekly Executive Performance' },
            { key: 'monthly', label: '3. Monthly Board & CEO Review' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setReportType(t.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                reportType === t.key ? 'bg-marine text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Global Filter Bar - Hidden on Print */}
        <div className="print:hidden">
          <ManagementFilterBar
            filters={filters}
            onFilterChange={setFilters}
            onRefresh={fetchReport}
            isLoading={isLoading}
          />
        </div>

        {/* Printable Executive Report Document */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Document Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-marine pb-6">
            <div>
              <div className="flex items-center gap-3">
                <AcademyLogo variant="report" />
                <div className="border-l border-slate-200 pl-3">
                  <h2 className="font-display text-lg font-black text-marine">Executive Management Report</h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600">
                    Official Executive Report • Confidential
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right text-xs">
              <h3 className="font-bold text-marine text-base uppercase">{data?.reportType || 'Management Report'}</h3>
              <p className="text-slate-600 font-mono text-[11px] font-medium mt-0.5">
                Generated: {new Date(data?.generatedAt || Date.now()).toLocaleString()}
              </p>
              <p className="text-slate-600 text-[10px] font-medium">Period: {data?.period || 'Selected Range'}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-600 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Financial Totals
                  </span>
                  <p className="text-xl font-bold font-mono text-marine">
                    AED {(data?.summary?.totalInvoiced || data?.summary?.totalRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Collected: AED {(data?.summary?.totalCollected || 0).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-600 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Commercial Funnel
                  </span>
                  <p className="text-xl font-bold font-mono text-emerald-700">
                    {data?.summary?.wonLeads || data?.summary?.totalBookings || 0}{' '}
                    <span className="text-xs font-semibold text-slate-600">enrolled</span>
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Total Leads: {data?.summary?.totalLeads || data?.summary?.leadsCaptured || 0}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-600 flex items-center gap-1">
                    <Ship className="h-3 w-3" /> Field Delivery
                  </span>
                  <p className="text-xl font-bold font-mono text-teal-700">
                    {data?.summary?.sessionsCompleted || data?.summary?.sessionsDelivered || 0}{' '}
                    <span className="text-xs font-semibold text-slate-600">sessions</span>
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Ready Boats: {data?.summary?.readyVessels || 0} boats sea-ready
                  </p>
                </div>
              </div>

              {/* Monthly Branch Margins Table (If Monthly) */}
              {reportType === 'monthly' && data?.branches && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-marine border-b border-slate-100 pb-1.5">
                    1. Multi-Branch Financial &amp; Margin Breakdown
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
                          <th className="pb-2 font-bold">Branch Name</th>
                          <th className="pb-2 font-bold">City</th>
                          <th className="pb-2 font-bold text-center">Bookings</th>
                          <th className="pb-2 font-bold text-right">Revenue</th>
                          <th className="pb-2 font-bold text-right">Direct Costs</th>
                          <th className="pb-2 font-bold text-right">Operating Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.branches.map((b) => (
                          <tr key={b.name}>
                            <td className="py-2.5 font-bold text-marine">{b.name}</td>
                            <td className="py-2.5 text-slate-600 font-medium">{b.city}</td>
                            <td className="py-2.5 text-center font-mono font-bold text-slate-800">{b.bookings}</td>
                            <td className="py-2.5 text-right font-mono font-bold text-marine">
                              AED {b.revenue.toLocaleString()}
                            </td>
                            <td className="py-2.5 text-right font-mono text-slate-600 font-medium">
                              AED {b.directCosts.toLocaleString()}
                            </td>
                            <td className="py-2.5 text-right font-mono font-bold text-emerald-700">
                              AED {b.margin.toLocaleString()} ({b.marginPercent}%)
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Reconciled Invoices Table */}
              {data?.details?.invoices && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-marine border-b border-slate-100 pb-1.5">
                    {reportType === 'monthly' ? '2.' : '1.'} Reconciled Revenue &amp; Invoices Schedule
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
                          <th className="pb-2 font-bold">Invoice #</th>
                          <th className="pb-2 font-bold">Customer</th>
                          <th className="pb-2 font-bold">Program</th>
                          <th className="pb-2 font-bold">Status</th>
                          <th className="pb-2 font-bold text-right">Total (AED)</th>
                          <th className="pb-2 font-bold text-right">Balance Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.details.invoices.slice(0, 10).map((i) => (
                          <tr key={i._id}>
                            <td className="py-2 font-mono font-bold text-marine">{i.invoiceNumber}</td>
                            <td className="py-2 text-slate-700 font-medium">{i.customer?.fullName || '—'}</td>
                            <td className="py-2 text-slate-600 font-medium">{i.program?.title || 'General'}</td>
                            <td className="py-2 font-bold text-[10px] uppercase text-slate-700">{i.status}</td>
                            <td className="py-2 text-right font-mono font-bold text-marine">
                              AED {i.totalAmount?.toLocaleString()}
                            </td>
                            <td className="py-2 text-right font-mono font-bold text-rose-700">
                              AED {i.balanceDue?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sign-off Footnote */}
              <div className="pt-8 border-t border-slate-200 flex justify-between text-[10px] text-slate-600 font-medium">
                <span>System: Aqua Fishing Academy ERP v2.0 • Reconciled to Central Database</span>
                <span>Management Sign-off: _____________________________</span>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
