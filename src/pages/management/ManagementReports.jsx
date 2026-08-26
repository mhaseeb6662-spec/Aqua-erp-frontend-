import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ManagementFilterBar from '../../components/management/ManagementFilterBar';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  FileText, Download, Printer, Calendar, DollarSign,
  Users, CheckCircle2, Ship, ShieldCheck, Activity, Award
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import AcademyLogo from '../../components/common/AcademyLogo';

export default function ManagementReports() {
  const [reportType, setReportType] = useState('Daily Management Snapshot');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    range: 'this_month',
    branchId: '',
  });

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await managementService.getReports({ ...filters, reportType });
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to generate report', err);
      toast.error('Failed to generate report');
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

  const handleExportCSV = () => {
    if (!data) return;

    const summaryRows = [
      ['Aqua Fishing Academy ERP - Management Report'],
      ['Report Type', reportType],
      ['Generated At', new Date().toISOString()],
      ['Period', data.period || 'Custom'],
      ['Gross Invoiced Revenue (AED)', data.financials?.totalRevenue || 0],
      ['Cash Collected (AED)', data.financials?.totalCollected || 0],
      ['Outstanding Receivables (AED)', data.financials?.totalOutstanding || 0],
      ['Total Leads', data.commercials?.totalLeads || 0],
      ['Won Leads', data.commercials?.wonLeads || 0],
      ['Conversion Rate (%)', data.commercials?.conversionRate || 0],
      ['Total Sessions Delivered', data.operations?.completedSessions || 0],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      summaryRows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Executive report downloaded as CSV');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header - Hidden on Print */}
        <div className="print:hidden flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Executive Reports &amp; Analytics Center
            </h1>
            <p className="text-xs text-slate-500">
              Publish-ready executive snapshots, weekly board packs, and monthly CEO reviews with printable PDF layout.
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
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-marine text-white rounded-xl text-xs font-bold hover:bg-marine-dark transition shadow-sm"
            >
              <Download className="h-4 w-4" /> Export CSV / Excel
            </button>
          </div>
        </div>

        {/* Report Type Selector Tabs - Hidden on Print */}
        <div className="print:hidden flex gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          {['Daily Management Snapshot', 'Weekly Executive Summary', 'Monthly CEO Review'].map((t) => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                reportType === t ? 'bg-marine text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
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
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Management Information System</p>
                </div>
              </div>
            </div>
            <div className="text-right text-xs">
              <h3 className="font-bold text-marine text-base uppercase">{reportType}</h3>
              <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                Generated: {new Date(data?.generatedAt || Date.now()).toLocaleString()}
              </p>
              <p className="text-slate-400 text-[10px]">Classification: Executive Confidential</p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Executive Summary Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Financial Health
                  </span>
                  <p className="text-xl font-bold font-mono text-marine">
                    AED {data?.financials?.totalRevenue?.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Collected: AED {data?.financials?.totalCollected?.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Commercial Funnel
                  </span>
                  <p className="text-xl font-bold font-mono text-emerald-600">
                    {data?.commercials?.wonLeads || 0} <span className="text-xs font-normal text-slate-400">enrolled</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Conversion: {data?.commercials?.conversionRate || 0}% ({data?.commercials?.totalLeads || 0} leads)
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Ship className="h-3 w-3" /> Field Delivery
                  </span>
                  <p className="text-xl font-bold font-mono text-teal-600">
                    {data?.operations?.completedSessions || 0} <span className="text-xs font-normal text-slate-400">sessions</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Fleet: {data?.operations?.readyFleet || 0} of {data?.operations?.totalFleet || 0} sea-ready
                  </p>
                </div>
              </div>

              {/* Invoices Reconciled Schedule */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-marine border-b border-slate-100 pb-1.5">
                  1. Revenue &amp; Invoices Schedule
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
                        <th className="pb-2 font-bold">Invoice #</th>
                        <th className="pb-2 font-bold">Customer</th>
                        <th className="pb-2 font-bold">Program</th>
                        <th className="pb-2 font-bold">Status</th>
                        <th className="pb-2 font-bold text-right">Amount (AED)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.details?.invoices || []).slice(0, 8).map((i) => (
                        <tr key={i._id}>
                          <td className="py-2 font-mono font-bold text-marine">{i.invoiceNumber}</td>
                          <td className="py-2 text-slate-700 font-medium">{i.customer?.fullName || '—'}</td>
                          <td className="py-2 text-slate-600">{i.program?.title || 'General'}</td>
                          <td className="py-2 font-bold text-[10px] uppercase text-slate-700">{i.status}</td>
                          <td className="py-2 text-right font-mono font-bold text-marine">
                            AED {i.totalAmount?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sign-off Footnote */}
              <div className="pt-8 border-t border-slate-200 flex justify-between text-[10px] text-slate-600 font-medium">
                <span>System: Aqua Fishing Academy ERP v2.0 • Data Integrity Verified</span>
                <span>Sign-off: _____________________________</span>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
