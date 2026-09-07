import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../services/userService';

const emptyForm = { fullName: '', email: '', password: '', phone: '', role: '', branch: 'Main Branch', status: 'active' };

export default function UserFormModal({ open, onClose, onSaved, roles, editingUser }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingUser) {
      setForm({
        fullName: editingUser.fullName,
        email: editingUser.email,
        password: '',
        phone: editingUser.phone || '',
        role: editingUser.role?._id || '',
        branch: editingUser.branch || 'Main Branch',
        status: editingUser.status,
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [editingUser, open]);

  const selectedRoleDoc = roles.find((r) => r._id === form.role);
  const isStudentRole = selectedRoleDoc?.slug === 'student' || selectedRoleDoc?.name?.toLowerCase() === 'student';

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrim = (form.email || '').trim();

    if (isStudentRole) {
      if (emailTrim) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrim)) {
          setError('Please provide a valid email address, or leave it blank.');
          return;
        }
      }
    } else {
      if (!emailTrim) {
        setError('Email address is required for this role.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrim)) {
        setError('Please provide a valid email address.');
        return;
      }
    }

    setLoading(true);
    try {
      if (editingUser) {
        const { password, ...updatePayload } = form;
        updatePayload.email = emailTrim;
        await userService.updateUser(editingUser._id, updatePayload);
        toast.success('User updated successfully.');
      } else {
        const createPayload = { ...form, email: emailTrim };
        const res = await userService.createUser(createPayload);
        const createdUser = res?.data?.data;
        if (isStudentRole && createdUser?.studentCode) {
          toast.success(`Student created! Student ID: ${createdUser.studentCode}`);
        } else {
          toast.success('User created successfully.');
        }
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md animate-rise overflow-y-auto rounded-2xl bg-white p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-marine">
            {editingUser ? 'Edit user' : 'Add new user'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-coral/20 bg-coral/5 px-4 py-2.5 text-sm font-bold text-coral">
              {error}
            </div>
          )}

          {roles.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900">
              No roles are available yet, so a user can't be created. Go to Roles &amp; Permissions and create at least one role first.
            </div>
          )}

          <div>
            <label className="label-field">Full name</label>
            <input
              required
              className="input-field"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="label-field">
              {isStudentRole ? 'Email (Optional)' : 'Email address *'}
            </label>
            <input
              type="text"
              required={!isStudentRole}
              className="input-field"
              placeholder={isStudentRole ? 'Optional contact email' : 'user@aquafishingacademy.com'}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {isStudentRole && (
              <p className="mt-1 text-xs text-slate-500">
                Optional for students. If omitted, student can log in using their generated Student ID.
              </p>
            )}
          </div>

          {!editingUser && (
            <div>
              <label className="label-field">Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="input-field"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Phone</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">Branch</label>
              <input
                className="input-field"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Role</label>
              <select
                required
                className="input-field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="" disabled>Select a role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading || roles.length === 0} className="btn-primary">
              {loading ? 'Saving...' : editingUser ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
