import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children, permission, allowedRoles, forbidRoles, portalType }) {
  const { user, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader fullScreen label="Checking your session..." />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleSlug = user.role?.slug;
  const isSuperAdmin = roleSlug === 'super-admin';

  // 1. Self-service portal isolation checks
  if (portalType === 'student' && roleSlug !== 'student') {
    return <Navigate to="/unauthorized" replace />;
  }
  if (portalType === 'parent' && roleSlug !== 'parent') {
    return <Navigate to="/unauthorized" replace />;
  }
  if (portalType === 'coach' && !['coach', 'instructor', 'head-coach'].includes(roleSlug)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 2. Strict role exclusion (unless Super Admin)
  if (forbidRoles && forbidRoles.includes(roleSlug) && !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Strict role whitelisting (if specified, unless Super Admin)
  if (allowedRoles && !allowedRoles.includes(roleSlug) && !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Granular RBAC permission check (Super Admin automatically passes via hasPermission)
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
