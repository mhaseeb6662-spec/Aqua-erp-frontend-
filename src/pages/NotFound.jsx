import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tide/10 text-tide">
        <Waves className="h-8 w-8" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold text-marine">404 — Lost at sea</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        The page you're looking for has drifted off course. Let's get you back to safe waters.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to Dashboard
      </Link>
    </div>
  );
}
