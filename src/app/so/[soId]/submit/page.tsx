"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  RefreshCw,
  ChevronRight,
  MapPin,
  AlertCircle,
  Home,
  ClipboardCheck,
  Trophy,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useSubmit } from "@/hooks/useSubmit";
import { usePickingStore } from "@/store/picking-store";
import { ErrorType } from "@/constants";

const ERROR_TYPE_STYLE: Record<string, string> = {
  [ErrorType.PALLET_NOT_FOUND]: "bg-red-50 text-red-700 border-red-200",
  [ErrorType.PALLET_MISMATCH]: "bg-orange-50 text-orange-700 border-orange-200",
  [ErrorType.PALLET_EMPTY]: "bg-yellow-50 text-yellow-700 border-yellow-200",
  [ErrorType.SKU_SHORT]: "bg-purple-50 text-purple-700 border-purple-200",
  [ErrorType.SKU_MISMATCH]: "bg-pink-50 text-pink-700 border-pink-200",
};

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const soId = decodeURIComponent(params.soId as string);
  const activeSO = usePickingStore((s) => s.activeSO);

 const [hasHydrated, setHasHydrated] = useState<boolean>(false);

useEffect(() => {
  const unsubscribe = usePickingStore.persist.onFinishHydration(() => {
    setHasHydrated(true);
  });

  if (usePickingStore.persist.hasHydrated()) {
    setHasHydrated(true);
  }

  return () => unsubscribe();
}, []);

 const {
    errors,
    isOnline,
    isSubmitting,
    isSubmitted,
    submitError,
    totalLocations,
    completedLocations,
    pickedCount,
    errorCount,
    canSubmit,
    handleSubmit,
    handleRetry,
  } = useSubmit(soId);

useEffect(() => {
  if (!isSubmitted) return;
  const timer = setTimeout(() => {
    router.replace("/");
  }, 2500);
  return () => clearTimeout(timer);
}, [isSubmitted, router]);

useEffect(() => {
  if (!hasHydrated) return;
  if (!activeSO && !isSubmitted) {
    router.replace(`/so/${encodeURIComponent(soId)}`);
  }
}, [hasHydrated, activeSO, isSubmitted, soId, router]);

 if (!hasHydrated || (!activeSO && !isSubmitted)) return null;

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f1f5f9" }}>
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-7">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
              className="w-32 h-32 rounded-3xl flex items-center justify-center"
              style={{
                background: errorCount > 0
                  ? "linear-gradient(135deg, #fff7ed, #fed7aa)"
                  : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                boxShadow: errorCount > 0
                  ? "0 12px 40px rgba(249,115,22,0.25)"
                  : "0 12px 40px rgba(22,163,74,0.25)",
              }}
            >
              {errorCount > 0 ? (
                <AlertTriangle className="w-16 h-16 text-orange-500" aria-hidden="true" />
              ) : (
                <Trophy className="w-16 h-16 text-green-500" aria-hidden="true" />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {errorCount > 0 ? "Submitted with Errors" : "Submitted! 🎉"}
            </h1>
            <p className="text-slate-500 text-base leading-relaxed">
              SO <strong className="text-slate-800">{soId}</strong> has been marked as{" "}
              <strong
                className={errorCount > 0 ? "text-orange-600" : "text-green-600"}
              >
                {errorCount > 0 ? "COMPLETED WITH ERRORS" : "COMPLETED"}
              </strong>
              .
            </p>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <span className="badge badge-success px-4 py-2 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {pickedCount} Picked
            </span>
            {errorCount > 0 && (
              <span className="badge badge-error px-4 py-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errorCount} Error{errorCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <button
            onClick={() => router.replace("/")}
            className="warehouse-button warehouse-button-primary w-full max-w-xs
                       flex items-center justify-center gap-2 mt-2"
            aria-label="Return to home screen"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            Back to Home
          </button>
        </main>
      </div>
    );
  }

  // ── SUBMIT SCREEN ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>

      <Header
        title="Submit"
        showBack
        onBack={() => router.push(`/so/${encodeURIComponent(soId)}/picking`)}
      />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-36">
        <div className="mt-4 space-y-4">

          {/* ── Summary card ──────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
              boxShadow: "0 8px 32px rgba(37,99,235,0.3), 0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <ClipboardCheck className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Sales Order</p>
                <p className="text-2xl font-black text-white truncate tracking-tight">{soId}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div
              className="grid grid-cols-3 gap-3 pt-4 border-t"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              <div
                className="text-center rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <p className="text-3xl font-black text-white tabular-nums">{totalLocations}</p>
                <p className="text-xs text-blue-200 mt-1 font-semibold">Total</p>
              </div>
              <div
                className="text-center rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <p className="text-3xl font-black text-green-300 tabular-nums">{pickedCount}</p>
                <p className="text-xs text-blue-200 mt-1 font-semibold">Picked</p>
              </div>
              <div
                className="text-center rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <p
                  className={`text-3xl font-black tabular-nums ${
                    errorCount > 0 ? "text-red-300" : "text-white/40"
                  }`}
                >
                  {errorCount}
                </p>
                <p className="text-xs text-blue-200 mt-1 font-semibold">Errors</p>
              </div>
            </div>

            {/* Final status chip */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           text-xs font-bold border ${
                             errorCount > 0
                               ? "bg-orange-100 text-orange-700 border-orange-200"
                               : "bg-green-100 text-green-700 border-green-200"
                           }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  errorCount > 0 ? "bg-orange-500" : "bg-green-500"
                }`}
              />
              {errorCount > 0 ? "COMPLETED WITH ERRORS" : "COMPLETED"}
            </span>
          </div>

          {/* ── Errors list ───────────────────────────────────────── */}
          {errors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <AlertTriangle className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  Errors to Submit ({errors.length})
                </h3>
              </div>

              {errors.map((err, index) => (
                <div
                  key={err.id}
                  className="warehouse-card fade-in"
                  style={{
                    borderLeft: "4px solid #f87171",
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-800">
                          {err.location}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">#{index + 1}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 badge text-xs font-bold border ${
                        ERROR_TYPE_STYLE[err.errorType] ??
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {err.errorType}
                    </span>
                  </div>

                  {err.note && (
                    <p className="text-sm text-slate-500 pl-9 mt-2 italic">
                      &ldquo;{err.note}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── No errors state ─────────────────────────────────── */}
          {errors.length === 0 && (
            <div
              className="warehouse-card flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                border: "2px solid #bbf7d0",
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-green-800">
                No errors — all locations picked successfully!
              </p>
            </div>
          )}

          {/* ── Offline warning ─────────────────────────────────── */}
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
                You are offline. Connect to internet to submit.
              </span>
            </div>
          )}

          {/* ── Submit error banner ─────────────────────────────── */}
          {submitError && (
            <div
              className="flex items-start gap-3 rounded-2xl px-4 py-4"
              style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
            >
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-red-700">Submission Failed</p>
                <p className="text-xs text-red-500 mt-0.5 leading-relaxed">{submitError}</p>
              </div>
              <button
                onClick={handleRetry}
                disabled={!isOnline}
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold
                           text-red-600 hover:text-red-800 underline
                           disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Retry submission"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}

          {/* ── What happens note ─────────────────────────────── */}
          <div
            className="rounded-2xl px-4 py-4 space-y-2"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              On Submit
            </p>
            {[
              errors.length > 0
                ? `${errors.length} error(s) will be written to the Errors sheet`
                : "No errors to write",
              `SO_List status will be updated to ${
                errors.length > 0 ? "COMPLETED_WITH_ERRORS" : "COMPLETED"
              }`,
              "Local cached data for this SO will be cleared",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <ChevronRight
                  className="w-4 h-4 text-blue-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs text-slate-500 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Sticky Submit Button ─────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 safe-bottom"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(226,232,240,0.8)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Submit picking results to Google Sheets"
            className="warehouse-button warehouse-button-primary w-full flex items-center
                       justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
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
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" aria-hidden="true" />
                Submit to Google Sheets
              </>
            )}
          </button>

          {!isOnline && (
            <p className="text-center text-xs text-slate-400 font-medium">
              Internet connection required to submit
            </p>
          )}
        </div>
      </div>
    </div>
  );
}