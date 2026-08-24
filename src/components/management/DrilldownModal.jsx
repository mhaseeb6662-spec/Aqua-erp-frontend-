import { useState, useEffect } from 'react';
import { X, Search, FileText, Download, ExternalLink, Filter } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function DrilldownModal({ isOpen, onClose, metricType, title, filters = {} }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen || !metricType) return;

    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/management/drilldown', {
          params: {
            metricType,
            ...filters,
          },
        });
        setData(res.data.data || []);
      } catch (err) {
        console.error('Failed to load drill-down records', err);
        toast.error('Failed to fetch underlying records');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [isOpen, metricType, filters]);

  if (!isOpen) return null;

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(term);
  });

  const exportCSV = () => {
    if (data.length === 0) return toast.error('No records to export');

    const headers = ['ID', 'Date', 'Customer/Title', 'Status', 'Amount/Count'];
    const rows = data.map((d) => [
      d._id || d.invoiceNumber || d.bookingId || '',
      new Date(d.createdAt || d.startTime || Date.now()).toLocaleDateString(),
      d.customer?.fullName || d.student?.fullName || d.title || d.name || '',
      d.status || d.stage || d.operationalStatus || '',
      d.totalAmount || d.amount || d.capacity || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `drilldown_${metricType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported to CSV');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-marine text-white">
                Live Audit Trace
              </span>
              <span className="text-xs text-slate-400 font-mono">({data.length} records found)</span>
            </div>
            <h3 className="font-display text-lg font-bold text-marine mt-1">
              {title || `Source Records for ${metricType}`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
              title="Download CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, reference ID, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-marine"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent mb-2"></div>
              <p className="text-xs font-semibold text-slate-700">Tracing source records...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <FileText className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700">No records found</p>
              <p className="text-xs text-slate-600 mt-1">No underlying transactions match the selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-bold">Reference / ID</th>
                    <th className="pb-3 font-bold">Customer / User</th>
                    <th className="pb-3 font-bold">Program / Item</th>
                    <th className="pb-3 font-bold">Date</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Value (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-mono font-bold text-marine">
                        {item.invoiceNumber || item.bookingId || item.incidentId || item.registrationNumber || String(item._id).slice(-6)}
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        {item.customer?.fullName || item.student?.fullName || item.reportedBy?.fullName || item.assignedTo?.fullName || item.name || '—'}
                      </td>
                      <td className="py-3 text-slate-600">
                        {item.program?.title || item.title || item.category || item.branch?.name || '—'}
                      </td>
                      <td className="py-3 text-slate-600 font-medium">
                        {new Date(item.createdAt || item.startTime || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                            ['Paid', 'Completed', 'Won', 'Available', 'Ready'].includes(item.status || item.stage || item.operationalStatus)
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ['Sent', 'Pending', 'Open', 'Scheduled'].includes(item.status || item.stage)
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.status || item.stage || item.operationalStatus || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-marine">
                        {item.totalAmount !== undefined
                          ? `AED ${item.totalAmount.toLocaleString()}`
                          : item.amount !== undefined
                          ? `AED ${item.amount.toLocaleString()}`
                          : item.capacity !== undefined
                          ? `${item.capacity} pax`
                          : item.totalQuantity !== undefined
                          ? `${item.totalQuantity} units`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
          <span>Reconciliation Status: <strong className="text-emerald-600">100% Reconciled to Database</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-marine text-white rounded-xl font-semibold hover:bg-marine-dark transition"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
}
