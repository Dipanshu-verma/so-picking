"use client";

import React from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="min-h-screen flex flex-col items-center
                      justify-center px-6 text-center gap-6"
          style={{ background: "#f1f5f9" }}
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
              boxShadow: "0 8px 32px rgba(220,38,38,0.15)",
            }}
          >
            <AlertTriangle className="w-12 h-12 text-red-500" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
              An unexpected error occurred. Your picking progress is saved locally.
            </p>
            {this.state.error && (
              <p
                className="mt-3 text-xs font-mono text-red-400 rounded-xl
                            px-4 py-2.5 max-w-xs mx-auto break-all"
                style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
              >
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="warehouse-button warehouse-button-primary flex items-center gap-2 px-10"
          >
            <RefreshCw className="w-5 h-5" aria-hidden="true" />
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}