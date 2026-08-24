import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import KpiFormulaModal from '../../components/management/KpiFormulaModal';
import managementService from '../../services/managementService';
import toast from 'react-hot-toast';
import {
  Code2, Info, Search, Filter, ShieldCheck,
  Activity, Target, AlertTriangle, Layers
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export default function BusinessKpis() {
  const [kpis, setKpis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formulaModal, setFormulaModal] = useState({ isOpen: false, kpi: null });

  const fetchKpis = async () => {
    setIsLoading(true);
    try {
      const res = await managementService.getKpis();
      setKpis(res.data.data || []);
    } catch (err) {
      console.error('Failed to load KPI library', err);
      toast.error('Failed to load KPI definitions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const categories = ['All', 'Revenue', 'Finance', 'Sales', 'Operations', 'Coach'];

  const filteredKpis = kpis.filter((k) => {
    const matchesSearch =
      k.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.kpiId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || k.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Central KPI Library &amp; Versioning
            </h1>
            <p className="text-xs text-slate-500">
              Approved executive metrics catalog, version-controlled mathematical formulas, targets, and data quality standards.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                  selectedCategory === cat
                    ? 'bg-marine text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search formula, ID, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-marine"
            />
          </div>
        </div>

        {/* KPI Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent"></div>
          </div>
        ) : filteredKpis.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8">
            <Layers className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No KPI definitions found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search query.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredKpis.map((kpi) => (
              <Card
                key={kpi._id || kpi.kpiId}
                onClick={() => setFormulaModal({ isOpen: true, kpi })}
                className="bg-white border-slate-200 hover:border-slate-300 transition shadow-xs cursor-pointer group"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-400">{kpi.kpiId}</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          v{kpi.formulaVersion || '1.0.0'}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-marine mt-1">{kpi.name}</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {kpi.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{kpi.description}</p>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[11px] text-marine break-all">
                    {kpi.formula}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400">
                      Target: <strong className="text-emerald-600">{kpi.targetValue ? `${kpi.targetValue} ${kpi.unit}` : 'Standard'}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-marine group-hover:underline">
                      Inspect Formula →
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* KPI Formula Modal */}
      <KpiFormulaModal
        isOpen={formulaModal.isOpen}
        onClose={() => setFormulaModal({ isOpen: false, kpi: null })}
        kpi={formulaModal.kpi}
      />
    </DashboardLayout>
  );
}
