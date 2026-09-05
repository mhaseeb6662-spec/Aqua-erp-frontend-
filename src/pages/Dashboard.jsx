import { useEffect, useState } from 'react';
import { Users, ShieldCheck, CheckCircle2, Contact2, UserSquare2, BookOpen, MapPin, Calendar, FileText, TrendingUp, CreditCard, Sparkles } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import roleService from '../services/roleService';
import leadService from '../services/leadService';
import customerService from '../services/customerService';
import portalService from '../services/portalService';

const SYSTEM_MODULES = [
  { label: 'Sales CRM & Live Pipeline Tracking', status: 'Operational', desc: 'Inbound leads, multi-stage pipeline, and conversion analytics' },
  { label: 'Finance, Invoicing & Multi-Gateway Checkout', status: 'Operational', desc: 'Automated invoices, Tabby, PayTabs, TotalPay & Tax Receipts' },
  { label: 'Class Scheduling & Branch Operations', status: 'Operational', desc: 'Daily calendars, trainer rosters, and student attendance' },
  { label: 'Student & Parent Self-Service Portals', status: 'Operational', desc: 'Online booking, progress reports, and receipt downloads' },
  { label: 'Fleet & Equipment Safety Compliance', status: 'Operational', desc: 'Vessel logs, safety checklists, and incident reporting' },
  { label: 'Executive Management Command Center', status: 'Operational', desc: 'Real-time KPIs, cross-branch analytics, and exportable reports' },
];

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState({ users: null, roles: null, leads: null, customers: null, programs: null, branches: null });

  useEffect(() => {
    if (user?.role?.slug === 'student') {
      window.location.replace('/student/dashboard');
      return;
    }
    if (user?.role?.slug === 'parent') {
      window.location.replace('/parent/dashboard');
      return;
    }
    if (user?.role?.slug === 'coach' || user?.role?.slug === 'instructor' || user?.role?.slug === 'head-coach') {
      window.location.replace('/coach/dashboard');
      return;
    }
    if (user?.role?.slug === 'operations-manager') {
      window.location.replace('/operations/dashboard');
      return;
    }
    if (user?.role?.slug === 'sales-agent') {
      window.location.replace('/leads');
      return;
    }
    if (user?.role?.slug === 'finance-officer') {
      window.location.replace('/finance/invoices');
      return;
    }

    const load = async () => {
      try {
        if (hasPermission('core:users:view')) {
          const { data } = await userService.getUsers({ limit: 1 });
          setStats((s) => ({ ...s, users: data.meta?.total ?? 0 }));
        }
        if (hasPermission('core:roles:view')) {
          const { data } = await roleService.getRoles();
          setStats((s) => ({ ...s, roles: data.data?.length ?? 0 }));
        }
        if (hasPermission('crm:leads:view')) {
          const { data } = await leadService.getLeads({ limit: 1 });
          setStats((s) => ({ ...s, leads: data.meta?.total ?? 0 }));
        }
        if (hasPermission('crm:customers:view')) {
          const { data } = await customerService.getCustomers({ limit: 1 });
          setStats((s) => ({ ...s, customers: data.meta?.total ?? 0 }));
        }
        if (hasPermission('portal:programs:view')) {
          const { data } = await portalService.getPrograms();
          setStats((s) => ({ ...s, programs: data.data?.length ?? 0 }));
        }
        if (hasPermission('portal:branches:view')) {
          const { data } = await portalService.getBranches();
          setStats((s) => ({ ...s, branches: data.data?.length ?? 0 }));
        }
      } catch (err) {
        // silently ignore on dashboard widgets
      }
    };
    load();
  }, [hasPermission]);

  const cards = [
    { label: 'Active Programs', value: stats.programs, icon: BookOpen, permission: 'portal:programs:view' },
    { label: 'Academy Branches', value: stats.branches, icon: MapPin, permission: 'portal:branches:view' },
    { label: 'Total Leads in CRM', value: stats.leads, icon: Contact2, permission: 'crm:leads:view' },
    { label: 'Students', value: stats.customers, icon: UserSquare2, permission: 'crm:customers:view' },
    { label: 'Total Users', value: stats.users, icon: Users, permission: 'core:users:view' },
    { label: 'System Roles', value: stats.roles, icon: ShieldCheck, permission: 'core:roles:view' },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-8 rounded-2xl bg-ripple-gradient p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tide-light">
          Welcome back
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{user?.fullName?.split(' ')[0]} 👋</h2>
        <p className="mt-2 max-w-xl text-sm text-white/70">
          You're signed in as <span className="font-semibold text-white">{user?.role?.name}</span>. Monitor sales performance, operational schedules, course bookings, and financial metrics in real-time across the Academy.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards
          .filter((c) => !c.permission || hasPermission(c.permission))
          .map((c) => (
            <div key={c.label} className="card flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tide/10 text-tide">
                <c.icon className="h-5.5 w-5.5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{c.label}</p>
                <p className="mt-0.5 text-2xl font-bold text-marine">{c.value ?? '—'}</p>
              </div>
            </div>
          ))}
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-marine">Academy Management System Modules</h3>
            <p className="mt-0.5 text-xs text-ink/60">
              Live enterprise architecture running across Sales, Operations, Finance, and Portals.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> System Active
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SYSTEM_MODULES.map((mod) => (
            <div key={mod.label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-marine">{mod.label}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {mod.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{mod.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
