import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Waves, ShieldCheck, CheckCircle2, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AcademyLogo from '../components/common/AcademyLogo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
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
    <div className="grid min-h-screen lg:grid-cols-12 bg-slate-50 selection:bg-tide selection:text-white">
      {/* Left Brand Showcase Panel (Desktop) */}
      <div className="relative hidden lg:col-span-5 xl:col-span-5 overflow-hidden bg-marine lg:flex lg:flex-col lg:justify-between p-12 text-white border-r border-marine-dark/40 shadow-2xl">
        {/* Subtle background wave patterns */}
        <div className="absolute inset-0 bg-radial-gradient from-tide/20 via-transparent to-transparent pointer-events-none opacity-50"></div>
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-tide/10 blur-3xl pointer-events-none"></div>

        {/* Top Brand Card */}
        <div className="relative z-10">
          <AcademyLogo variant="login-hero" />
        </div>

        {/* Center Pitch Content */}
        <div className="relative z-10 max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-tide-light backdrop-blur-md border border-white/15">
            <Waves className="h-3.5 w-3.5" />
            <span>Enterprise Resource Planning</span>
          </div>
          <h2 className="font-display text-3xl xl:text-4xl font-extrabold leading-tight text-white tracking-tight">
            One system.
            <br />
            Every branch, every booking.
          </h2>
          <p className="text-sm leading-relaxed text-slate-200">
            Welcome to the official Aqua Fishing Academy operations platform — streamlining student programs, coach schedules, marine boat management, and automated invoicing.
          </p>

          <div className="pt-2 space-y-2.5 text-xs text-slate-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Multi-Branch Academy Operations &amp; Real-Time Calendar</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Automated Billing, Invoicing &amp; Payment Gateway</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Dedicated Portals for Students, Parents, Coaches &amp; Admin</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-medium">256-bit Encrypted Session</span>
          </div>
          <span className="text-[11px] opacity-75">Aqua Fishing Academy © {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Right Form Panel (Universal) */}
      <div className="flex items-center justify-center lg:col-span-7 xl:col-span-7 px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md space-y-6">
          {/* Top Logo for Mobile and Form Anchor */}
          <div className="flex flex-col items-center text-center">
            <AcademyLogo variant="login" className="mb-3" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-marine tracking-tight">
              Sign in to your workspace
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
              Enter your credentials to access your authorized academy portal.
            </p>
          </div>

          {/* Form Card */}
          <div className="card !p-6 sm:!p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 animate-rise flex items-start gap-2">
                  <span className="shrink-0 text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="label-field !text-xs font-bold text-slate-700" htmlFor="email">
                  Email address / Username
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input-field !pl-10 !py-2.5 text-sm font-medium"
                    placeholder="name@aquafishingacademy.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="label-field !text-xs font-bold text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-bold text-tide hover:text-tide-dark transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="input-field !pl-10 !pr-11 !py-2.5 text-sm font-medium"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-tide focus:ring-tide"
                  />
                  <span className="text-xs font-semibold text-slate-600">Remember my session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3 text-sm font-extrabold shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </form>
          </div>

          {/* Registration Helper Links */}
          <div className="rounded-xl bg-white/60 border border-slate-200 p-3 text-center text-xs text-slate-600">
            <p>
              New Student or Parent?{' '}
              <Link to="/register" className="font-bold text-tide hover:text-tide-dark underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

