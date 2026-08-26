import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, Waves, X, Anchor,
  Contact2, KanbanSquare, UserSquare2, Users2, BarChart3, Zap, CalendarDays,
  CreditCard, FileText, Banknote, Receipt, DollarSign, Wallet, GraduationCap, Ship, ShieldAlert, HardHat,
  TrendingUp, Activity, Award, Building, Layers, Bell, UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AcademyLogo from '../common/AcademyLogo';

// 1. STUDENT PORTAL NAVIGATION
const STUDENT_SECTIONS = [
  {
    title: 'Student Portal',
    items: [
      { to: '/student/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
      { to: '/student/profile', label: 'My Profile', icon: UserCircle },
      { to: '/programs', label: 'Academy Programs', icon: GraduationCap },
      { to: '/schedule', label: 'My Schedule', icon: CalendarDays },
      { to: '/bookings', label: 'My Bookings', icon: FileText },
      { to: '/documents', label: 'My Documents', icon: FileText },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

// 2. PARENT PORTAL NAVIGATION
const PARENT_SECTIONS = [
  {
    title: 'Parent Portal',
    items: [
      { to: '/parent/dashboard', label: 'Parent Dashboard', icon: LayoutDashboard },
      { to: '/parent/children', label: 'Linked Children', icon: Users },
      { to: '/parent/portal', label: 'Family Overview', icon: Contact2 },
      { to: '/programs', label: 'Program Catalogue', icon: GraduationCap },
      { to: '/schedule', label: 'Class Schedules', icon: CalendarDays },
      { to: '/bookings', label: 'Enrollments & Bookings', icon: FileText },
      { to: '/documents', label: 'Family Documents', icon: FileText },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

// 3. COACH PORTAL NAVIGATION
const COACH_SECTIONS = [
  {
    title: 'Coach Portal',
    items: [
      { to: '/coach/dashboard', label: 'Coach Dashboard', icon: LayoutDashboard },
      { to: '/coach/sessions', label: 'Assigned Sessions', icon: CalendarDays },
      { to: '/coach/students', label: 'My Students & Progress', icon: Users },
      { to: '/coach/certifications', label: 'My Certifications', icon: Award },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

// 4. SUPER ADMIN & STAFF NAVIGATION
const ADMIN_STAFF_SECTIONS = [
  {
    title: null,
    items: [
      { to: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, permission: 'core:users:view' },
    ],
  },
  {
    title: 'Management Command Center',
    items: [
      { to: '/management/dashboard', label: 'Executive Overview', icon: LayoutDashboard, permission: 'core:reports:view' },
      { to: '/management/revenue', label: 'Revenue Reconciliation', icon: DollarSign, permission: 'core:reports:view' },
      { to: '/management/sales', label: 'Sales Analytics', icon: TrendingUp, permission: 'core:reports:view' },
      { to: '/management/operations', label: 'Operations & Fleet', icon: Ship, permission: 'core:reports:view' },
      { to: '/management/staff', label: 'Coach & Staff Scorecard', icon: Award, permission: 'core:reports:view' },
      { to: '/management/branches', label: 'Branch Performance', icon: Building, permission: 'core:reports:view' },
      { to: '/management/programs', label: 'Program Rankings', icon: Layers, permission: 'core:reports:view' },
      { to: '/management/kpis', label: 'KPI Catalog & Versioning', icon: BarChart3, permission: 'core:reports:view' },
      { to: '/management/reports', label: 'Executive Reports', icon: FileText, permission: 'core:reports:view' },
      { to: '/management/audit', label: 'Audit Explorer', icon: ShieldCheck, permission: 'core:reports:view' },
    ],
  },
  {
    title: 'Sales CRM',
    items: [
      { to: '/leads', label: 'Leads', icon: Contact2, permission: 'crm:leads:view' },
      { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare, permission: 'crm:pipeline:view' },
      { to: '/customers', label: 'Customers', icon: UserSquare2, permission: 'crm:customers:view' },
      { to: '/calendar', label: 'Calendar', icon: CalendarDays, permission: 'crm:calendar:view' },
      { to: '/sales-team', label: 'Sales Team', icon: Users2, permission: 'crm:sales-team:view' },
      { to: '/sales-performance', label: 'Performance', icon: BarChart3, permission: 'crm:performance:view' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/operations/dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, permission: 'operations:dashboard:view' },
      { to: '/operations/fleet', label: 'Fleet Management', icon: Ship, permission: 'operations:fleet:view' },
      { to: '/operations/incidents', label: 'Incidents', icon: ShieldAlert, permission: 'operations:incidents:view' },
      { to: '/operations/equipment', label: 'Equipment & Inventory', icon: HardHat, permission: 'operations:equipment:view' },
    ],
  },
  {
    title: 'Finance & Billing',
    items: [
      { to: '/finance/dashboard', label: 'Finance Dashboard', icon: Wallet, permission: 'finance:reports:view' },
      { to: '/finance/invoices', label: 'Invoices', icon: FileText, permission: 'finance:invoices:view' },
      { to: '/finance/outstanding', label: 'Outstanding Payments', icon: CreditCard, permission: 'finance:invoices:view' },
      { to: '/finance/payments', label: 'Payment Tracking', icon: Banknote, permission: 'finance:payments:view' },
      { to: '/finance/receipts', label: 'Receipts', icon: Receipt, permission: 'finance:receipts:view' },
      { to: '/finance/refunds', label: 'Refunds', icon: DollarSign, permission: 'finance:refunds:manage' },
      { to: '/finance/reports', label: 'Financial Reports', icon: BarChart3, permission: 'finance:reports:view' },
    ],
  },
  {
    title: 'Academy Management',
    items: [
      { to: '/programs', label: 'Programs Catalogue', icon: GraduationCap, permission: 'portal:programs:view' },
      { to: '/schedule', label: 'Academy Schedule', icon: CalendarDays, permission: 'portal:schedule:view' },
      { to: '/bookings', label: 'All Bookings', icon: FileText, permission: 'portal:bookings:view' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/users', label: 'Users', icon: Users, permission: 'core:users:view' },
      { to: '/roles', label: 'Roles & Permissions', icon: ShieldCheck, permission: 'core:roles:view' },
      { to: '/integrations', label: 'Integrations', icon: Zap, permission: 'core:settings:manage' },
      { to: '/admin/notifications/monitor', label: 'Notification Monitor', icon: Bell, permission: 'core:settings:manage' },
      { to: '/reports', label: 'Reports & Analytics', icon: FileText, permission: 'core:reports:view' },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { user, hasPermission } = useAuth();
  const roleSlug = user?.role?.slug;

  // Resolve role-specific navigation sections
  let activeSections = ADMIN_STAFF_SECTIONS;
  let portalBadge = 'Enterprise ERP';

  if (roleSlug === 'student') {
    activeSections = STUDENT_SECTIONS;
    portalBadge = 'Student Portal';
  } else if (roleSlug === 'parent') {
    activeSections = PARENT_SECTIONS;
    portalBadge = 'Parent Portal';
  } else if (roleSlug === 'coach' || roleSlug === 'instructor' || roleSlug === 'head-coach') {
    activeSections = COACH_SECTIONS;
    portalBadge = 'Coach Portal';
  } else if (roleSlug === 'super-admin') {
    portalBadge = 'Super Admin Command';
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-marine-dark/50 backdrop-blur-xs lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 transform bg-marine text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full max-h-screen flex-col overflow-hidden">
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 shrink-0">
            <Link to="/dashboard" className="flex-1 pr-2">
              <AcademyLogo variant="sidebar" />
            </Link>
            <button className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 lg:hidden transition" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role / Portal Context Badge */}
          <div className="mx-4 mt-3 mb-3 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 flex items-center justify-between shadow-2xs shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-tide-light">{portalBadge}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* Nav: Scrollable Navigation with min-h-0 and custom scrollbar */}
          <nav className="flex-1 min-h-0 space-y-4 overflow-y-auto px-3 py-2 sidebar-scroll">
            {activeSections.map((section) => {
              const items = section.items.filter((item) => !item.permission || hasPermission(item.permission));
              if (items.length === 0) return null;
              return (
                <div key={section.title || 'main'}>
                  {section.title && (
                    <p className="mb-1.5 px-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/75">
                      {section.title}
                    </p>
                  )}
                  <div className="space-y-1">
                    {items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors
                          ${isActive ? 'bg-white/15 text-white font-bold shadow-xs' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Hook-shaped active indicator */}
                            {isActive && (
                              <span className="absolute -left-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-tr-full border-t-2 border-r-2 border-sandbar" />
                            )}
                            <item.icon className="h-4.5 w-4.5" strokeWidth={2} />
                            {item.label}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Original Footer */}
          <div className="mx-3 mb-5 mt-auto rounded-xl bg-white/5 p-3.5 border border-white/5 shrink-0">
            <div className="flex items-center gap-2 text-tide-light">
              <Waves className="h-4 w-4 animate-drift" />
              <p className="text-xs font-bold uppercase tracking-wide">Aqua ERP 2.0</p>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-300">
              Role-Isolated Portal Architecture
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
