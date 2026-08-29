import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-coral space-y-3 my-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{this.props.title || 'Unable to open CSV component. Please try again.'}</span>
          </div>
          {this.state.error?.message && (
            <p className="text-xs text-slate-600 font-mono bg-white/60 p-2 rounded border border-red-100">
              {this.state.error.message}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-3 py-1.5 rounded-lg bg-coral text-white text-xs font-bold hover:bg-red-600 transition flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
