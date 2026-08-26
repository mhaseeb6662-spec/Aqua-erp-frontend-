import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, Waves, X, Anchor,
  Contact2, KanbanSquare, UserSquare2, Users2, BarChart3, Zap, CalendarDays,
  CreditCard, FileText, Banknote, Receipt, DollarSign, Wallet, GraduationCap, Ship, ShieldAlert, HardHat,
  TrendingUp, Activity, Award, Building, Layers, Bell, UserCircle, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen
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

export default function Sidebar({ open, onClose, collapsed = false, onToggleCollapse }) {
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

  const desktopWidthClass = collapsed ? 'lg:w-20' : 'lg:w-64';

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-marine-dark/50 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 transform bg-marine text-white transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${desktopWidthClass} ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Brand Header */}
          <div className={`flex items-center justify-between border-b border-white/10 ${collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-5'}`}>
            <Link to="/dashboard" className={`flex items-center ${collapsed ? 'justify-center' : 'flex-1 pr-2'}`}>
              <AcademyLogo variant="sidebar" className={collapsed ? 'max-h-8 max-w-8' : ''} />
            </Link>
            <button
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 lg:hidden transition"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role / Portal Context Badge */}
          {!collapsed && (
            <div className="mx-4 mt-3 mb-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 flex items-center justify-between shadow-2xs shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-tide-light truncate">{portalBadge}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1"></span>
            </div>
          )}

          {/* Navigation Links with custom scrollbar */}
          <nav className={`flex-1 overflow-y-auto overflow-x-hidden space-y-4 py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
            {activeSections.map((section) => {
              const items = section.items.filter((item) => !item.permission || hasPermission(item.permission));
              if (items.length === 0) return null;

              return (
                <div key={section.title || 'main'}>
                  {section.title && !collapsed && (
                    <p className="mb-1.5 px-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/70 truncate">
                      {section.title}
                    </p>
                  )}
                  {section.title && collapsed && (
                    <div className="my-2 border-t border-white/10 mx-2" />
                  )}
                  <div className="space-y-1">
                    {items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          `group relative flex items-center rounded-xl text-sm font-semibold transition-all duration-150 ${
                            collapsed
                              ? 'justify-center p-3'
                              : 'gap-3 px-3.5 py-2.5'
                          } ${
                            isActive
                              ? 'bg-white/15 text-white font-bold shadow-xs'
                              : 'text-slate-200 hover:bg-white/10 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active indicator */}
                            {isActive && !collapsed && (
                              <span className="absolute -left-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-tr-full border-t-2 border-r-2 border-sandbar" />
                            )}
                            <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
                            {!collapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                            {/* Tooltip on collapsed hover */}
                            {collapsed && (
                              <div className="fixed left-20 ml-2 hidden rounded-md bg-marine-dark px-2.5 py-1 text-xs font-bold text-white shadow-lg group-hover:block z-50 whitespace-nowrap pointer-events-none border border-white/10">
                                {item.label}
                              </div>
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer & Collapse Toggle Button */}
          <div className="border-t border-white/10 p-3 shrink-0 bg-marine/95">
            {/* Collapse toggle (Desktop only) */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`hidden lg:flex w-full items-center rounded-xl p-2 text-xs font-bold text-white/75 hover:bg-white/10 hover:text-white transition ${
                collapsed ? 'justify-center' : 'justify-between px-3'
              }`}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {!collapsed && <span>Collapse Sidebar</span>}
              {collapsed ? (
                <ChevronRight className="h-4 w-4 text-tide-light" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-tide-light" />
              )}
            </button>

            {/* Version branding */}
            {!collapsed && (
              <div className="mt-2 rounded-xl bg-white/5 p-2.5 border border-white/5">
                <div className="flex items-center gap-1.5 text-tide-light">
                  <Waves className="h-3.5 w-3.5 animate-drift" />
                  <p className="text-[11px] font-bold uppercase tracking-wide">Aqua ERP 2.0</p>
                </div>
                <p className="mt-0.5 text-[9px] leading-relaxed text-slate-300 truncate">
                  Role-Isolated Architecture
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
