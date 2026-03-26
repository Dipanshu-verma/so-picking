"use client";

import { useEffect,useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useSubmit } from "@/hooks/useSubmit";
import { usePickingStore } from "@/store/picking-store";
import { ErrorType } from "@/constants";

// ── Error type color helper ────────────────────────────────────────
const ERROR_TYPE_STYLE: Record<string, string> = {
  [ErrorType.PALLET_NOT_FOUND]: "bg-red-100 text-red-700 border-red-200",
  [ErrorType.PALLET_MISMATCH]: "bg-orange-100 text-orange-700 border-orange-200",
  [ErrorType.PALLET_EMPTY]: "bg-yellow-100 text-yellow-700 border-yellow-200",
  [ErrorType.SKU_SHORT]: "bg-purple-100 text-purple-700 border-purple-200",
  [ErrorType.SKU_MISMATCH]: "bg-pink-100 text-pink-700 border-pink-200",
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
}, [hasHydrated, activeSO,isSubmitted, soId, router]);

 if (!hasHydrated || (!activeSO && !isSubmitted)) return null;

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-warehouse-bg flex flex-col">

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-6">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`w-28 h-28 rounded-full flex items-center justify-center
                          ${errorCount > 0 ? "bg-orange-100" : "bg-green-100"}`}
            >
              {errorCount > 0 ? (
                <AlertTriangle
                  className="w-14 h-14 text-orange-500"
                  aria-hidden="true"
                />
              ) : (
                <CheckCircle2
                  className="w-14 h-14 text-green-500"
                  aria-hidden="true"
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-gray-900">
              {errorCount > 0 ? "Submitted with Errors" : "Submitted!"}
            </h1>
            <p className="text-gray-500 text-base">
              SO <strong className="text-gray-800">{soId}</strong> has been
              marked as{" "}
              <strong
                className={
                  errorCount > 0 ? "text-orange-600" : "text-green-600"
                }
              >
                {errorCount > 0 ? "COMPLETED WITH ERRORS" : "COMPLETED"}
              </strong>
              .
            </p>
          </div>

          {/* Summary chips */}
          <div className="flex gap-3 flex-wrap justify-center">
           <span className="px-4 py-2 rounded-full bg-green-100 text-green-700
                 text-sm font-semibold border border-green-200">
  ✓ {pickedCount} Picked
</span>
            {errorCount > 0 && (
              <span className="px-4 py-2 rounded-full bg-red-100 text-red-700
                               text-sm font-semibold border border-red-200">
                ✗ {errorCount} Error{errorCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <button
            onClick={() => router.replace("/")}
            className="warehouse-button-primary w-full max-w-xs
                       flex items-center justify-center gap-2 mt-4"
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
    <div className="min-h-screen bg-warehouse-bg">
   

      <Header
        title="Submit"
        showBack
        onBack={() => router.push(`/so/${encodeURIComponent(soId)}/picking`)}
      />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-36">
        <div className="mt-4 space-y-4">

          {/* ── Summary card ──────────────────────────────────────── */}
          <div className="warehouse-card space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Sales Order
                </p>
                <p className="text-2xl font-black text-gray-900">{soId}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">
                  {totalLocations}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Total</p>
              </div>
              <div className="text-center">
               <p className="text-2xl font-black text-green-600">
  {pickedCount}
</p>
                <p className="text-xs text-gray-400 mt-0.5">Picked</p>
              </div>
              <div className="text-center">
                <p
                  className={`text-2xl font-black ${
                    errorCount > 0 ? "text-red-600" : "text-gray-300"
                  }`}
                >
                  {errorCount}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Errors</p>
              </div>
            </div>

            {/* Final status chip */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1.5">
                Will be submitted as
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full
                             text-sm font-bold border
                             ${
                               errorCount > 0
                                 ? "bg-orange-100 text-orange-700 border-orange-200"
                                 : "bg-green-100 text-green-700 border-green-200"
                             }`}
              >
                {errorCount > 0 ? "COMPLETED WITH ERRORS" : "COMPLETED"}
              </span>
            </div>
          </div>

          {/* ── Errors list ───────────────────────────────────────── */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">
                Errors to Submit ({errors.length})
              </h3>

              {errors.map((err, index) => (
                <div
                  key={err.id}
                  className="warehouse-card border-l-4 border-l-red-400 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin
                        className="w-4 h-4 text-gray-400 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-bold text-gray-800">
                        {err.location}
                      </span>
                      <span className="text-xs text-gray-400">
                        #{index + 1}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs
                                   font-semibold border
                                   ${
                                     ERROR_TYPE_STYLE[err.errorType] ??
                                     "bg-gray-100 text-gray-700 border-gray-200"
                                   }`}
                    >
                      {err.errorType}
                    </span>
                  </div>

                  {err.note && (
                    <p className="text-sm text-gray-500 pl-6 italic">
                      &ldquo;{err.note}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── No errors state ───────────────────────────────────── */}
          {errors.length === 0 && (
            <div
              className="warehouse-card flex items-center gap-3
                           bg-green-50 border-2 border-green-200"
            >
              <CheckCircle2
                className="w-6 h-6 text-green-500 shrink-0"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-green-800">
                No errors — all locations picked successfully.
              </p>
            </div>
          )}

          {/* ── Offline warning ───────────────────────────────────── */}
          {!isOnline && (
            <div
              className="flex items-center gap-2.5 bg-amber-50 border border-amber-200
                            rounded-xl px-4 py-3 text-amber-700 text-sm"
            >
              <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                You are offline. Connect to internet to submit.
              </span>
            </div>
          )}

          {/* ── Submit error banner ───────────────────────────────── */}
          {submitError && (
            <div
              className="flex items-start gap-3 bg-red-50 border border-red-200
                            rounded-xl px-4 py-3"
            >
              <AlertCircle
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-700">
                  Submission Failed
                </p>
                <p className="text-xs text-red-500 mt-0.5">{submitError}</p>
              </div>
              <button
                onClick={handleRetry}
                disabled={!isOnline}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold
                           text-red-600 hover:text-red-800 underline
                           disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Retry submission"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}

          {/* ── What happens note ─────────────────────────────────── */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 space-y-1.5">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                  className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs text-gray-500">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Sticky Submit Button ───────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
                      shadow-lg safe-bottom"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Submit picking results to Google Sheets"
            className="warehouse-button-primary w-full flex items-center justify-center gap-3
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
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
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                Submit to Google Sheets
              </>
            )}
          </button>

          {!isOnline && (
            <p className="text-center text-xs text-gray-400">
              Internet connection required to submit
            </p>
          )}
        </div>
      </div>
    </div>
  );
}