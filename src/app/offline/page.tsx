"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-warehouse-bg px-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
          <WifiOff className="w-12 h-12 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">You&apos;re Offline</h1>
          <p className="mt-2 text-gray-600 text-base">
            No internet connection. If you were picking, your progress is saved locally.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="warehouse-button-primary w-full flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}