import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Anchor, Eye, EyeOff, Waves } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(form.email, form.password);
      toast.success('Welcome back!');

      const roleSlug = loggedUser?.role?.slug;
      let defaultPath = '/dashboard';

      if (roleSlug === 'student') {
        defaultPath = '/student/dashboard';
      } else if (roleSlug === 'parent') {
        defaultPath = '/parent/dashboard';
      } else if (roleSlug === 'coach' || roleSlug === 'instructor' || roleSlug === 'head-coach') {
        defaultPath = '/coach/dashboard';
      } else if (roleSlug === 'operations-manager') {
        defaultPath = '/operations/dashboard';
      } else if (roleSlug === 'sales-agent') {
        defaultPath = '/leads';
      } else if (roleSlug === 'finance-officer') {
        defaultPath = '/finance/invoices';
      }

      // Check if from location belongs to user's permitted role
      const fromPath = location.state?.from?.pathname;
      let redirectTo = defaultPath;

      if (fromPath && fromPath !== '/login' && fromPath !== '/unauthorized') {
        const isStudentRoute = fromPath.startsWith('/student');
        const isParentRoute = fromPath.startsWith('/parent');
        const isCoachRoute = fromPath.startsWith('/coach');

        if (roleSlug === 'student' && !isParentRoute && !isCoachRoute && !fromPath.startsWith('/management') && !fromPath.startsWith('/finance') && !fromPath.startsWith('/operations')) {
          redirectTo = fromPath;
        } else if (roleSlug === 'parent' && !isStudentRoute && !isCoachRoute && !fromPath.startsWith('/management') && !fromPath.startsWith('/finance') && !fromPath.startsWith('/operations')) {
          redirectTo = fromPath;
        } else if ((roleSlug === 'coach' || roleSlug === 'instructor') && isCoachRoute) {
          redirectTo = fromPath;
        } else if (roleSlug === 'super-admin' || roleSlug === 'admin') {
          redirectTo = fromPath;
        }
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || (err.message === 'Network Error' ? 'Cannot connect to backend server. Please check your internet connection.' : err.message || 'Unable to log in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ripple-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Anchor className="h-6 w-6 text-white" />
          </span>
          <div className="leading-tight text-white">
            <p className="font-display text-lg font-bold">Aqua Fishing Academy</p>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-tide-light">
              Enterprise Resource Planning
            </p>
          </div>
        </div>

        <div className="max-w-md text-white">
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            One system.
            <br />
            Every branch, every booking.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/90">
            Phase 1 lays the foundation: secure sign-in, role-based access, and user
            management the entire academy will run on — from the sales desk to the
            dock.
          </p>
        </div>

        <div className="flex items-center gap-2 text-white/80">
          <Waves className="h-4 w-4 animate-drift" />
          <p className="text-xs font-semibold">Phase 1 — Project Foundation</p>
        </div>

        {/* wave divider signature element */}
        <svg
          className="absolute bottom-0 left-0 w-full text-white/[0.06]"
          viewBox="0 0 500 80"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,40 C120,80 180,0 300,40 C380,66 440,20 500,40 L500,80 L0,80 Z"
          />
        </svg>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-mist px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tide">
              <Anchor className="h-5 w-5 text-white" />
            </span>
            <p className="font-display text-base font-bold text-marine">Aqua Fishing Academy</p>
          </div>

          <h1 className="text-2xl font-bold text-marine">Sign in to your workspace</h1>
          <p className="mt-1.5 text-sm text-slate-600 font-medium">Enter your credentials to access the ERP dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-coral/20 bg-coral/5 px-4 py-3 text-sm font-bold text-coral">
                {error}
              </div>
            )}

            <div>
              <label className="label-field" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input-field"
                placeholder="you@aquafishingacademy.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label-field" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="mb-1.5 text-xs font-bold text-tide hover:text-tide-dark">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink/50">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-tide hover:text-tide-dark">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
