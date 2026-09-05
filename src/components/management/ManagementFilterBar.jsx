import { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw, Building, Layers } from 'lucide-react';
import api from '../../services/api';

export default function ManagementFilterBar({ filters, onFilterChange, onRefresh, isLoading, showBranch = true, showProgram = true }) {
  const [branches, setBranches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [customStart, setCustomStart] = useState(filters.startDate || '');
  const [customEnd, setCustomEnd] = useState(filters.endDate || '');
  const [errorMsg, setErrorMsg] = useState('');

  const applyCustomDates = () => {
    if (!customStart || !customEnd) {
      setErrorMsg('Both From and To dates are required.');
      return;
    }
    if (new Date(customEnd) < new Date(customStart)) {
      setErrorMsg('To Date cannot be earlier than From Date.');
      return;
    }
    setErrorMsg('');
    onFilterChange({ ...filters, startDate: customStart, endDate: customEnd });
  };

  const resetCustomDates = () => {
    setCustomStart('');
    setCustomEnd('');
    setErrorMsg('');
    onFilterChange({ ...filters, range: 'all', startDate: '', endDate: '' });
  };

  const handlePeriodChange = (val) => {
    setErrorMsg('');
    if (val !== 'custom') {
      onFilterChange({ ...filters, range: val, startDate: '', endDate: '' });
    } else {
      onFilterChange({ ...filters, range: val });
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const reqs = [];
        if (showBranch) reqs.push(api.get('/branches'));
        if (showProgram) reqs.push(api.get('/programs'));
        
        if (reqs.length > 0) {
          const res = await Promise.all(reqs);
          if (showBranch) setBranches(res[0]?.data?.data || []);
          if (showProgram) setPrograms(res[showBranch ? 1 : 0]?.data?.data || []);
        }
      } catch (err) {
        console.error('Failed to load filter dropdowns', err);
      }
    };
    fetchOptions();
  }, [showBranch, showProgram]);

  const periodOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last Quarter', value: 'quarter' },
    { label: 'This Year', value: 'this_year' },
    { label: 'Custom Date Range', value: 'custom' },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Quick Period Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Period:
          </span>
          {periodOptions.map((p) => {
            let label = p.label;
            if (p.value === 'custom' && filters.range === 'custom' && filters.startDate && filters.endDate) {
              const startFmt = new Date(filters.startDate).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' });
              const endFmt = new Date(filters.endDate).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' });
              label = `${startFmt} – ${endFmt}`;
            }
            return (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  filters.range === p.value
                    ? 'bg-marine text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition disabled:opacity-50"
            title="Refresh All Analytics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-marine' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Secondary Dropdown Row (Branch, Program, Custom Dates) */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-slate-100 text-xs">
        {/* Branch Filter */}
        {showBranch && (
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300">
          <Building className="h-4 w-4 text-slate-500 shrink-0" />
          <span className="text-slate-700 font-bold">Branch:</span>
          <select
            value={filters.branchId || ''}
            onChange={(e) => onFilterChange({ ...filters, branchId: e.target.value })}
            className="bg-transparent font-bold text-marine focus:outline-none w-full"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
        )}

        {/* Program Filter */}
        {showProgram && (
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300">
          <Layers className="h-4 w-4 text-slate-500 shrink-0" />
          <span className="text-slate-700 font-bold">Program:</span>
          <select
            value={filters.programId || ''}
            onChange={(e) => onFilterChange({ ...filters, programId: e.target.value })}
            className="bg-transparent font-bold text-marine focus:outline-none w-full"
          >
            <option value="">All Programs</option>
            {programs.map((prg) => (
              <option key={prg._id} value={prg._id}>{prg.title}</option>
            ))}
          </select>
        </div>
        )}

        {/* Custom Start & End Dates if Custom selected */}
        {filters.range === 'custom' && (
          <div className="col-span-full flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">From Date:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent font-semibold text-marine focus:outline-none w-auto"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">To Date:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent font-semibold text-marine focus:outline-none w-auto"
              />
            </div>
            
            <button
              onClick={applyCustomDates}
              className="px-3 py-1.5 bg-marine text-white text-xs font-bold rounded-xl hover:bg-marine-dark transition"
            >
              Apply
            </button>
            <button
              onClick={resetCustomDates}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-200 transition"
            >
              Reset
            </button>
            
            {errorMsg && <span className="text-red-500 font-bold ml-2">{errorMsg}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
