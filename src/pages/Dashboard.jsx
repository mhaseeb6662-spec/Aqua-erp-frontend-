import { useEffect, useState } from 'react';
import { Users, ShieldCheck, CheckCircle2, Circle, Contact2, UserSquare2, BookOpen, MapPin, Calendar, FileText } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import roleService from '../services/roleService';
import leadService from '../services/leadService';
import customerService from '../services/customerService';
import portalService from '../services/portalService';

const PHASE4_CHECKLIST = [
  { label: 'Invoice generation (INV-XXXXXX) & line item calculations', done: true },
  { label: 'Online payment integration (Stripe / Credit Card / PayPal modal)', done: true },
  { label: 'Payment tracking & transaction history log', done: true },
  { label: 'Refund management & partial/full refund processing', done: true },
  { label: 'Revenue dashboard & financial KPIs (Revenue, MRR, Receivables)', done: true },
  { label: 'Financial reporting & exportable CSV income statements', done: true },
  { label: 'Outstanding payments list & automated payment reminders', done: true },
  { label: 'Receipt management (RCT-XXXXXX) & printable payment receipts', done: true },
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
    { label: 'Open Leads', value: stats.leads, icon: Contact2, permission: 'crm:leads:view' },
    { label: 'Customers', value: stats.customers, icon: UserSquare2, permission: 'crm:customers:view' },
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
          You're signed in as <span className="font-semibold text-white">{user?.role?.name}</span>. Phase 4
          — Finance &amp; Billing Module — is live! Issue invoices, accept online gateway payments, track transactions, process refunds, and view revenue analytics.
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
        <h3 className="text-base font-semibold text-marine">Phase 4 — Finance &amp; Billing Module Checklist</h3>
        <p className="mt-1 text-sm text-ink/60">
          All 8 requested Phase 4 scope items are fully developed and running in this release.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {PHASE4_CHECKLIST.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 text-sm">
              {item.done ? (
                <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0 text-tide" />
              ) : (
                <Circle className="h-4.5 w-4.5 flex-shrink-0 text-ink/20" />
              )}
              <span className={item.done ? 'text-ink font-medium' : 'text-ink/40'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
