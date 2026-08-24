import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth & Core
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Integrations from './pages/Integrations';

import ProtectedRoute from './components/common/ProtectedRoute';

// CRM
import Leads from './pages/crm/Leads';
import LeadDetail from './pages/crm/LeadDetail';
import Pipeline from './pages/crm/Pipeline';
import Customers from './pages/crm/Customers';
import CustomerDetail from './pages/crm/CustomerDetail';
import SalesTeam from './pages/crm/SalesTeam';
import SalesPerformance from './pages/crm/SalesPerformance';
import CalendarPage from './pages/crm/Calendar';

// Coach
import CoachDashboard from './pages/coach/CoachDashboard';
import CoachMyCertifications from './pages/coach/CoachMyCertifications';
import CoachSessionDetail from './pages/coach/CoachSessionDetail';
import CoachSessions from './pages/coach/CoachSessions';
import CoachStudents from './pages/coach/CoachStudents';

// Finance
import FinanceDashboard from './pages/finance/FinanceDashboard';
import FinancialReports from './pages/finance/FinancialReports';
import Invoices from './pages/finance/Invoices';
import OutstandingPayments from './pages/finance/OutstandingPayments';
import PaymentsTracking from './pages/finance/PaymentsTracking';
import ReceiptsManagement from './pages/finance/ReceiptsManagement';
import RefundsManagement from './pages/finance/RefundsManagement';

// Operations
import OperationsDashboard from './pages/operations/OperationsDashboard';
import FleetManagement from './pages/operations/FleetManagement';
import IncidentReports from './pages/operations/IncidentReports';
import EquipmentInventory from './pages/operations/EquipmentInventory';

// Management Command Center (Phase 7)
import ManagementDashboard from './pages/management/ManagementDashboard';
import RevenueAnalytics from './pages/management/RevenueAnalytics';
import SalesAnalytics from './pages/management/SalesAnalytics';
import OperationsAnalytics from './pages/management/OperationsAnalytics';
import StaffCoachPerformance from './pages/management/StaffCoachPerformance';
import BranchPerformance from './pages/management/BranchPerformance';
import ProgramAnalytics from './pages/management/ProgramAnalytics';
import BusinessKpis from './pages/management/BusinessKpis';
import ManagementReports from './pages/management/ManagementReports';
import AuditExplorer from './pages/management/AuditExplorer';

// Phase 9 - Reports & Notifications Monitoring
import NotificationMonitor from './pages/admin/NotificationMonitor';
import ReportsHub from './pages/reports/ReportsHub';

// Portal
import Bookings from './pages/portal/Bookings';
import BranchSelection from './pages/portal/BranchSelection';
import Documents from './pages/portal/Documents';
import Notifications from './pages/portal/Notifications';
import ParentChildren from './pages/portal/ParentChildren';
import ParentDashboard from './pages/portal/ParentDashboard';
import ParentPortal from './pages/portal/ParentPortal';
import ProgramCatalogue from './pages/portal/ProgramCatalogue';
import Schedule from './pages/portal/Schedule';
import StudentDashboard from './pages/portal/StudentDashboard';
import StudentProfile from './pages/portal/StudentProfile';

import { useAuth } from './context/AuthContext';
import Loader from './components/common/Loader';

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loader fullScreen label="Resolving your portal..." />;
  if (!user) return <Navigate to="/login" replace />;

  const roleSlug = user.role?.slug;
  if (roleSlug === 'student') return <Navigate to="/student/dashboard" replace />;
  if (roleSlug === 'parent') return <Navigate to="/parent/dashboard" replace />;
  if (roleSlug === 'coach' || roleSlug === 'instructor' || roleSlug === 'head-coach') return <Navigate to="/coach/dashboard" replace />;
  if (roleSlug === 'operations-manager') return <Navigate to="/operations/dashboard" replace />;
  if (roleSlug === 'sales-agent') return <Navigate to="/leads" replace />;
  if (roleSlug === 'finance-officer') return <Navigate to="/finance/invoices" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 1. Super Admin & Core Management Portal */}
        <Route path="/dashboard" element={<ProtectedRoute forbidRoles={['student', 'parent']}><Dashboard /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute permission="core:users:view"><Users /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute permission="core:roles:view"><Roles /></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute permission="core:settings:manage"><Integrations /></ProtectedRoute>} />
        <Route path="/admin/notifications/monitor" element={<ProtectedRoute permission="core:settings:manage"><NotificationMonitor /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute permission="core:reports:view"><ReportsHub /></ProtectedRoute>} />

        {/* 2. Sales CRM */}
        <Route path="/leads" element={<ProtectedRoute permission="crm:leads:view"><Leads /></ProtectedRoute>} />
        <Route path="/leads/:id" element={<ProtectedRoute permission="crm:leads:view"><LeadDetail /></ProtectedRoute>} />
        <Route path="/pipeline" element={<ProtectedRoute permission="crm:pipeline:view"><Pipeline /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute permission="crm:customers:view"><Customers /></ProtectedRoute>} />
        <Route path="/customers/:id" element={<ProtectedRoute permission="crm:customers:view"><CustomerDetail /></ProtectedRoute>} />
        <Route path="/sales-team" element={<ProtectedRoute permission={['crm:sales-team:view', 'crm:leads:assign', 'crm:leads:view']}><SalesTeam /></ProtectedRoute>} />
        <Route path="/sales-performance" element={<ProtectedRoute permission="crm:performance:view"><SalesPerformance /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute permission={['crm:calendar:view', 'portal:schedule:view']}><CalendarPage /></ProtectedRoute>} />

        {/* 3. Coach Portal */}
        <Route path="/coach/dashboard" element={<ProtectedRoute portalType="coach"><CoachDashboard /></ProtectedRoute>} />
        <Route path="/coach/certifications" element={<ProtectedRoute portalType="coach"><CoachMyCertifications /></ProtectedRoute>} />
        <Route path="/coach/my-certifications" element={<ProtectedRoute portalType="coach"><CoachMyCertifications /></ProtectedRoute>} />
        <Route path="/coach/sessions" element={<ProtectedRoute portalType="coach"><CoachSessions /></ProtectedRoute>} />
        <Route path="/coach/reports" element={<ProtectedRoute portalType="coach"><CoachSessions /></ProtectedRoute>} />
        <Route path="/coach/sessions/:id" element={<ProtectedRoute portalType="coach"><CoachSessionDetail /></ProtectedRoute>} />
        <Route path="/coach/students" element={<ProtectedRoute portalType="coach"><CoachStudents /></ProtectedRoute>} />

        {/* 4. Finance & Billing */}
        <Route path="/finance/dashboard" element={<ProtectedRoute permission={['finance:reports:view', 'finance:invoices:view']}><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/finance/reports" element={<ProtectedRoute permission="finance:reports:view"><FinancialReports /></ProtectedRoute>} />
        <Route path="/finance/invoices" element={<ProtectedRoute permission="finance:invoices:view"><Invoices /></ProtectedRoute>} />
        <Route path="/finance/outstanding" element={<ProtectedRoute permission="finance:invoices:view"><OutstandingPayments /></ProtectedRoute>} />
        <Route path="/finance/payments" element={<ProtectedRoute permission="finance:payments:view"><PaymentsTracking /></ProtectedRoute>} />
        <Route path="/finance/receipts" element={<ProtectedRoute permission="finance:receipts:view"><ReceiptsManagement /></ProtectedRoute>} />
        <Route path="/finance/refunds" element={<ProtectedRoute permission={['finance:refunds:manage', 'finance:payments:view']}><RefundsManagement /></ProtectedRoute>} />

        {/* 5. Operations & Fleet */}
        <Route path="/operations/dashboard" element={<ProtectedRoute permission={['operations:dashboard:view', 'portal:schedule:view']}><OperationsDashboard /></ProtectedRoute>} />
        <Route path="/operations/fleet" element={<ProtectedRoute permission="operations:fleet:view"><FleetManagement /></ProtectedRoute>} />
        <Route path="/operations/incidents" element={<ProtectedRoute permission="operations:incidents:view"><IncidentReports /></ProtectedRoute>} />
        <Route path="/operations/equipment" element={<ProtectedRoute permission="operations:equipment:view"><EquipmentInventory /></ProtectedRoute>} />

        {/* 6. Management Command Center */}
        <Route path="/management/dashboard" element={<ProtectedRoute permission="core:reports:view"><ManagementDashboard /></ProtectedRoute>} />
        <Route path="/management/revenue" element={<ProtectedRoute permission="core:reports:view"><RevenueAnalytics /></ProtectedRoute>} />
        <Route path="/management/sales" element={<ProtectedRoute permission="core:reports:view"><SalesAnalytics /></ProtectedRoute>} />
        <Route path="/management/operations" element={<ProtectedRoute permission="core:reports:view"><OperationsAnalytics /></ProtectedRoute>} />
        <Route path="/management/staff" element={<ProtectedRoute permission="core:reports:view"><StaffCoachPerformance /></ProtectedRoute>} />
        <Route path="/management/branches" element={<ProtectedRoute permission="core:reports:view"><BranchPerformance /></ProtectedRoute>} />
        <Route path="/management/programs" element={<ProtectedRoute permission="core:reports:view"><ProgramAnalytics /></ProtectedRoute>} />
        <Route path="/management/kpis" element={<ProtectedRoute permission="core:reports:view"><BusinessKpis /></ProtectedRoute>} />
        <Route path="/management/reports" element={<ProtectedRoute permission="core:reports:view"><ManagementReports /></ProtectedRoute>} />
        <Route path="/management/audit" element={<ProtectedRoute permission="core:reports:view"><AuditExplorer /></ProtectedRoute>} />

        {/* 7. Student Portal */}
        <Route path="/student/dashboard" element={<ProtectedRoute portalType="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute portalType="student"><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/programs" element={<ProtectedRoute permission="portal:programs:view"><ProgramCatalogue /></ProtectedRoute>} />
        <Route path="/student/schedule" element={<ProtectedRoute permission="portal:schedule:view"><Schedule /></ProtectedRoute>} />
        <Route path="/student/bookings" element={<ProtectedRoute permission="portal:bookings:view"><Bookings /></ProtectedRoute>} />

        {/* 8. Parent Portal */}
        <Route path="/parent/dashboard" element={<ProtectedRoute portalType="parent"><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/children" element={<ProtectedRoute portalType="parent"><ParentChildren /></ProtectedRoute>} />
        <Route path="/parent/portal" element={<ProtectedRoute portalType="parent"><ParentPortal /></ProtectedRoute>} />
        <Route path="/parent/programs" element={<ProtectedRoute permission="portal:programs:view"><ProgramCatalogue /></ProtectedRoute>} />
        <Route path="/parent/schedule" element={<ProtectedRoute permission="portal:schedule:view"><Schedule /></ProtectedRoute>} />
        <Route path="/parent/bookings" element={<ProtectedRoute permission="portal:bookings:view"><Bookings /></ProtectedRoute>} />

        {/* 9. Shared Portal Features */}
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/portal/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/programs" element={<ProtectedRoute permission="portal:programs:view"><ProgramCatalogue /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute permission="portal:schedule:view"><Schedule /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute permission="portal:bookings:view"><Bookings /></ProtectedRoute>} />
        <Route path="/branch-selection" element={<ProtectedRoute><BranchSelection /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}