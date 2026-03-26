"use client";

import { useParams, useRouter } from "next/navigation";
import { AlertCircle, PlayCircle, RotateCcw, WifiOff, MapPin, QrCode } from "lucide-react";
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

  const activeLocationIndex = locations.findIndex(
    (l) => l.status === LocationStatus.PENDING
  );

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      <Header
        title={soId}
        showBack
        onBack={() => router.push("/")}
      />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-36">
        {/* ── Loading ─────────────────────────────────────── */}
        {isLoading && (
          <div className="mt-4">
            <SODetailSkeleton />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────── */}
        {!isLoading && error && (
          <div className="mt-8 flex flex-col items-center gap-5 text-center px-4 fade-in">
            <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">Could not load SO</p>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
            <button
              onClick={() => router.refresh()}
              className="warehouse-button warehouse-button-secondary px-8 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────── */}
        {!isLoading && !error && (
          <div className="mt-4 space-y-4 fade-in">

            {/* ── Summary Card ────────────────────────────── */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
                boxShadow: "0 8px 32px rgba(37,99,235,0.3), 0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {/* SO number + date */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-0.5">
                    Sales Order
                  </p>
                  <h2 className="text-3xl font-black text-white truncate tracking-tight">
                    {soId}
                  </h2>
                  {soRow && (
                    <p className="text-blue-200 text-sm mt-1">
                      {formatDate(soRow.date)}
                    </p>
                  )}
                </div>
                {soRow?.scanSku && (
                  <span
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5
                               rounded-full text-xs font-bold text-purple-700 mt-1"
                    style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e9d5ff" }}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    SKU Scan
                  </span>
                )}
              </div>

              {/* Progress bar — white on blue */}
              <div>
                <div
                  className="w-full h-3 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-white tabular-nums">{completedCount}</span>
                    <span className="text-lg text-blue-200 font-semibold">/ {totalCount}</span>
                    <span className="text-blue-200 text-sm ml-1">locations</span>
                  </div>
                  <span className="text-white font-bold text-lg tabular-nums">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Error count badge */}
              {errorCount > 0 && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             text-xs font-bold"
                  style={{ background: "rgba(254,202,202,0.2)", border: "1px solid rgba(254,202,202,0.4)", color: "#fecaca" }}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorCount} error{errorCount !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* ── Offline Warning ──────────────────────────── */}
            {!isOnline && (
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-amber-800 text-sm"
                style={{
                  background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                  border: "1px solid #fde68a",
                }}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <WifiOff className="w-4 h-4 text-amber-600" aria-hidden="true" />
                </div>
                <span className="font-medium flex-1">
                  You are offline. Connect to internet to start picking.
                </span>
              </div>
            )}

            {/* ── Location list ────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  Locations ({totalCount})
                </h3>
              </div>

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
        <div
          className="fixed bottom-0 left-0 right-0 safe-bottom"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(226,232,240,0.8)",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              onClick={handleStartPicking}
              disabled={isStarting || !isOnline}
              aria-label={canResume ? "Resume picking" : "Start picking"}
              className="warehouse-button warehouse-button-primary w-full flex items-center
                         justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <>
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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
              <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                Internet connection required to start
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}