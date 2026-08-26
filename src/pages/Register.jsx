import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AcademyLogo from '../components/common/AcademyLogo';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', roleSlug: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const createdUser = await register(form);
      toast.success('Account created successfully!');
      if (form.roleSlug === 'parent' || createdUser.role?.slug === 'parent') {
        navigate('/parent/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/login">
            <AcademyLogo variant="login" />
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold text-marine text-center">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600 font-medium text-center">Student &amp; parent self-registration.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-lg border border-coral/20 bg-coral/5 px-4 py-3 text-sm text-coral">
              {error}
            </div>
          )}

          <div>
            <label className="label-field">Account Type</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, roleSlug: 'student' })}
                className={`rounded-xl p-3 text-xs font-bold border text-center transition ${
                  form.roleSlug === 'student'
                    ? 'border-tide bg-tide/10 text-tide shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🎓 Student Account
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, roleSlug: 'parent' })}
                className={`rounded-xl p-3 text-xs font-bold border text-center transition ${
                  form.roleSlug === 'parent'
                    ? 'border-tide bg-tide/10 text-tide shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                👨‍👩‍👧 Parent Account
              </button>
            </div>
          </div>

          <div>
            <label className="label-field">Full name</label>
            <input
              required
              className="input-field"
              placeholder="Jordan Blake"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Email address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Phone (optional)</label>
            <input
              className="input-field"
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
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

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-ink/50">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-tide hover:text-tide-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
