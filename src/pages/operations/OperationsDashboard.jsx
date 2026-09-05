import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Waves, AlertTriangle, CheckCircle2, CalendarDays, Ship, 
  HardHat, ShieldAlert, ArrowRight, RefreshCw, Anchor, Sparkles, Lock
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [stats, setStats] = useState({
    todaySessions: 0,
    activeTrips: 0,
    fleetReadiness: { total: 0, ready: 0, maintenance: 0 },
    pendingIncidents: 0,
    lowEquipment: 0,
    totalEquipment: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const canViewCalendar = hasPermission('crm:calendar:view') || hasPermission('portal:schedule:view');
  const canViewFleet = hasPermission('operations:fleet:view');
  const canViewEquipment = hasPermission('operations:equipment:view');
  const canViewIncidents = hasPermission('operations:incidents:view');

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/operations/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch operations stats', err);
      toast.error('Failed to refresh dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCalendarClick = () => {
    if (canViewCalendar) {
      navigate('/calendar');
    } else {
      toast.error('Access Denied: You do not have permission to view the session calendar.');
    }
  };

  return (
    <DashboardLayout title="Operations & Fleet Control">
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Operations & Boat Control</h1>
            <p className="text-xs text-slate-500">Live operational command center for boats, session delivery, equipment, and safety.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchStats}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 shadow-xs transition"
              title="Refresh Stats"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-xs font-semibold">Refresh</span>
            </button>
          </div>
        </div>

        {/* Main KPI Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card 
            onClick={handleCalendarClick}
            className={`bg-white border-slate-200 hover:border-slate-300 transition shadow-xs ${canViewCalendar ? 'cursor-pointer' : 'cursor-default opacity-90'}`}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Sessions</p>
                  {!canViewCalendar && <Lock className="h-3 w-3 text-slate-400" />}
                </div>
                <h3 className="text-2xl font-bold text-marine">{stats.todaySessions}</h3>
                <p className="text-[11px] text-slate-500">
                  {canViewCalendar ? 'Click to view master schedule' : 'Permission-restricted view'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
                <CalendarDays className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            onClick={handleCalendarClick}
            className={`bg-white border-slate-200 hover:border-slate-300 transition shadow-xs ${canViewCalendar ? 'cursor-pointer' : 'cursor-default opacity-90'}`}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Fishing Trips</p>
                  {!canViewCalendar && <Lock className="h-3 w-3 text-slate-400" />}
                </div>
                <h3 className="text-2xl font-bold text-indigo-600">{stats.activeTrips}</h3>
                <p className="text-[11px] text-slate-500">Offshore & coastal trips</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <Waves className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => canViewFleet && navigate('/operations/fleet')}
            className={`bg-white border-slate-200 hover:border-slate-300 transition shadow-xs ${canViewFleet ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Fleet Ready</p>
                <h3 className="text-2xl font-bold text-emerald-600">
                  {stats.fleetReadiness.ready} <span className="text-xs text-slate-400 font-normal">/ {stats.fleetReadiness.total}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {stats.fleetReadiness.maintenance > 0 ? `${stats.fleetReadiness.maintenance} under repair` : 'All ready for sea'}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <Ship className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => canViewIncidents && navigate('/operations/incidents')}
            className={`bg-white border-slate-200 hover:border-slate-300 transition shadow-xs ${canViewIncidents ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Incidents</p>
                <h3 className={`text-2xl font-bold ${stats.pendingIncidents > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {stats.pendingIncidents}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {stats.pendingIncidents === 0 ? 'Zero safety incidents' : 'Requires investigation'}
                </p>
              </div>
              <div className={`p-3.5 rounded-2xl ${stats.pendingIncidents > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card 
            onClick={() => canViewFleet && navigate('/operations/fleet')}
            className={`bg-white border-slate-200 transition group ${canViewFleet ? 'hover:border-marine/40 hover:shadow-md cursor-pointer' : 'opacity-80 cursor-default'}`}
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition">
                  <Anchor className="h-6 w-6" />
                </div>
                {canViewFleet ? (
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition text-marine" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-marine text-base">Boat Management</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage registered boats, maintenance logs, capacity limits, and inspection documents.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => canViewEquipment && navigate('/operations/equipment')}
            className={`bg-white border-slate-200 transition group ${canViewEquipment ? 'hover:border-marine/40 hover:shadow-md cursor-pointer' : 'opacity-80 cursor-default'}`}
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-105 transition">
                  <HardHat className="h-6 w-6" />
                </div>
                {canViewEquipment ? (
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition text-marine" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-marine text-base">Equipment & Tackle</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track fishing rods, reels, life jackets, tackle kits, damaged gear, and stock levels.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => canViewIncidents && navigate('/operations/incidents')}
            className={`bg-white border-slate-200 transition group ${canViewIncidents ? 'hover:border-marine/40 hover:shadow-md cursor-pointer' : 'opacity-80 cursor-default'}`}
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:scale-105 transition">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                {canViewIncidents ? (
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition text-marine" />
                ) : (
                  <Lock className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-marine text-base">Safety & Incidents</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Log injuries, weather disruptions, gear breakage, and maritime compliance logs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operational Warnings / Alerts */}
        {(stats.fleetReadiness.maintenance > 0 || stats.lowEquipment > 0 || stats.pendingIncidents > 0) && (
          <Card className="border-amber-200 bg-amber-50/70 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Operational Attention Required
              </h4>
              
              <div className="grid gap-2 sm:grid-cols-2 text-xs text-amber-900 pt-1">
                {stats.fleetReadiness.maintenance > 0 && (
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                    <Ship className="h-4 w-4 text-amber-700 shrink-0" />
                    <span><strong>{stats.fleetReadiness.maintenance} boat(s)</strong> currently under maintenance.</span>
                  </div>
                )}
                {stats.lowEquipment > 0 && (
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                    <HardHat className="h-4 w-4 text-amber-700 shrink-0" />
                    <span><strong>{stats.lowEquipment} equipment items</strong> are running low on stock.</span>
                  </div>
                )}
                {stats.pendingIncidents > 0 && (
                  <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200 sm:col-span-2">
                    <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
                    <span><strong>{stats.pendingIncidents} safety incident(s)</strong> awaiting resolution or follow-up.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
