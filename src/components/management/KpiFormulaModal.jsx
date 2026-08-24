import React from 'react';
import { X, Code2, Database, ShieldCheck, Tag, Info } from 'lucide-react';

export default function KpiFormulaModal({ isOpen, onClose, kpi }) {
  if (!isOpen || !kpi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">{kpi.kpiId}</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                Version {kpi.formulaVersion || '1.0.0'}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-marine mt-1">{kpi.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-tide" /> Plain English Definition
          </label>
          <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {kpi.description}
          </p>
        </div>

        {/* Mathematical Formula */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Code2 className="h-3.5 w-3.5 text-tide" /> Calculation Formula
          </label>
          <div className="font-mono text-xs font-bold text-marine bg-slate-50 p-3 rounded-xl border border-slate-300 text-wrap">
            {kpi.formula}
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Category</span>
            <strong className="text-marine font-bold">{kpi.category}</strong>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Target Benchmark</span>
            <strong className="text-emerald-700 font-bold">
              {kpi.targetValue ? `${kpi.targetValue.toLocaleString()} ${kpi.unit}` : 'Standard SLA'}
            </strong>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Data Quality</span>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              {kpi.dataQuality || 'Live Synchronized'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Source DB Collections</span>
            <span className="text-[11px] font-mono text-slate-700 font-medium mt-0.5 block">
              {(kpi.sourceCollections || []).join(', ') || 'Central DB'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-marine text-white text-xs font-semibold rounded-xl hover:bg-marine-dark transition"
          >
            Close Definition
          </button>
        </div>
      </div>
    </div>
  );
}
