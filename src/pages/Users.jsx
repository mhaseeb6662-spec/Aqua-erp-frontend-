import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, FileSpreadsheet, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import UserFormModal from '../components/users/UserFormModal';
import StudentMigrationModal from '../components/users/StudentMigrationModal';
import userService from '../services/userService';
import roleService from '../services/roleService';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  const [formOpen, setFormOpen] = useState(false);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getUsers({ search, page, limit: 8 });
      setUsers(data.data);
      setMeta(data.meta);
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  const loadRoles = useCallback(async () => {
    try {
      const { data } = await roleService.getRoles();
      setRoles(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load roles. The "Add user" form needs at least one role to work.');
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadRoles(); }, [loadRoles]);

  const handleDelete = async () => {
    try {
      await userService.deleteUser(deleteTarget._id);
      toast.success('User deleted.');
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <DashboardLayout title="Users">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex items-center gap-3">
          {hasPermission('core:users:create') && (
            <>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                onClick={() => setMigrationModalOpen(true)}
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Migrate Students
              </button>

              <button
                className="btn-primary"
                onClick={() => { setEditingUser(null); setFormOpen(true); }}
              >
                <Plus className="h-4 w-4" />
                Add user
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card overflow-hidden !p-0">
        {loading ? (
          <Loader label="Loading users..." />
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500 font-medium">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-700">
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Branch</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-marine">{u.fullName}</p>
                      <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">{u.role?.name || '—'}</td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">{u.branch}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={u.status} /></td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        {hasPermission('core:users:update') && (
                          <button
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => { setEditingUser(u); setFormOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {hasPermission('core:users:delete') && (
                          <button
                            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => setDeleteTarget(u)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm text-ink/60">
          <p>{meta.total} user{meta.total === 1 ? '' : 's'} total</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary !px-2.5 !py-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-marine">{page} / {meta.totalPages}</span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary !px-2.5 !py-2 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); loadUsers(); }}
        roles={roles}
        editingUser={editingUser}
      />

      {migrationModalOpen && (
        <StudentMigrationModal
          onClose={() => setMigrationModalOpen(false)}
          onSuccess={() => {
            loadUsers();
          }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this user?"
        message={`This will permanently remove "${deleteTarget?.fullName}" from the system. This cannot be undone.`}
        confirmLabel="Delete user"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
