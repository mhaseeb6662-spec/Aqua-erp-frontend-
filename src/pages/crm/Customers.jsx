import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import SourceBadge from '../../components/crm/SourceBadge';
import StudentFormModal from '../../components/crm/StudentFormModal';
import customerService from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';

export default function Customers() {
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await customerService.getCustomers({ search, page, limit: 10 });
      setCustomers(data.data);
      setMeta(data.meta);
    } catch (err) {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const handleDelete = async () => {
    try {
      await customerService.deleteCustomer(deleteTarget._id);
      toast.success('Student removed.');
      setDeleteTarget(null);
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  return (
    <DashboardLayout title="Students">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            className="input-field pl-9"
            placeholder="Search students..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-sm text-ink/50 sm:block">New students can also come from a converted lead.</p>
          {hasPermission('crm:customers:create') && (
            <button className="btn-primary flex items-center gap-2" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add student
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden !p-0">
        {loading ? (
          <Loader label="Loading students..." />
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink/50">No students yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-marine/[0.06] bg-marine/[0.02] text-xs font-semibold uppercase tracking-wide text-ink/50">
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Original source</th>
                  <th className="px-6 py-3.5">Sales rep</th>
                  <th className="px-6 py-3.5">Converted</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} className="border-b border-marine/[0.04] last:border-0 hover:bg-marine/[0.015]">
                    <td className="px-6 py-3.5">
                      <Link to={`/customers/${c._id}`} className="font-medium text-marine hover:text-tide">{c.fullName}</Link>
                      <p className="text-xs text-ink/50">{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
                    </td>
                    <td className="px-6 py-3.5"><SourceBadge source={c.source} /></td>
                    <td className="px-6 py-3.5 text-ink/70">{c.assignedTo?.fullName || '—'}</td>
                    <td className="px-6 py-3.5 text-ink/70">
                      {c.convertedAt ? new Date(c.convertedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        {hasPermission('crm:customers:delete') && (
                          <button
                            className="rounded-lg p-2 text-ink/40 hover:bg-coral/10 hover:text-coral"
                            title="Delete"
                            onClick={() => setDeleteTarget(c)}
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
          <p>{meta.total} student{meta.total === 1 ? '' : 's'} total</p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !px-2.5 !py-2 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-marine">{page} / {meta.totalPages}</span>
            <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary !px-2.5 !py-2 disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Remove this student?"
        message={`This will permanently remove "${deleteTarget?.fullName}" from the student list. This cannot be undone.`}
        confirmLabel="Delete student"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <StudentFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => { setAddOpen(false); loadCustomers(); }}
      />
    </DashboardLayout>
  );
}
