import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, MailCheck } from 'lucide-react';
import authService from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tide">
            <Anchor className="h-5 w-5 text-white" />
          </span>
          <p className="font-display text-base font-bold text-marine">Aqua Fishing Academy</p>
        </div>

        {sent ? (
          <div className="card text-center">
            <MailCheck className="mx-auto h-10 w-10 text-tide" />
            <h1 className="mt-4 text-lg font-bold text-marine">Check your email</h1>
            <p className="mt-2 text-sm text-ink/60">
              If an account exists for <span className="font-medium text-ink">{email}</span>, a reset link
              is on its way.
            </p>
            <Link to="/login" className="btn-secondary mt-6 w-full">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-marine">Reset your password</h1>
            <p className="mt-1.5 text-sm text-ink/60">We'll email you a link to reset it.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="label-field">Email address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-ink/50">
              <Link to="/login" className="font-semibold text-tide hover:text-tide-dark">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
