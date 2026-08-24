import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function KpiCard({
  title,
  value,
  unit = '',
  prevValue,
  changePercent,
  dataQuality = 'Live',
  kpiId,
  details,
  icon: Icon,
  iconBg = 'bg-blue-50 text-blue-600',
  onDrilldown,
  onInfoClick,
}) {
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;

  const formatValue = (v) => {
    if (v === undefined || v === null) return '0';
    if (typeof v === 'number') {
      return v.toLocaleString();
    }
    return v;
  };

  return (
    <Card className="bg-white border-slate-200 hover:border-slate-300 transition shadow-xs group">
      <CardContent className="p-5 space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-105 transition`}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold font-mono text-slate-500">{kpiId}</span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                    dataQuality === 'Live'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                      : dataQuality === 'Estimated'
                      ? 'bg-purple-50 text-purple-800 border border-purple-300 font-bold'
                      : 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                  }`}
                >
                  {dataQuality}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-700 mt-0.5">{title}</h4>
            </div>
          </div>

          {onInfoClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick();
              }}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition"
              title="View KPI Definition & Formula"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Big Metric Value */}
        <div className="pt-1">
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-black tracking-tight text-marine">
              {formatValue(value)}
            </h3>
            {unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
          </div>
          {details && <p className="text-[11px] text-slate-600 font-medium mt-0.5">{details}</p>}
        </div>

        {/* Bottom Comparison & Drill-down Link */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          {changePercent !== undefined && changePercent !== null ? (
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold text-[11px] ${
                  isPositive
                    ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    : isNegative
                    ? 'text-rose-800 bg-rose-50 border border-rose-200'
                    : 'text-slate-700 bg-slate-100 border border-slate-200'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : isNegative ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {Math.abs(changePercent)}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">vs prev period</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 font-medium">Target Tracked</span>
          )}

          {onDrilldown && (
            <button
              onClick={onDrilldown}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-marine hover:text-marine-dark hover:underline transition"
            >
              <span>Trace</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
