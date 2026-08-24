import { useEffect, useState } from 'react';
import { ShieldCheck, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import roleService from '../services/roleService';
import { useAuth } from '../context/AuthContext';

const PERMISSION_LABELS = {
  'core:users:view': 'View users',
  'core:users:create': 'Create users',
  'core:users:update': 'Update users',
  'core:users:delete': 'Delete users',
  'core:roles:view': 'View roles',
  'core:roles:manage': 'Manage roles & permissions',
  'core:settings:manage': 'Manage system settings',
};

export default function Roles() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions(),
      ]);
      setRoles(rolesRes.data.data);
      setPermissions(Object.values(permsRes.data.data));
    } catch (err) {
      toast.error('Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePermission = async (role, permission) => {
    if (role.slug === 'super-admin') return;
    const has = role.permissions.includes(permission);
    const updatedPermissions = has
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];

    setSaving(role._id);
    try {
      const { data } = await roleService.updateRole(role._id, { permissions: updatedPermissions });
      setRoles((prev) => prev.map((r) => (r._id === role._id ? data.data : r)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update permission.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Roles & Permissions">
        <Loader label="Loading roles..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Roles & Permissions">
      <p className="mb-6 max-w-2xl text-sm text-ink/60">
        Roles determine what each staff member can see and do. System roles ship with the platform
        and power feature access across every phase of the ERP.
      </p>

      <div className="space-y-3">
        {roles.map((role) => {
          const isOpen = expanded === role._id;
          const isSuperAdmin = role.slug === 'super-admin';

          return (
            <div key={role._id} className="card !p-0 overflow-hidden">
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                onClick={() => setExpanded(isOpen ? null : role._id)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tide/10 text-tide">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-marine">
                      {role.name}
                      {role.isSystem && (
                        <span className="badge bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                          <Lock className="h-3 w-3" /> System
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-600 font-medium">{role.description || 'No description provided.'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">
                    {isSuperAdmin ? 'All permissions' : `${role.permissions.length} permission${role.permissions.length === 1 ? '' : 's'}`}
                  </span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-5">
                  {isSuperAdmin ? (
                    <p className="text-sm text-slate-600 font-medium">
                      The Super Admin role always has full access and cannot be restricted.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {permissions.map((perm) => (
                        <label
                          key={perm}
                          className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm hover:border-slate-300"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-tide focus:ring-tide"
                            checked={role.permissions.includes(perm)}
                            disabled={!hasPermission('core:roles:manage') || saving === role._id}
                            onChange={() => togglePermission(role, perm)}
                          />
                          <span className="text-slate-800 font-medium">{PERMISSION_LABELS[perm] || perm}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
