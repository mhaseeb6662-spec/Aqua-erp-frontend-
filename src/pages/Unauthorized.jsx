import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10 text-coral">
        <ShieldAlert className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-marine">You don't have access to this page</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        Your current role doesn't include the permissions needed to view this section. Contact an
        administrator if you believe this is a mistake.
      </p>
      <Link to="/dashboard" className="btn-primary mt-6">
        Back to dashboard
      </Link>
    </div>
  );
}
