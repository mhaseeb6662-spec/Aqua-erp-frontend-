import { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw, Building, Layers } from 'lucide-react';
import api from '../../services/api';

export default function ManagementFilterBar({ filters, onFilterChange, onRefresh, isLoading }) {
  const [branches, setBranches] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [bRes, pRes] = await Promise.all([
          api.get('/branches'),
          api.get('/programs'),
        ]);
        setBranches(bRes.data.data || []);
        setPrograms(pRes.data.data || []);
      } catch (err) {
        console.error('Failed to load filter dropdowns', err);
      }
    };
    fetchOptions();
  }, []);

  const periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this_week' },
    { label: 'Last Week', value: 'last_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Custom', value: 'custom' },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Quick Period Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Period:
          </span>
          {periodOptions.map((p) => (
            <button
              key={p.value}
              onClick={() => onFilterChange({ ...filters, range: p.value })}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                filters.range === p.value
                  ? 'bg-marine text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
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

        {/* Program Filter */}
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

        {/* Custom Start & End Dates if Custom selected */}
        {filters.range === 'custom' && (
          <>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                className="bg-transparent font-semibold text-marine focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                className="bg-transparent font-semibold text-marine focus:outline-none w-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
