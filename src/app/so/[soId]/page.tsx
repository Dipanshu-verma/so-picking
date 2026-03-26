"use client";

import { useParams, useRouter } from "next/navigation";
import { AlertCircle, PlayCircle, RotateCcw, WifiOff } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ProgressBar } from "@/components/picking/ProgressBar";
import { ProgressIndicator } from "@/components/picking/ProgressIndicator";
import { LocationCard } from "@/components/picking/LocationCard";
import { SODetailSkeleton } from "@/components/picking/SODetailSkeleton";
import { useSODetail } from "@/hooks/useSODetail";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";
import { LocationStatus } from "@/constants";

export default function SODetailPage() {
  const params = useParams();
  const router = useRouter();
  const soId = decodeURIComponent(params.soId as string);
  const isOnline = useAppStore((s) => s.isOnline);

  const {
    soRow,
    locations,
    isLoading,
    isStarting,
    error,
    completedCount,
    totalCount,
    canResume,
    handleStartPicking,
  } = useSODetail(soId);

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const errorCount = locations.filter(
    (l) => l.status === LocationStatus.ERROR
  ).length;

  // Find the current active location index (first PENDING)
  const activeLocationIndex = locations.findIndex(
    (l) => l.status === LocationStatus.PENDING
  );

  return (
    <div className="min-h-screen bg-warehouse-bg">
     

      <Header
        title={soId}
        showBack
        onBack={() => router.push("/")}
      />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-32">
        {/* ── Loading ─────────────────────────────────────── */}
        {isLoading && (
          <div className="mt-4">
            <SODetailSkeleton />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────── */}
        {!isLoading && error && (
          <div className="mt-8 flex flex-col items-center gap-5 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">Could not load SO</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
            <button
              onClick={() => router.refresh()}
              className="warehouse-button-secondary px-8 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────── */}
        {!isLoading && !error && (
          <div className="mt-4 space-y-4">
            {/* ── Summary Card ────────────────────────────── */}
            <div className="warehouse-card space-y-4">
              {/* SO number + date */}
              <div>
                <h2 className="text-2xl font-black text-gray-900">{soId}</h2>
                {soRow && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(soRow.date)}
                    {soRow.scanSku && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full
                                       bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200">
                        SKU Scan Required
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <ProgressBar percent={progressPercent} showLabel />

              {/* Progress indicator */}
              <ProgressIndicator
                completed={completedCount}
                total={totalCount}
                errors={errorCount}
              />
            </div>

            {/* ── Offline Warning ──────────────────────────── */}
            {!isOnline && (
              <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200
                              rounded-xl px-4 py-3 text-amber-700 text-sm">
                <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  You are offline. Connect to internet to start picking.
                </span>
              </div>
            )}

            {/* ── Location list ────────────────────────────── */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">
                Locations ({totalCount})
              </h3>

              {locations.map((loc, index) => (
                <LocationCard
                  key={loc.location}
                  location={loc}
                  index={index}
                  isActive={canResume && index === activeLocationIndex}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Sticky bottom action button ─────────────────────── */}
      {!isLoading && !error && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
                        shadow-lg safe-bottom">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              onClick={handleStartPicking}
              disabled={isStarting || !isOnline}
              aria-label={canResume ? "Resume picking" : "Start picking"}
              className="warehouse-button-primary w-full flex items-center justify-center gap-3
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Starting...
                </>
              ) : (
                <>
                  <PlayCircle className="w-6 h-6" aria-hidden="true" />
                  {canResume ? "Resume Picking" : "Start Picking"}
                </>
              )}
            </button>

            {!isOnline && (
              <p className="text-center text-xs text-gray-400 mt-2">
                Internet connection required to start
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}