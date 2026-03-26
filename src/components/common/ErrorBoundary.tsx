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
        <div className="min-h-screen bg-warehouse-bg flex flex-col items-center
                        justify-center px-6 text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-gray-500 text-sm max-w-xs mx-auto">
              An unexpected error occurred. Your picking progress is saved locally.
            </p>
            {this.state.error && (
              <p className="mt-3 text-xs font-mono text-red-400 bg-red-50
                            rounded-lg px-3 py-2 max-w-xs mx-auto break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="warehouse-button-primary flex items-center gap-2 px-10"
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